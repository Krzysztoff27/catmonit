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
        },
    },
    network: {},
    fileShares: {
        "1": {
            uuid: "1",
            hostname: "Tux",
            ip: "192.168.1.1",
            mask: "24",
            fileShares: {
                "/mnt/shareA": {
                    path: "/mnt/shareA",
                    storageLimit: 100,
                    storageCurrent: 50,
                },
                "/mnt/shareB": {
                    path: "/mnt/shareB",
                    storageLimit: 100,
                    storageCurrent: 80,
                },
                "/mnt/shareC": {
                    path: "/mnt/shareC",
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
            fileShares: {
                "C:\\SharedDocs": {
                    path: "C:\\SharedDocs",
                    storageLimit: 500,
                    storageCurrent: 200,
                },
                "D:\\Media": {
                    path: "D:\\Media",
                    storageLimit: 1000,
                    storageCurrent: 800,
                },
                "E:\\Backups": {
                    path: "E:\\Backups",
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
            fileShares: {
                "/srv/files/public/private/public/private": {
                    path: "/srv/files/public/private/public/private",
                    storageLimit: 16000,
                    storageCurrent: 200,
                },
                "/srv/files/secure": {
                    path: "/srv/files/secure",
                    storageLimit: 12200,
                    storageCurrent: 800,
                },
                "/srv/files/backup": {
                    path: "/srv/files/backup",
                    storageLimit: 22000,
                    storageCurrent: 1500,
                },
            },
        },
        "4": {
            uuid: "4",
            hostname: "Overkill",
            ip: "192.168.1.4",
            mask: "26",
            fileShares: Object.fromEntries(
                Array.from({ length: 50 }, (_, i) => {
                    const sharePath = `/srv/samba/ultra/share${i}`;
                    const storageLimit = 1000 + i * 100;
                    const storageCurrent = Math.floor(storageLimit * 0.6);
                    return [
                        sharePath,
                        {
                            path: sharePath,
                            storageLimit,
                            storageCurrent,
                        },
                    ];
                })
            ),
        },
    },
};
