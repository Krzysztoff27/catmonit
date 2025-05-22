const INACTIVE_RESPONSES_CAP = 5; // 🧢

const API_CONFIG = {
    deviceTimeout: {
        disks:      INACTIVE_RESPONSES_CAP * 120 * 1000,
        fileShares: INACTIVE_RESPONSES_CAP * 120 * 1000,
        network:    INACTIVE_RESPONSES_CAP *  30 * 1000,
    },
};

export default API_CONFIG;
