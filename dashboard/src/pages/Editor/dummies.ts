export const data = {
    storage: {
        "1": {
            uuid: "1",
            hostname: "Tux",
            ip: "192.168.1.1",
            mask: "24",
            disks: {
                "/dev/sda": {
                    path: "/dev/sda",
                    storageLimit: 100,
                    storageCurrent: 50,
                },
                "/dev/sdb": {
                    path: "/dev/sdb",
                    storageLimit: 100,
                    storageCurrent: 80,
                },
                "/dev/sdc": {
                    path: "/dev/sdc",
                    storageLimit: 50,
                    storageCurrent: 15,
                },
            },
            bootTimestamp: new Date(1716189593 * 1000), 
            cpu: 88,
            cpuCoreNumber: 16,
            cpuLoadAverage: [1.23, 0.98, 0.75],
            ramUsed: 13 * 1024 ** 3,
            ramMax: 16 * 1024 ** 3,
            swapUsed: 156 * 1024 ** 3,
            swapMax: 160 * 1024 ** 3,
        },
        "2": {
            uuid: "2",
            hostname: "Kamel",
            ip: "192.168.1.2",
            mask: "24",
            disks: {
                "C:": {
                    path: "C:",
                    storageLimit: 500,
                    storageCurrent: 200,
                },
                "D:": {
                    path: "D:",
                    storageLimit: 1000,
                    storageCurrent: 800,
                },
                "E:": {
                    path: "E:",
                    storageLimit: 2000,
                    storageCurrent: 1500,
                },
            },
            bootTimestamp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
            cpu: 75,
            cpuCoreNumber: 4,
            cpuLoadAverage: [2.5, 1.8, 1.2],
            ramUsed: 3 * 1024 ** 3,
            ramMax: 8 * 1024 ** 3,
            swapUsed: 512 * 1024 ** 2,
            swapMax: 2 * 1024 ** 3,
        },
        "3": {
            uuid: "3",
            hostname: "Bro",
            ip: "192.168.1.3",
            mask: "25",
            disks: {
                "/dev/sec": {
                    path: "/dev/sec",
                    storageLimit: 16000,
                    storageCurrent: 200,
                },
                "/dev/files": {
                    path: "/dev/files",
                    storageLimit: 12200,
                    storageCurrent: 800,
                },
                "/dev/meow": {
                    path: "/dev/meow",
                    storageLimit: 22000,
                    storageCurrent: 1500,
                },
            },
            bootTimestamp: Math.floor(Date.now() / 1000) - 17299,
            cpu: 78,
            cpuCoreNumber: 8,
            cpuLoadAverage: [1.21, 1.18, 0.84],
            ramUsed: 11 * 1024 ** 3,
            ramMax: 19 * 1024 ** 3,
            swapUsed: 106 * 1024 ** 3,
            swapMax: 180 * 1024 ** 3,
        },
        "4": {
            uuid: "4",
            hostname: "Overkill",
            ip: "192.168.1.4",
            mask: "26",
            disks: {
                ...Object.fromEntries(
                    Array.from({ length: 50 }, (_, i) => {
                        const driveName = `/dev/ultra${i}`;
                        const storageLimit = 1000 + i * 100; // e.g. 1000, 1100, 1200...
                        const storageCurrent = Math.floor(storageLimit * 0.6); // 60% used
                        return [
                            driveName,
                            {
                                path: driveName,
                                storageLimit,
                                storageCurrent,
                            },
                        ];
                    })
                ),
            },
            bootTimestamp: Math.floor(Date.now() / 1000) - 19999,
            cpu: 98,
            cpuCoreNumber: 16,
            cpuLoadAverage: [1.27, 1.11, 0.99],
            ramUsed: 17 * 1024 ** 3,
            ramMax: 25 * 1024 ** 3,
            swapUsed: 56 * 1024 ** 3,
            swapMax: 190 * 1024 ** 3,
        },
    },
    network: {},
};
