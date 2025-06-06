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
import SpacingWidget from "../components/widgets/SpacingWidget/SpacingWidget";

export const GRID_SIZE_PX = 128;
export const GRID_MARGIN_PX = 10;

const WIDGETS_CONFIG: WidgetsConfig = {
    ALERTS: {
        name: "alerts widget",
        content: AlertWidget,
        propertiesContent: AlertDrawer,
        limits: {
            minH: 2,
            maxH: 5,
            minW: 6,
            maxW: 10,
        },
        initialSettings: {sources: []},
        isReferingToSingularResource: false,
        dataSource: "",
        image: "/images/widgets/alerts.png",
    },
    OVERALL_DEVICE_STORAGE: {
        name: "overall device's disks",
        title: "Total storage",
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
        image: "/images/widgets/overall_device_storage.png",
    },
    DETAILED_DEVICE_STORAGE: {
        name: "device's disks state",
        title: "Storage",
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
            disks: {},
        },
        dataSource: "disks",
        isReferingToSingularResource: true,
        image: "/images/widgets/detailed_device_storage.png",
    },
    FILE_SHARES: {
        name: "file share widget",
        title: "Fileshares",
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
            fileShares: {},
        },
        dataSource: "fileShares",
        isReferingToSingularResource: true,
        image: "/images/widgets/fileshares.png",
    },
    DEVICE_STATUS: {
        name: "device status info",
        title: "Performance",
        content: DeviceStatusWidget,
        propertiesContent: DeviceStatusDrawer,
        limits: {
            minH: 2,
            maxH: 3,
            minW: 2,
            maxW: 10,
        },
        initialSettings: {
            target: null,
            automatic: true,
        },
        dataSource: "system",
        isReferingToSingularResource: true,
        image: "/images/widgets/device_status.png",
    },
    NETWORK_THROUGHPUT: {
        name: "network throughput",
        title: "Network throughput",
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
    SPACING_WIDGET: {
        name: "Spacing for creating layouts",
        content: SpacingWidget,
        limits: {
            minH: 1,
            maxH: 8,
            minW: 1,
            maxW: 15,
        },
        initialSettings: {
            target: null,
        },
        dataSource: "",
        isReferingToSingularResource: false,
        image: "/images/widgets/spacing.png",
    },
};

export default WIDGETS_CONFIG;
