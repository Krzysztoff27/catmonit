export const dummies = {
  storage: {
    "1": {
      uuid: "1",
      hostname: "Tux",
      ip: "192.168.1.1",
      mask: "24",
      disks: {
        "/dev/sda": {
          path: "/dev/sda",
          storageLimit: 128 * 1024 ** 3,
          storageCurrent: 50 * 1024 ** 3,
        },
        "/dev/sdb": {
          path: "/dev/sdb",
          storageLimit: 128 * 1024 ** 3,
          storageCurrent: 80 * 1024 ** 3,
        },
        "/dev/sdc": {
          path: "/dev/sdc",
          storageLimit: 64 * 1024 ** 3,
          storageCurrent: 15 * 1024 ** 3,
        },
      },
      bootTimestamp: new Date(1716189593 * 1000),
      cpu: 41,
      cpuCoreNumber: 16,
      cpuLoadAverage: [1.23, 0.98, 0.75],
      ramUsed: 30 * 1024 ** 3,
      ramMax: 32 * 1024 ** 3,
      swapUsed: 7 * 1024 ** 3,
      swapMax: 8 * 1024 ** 3,
    },
    "2": {
      uuid: "2",
      hostname: "Kamel",
      ip: "192.168.1.2",
      mask: "24",
      disks: {
        "C:": {
          path: "C:",
          storageLimit: 500 * 1024 ** 3,
          storageCurrent: 200 * 1024 ** 3,
        },
        "D:": {
          path: "D:",
          storageLimit: 1000 * 1024 ** 3,
          storageCurrent: 800 * 1024 ** 3,
        },
        "E:": {
          path: "E:",
          storageLimit: 2000 * 1024 ** 3,
          storageCurrent: 1500 * 1024 ** 3,
        },
      },
      bootTimestamp: Math.floor(Date.now() / 1000) - 3600,
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
          storageLimit: 1600 * 1024 ** 3,
          storageCurrent: 20 * 1024 ** 3,
        },
        "/dev/files": {
          path: "/dev/files",
          storageLimit: 1220 * 1024 ** 3,
          storageCurrent: 80 * 1024 ** 3,
        },
        "/dev/meow": {
          path: "/dev/meow",
          storageLimit: 2200 * 1024 ** 3,
          storageCurrent: 150 * 1024 ** 3,
        },
      },
      bootTimestamp: Math.floor(Date.now() / 1000) - 17299,
      cpu: 78,
      cpuCoreNumber: 8,
      cpuLoadAverage: [1.21, 1.18, 0.84],
      ramUsed: 32 * 1024 ** 3,
      ramMax: 36 * 1024 ** 3,
      swapUsed: 13 * 1024 ** 3,
      swapMax: 16 * 1024 ** 3,
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
            const storageLimit = (1000 + i * 100) * 1024 ** 3;
            const storageCurrent = Math.floor(storageLimit * 0.6);
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
  fileShares: {
    "1": {
      uuid: "1",
      hostname: "Tux",
      ip: "192.168.1.1",
      mask: "24",
      fileShares: {
        "/mnt/shareA": {
          path: "/mnt/shareA",
          storageLimit: 100 * 1024 ** 3,
          storageCurrent: 50 * 1024 ** 3,
        },
        "/mnt/shareB": {
          path: "/mnt/shareB",
          storageLimit: 100 * 1024 ** 3,
          storageCurrent: 80 * 1024 ** 3,
        },
        "/mnt/shareC": {
          path: "/mnt/shareC",
          storageLimit: 50 * 1024 ** 3,
          storageCurrent: 15 * 1024 ** 3,
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
          storageLimit: 500 * 1024 ** 3,
          storageCurrent: 200 * 1024 ** 3,
        },
        "D:\\Media": {
          path: "D:\\Media",
          storageLimit: 1000 * 1024 ** 3,
          storageCurrent: 800 * 1024 ** 3,
        },
        "E:\\Backups": {
          path: "E:\\Backups",
          storageLimit: 2000 * 1024 ** 3,
          storageCurrent: 1500 * 1024 ** 3,
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
          storageLimit: 16000 * 1024 ** 3,
          storageCurrent: 200 * 1024 ** 3,
        },
        "/srv/files/secure": {
          path: "/srv/files/secure",
          storageLimit: 12200 * 1024 ** 3,
          storageCurrent: 800 * 1024 ** 3,
        },
        "/srv/files/backup": {
          path: "/srv/files/backup",
          storageLimit: 22000 * 1024 ** 3,
          storageCurrent: 1500 * 1024 ** 3,
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
          const storageLimit = (1000 + i * 100) * 1024 ** 3;
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