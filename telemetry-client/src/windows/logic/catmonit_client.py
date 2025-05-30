﻿import grpc
import asyncio
import time
import logging
#Local imports
import data_retrieval
import telemetry_pb2_grpc
import telemetry_pb2
import utils

logging.basicConfig(
    filename="C:\\Program Files\\CatMonit Telemetry Client\\telemetry.log",
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(message)s"
)

class TelemetryStream:
    #Intervals are specified in seconds
    push_interval = 5.0
    network_push_interval = 30.0
    disk_push_interval = 120.0
    fileshares_push_interval = 120.0
    usage_push_interval = 15.0
    error_push_interval = 120.0

    def __init__(self):
        trusted_certs = utils.load_certificate()
        if not trusted_certs:
            raise RuntimeError("Certificate file is empty or missing!")
        self.credentials = grpc.ssl_channel_credentials(root_certificates=trusted_certs)

    async def open_stream(self, server_address, server_port):
        logging.info(server_address)
        logging.info(server_port)
        while True:
            try:
                async with grpc.aio.secure_channel(f"{server_address}:{server_port}", self.credentials) as channel:
                    stub = telemetry_pb2_grpc.TelemetryServiceStub(channel)
                    stream = stub.StreamTelemetry()
                    logging.info("Opened stream")

                    last_network_sent = 0
                    last_disk_sent = 0
                    last_fileshares_sent = 0
                    last_usage_sent = 0
                    last_disk_error_sent = 0
                    last_system_error_sent = 0

                    while True:
                        try:
                            now = time.time()

                            #Network
                            if now - last_network_sent >= self.network_push_interval:
                                msg = data_retrieval.get_message("network")
                                if msg:
                                    await stream.write(msg)
                                last_network_sent = now

                            #Disks
                            if now - last_disk_sent >= self.disk_push_interval:
                                msg = data_retrieval.get_message("disks")
                                if msg:
                                    await stream.write(msg)
                                last_disk_sent = now

                            #Fileshares
                            if now - last_fileshares_sent >= self.fileshares_push_interval:
                                msg = data_retrieval.get_message("fileshares")
                                if msg:
                                    await stream.write(msg)
                                last_fileshares_sent = now

                            #CPU/RAM Usage
                            if now - last_usage_sent >= self.usage_push_interval:
                                msg = data_retrieval.get_message("usage")
                                if msg:
                                    #await stream.write(msg)
                                    try:
                                        logging.debug("Writing to telemetry stream...")
                                        await stream.write(msg)
                                        logging.debug("SystemUsage payload written to stream.")
                                    except grpc.RpcError as e:
                                        logging.error(f"gRPC stream error: {e.code()} - {e.details()}")
                                    except Exception as e:
                                        logging.exception(f"Unexpected stream error: {e}")
                                last_usage_sent = now

                            #Disk Errors
                            if now - last_disk_error_sent >= self.error_push_interval:
                                msg = data_retrieval.get_message("disk_errors")
                                if msg:
                                    await stream.write(msg)
                                last_disk_error_sent = now

                            #System Errors
                            if now - last_system_error_sent >= self.error_push_interval:
                                msg = data_retrieval.get_message("system_errors")
                                if msg:
                                    await stream.write(msg)
                                last_system_error_sent = now

                            await asyncio.sleep(self.push_interval)

                        except Exception as e:
                            print(f"Stream error: {e}")
                            await asyncio.sleep(5)
                            break

                    response = await stream.done_writing()
                    print("Server response:", response.status)

            except Exception as e:
                print(f"Connection error: {e}, retrying in 5 seconds...")
                await asyncio.sleep(5)

async def main():
    stream = TelemetryStream()
    try:
        config = utils.load_config()
        await stream.open_stream(config.get("server_address"), config.get("server_port"))
    except KeyboardInterrupt:
        print("Shutdown requested...exiting gracefully.")
    except Exception as e:
        print(f"Unhandled exception in main: {e}")

if __name__ == '__main__':
    asyncio.run(main())