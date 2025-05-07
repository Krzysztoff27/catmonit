import platform
import subprocess
import grpc
import socket
import os
import sys
import time
import psutil
import yaml
import asyncio
from protocol_buffers.telemetry import telemetry_pb2_grpc
from protocol_buffers.telemetry import telemetry_pb2

#.exe files do not process paths in the same way as scripts
#if distributed in .exe form (as planned) the absolute path must be used for all directory traversals instead of relative path
def get_base_path():
    if getattr(sys, 'frozen', False):
        # Running from .exe
        return os.path.dirname(sys.executable)
    else:
        # Running from script
        return os.path.dirname(os.path.abspath(__file__))
from pathlib import Path

def load_config():
    base_path = Path(get_base_path())
    grandparent_dir = base_path.parent.parent  # Two levels up
    config_path = grandparent_dir / "config" / "config.yaml"

    if not config_path.exists():
        raise FileNotFoundError(f"Config file not found at {config_path}")

    with open(config_path, "r") as f:
        return yaml.safe_load(f)

def telemetry_stream():
    push_interval = 5
    network_push_interval = 30
    last_disk_sent = 0

    hostname = socket.gethostname()
    ip_address = socket.gethostbyname(hostname)
    uuid = subprocess.run(["powershell", "-Command", "(Get-WmiObject Win32_ComputerSystemProduct).UUID"], capture_output=True, text=True)
    operating_system = platform.system() + " " + platform.release()

    network_interfaces = []
    for interface, addrs in psutil.net_if_addrs().items():
        for addr in addrs:
            stats = psutil.net_io_counters(pernic=True).get(interface)
            if addr.address == ip_address:
                network_interfaces.append(telemetry_pb2.NetworkStats(interface_name=interface, rx_mbps=round(stats.bytes_recv * 8 / (1024 ** 2),2), tx_mbps=round(stats.bytes_sent * 8 / (1024 ** 2),2), is_main=True))
            network_interfaces.append(telemetry_pb2.NetworkStats(interface_name=interface, rx_mbps=round(stats.bytes_recv * 8 / (1024 ** 2), 2), tx_mbps=round(stats.bytes_sent * 8 / (1024 ** 2),2),))

    disks = []
    for partition in psutil.disk_partitions():
        usage = psutil.disk_usage(partition.mountpoint)
        disks.append(telemetry_pb2.DiskStats(mount_point=partition.mountpoint, usage=usage.total, capacity=usage.free))

    while True:
        now = int(time.time())
        yield telemetry_pb2.TelemetryRequest(
            hostname=hostname,
            ip_address=ip_address,
            uuid=uuid,
            operating_system=operating_system,
            network=telemetry_pb2.NetworkStatsList(
                network_interfaces
            )
        )

        if now - last_disk_sent >= 30:
            yield telemetry_pb2.TelemetryRequest(
                hostname=hostname,
                ip_address=ip_address,
                uuid=uuid,
                operating_system=operating_system,
                disks=telemetry_pb2.DiskStatsList(
                    disks
                )
            )
            last_disk_sent = now

        time.sleep(push_interval)

async def main():
    print(load_config()['cert_path'])
    with open(load_config()['cert_path'], 'rb') as cert_file:
        trusted_certs = cert_file.read()

    credentials = grpc.ssl_channel_credentials(root_certificates=trusted_certs)
    async with grpc.aio.secure_channel('localhost:5172', credentials) as channel:
        stub = telemetry_pb2_grpc.TelemetryServiceStub(channel)

        async def request_generator():
            yield telemetry_pb2.TelemetryRequest(
                hostname="my-host",
                ip_address="192.168.1.10",
                uuid="12345",
                operating_system="Windows",
                disks=telemetry_pb2.DiskStatsList(entries=[
                    telemetry_pb2.DiskStats(
                        mount_point="C:\\",
                        usage=5000000000,
                        capacity=10000000000
                    )
                ])
            )

        # Async call to the server
        response = await stub.StreamTelemetry(request_generator())
        print("Stream response from server:", response.status)


if __name__ == '__main__':
    asyncio.run(main())