import DeviceDisksWidget from "../components/DeviceDisksWidget/DeviceDisksWidget";
import DeviceStorageDrawer from "../components/DeviceStorageDrawer/DeviceStorageDrawer";

export const GRID_SIZE_PX = 128;

const WIDGETS_CONFIG = { 
    DEVICE_DISKS: {
        component: DeviceDisksWidget,
        limits: {
            minH: 2,
            maxH: 5,
            minW: 2,
            maxW: 4,
        },
    },
};

export default WIDGETS_CONFIG;
