import grpc
import asyncio
import time
import logging  # Import logging

# Local imports - ensure 'logic' directory is in Python's path or structured as a package
from logic import data_retrieval
from logic import telemetry_pb2_grpc
from logic import utils

# It's good practice to use a named logger for your modules
logger = logging.getLogger(__name__)


class TelemetryStream:
    push_interval = 5  # seconds
    network_push_interval = 30  # seconds

    def __init__(self, parent_service=None):
        """
        Initializes the TelemetryStream.
        Args:
            parent_service: An optional reference to the calling service instance.
                            Used to check a 'running' flag for graceful shutdown.
        """
        self.parent_service = parent_service
        logger.info("TelemetryStream.__init__: Initializing...")
        try:
            cert_path = utils.load_certificate()  # Assuming utils.load_certificate() returns the cert itself or path
            if not cert_path:  # Or handle if it returns None/empty
                logger.error("TelemetryStream.__init__: Certificate data is empty or missing!")
                # Depending on what load_certificate returns, you might read the file here
                # For now, assuming cert_path IS the credential data if not None
                raise RuntimeError("Certificate data is empty or missing after load_certificate call!")

            # If load_certificate() returns the cert content:
            self.credentials = grpc.ssl_channel_credentials(root_certificates=cert_path)
            # If load_certificate() returns a path to the cert file:
            # with open(cert_path, 'rb') as f:
            #    cert_bytes = f.read()
            # self.credentials = grpc.ssl_channel_credentials(root_certificates=cert_bytes)

            logger.info("TelemetryStream.__init__: Credentials created successfully.")
        except Exception as e:
            logger.exception("TelemetryStream.__init__: Failed during initialization.")
            raise

    async def open_stream(self, server_address, server_port):
        logger.info(f"TelemetryStream.open_stream: Attempting to connect to {server_address}:{server_port}")

        # Loop for connection retries, checking the parent_service.running flag
        while self.parent_service is None or self.parent_service.running:
            try:
                logger.info(
                    f"TelemetryStream.open_stream: Establishing secure channel to {server_address}:{server_port}...")
                async with grpc.aio.secure_channel(
                        f"{server_address}:{server_port}",
                        self.credentials
                ) as channel:
                    logger.info("TelemetryStream.open_stream: Secure channel established.")
                    stub = telemetry_pb2_grpc.TelemetryServiceStub(channel)

                    # Start the streaming RPC
                    logger.info("TelemetryStream.open_stream: Starting StreamTelemetry RPC.")
                    if hasattr(self.parent_service, "started_event"):
                        self.parent_service.started_event.set()
                    async_stream = stub.StreamTelemetry()  # Call the RPC to get the request-stream object

                    last_disk_sent_time = time.monotonic()  # Use monotonic clock for intervals

                    # Inner loop for sending data, also checking the running flag
                    while self.parent_service is None or self.parent_service.running:
                        try:
                            current_time = time.monotonic()

                            # Send network message
                            network_msg = data_retrieval.get_message("network")
                            if network_msg:  # Ensure message is not None
                                await async_stream.write(network_msg)
                                logger.debug("TelemetryStream.open_stream: Sent network telemetry.")
                            else:
                                logger.warning("TelemetryStream.open_stream: get_message('network') returned None.")

                            # Send disk and fileshares messages periodically
                            if current_time - last_disk_sent_time >= self.network_push_interval:
                                disks_msg = data_retrieval.get_message("disks")
                                if disks_msg:
                                    await async_stream.write(disks_msg)
                                    logger.debug("TelemetryStream.open_stream: Sent disks telemetry.")
                                else:
                                    logger.warning("TelemetryStream.open_stream: get_message('disks') returned None.")

                                fileshares_msg = data_retrieval.get_message("fileshares")
                                if fileshares_msg:
                                    await async_stream.write(fileshares_msg)
                                    logger.debug("TelemetryStream.open_stream: Sent fileshares telemetry.")
                                else:
                                    logger.warning(
                                        "TelemetryStream.open_stream: get_message('fileshares') returned None.")

                                last_disk_sent_time = current_time

                            # Wait for the push interval, but break early if service is stopping
                            # This makes the shutdown more responsive.
                            for _ in range(self.push_interval):
                                if not (self.parent_service is None or self.parent_service.running):
                                    break
                                await asyncio.sleep(1)
                            if not (self.parent_service is None or self.parent_service.running):
                                logger.info("TelemetryStream.open_stream: Service stopping, exiting inner send loop.")
                                break

                        except grpc.aio.AioRpcError as e:
                            logger.error(
                                f"TelemetryStream.open_stream: gRPC stream error during write: {e.code()} - {e.details()}. Breaking inner loop.")
                            await asyncio.sleep(5)  # Wait before trying to re-establish connection
                            break  # Break inner loop to re-establish channel
                        except Exception as e_inner:
                            logger.exception(
                                f"TelemetryStream.open_stream: Unexpected error in inner send loop: {e_inner}. Breaking inner loop.")
                            await asyncio.sleep(5)
                            break  # Break inner loop

                    # If the service is stopping, try to gracefully end the stream
                    if not (self.parent_service is None or self.parent_service.running):
                        logger.info("TelemetryStream.open_stream: Service stopping, attempting to close stream.")
                        if async_stream:  # Check if stream object was obtained
                            await async_stream.done_writing()
                        return  # Exit open_stream method

                    # If the inner loop broke due to an error (not service stopping), this part is reached.
                    # This means the stream is likely broken, so we let the outer loop retry connection.
                    if async_stream:  # Check if stream object was obtained
                        logger.info("TelemetryStream.open_stream: Inner loop exited, attempting done_writing.")
                        await async_stream.done_writing()  # Signal end of client messages


            except grpc.aio.AioRpcError as e:
                logger.error(
                    f"TelemetryStream.open_stream: gRPC connection error: {e.code()} - {e.details()}. Retrying in 10 seconds if service is running.")
                # Wait before retrying connection, but check running flag periodically
                for _ in range(10):
                    if not (self.parent_service is None or self.parent_service.running):
                        break
                    await asyncio.sleep(1)
            except Exception as e_outer:
                logger.exception(
                    f"TelemetryStream.open_stream: Connection error or unexpected error in outer loop: {e_outer}. Retrying in 10 seconds if service is running.")
                for _ in range(10):
                    if not (self.parent_service is None or self.parent_service.running):
                        break
                    await asyncio.sleep(1)

            # If service is no longer running, exit the main connection retry loop
            if not (self.parent_service is None or self.parent_service.running):
                logger.info("TelemetryStream.open_stream: Service is stopping, exiting connection retry loop.")
                break

        logger.info("TelemetryStream.open_stream: Exited main loop.")

# Remove the old test main() if it exists, as this module is now primarily a library
# async def main():
# await TelemetryStream().open_stream("localhost", "5001")
# if __name__ == '__main__':
#    asyncio.run(main())