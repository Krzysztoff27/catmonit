export interface Device {
    uuid: string;
    hostname: string;
    ip: string;
}

export interface Disk {
    path: string;
    storageLimit: number;
    storageCurrent: number;
}
