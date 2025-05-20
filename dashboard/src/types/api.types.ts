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

// export interface OverallDeviceStorageData { //extends Device
//   hostname: string;
//   ip: string;
//   storage: {
//     name: string;
//     value: number;
//   }[];
// }


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

