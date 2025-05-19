import { Text, Flex, Box } from "@mantine/core";
import { DonutChart } from "@mantine/charts";
import { useElementSize } from "@mantine/hooks";
import { WidgetContentProps } from "../../../types/components.types";
import { GRID_SIZE_PX } from "../../../config/widgets.config";
import classes from "./OverallDeviceStorageWidget.module.css";
import { DeviceDiskData } from "../../../types/api.types";
import { useEffect } from "react";
import DeviceTitleOneLine from "../../display/DeviceTitle/DeviceTitleOneLine";
import { safeObjectValues } from "../../../utils/object";
import { useWidgets } from "../../../contexts/WidgetContext/WidgetContext";

function OverallDeviceStorageWidget({ index, data, settings, ...props }: WidgetContentProps) {
    // DATA CALCULAIONS ETC.
    const { getWidget } = useWidgets();
    const widget = getWidget(index);

    if (!widget || !widget.rect) {
        console.warn("Widget or rect not available:", widget);
        return null; // Or render fallback UI
    }

    const { w, h } = widget.rect;
    console.log("Width:", w, "Height:", h);

    const { hostname, ip, disks } = data as DeviceDiskData; //rename to data later
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
    const disksArray = safeObjectValues(disks);
    const total = disksArray?.reduce((sum, d) => sum + d.storageLimit, 0) ?? 0;
    const used = disksArray?.reduce((sum, d) => sum + d.storageCurrent, 0) ?? 0;
    const free = total - used;

    const formattedData = [
        {
            name: "Used",
            value: used,
            color: "blue",
        },
        {
            name: "Free",
            value: free,
            color: "var(--background-color-3)",
        },
    ];
    // creating labels, calculating % etc.
    const chartLabel = formattedData.map((item) => `${item.name}\n ${item.value}GB (${((item.value / total) * 100).toFixed(1)}%)`).join("\n");

    // RESPONSIVENESS
    const { ref } = useElementSize();
    // const { ref, width, height } = useElementSize();
    //     const baseChartSize = 170;
    //     const chartScale = Math.min(num_cols, num_rows);
    //     const scaleMultiplier = chartScale <= 2 ? 1 : 1 + (chartScale - 2) * 0.25;
    //     const chartSize = baseChartSize * scaleMultiplier;
    const textDirection = w >= 3 && h >= 3 && !(w == 4 && h == 3) ? "row" : "column"; // column for under each other, row for side by side
    const layoutDirection = w > h ? "row" : "column"; // column for under each other, row for side by side
    console.log(textDirection);
    return (
        <Box
            ref={ref}
            className={classes.container}
            {...props}
        >
            <DeviceTitleOneLine data={data} />
            <Flex
                direction={layoutDirection}
                // {/* Flex container for centering elements horizontally and spacing them evenly */}
                className={classes.centeredContainer}
            >
                <Flex
                    align="center"
                    justify="center"
                    w="100%"
                    h="100%"
                >
                    <DonutChart
                        data={formattedData}
                        withTooltip={false}
                        size={170}
                        h={170}
                        w={170}
                        chartLabel={`${used}GB/${total}GB`}
                        className={classes.chart}
                        bg="red"
                    />
                </Flex>

                {/* <Flex
                    display={h < 3 && w < 3 ? "none" : "initial"}
                    direction={layoutDirection}
                    align="center"
                    justify="center"
                    className={classes.textContainer}
                > */}
                <Flex
                    display={h < 3 && w < 3 ? "none" : "initial"}
                    direction={textDirection}
                    justify="space-evenly"
                    align="center"
                    style={{ width: "100%", height: "100%" }}
                >
                    {formattedData.map((item, index) => (
                        <Text
                            bg="blue"
                            key={index}
                            ta="center"
                            // style={{ whiteSpace: "pre-line" }}
                        >
                            <span style={{ fontWeight: 600 }}>{item.name}</span>
                            <br />
                            <span>{`${item.value}GB (${((item.value / total) * 100).toFixed(1)}%)`}</span>
                            <br />
                            <br />
                        </Text>
                    ))}
                </Flex>
                {/* </Flex> */}
            </Flex>
        </Box>
    );
}

export default OverallDeviceStorageWidget;
