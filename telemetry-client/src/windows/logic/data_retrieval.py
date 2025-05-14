import socket
import subprocess
import platform
import psutil
import json
from typing import List
from pydantic import BaseModel
from functools import lru_cache
from logic import telemetry_pb2


class Base(BaseModel):
    hostname: str
    ip_address: str
    uuid: str
    operating_system: str

fileshares_extract_script = """
    # Get all non-special shares (exclude administrative shares)
    $shares = Get-SmbShare | Where-Object { 
        $_.Path -ne $null -and 
        $_.Name -notmatch '\\$$' -and 
        $_.ShareType -eq 'FileSystemDirectory'
    }

    $result = @()

    foreach ($share in $shares) {
        $path = $share.Path
        $drive = $path.Substring(0, 2)

        $disk = Get-Volume -DriveLetter $drive[0] -ErrorAction SilentlyContinue
        if ($disk) {
            $result += [PSCustomObject]@{
                share_path = $path
                usage = $disk.Size - $disk.SizeRemaining
                capacity = $disk.Size
            }
        }
    }
    $result | ConvertTo-Json -Depth 3
    """

def get_message(payload_type: str) -> telemetry_pb2.TelemetryRequest:
    message = telemetry_pb2.TelemetryRequest()
    base = get_base()

    message.hostname = base.hostname
    message.ip_address = base.ip_address
    message.uuid = base.uuid
    message.operating_system = base.operating_system

    if payload_type == "network":
        network_stats = telemetry_pb2.NetworkStatsList()
        network_stats.entries.extend(get_network_payload())
        message.network.CopyFrom(network_stats)
    elif payload_type == "disks":
        disk_stats = telemetry_pb2.DiskStatsList()
        disk_stats.entries.extend(get_disks_payload())
        message.disks.CopyFrom(disk_stats)
    elif payload_type == "fileshares":
        file_shares = telemetry_pb2.FileSharesList()
        file_shares.entries.extend(get_fileshares_payload())
        message.shares.CopyFrom(file_shares)

    return message

@lru_cache
def get_base() -> Base:
    hostname = socket.gethostname()
    ip_address = socket.gethostbyname(hostname)

    uuid_raw = subprocess.run(
        ["powershell", "-Command", "(Get-WmiObject Win32_ComputerSystemProduct).UUID"],
        capture_output=True,
        text=True
    )
    uuid = uuid_raw.stdout.strip()
    operating_system = f"{platform.system()} {platform.release()}"

    return Base(
        hostname=hostname,
        ip_address=ip_address,
        uuid=uuid,
        operating_system=operating_system
    )


def get_network_payload() -> List[telemetry_pb2.NetworkStats]:
    network_stats = psutil.net_io_counters(pernic=True)
    interfaces = []
    main_ip = socket.gethostbyname(socket.gethostname())

    for interface, addrs in psutil.net_if_addrs().items():
        stats = network_stats.get(interface)
        if stats:
            interface_msg = telemetry_pb2.NetworkStats()
            interface_msg.interface_name = interface
            interface_msg.rx_mbps = round(stats.bytes_recv * 8 / (1024 ** 2), 2)
            interface_msg.tx_mbps = round(stats.bytes_sent * 8 / (1024 ** 2), 2)

            if any(addr.address == main_ip for addr in addrs):
                interface_msg.is_main = True

            interfaces.append(interface_msg)

    return interfaces


def get_disks_payload() -> List[telemetry_pb2.DiskStats]:
    disks = []
    for partition in psutil.disk_partitions():
        try:
            usage = psutil.disk_usage(partition.mountpoint)
            disk = telemetry_pb2.DiskStats()
            disk.mount_point = partition.mountpoint
            disk.usage = usage.used
            disk.capacity = usage.total
            disks.append(disk)
        except Exception as e:
            print(f"Error getting disk stats for {partition.mountpoint}: {e}")
    return disks


def get_fileshares_payload() -> List[telemetry_pb2.FileShares]:
    try:
        result = subprocess.run(
            ["powershell", "-Command", fileshares_extract_script],
            capture_output=True,
            text=True,
            check=True
        )
        shares = []
        for share in json.loads(result.stdout):
            fs = telemetry_pb2.FileShares()
            fs.share_path = share["share_path"]
            fs.usage = int(share["usage"])
            fs.capacity = int(share["capacity"])
            shares.append(fs)
        return shares
    except Exception as e:
        print(f"Error getting fileshares: {e}")
        return []