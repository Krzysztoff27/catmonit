export interface TokenRequestForm {
    username: string;
    password: string;
}

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

export interface WidgetData {
    type: string;
    rect: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    data: any;
}
