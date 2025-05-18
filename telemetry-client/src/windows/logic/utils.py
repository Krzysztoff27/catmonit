import ssl
import sys
import os
import yaml
from pathlib import Path

#.exe files do not process paths in the same way as scripts
#if distributed in .exe form (as planned) the absolute path must be used for all directory traversals instead of relative path
def get_base_path():
    if getattr(sys, 'frozen', False):
        # Running from .exe
        return os.path.dirname(sys.executable)
    else:
        # Running from script
        return os.path.dirname(os.path.abspath(__file__))

def load_config():
    #Traverse two directories up from execution directory to access config file
    #config_path = Path(get_base_path()).parent.parent / "config" / "config.yaml"
    config_path = Path("C:\\Program Files\\CatMonit Telemetry Client\\config.yaml")

    if not config_path.exists():
        raise FileNotFoundError(f"Config file not found at {config_path}")

    with open(config_path, "r", encoding="utf-8-sig") as f:
        return yaml.safe_load(f)


def load_certificate(cert_path="C:\\Program Files\\CatMonit Telemetry Client\\server.crt") -> bytes:
    with open(cert_path, "rb") as f:
        data = f.read()

    # Try to detect PEM format by header
    if data.startswith(b"-----BEGIN CERTIFICATE-----"):
        print("Detected PEM certificate.")
        return data
    else:
        try:
            pem_data = ssl.DER_cert_to_PEM_cert(data)
            print("Detected DER certificate, converted to PEM.")
            return pem_data.encode("ascii")
        except Exception as e:
            raise ValueError(f"Failed to parse certificate: {e}")
    """
    base_path = Path(get_base_path()).parent.parent.parent

    full_cert_path = base_path / "ssl" / "server.crt"

    print(f"Attempting to load certificate from: {full_cert_path}")

    if not full_cert_path.exists():
        raise FileNotFoundError(f"Certificate file not found at {full_cert_path}")

    try:
        with open(full_cert_path, 'rb') as cert_file:
            trusted_certs = cert_file.read()
            return trusted_certs
    except PermissionError as e:
        raise PermissionError(f"Permission denied when accessing certificate at {full_cert_path}") from e
    """