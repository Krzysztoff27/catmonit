import { IconAlertSquareRounded, IconChartDonut, IconDatabase, IconFiles, IconInfoCircleFilled, IconNetwork } from "@tabler/icons-react";
import AlertDrawer from "../components/drawers/AlertDrawer/AlertDrawer";
import DeviceStatusDrawer from "../components/drawers/DeviceStatusDrawer/DeviceStatusDrawer";
import OverallDeviceStorageDrawer from "../components/drawers/OverallDeviceStorageDrawer/OverallDeviceStorageDrawer";
import StorageResourcesDrawer from "../components/drawers/StorageResourcesDrawer/StorageResourcesDrawer";
import AlertWidget from "../components/widgets/AlertWidget/AlertWidget";
import DetailedDeviceStorageWidget from "../components/widgets/DetailedDeviceStorageWidget/DetailedDeviceStorageWidget";
import DeviceStatusWidget from "../components/widgets/DeviceStatusWidget/DeviceStatusWidget";
import FileSharesWidget from "../components/widgets/FileSharesWidget/FileSharesWidget";
import NetworkThroughputWidget from "../components/widgets/NetworkThroughputWidget/NetworkThroughputWidget";
import OverallDeviceStorageWidget from "../components/widgets/OverallDeviceStorageWidget/OverallDeviceStorageWidget";
import { WidgetsConfig } from "../types/config.types";

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
        image: "/images/widgets/detailed_device_storage.png",
    },
    OVERALL_DEVICE_STORAGE: {
        name: "overall device's storage",
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
            target: undefined,
            automatic: true,
        },
        dataSource: "storage",
        isReferingToSingularResource: true,
        image: "/images/widgets/overall_device_storage.png",
    },
    DEVICE_STATUS: {
        name: "device status info",
        icon: IconInfoCircleFilled,
        content: DeviceStatusWidget,
        propertiesContent: DeviceStatusDrawer,
        limits: {
            minH: 2,
            maxH: 3,
            minW: 2,
            maxW: 10,
        },
        initialSettings: {  
            target: undefined,
            automatic: true,
        },
        dataSource: "storage",
        isReferingToSingularResource: true,
        image: "/images/widgets/device_status.png",
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
