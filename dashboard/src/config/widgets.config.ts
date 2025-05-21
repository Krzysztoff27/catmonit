import { Box } from "@mantine/core";
import AlertDrawer from "../components/drawers/AlertDrawer/AlertDrawer";
import OverallDeviceStorageDrawer from "../components/drawers/OverallDeviceStorageDrawer/OverallDeviceStorageDrawer";
import { IconDatabase, IconNetwork, IconChartDonut, IconFiles, IconAlertSquareRounded } from "@tabler/icons-react";
import AlertWidget from "../components/widgets/AlertWidget/AlertWidget";
import DetailedDeviceStorageWidget from "../components/widgets/DetailedDeviceStorageWidget/DetailedDeviceStorageWidget";
import FileSharesWidget from "../components/widgets/FileSharesWidget/FileSharesWidget";
import NetworkThroughputWidget from "../components/widgets/NetworkThroughputWidget/NetworkThroughputWidget";
import { WidgetsConfig } from "../types/config.types";
import StorageResourcesDrawer from "../components/drawers/StorageResourcesDrawer/StorageResourcesDrawer";
import OverallDeviceStorageWidget from "../components/widgets/OverallDeviceStorageWidget/OverallDeviceStorageWidget";

export const GRID_SIZE_PX = 128;
export const GRID_MARGIN_PX = 10;

const WIDGETS_CONFIG: WidgetsConfig = {
    ALERTS: {
        name: "alerts widget",
        icon: IconAlertSquareRounded,
        content: AlertWidget,
        propertiesContent: AlertDrawer,
        limits: {
            minH: 2,
            maxH: 5,
            minW: 6,
            maxW: 10,
        },
        initialSettings: {},
        isReferingToSingularResource: false,
        image: "/images/widgets/alerts.png",
    },
    DETAILED_DEVICE_STORAGE: {
        name: "device's disks state",
        icon: IconDatabase,
        content: DetailedDeviceStorageWidget,
        propertiesContent: StorageResourcesDrawer,
        limits: {
            minH: 2,
            maxH: 5,
            minW: 2,
            maxW: 4,
        },
        initialSettings: {
            target: null,
            automatic: true,
            disks: undefined,
            highlightStages: {
                yellow: 75,
                red: 90,
            },
        },
        dataSource: "disks",
        isReferingToSingularResource: true,
        image: "/images/widgets/detailed_device_storage.png",
    },
    OVERALL_DEVICE_STORAGE: {
        name: "overall device's disks",
        icon: IconChartDonut,
        content: OverallDeviceStorageWidget,
        propertiesContent: OverallDeviceStorageDrawer,
        limits: {
            minH: 2,
            maxH: 4,
            minW: 2,
            maxW: 4,
        },
        initialSettings: {
            target: null,
            automatic: true,
        },
        dataSource: "disks",
        isReferingToSingularResource: true,
    },
    FILE_SHARES: {
        name: "file share widget",
        icon: IconFiles,
        content: FileSharesWidget,
        propertiesContent: StorageResourcesDrawer,
        limits: {
            minH: 2,
            maxH: 5,
            minW: 2,
            maxW: 4,
        },
        initialSettings: {
            target: null,
            automatic: true,
            fileShares: undefined,
            highlightStages: {
                yellow: 75,
                red: 90,
            },
        },
        dataSource: "fileShares",
        isReferingToSingularResource: true,
        image: "/images/widgets/fileshares.png",
    },
    // SERVICE_STATUS: {
    //     name: "device's status ",
    //     icon: IconProgressCheck,
    //     content: Box,
    //     1tiesContent: ServiceStatusDrawer, //@TODO change it
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
        limits: {
            minH: 2,
            maxH: 6,
            minW: 3,
            maxW: 6,
        },
        initialSettings: {},
        image: "/images/widgets/network_throughput.png",
        dataSource: "network",
        isReferingToSingularResource: false,
    },
};

export default WIDGETS_CONFIG;
