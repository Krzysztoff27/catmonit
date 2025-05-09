import DeviceDisksWidget from "../components/DeviceDisksWidget/DeviceDisksWidget";
import DeviceDiskDrawer from "../components/DeviceDiskDrawer/DeviceDiskDrawer";
import { WidgetsConfig } from "../types/config.types";
import { IconDatabase } from "@tabler/icons-react";

export const GRID_SIZE_PX = 128;

const WIDGETS_CONFIG: WidgetsConfig = {
    DEVICE_DISKS: {
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
};

export default WIDGETS_CONFIG;
