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

    const fileShares: ShareInfo[] = data?.sharesInfo ?? [];

    const prepareData = () => {
        if (!height || !fileShares) return fileShares ?? [];

        const numberOfSlots = Math.floor((height + 12) / 44);
        const visibleDisksPaths = safeObjectValues(settings?.fileShares ?? {})
            .filter(({ hidden }) => !hidden)
            .map(({ path }) => path);

        const getFileShare = (sharePath: string) => fileShares.find((e) => e.sharePath === sharePath) as ShareInfo;
        const sharesData = visibleDisksPaths?.map?.(getFileShare) ?? fileShares;

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
                    {preparedData.map((fileShare: ShareInfo, i) => (
                        <DiskProgress
                            key={i}
                            highlightStages={settings?.fileShares?.[fileShare.sharePath]?.highlightStages ?? { red: 100, yellow: 100 }}
                            path={fileShare.sharePath}
                            usage={fileShare.usage}
                            capacity={fileShare.capacity}
                        />
                    ))}
                </Stack>
            </Stack>
        </Box>
    );
}

export default FileSharesWidget;
