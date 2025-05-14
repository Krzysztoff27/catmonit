import ssl

import grpc
import asyncio
import time
#Local imports
import data_retrieval
import telemetry_pb2_grpc
import utils


class TelemetryStream:
    push_interval = 5.0  # seconds
    network_push_interval = 30.0  # seconds

    def __init__(self):
        cert = utils.load_certificate()
        if not cert:
            raise RuntimeError("Certificate file is empty or missing!")
        self.credentials = grpc.ssl_channel_credentials(root_certificates=cert)

    async def open_stream(self, server_address, server_port):
        while True:
            try:
                async with grpc.aio.secure_channel(
                        f"{server_address}:{server_port}",
                        self.credentials
                ) as channel:
                    stub = telemetry_pb2_grpc.TelemetryServiceStub(channel)
                    stream = stub.StreamTelemetry()

                    last_disk_sent = 0
                    while True:
                        try:
                            now = time.time()

                            await stream.write(
                                data_retrieval.get_message("network")
                            )

                            if now - last_disk_sent >= self.network_push_interval:
                                await stream.write(
                                    data_retrieval.get_message("disks")
                                )

                                await stream.write(
                                    data_retrieval.get_message("fileshares")
                                )

                                last_disk_sent = now
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
        await stream.open_stream("localhost", "5001")
    except KeyboardInterrupt:
        print("Shutdown requested...exiting gracefully.")
    except Exception as e:
        print(f"Unhandled exception in main: {e}")

if __name__ == '__main__':
    asyncio.run(main())