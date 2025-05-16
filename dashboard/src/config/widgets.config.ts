import { Box } from "@mantine/core";
import { IconDatabase, IconProgressCheck, IconStorm, IconDatabaseX, IconNetwork } from "@tabler/icons-react";
import DetailedDeviceStorageDrawer from "../components/drawers/DetailedDeviceStorageDrawer/DetailedDeviceStorageDrawer";
import AlertWidget from "../components/widgets/AlertWidget/AlertWidget";
import DetailedDeviceStorageWidget from "../components/widgets/DetailedDeviceStorageWidget/DetailedDeviceStorageWidget";
import { WidgetsConfig } from "../types/config.types";
// import ServiceStatusWidget from "../components/widgets/ServiceStatusWidget/ServiceStatusWidget";
import ServiceStatusDrawer from "../components/drawers/ServiceStatusDrawer/ServiceStatusDrawer";
import OverallDeviceStorageDrawer from "../components/drawers/OverallDeviceStorageDrawer/OverallDeviceStorageDrawer";
import NetworkThroughputWidget from "../components/widgets/NetworkThroughputWidget/NetworkThroughputWidget";
import OverallDeviceStorageWidget from "../components/widgets/OverallDeviceStorageWidget/OverallDeviceStorageWidget";

export const GRID_SIZE_PX = 128;
export const GRID_MARGIN_PX = 10;

const WIDGETS_CONFIG: WidgetsConfig = {
    DETAILED_DEVICE_STORAGE: {
        name: "device's disks state",
        icon: IconDatabase,
        content: DetailedDeviceStorageWidget,
        drawer: DetailedDeviceStorageDrawer,
        limits: {
            minH: 2,
            maxH: 5,
            minW: 2,
            maxW: 4,
        },
        initialSettings: {
            target: undefined,
            automatic: true,
            disks: [],
        },
        dataSource: "storage",
        isReferingToSingularResource: true,
    },
    OVERALL_DEVICE_STORAGE: {
        name: "overall device's storage",
        icon: IconStorm,
        content: OverallDeviceStorageWidget,
        drawer: OverallDeviceStorageDrawer,
        limits: {
            minH: 2,
            maxH: 5,
            minW: 2,
            maxW: 4,
        },
        initialSettings: {
            target: undefined,
            automatic: true,
        },
        dataSource: "storage",
        isReferingToSingularResource: true,
    },
    STORAGE_ALERTS: {
        name: "storage alerts widget",
        icon: IconDatabaseX,
        content: AlertWidget,
        drawer: Box,
        limits: {
            minH: 2,
            maxH: 5,
            minW: 6,
            maxW: 10,
        },
    },
    SERVICE_STATUS: {
        name: "device's status ",
        icon: IconProgressCheck,
        content: Box,
        drawer: ServiceStatusDrawer, //@TODO change it
        limits: {
            minH: 2,
            maxH: 5,
            minW: 2,
            maxW: 4,
        },
    },
    NETWORK_THROUGHPUT: {
        name: "network throughput",
        icon: IconNetwork,
        content: NetworkThroughputWidget,
        drawer: Box,
        limits: {
            minH: 2,
            maxH: 6,
            minW: 3,
            maxW: 6,
        },
    },
};

export default WIDGETS_CONFIG;
