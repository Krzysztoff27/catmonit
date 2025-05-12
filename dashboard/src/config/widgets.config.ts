import DeviceDiskDrawer from "../components/DeviceDiskDrawer/DeviceDiskDrawer";
import DeviceDisksWidget from "../components/DeviceDisksWidget/DeviceDisksWidget";
import DeviceStorageDrawer from "../components/DeviceStorageDrawer/DeviceStorageDrawer";
import { WidgetsConfig } from "../types/config.types";
import { IconDatabase } from "@tabler/icons-react";

export const GRID_SIZE_PX = 128;

const WIDGETS_CONFIG: WidgetsConfig = {
    DEVICE_DISKS: {
        name: "device's disks state",
        icon: IconDatabase,
        component: DeviceDisksWidget,
        drawer: DeviceDiskDrawer,
        limits: {
            minH: 2,
            maxH: 5,
            minW: 2,
            maxW: 4,
        },
    },
    //! @TODON BRING BACK DeviceStorageWidget
    // DEVICE_STORAGE: {
    //     component: DeviceStorageWidget,
    //     drawer: DeviceStorageDrawer,
    //     limits: {
    //         minH: 2,
    //         maxH: 5,
    //         minW: 2,
    //         maxW: 4,
    //     },
    // },
};

export default WIDGETS_CONFIG;
