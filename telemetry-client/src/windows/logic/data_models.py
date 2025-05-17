from pydantic import BaseModel
class Base(BaseModel):
    hostname: str
    ip_address: str
    uuid: str
    operating_system: str
    last_boot_timestamp: str