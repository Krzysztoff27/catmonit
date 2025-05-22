import { Box, Stack, Title } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { WidgetContentProps } from "../../../types/components.types";
import DiskProgress from "../../display/DiskProgress/DiskProgress";
import classes from "./FileSharesWidget.module.css";
import DeviceTitleOneLine from "../../display/DeviceTitle/DeviceTitleOneLine";
import { safeObjectValues } from "../../../utils/object";
import { ShareInfo } from "../../../types/api.types";

function FileSharesWidget({ data, settings, ...props }: WidgetContentProps) {
    let { height, ref } = useElementSize();

    const prepareData = () => {
        if (!height || !data?.fileShares) return safeObjectValues(data?.fileShares) ?? [];
        const numberOfSlots = Math.floor((height + 12) / 44);
        const visiblefileShares = safeObjectValues(settings?.fileShares)
            ?.filter(({ hidden }) => !hidden)
            .map(({ path }) => path);
        const fileSharesData = visiblefileShares?.map((path: string) => data.fileShares[path]) ?? safeObjectValues(data.fileShares);

        if (settings.automatic) {
            return fileSharesData.sort((a: ShareInfo, b: ShareInfo) => (a.usage / a.capacity < b.usage / b.capacity ? 1 : -1)).slice(0, numberOfSlots);
        }

        return fileSharesData.slice(0, numberOfSlots);
    };

    const fileSharesData = prepareData();
    return (
        <Box
            className={classes.container}
            {...props}
        >
            <Stack className={classes.stack}>
                <Title
                    order={3}
                    className={classes.title}
                >
                    File Shares
                </Title>
                <DeviceTitleOneLine
                    data={data}
                    mb="6"
                />
                <Stack
                    ref={ref}
                    className={classes.progressBarStack}
                >
                    {fileSharesData.map((fileShare: ShareInfo, i) => (
                        <DiskProgress
                            key={i}
                            highlightStages={settings?.fileShares?.[fileShare.sharePath]?.highlightStages ?? { red: 100, yellow: 100 }}
                            {...fileShare}
                        />
                    ))}
                </Stack>
            </Stack>
        </Box>
    );
}

export default FileSharesWidget;
