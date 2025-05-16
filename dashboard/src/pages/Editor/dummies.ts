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
        },
    },
    network: {},
};
