import { DeviceDiskData } from "../../../types/api.types";

const DUMMIES = {
    DETAILED_DEVICE_STORAGE: {
        hostname: "Machine",
        ip: "0.0.0.0",
        mask: "0",
        disks: [
            { path: "/dev/sdb", storageCurrent: 2000, storageLimit: 2048 },
            { path: "/dev/sda", storageCurrent: 1600, storageLimit: 2048 },
            { path: "/dev/sdc", storageCurrent: 720, storageLimit: 2048 },
        ],
    } as DeviceDiskData,
    OVERALL_DEVICE_STORAGE: {
        hostname: "Machine",
        ip: "0.0.0.0",
        mask: "0",
        disks: [
            { path: "/dev/sdb", storageCurrent: 2000, storageLimit: 2048 },
            { path: "/dev/sda", storageCurrent: 1600, storageLimit: 2048 },
            { path: "/dev/sdc", storageCurrent: 720, storageLimit: 2048 },
        ],
    } as DeviceDiskData,
};

export default DUMMIES;
