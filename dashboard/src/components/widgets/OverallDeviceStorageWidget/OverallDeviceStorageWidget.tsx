import { Text, Flex, Box } from "@mantine/core";
import { DonutChart } from "@mantine/charts";
import { useElementSize } from "@mantine/hooks";
import { WidgetContentProps } from "../../../types/components.types";
import classes from "./OverallDeviceStorageWidget.module.css";
import { DeviceInfo, DiskInfo } from "../../../types/api.types";
import DeviceTitleOneLine from "../../display/DeviceTitle/DeviceTitleOneLine";
import { safeObjectValues } from "../../../utils/object";
import { useWidgets } from "../../../contexts/WidgetContext/WidgetContext";
import { formatBytes } from "../../../utils/formatBytes";

interface OverallDeviceStorageWidgetProps extends WidgetContentProps {
    data: {
        deviceInfo: DeviceInfo;
        disksInfo?: DiskInfo[];
    };
}

function OverallDeviceStorageWidget({ index, data, settings, ...props }: OverallDeviceStorageWidgetProps) {
    // DATA CALCULAIONS ETC.
    const { getWidget } = useWidgets();
    const widget = getWidget(index);

    if (!widget || !widget.rect) {
        return null;
    }

    const { w, h } = widget.rect;

    const chartScale = Math.min(w, h);
    const minSize = 150;
    const maxSize = 320;

    //CHART SIZE
    const chartSize = minSize + (chartScale - 2) * ((maxSize - minSize) / 2);
    const cappedChartSize = Math.min(Math.max(chartSize, minSize), maxSize);

    //FONT SIZE
    const fontSize = 16 + (chartScale - 2) * 2;
    const labelSize = 16 + (23 - 16) * ((chartScale - 2) / (4 - 2));

    //THICKNESS
    const minThickness = 20;
    const maxThickness = 40;
    const thickness = minThickness + ((chartSize - minSize) * (maxThickness - minThickness)) / (maxSize - minSize);

    const disksArray = safeObjectValues(data.disksInfo ?? []); //@TODO: [] or {}? I guess [] in this case

    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
    const used = disksArray?.reduce((sum, d) => sum + d.usage, 0) ?? 0;
    const total = disksArray?.reduce((sum, d) => sum + d.capacity, 0) ?? 0;
    const free = total - used;

    const formattedData = [
        {
            name: "Used",
            value: used,
            displayValue: formatBytes(used),
            color: "#4c6ef5", //or #3d53a9
        },
        {
            name: "Free",
            value: free,
            displayValue: formatBytes(free),
            color: "var(--background-color-5)",
        },
    ];

    const { ref } = useElementSize();
    const textDirection = w >= 3 && h >= 3 && !(w == 4 && h == 3) ? "row" : "column";
    const layoutDirection = w > h ? "row" : "column";

    return (
        <Box
            ref={ref}
            className={classes.container}
            {...props}
        >
            <DeviceTitleOneLine data={data} />
            <Flex
                direction={layoutDirection}
                className={classes.centeredContainer}
                w="100%"
                h="100%"
            >
                <Flex
                    align="center"
                    justify="center"
                    w="100%"
                    h="100%"
                    pos="relative"
                >
                    <DonutChart
                        data={formattedData}
                        withTooltip={false}
                        size={cappedChartSize}
                        h={cappedChartSize}
                        w={cappedChartSize}
                        thickness={thickness}
                        className={classes.chart}
                        chartLabel=""
                    />
                    <Text
                        pos="absolute"
                        top="50%"
                        left="50%"
                        fz={labelSize}
                        style={{
                            transform: "translate(-50%, -50%)",
                            whiteSpace: "pre-line",
                            textAlign: "center",
                        }}
                    >
                        {`${formatBytes(used)}\n/${formatBytes(total)}`}
                    </Text>
                </Flex>

                <Flex
                    display={h < 3 && w < 3 ? "none" : "flex"}
                    direction={textDirection}
                    gap="xl"
                    justify="center"
                    align="center"
                    w="100%"
                    h="100%"
                >
                    {formattedData.map((item, index) => (
                        <Flex
                            key={index}
                            direction="column"
                            align="center"
                        >
                            <Text
                                fw={600}
                                style={{ fontSize }}
                            >
                                {item.name}
                            </Text>
                            <Text style={{ fontSize: fontSize - 2 }}>{`${item.displayValue} (${((item.value / total) * 100).toFixed(1)}%)`}</Text>
                        </Flex>
                    ))}
                </Flex>
            </Flex>
        </Box>
    );
}

export default OverallDeviceStorageWidget;