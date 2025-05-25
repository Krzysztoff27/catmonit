import { Box, Stack, Title } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { WidgetContentProps } from "../../../types/components.types";
import DiskProgress from "../../display/DiskProgress/DiskProgress";
import classes from "./FileSharesWidget.module.css";
import DeviceTitleOneLine from "../../display/DeviceTitle/DeviceTitleOneLine";
import { safeObjectValues } from "../../../utils/object";
import { ShareInfo } from "../../../types/api.types";
import { useWidgets } from "../../../contexts/WidgetContext/WidgetContext";
import { isEqual } from "lodash";
import { useEffect } from "react";

function FileSharesWidget({ index, data, settings, ...props }: WidgetContentProps) {
    let { height, ref } = useElementSize();
    const { setWidgetSettings, getWidget } = useWidgets();
    const widget = getWidget(index);

    const fileShares: ShareInfo[] = data?.sharesInfo ?? [];

    const updateSettings = () => {
        const resourceData: ShareInfo[] = data?.sharesInfo ?? [];
        const oldResourceSettings = settings?.fileShares ?? {};
        let newResourceSettings = {};

        resourceData.forEach(({ sharePath }) => {
            if (oldResourceSettings[sharePath]) return (newResourceSettings[sharePath] = oldResourceSettings[sharePath]);
            newResourceSettings[sharePath] = { path: sharePath, hidden: false, highlightStages: { yellow: 75, red: 90 } };
        });

        if (!isEqual(newResourceSettings, oldResourceSettings)) {
            setWidgetSettings(index, { ...settings, fileShares: newResourceSettings });
        }
    };

    useEffect(() => {
        updateSettings();
    }, []);

    useEffect(() => {
        updateSettings();
    }, [widget?.version, data, settings?.target]);

    const prepareData = () => {
        if (!height || !fileShares) return fileShares ?? [];
        const numberOfSlots = Math.floor(height / 44);
        const visibleDisksPaths = safeObjectValues(settings?.fileShares ?? {})
            .filter(({ hidden }) => !hidden)
            .map(({ path }) => path);

        const getFileShare = (sharePath: string) => fileShares.find((e) => e.sharePath === sharePath) as ShareInfo;
        const sharesData = visibleDisksPaths?.map?.(getFileShare).filter((e) => e) ?? fileShares;

        if (settings.automatic) {
            return sharesData.sort((a: ShareInfo, b: ShareInfo) => (a.usage / a.capacity < b.usage / b.capacity ? 1 : -1)).slice(0, numberOfSlots);
        }

        return sharesData.slice(0, numberOfSlots);
    };

    const preparedData = prepareData();

    return (
        <Box
            className={classes.container}
            {...props}
        >
            <Stack className={classes.stack}>
                <DeviceTitleOneLine
                    data={data}
                    mb="6"
                />
                <Stack
                    ref={ref}
                    className={classes.progressBarStack}
                >
                    {preparedData.map((fileShare: ShareInfo, i) => (
                        <DiskProgress
                            key={i}
                            highlightStages={settings?.fileShares?.[fileShare?.sharePath]?.highlightStages ?? { red: 100, yellow: 100 }}
                            path={fileShare?.sharePath}
                            usage={fileShare?.usage}
                            capacity={fileShare?.capacity}
                        />
                    ))}
                </Stack>
            </Stack>
        </Box>
    );
}

export default FileSharesWidget;
