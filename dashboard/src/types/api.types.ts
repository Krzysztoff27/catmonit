export interface TokenRequestForm {
    username: string;
    password: string;
}

export interface Device {
    uuid: string;
    hostname: string;
    ip: string;
    mask: string;
}

export interface Disk {
    path: string;
    storageLimit: number;
    storageCurrent: number;
}

export interface DeviceDiskData extends Device {
    disks: { [key: string]: Disk };
}

export interface FileShare {
    path: string;
    storageLimit: number;
    storageCurrent: number;
}

export interface WidgetData {
    type: string;
    rect: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    settings: any;
    version: number;
}

export interface LayoutInfoInDatabase {
    id: string;
    name: string;
}
export interface LayoutInDatabase {
    info: LayoutInfoInDatabase;
    data: WidgetData[];
}

export interface WebSocketStart {
    message: "start";
    devices?: string[]; // uuids
    auto?: number; // amount of automatically provided resources
    warningsCount?: number;
    errorsCount?: number;
}
