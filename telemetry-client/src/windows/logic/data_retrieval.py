import socket
import subprocess
import platform
import psutil
import json
from typing import List
from pydantic import BaseModel
from functools import lru_cache
from datetime import datetime
import scripts
import telemetry_pb2


class Base(BaseModel):
    hostname: str
    ip_address: str
    uuid: str
    operating_system: str
    last_boot_timestamp: str


def _parse_json_output(output: str, context: str):
    if not output.strip():
        raise ValueError(f"{context}: PowerShell returned empty output.")

    try:
        events = json.loads(output.strip())
    except json.JSONDecodeError as e:
        raise ValueError(f"{context}: Failed to parse JSON output. Error: {str(e)}\nRaw output: {output.strip()[:300]}")

    if isinstance(events, dict):
        events = [events]
    elif not isinstance(events, list):
        raise ValueError(f"{context}: Parsed output is not a list or dict. Got: {type(events).__name__}")

    return events

def get_message(payload_type: str) -> telemetry_pb2.TelemetryRequest:
    message = telemetry_pb2.TelemetryRequest()
    base = base_data

    message.hostname = base.hostname
    message.ip_address = base.ip_address
    message.uuid = base.uuid
    message.operating_system = base.operating_system
    message.last_boot_timestamp = base.last_boot_timestamp

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
    elif payload_type == "disk_errors":
        errors = telemetry_pb2.DiskErrorsList()
        errors.entries.extend(get_disk_errors_payload())
        message.disk_errors.CopyFrom(errors)
    elif payload_type == "system_errors":
        errors = telemetry_pb2.SystemErrorsList()
        errors.entries.extend(get_system_errors_payload())
        message.system_errors.CopyFrom(errors)
    elif payload_type == "usage":
        usage = get_system_usage_payload()
        message.usage.CopyFrom(usage)

    return message

@lru_cache(maxsize=1)
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
    last_boot_timestamp = datetime.fromtimestamp(psutil.boot_time()).isoformat()

    return Base(
        hostname=hostname,
        ip_address=ip_address,
        uuid=uuid,
        operating_system=operating_system,
        last_boot_timestamp=last_boot_timestamp
    )

base_data = get_base()

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
            ["powershell", "-Command", scripts.fileshares_extract_script],
            capture_output=True,
            text=True,
            check=True
        )
        raw_json = result.stdout.strip()
        if not raw_json:
            print("Empty JSON output from PowerShell")
            return []

        parsed = json.loads(raw_json)

        # Ensure it's a list
        if isinstance(parsed, dict):
            parsed = [parsed]
        elif not isinstance(parsed, list):
            print(f"Unexpected JSON type: {type(parsed)}")
            return []

        shares = []
        for share in parsed:
            try:
                fs = telemetry_pb2.FileShares()
                fs.share_path = share["share_path"]
                fs.usage = int(share["usage"])
                fs.capacity = int(share["capacity"])
                shares.append(fs)
            except (KeyError, ValueError, TypeError) as e:
                print(f"Invalid share data: {share}, error: {e}")
        return shares

    except subprocess.CalledProcessError as e:
        print(f"PowerShell script failed: {e.stderr}")
    except json.JSONDecodeError as e:
        print(f"Invalid JSON returned: {e}")
    except Exception as e:
        print(f"Error getting fileshares: {e}")
    return []

def get_disk_errors_payload() -> List[telemetry_pb2.DiskErrors]:
    try:
        result = subprocess.run(
            ["powershell", "-Command", scripts.disk_errors_script],
            capture_output=True,
            text=True,
            check=True
        )
        events = _parse_json_output(result.stdout, "DiskErrors")

        return [
            telemetry_pb2.DiskErrors(
                message=event.get("message", ""),
                source=event.get("source", ""),
                timestamp=int(event.get("timestamp", 0)),
                mount_point=event.get("mount_point", "")
            )
            for event in events
        ]
    except Exception as e:
        print(f"[DiskErrors] Retrieval failed: {str(e)}")
        return []  # Ensure this doesn't break your code


def get_system_errors_payload() -> List[telemetry_pb2.SystemErrors]:
    try:
        result = subprocess.run(
            ["powershell", "-Command", scripts.system_errors_script],
            capture_output=True,
            text=True,
            check=True
        )
        events = _parse_json_output(result.stdout, "SystemErrors")

        return [
            telemetry_pb2.SystemErrors(
                message=event.get("message", ""),
                source=event.get("source", ""),
                timestamp=int(event.get("timestamp", 0))
            )
            for event in events
        ]
    except Exception as e:
        print(f"[SystemErrors] Retrieval failed: {str(e)}")
        return []

def get_system_usage_payload() -> telemetry_pb2.SystemUsage:
    usage = telemetry_pb2.SystemUsage()
    usage.cpu_usage_percent = psutil.cpu_percent(interval=1)
    mem = psutil.virtual_memory()
    usage.ram_total_bytes = mem.total
    usage.ram_used_bytes = mem.used
    return usage