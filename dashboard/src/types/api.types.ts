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

export interface DeviceCpuData extends Device {
    bootTimestamp: number;
    cpu: number; //percentage, so <0;100>
    cpuCoreNumber: number;
    cpuLoadAverage: number[];
    ramUsed: number;
    ramMax: number;
    swapUsed: number;
    swapMax: number;
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

export type AlertType = "disks" | "fileShares" | "system";

export interface Alert {
    id: number;
    uuid: string;
    hostname: string;
    ip: string;
    mask: string;
    path: string;
    message: string;
    isWarning: boolean;
    type: AlertType;
}

export interface AlertListElementProps {
    alert: Alert;
    onRemove: () => void;
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
