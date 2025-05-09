import grpc
import asyncio
import time
from protocol_buffers.telemetry import telemetry_pb2_grpc
import data_retrieval
import utils


class TelemetryStream:
    push_interval = 5  # seconds
    network_push_interval = 30  # seconds

    def __init__(self):
        self.credentials = grpc.ssl_channel_credentials(
            root_certificates=utils.load_certificate()
        )

    async def open_stream(self):
        while True:
            try:
                async with grpc.aio.secure_channel(
                        'localhost:5001',
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
    await TelemetryStream().open_stream()

if __name__ == '__main__':
    asyncio.run(main())