import { Box } from "@mantine/core";
import { IconDatabase, IconDatabaseX } from "@tabler/icons-react";
import DetailedDeviceStorageDrawer from "../components/drawers/DetailedDeviceStorageDrawer/DetailedDeviceStorageDrawer";
import AlertWidget from "../components/widgets/AlertWidget/AlertWidget";
import DetailedDeviceStorageWidget from "../components/widgets/DetailedDeviceStorageWidget/DetailedDeviceStorageWidget";
import { WidgetsConfig } from "../types/config.types";

export const GRID_SIZE_PX = 128;

const WIDGETS_CONFIG: WidgetsConfig = {
    DEVICE_DISKS: {
        name: "device's disks state",
        icon: IconDatabase,
        component: DetailedDeviceStorageWidget,
        drawer: DetailedDeviceStorageDrawer,
        limits: {
            minH: 2,
            maxH: 5,
            minW: 2,
            maxW: 4,
        },
    },
    STORAGE_ALERTS_WIDGET: {
        name: "storage alerts widget",
        icon: IconDatabaseX,
        component: AlertWidget,
        drawer: Box,
        limits: {
            minH: 2,
            maxH: 5,
            minW: 6,
            maxW: 10,
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
