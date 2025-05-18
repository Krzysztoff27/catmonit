import { Box } from "@mantine/core";
import { IconAlertSquareRounded, IconChartDonut, IconDatabase, IconFiles, IconNetwork } from "@tabler/icons-react";
import AlertDrawer from "../components/drawers/AlertDrawer/AlertDrawer";
import DetailedDeviceStorageDrawer from "../components/drawers/DetailedDeviceStorageDrawer/DetailedDeviceStorageDrawer";
import FileSharesDrawer from "../components/drawers/FileSharesDrawer/FileSharesDrawer";
import OverallDeviceStorageDrawer from "../components/drawers/OverallDeviceStorageDrawer/OverallDeviceStorageDrawer";
import AlertWidget from "../components/widgets/AlertWidget/AlertWidget";
import DetailedDeviceStorageWidget from "../components/widgets/DetailedDeviceStorageWidget/DetailedDeviceStorageWidget";
import FileSharesWidget from "../components/widgets/FileSharesWidget/FileSharesWidget";
import NetworkThroughputWidget from "../components/widgets/NetworkThroughputWidget/NetworkThroughputWidget";
import OverallDeviceStorageWidget from "../components/widgets/OverallDeviceStorageWidget/OverallDeviceStorageWIdget";
import { WidgetsConfig } from "../types/config.types";
import StorageResourcesDrawer from "../components/drawers/StorageResourcesDrawer/StorageResourcesDrawer";

export const GRID_SIZE_PX = 128;
export const GRID_MARGIN_PX = 10;

const WIDGETS_CONFIG: WidgetsConfig = {
    ALERTS: {
        name: "alerts widget",
        icon: IconAlertSquareRounded,
        content: AlertWidget,
        drawer: AlertDrawer,
        limits: {
            minH: 2,
            maxH: 5,
            minW: 6,
            maxW: 10,
        },
        initialSettings: {},
        isReferingToSingularResource: false,
    },
    DETAILED_DEVICE_STORAGE: {
        name: "device's disks state",
        icon: IconDatabase,
        content: DetailedDeviceStorageWidget,
        drawer: StorageResourcesDrawer,
        limits: {
            minH: 2,
            maxH: 5,
            minW: 2,
            maxW: 4,
        },
        initialSettings: {
            target: undefined,
            automatic: true,
            disks: undefined,
            highlightStages: {
                yellow: 75,
                red: 90,
            },
        },
        dataSource: "storage",
        isReferingToSingularResource: true,
    },
    OVERALL_DEVICE_STORAGE: {
        name: "overall device's storage",
        icon: IconChartDonut,
        content: OverallDeviceStorageWidget,
        drawer: OverallDeviceStorageDrawer,
        limits: {
            minH: 2,
            maxH: 4,
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
    FILE_SHARES: {
        name: "file share widget",
        icon: IconFiles,
        content: FileSharesWidget,
        drawer: StorageResourcesDrawer,
        limits: {
            minH: 2,
            maxH: 5,
            minW: 2,
            maxW: 4,
        },
        initialSettings: {
            arget: undefined,
            automatic: true,
            fileShares: undefined,
            highlightStages: {
                yellow: 75,
                red: 90,
            },
        },
        dataSource: "fileShares",
        isReferingToSingularResource: true,
    },
    // SERVICE_STATUS: {
    //     name: "device's status ",
    //     icon: IconProgressCheck,
    //     content: Box,
    //     drawer: ServiceStatusDrawer, //@TODO change it
    //     limits: {
    //         minH: 2,
    //         maxH: 5,
    //         minW: 2,
    //         maxW: 4,
    //     },
    // },
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
        initialSettings: {},
    },
};

export default WIDGETS_CONFIG;
