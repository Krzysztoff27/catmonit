export interface TokenRequestForm {
    username: string;
    password: string;
}

export interface DeviceInfo {
    lastUpdated: string;
    hostname: string;
    ipAddress: string;
    mask: string;
    uuid: string;
    os: string;
}

export interface SystemInfo {
    cpuUsagePercent: number;
    ramTotalBytes: number;
    ramUsedBytes: number;
    pagefileTotalBytes: number; //SWAP
    pagefileUsedBytes: number;
    lastBootTimestamp: string;
}

export interface ShareInfo {
    sharePath: string;
    usage: number;
    capacity: number;
}

export interface DiskInfo {
    mountPoint: string;
    usage: number;
    capacity: number;
}

export interface Device {
    deviceInfo: DeviceInfo;
    systemInfo?: SystemInfo;
    sharesInfo?: ShareInfo[];
    disksInfo?: DiskInfo[];
}

export interface WarningInfo {
    deviceInfo: DeviceInfo;
    warnings: string[];
}

export interface ErrorInfo {
    deviceInfo: DeviceInfo;
    error: string[];
}

export interface APIResponse {
    responseTime: string;
    monitoredDevices: Record<string, Device | null>;
    autoDevices: Record<string, Device | null>;
    warnings?: Record<string, WarningInfo>;
    errors?: Record<string, ErrorInfo>;
}

export interface WidgetData {
    index: number;
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

// export type AlertType = "disks" | "fileShares" | "system";

// export interface Alert {
//     id: number;
//     uuid: string;
//     hostname: string;
//     ip: string;
//     mask: string;
//     path: string;
//     message: string;
//     isWarning: boolean;
//     type: AlertType;
// }

// export interface AlertListElementProps {
//     alert: Alert;
//     onRemove: () => void;
// }

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