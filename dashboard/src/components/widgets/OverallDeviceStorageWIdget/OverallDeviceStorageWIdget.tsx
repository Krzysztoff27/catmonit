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
    const { getWidget, getWidgetData } = useWidgets();
    // const { hostname, ip, disks } = data as DeviceDiskData; //rename to data later
    const { hostname, ip, disks } = data;
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
    const { ref, width, height } = useElementSize();
    // console.log("width" + getWidgetSize(width));
    // console.log("height" + getWidgetSize(height));

    //     const num_cols = Math.round(width / GRID_SIZE_PX);
    //     const num_rows = Math.round(height / GRID_SIZE_PX);
    //     const baseChartSize = 170;
    //     const chartScale = Math.min(num_cols, num_rows);
    //     const scaleMultiplier = chartScale <= 2 ? 1 : 1 + (chartScale - 2) * 0.25;
    //     const chartSize = baseChartSize * scaleMultiplier;
    //     useEffect(() => {
    //         console.log("Num cols:" + num_cols); // Logs every time num_cols changes
    //         console.log("Num rows:" + num_rows); // Logs every time num_cols changes
    //         console.log("Height:" + height); // Logs every time num_cols changes
    //         console.log("WIdth:" + width); // Logs every time num_cols changes
    //         console.log("grid size: " + GRID_SIZE_PX);
    //         console.log("function get size width: " + getWidgetSize(width));
    //         console.log("function get size height: " + getWidgetSize(height));
    //     }, [num_cols]);
    //     // console.log("chasrtsize: " + chartSize);
    const layoutDirection = width == 3 && height == 2 ? "row" : "column"; // column for under each other, row for side by side
    return (
        <Box
            ref={ref}
            className={classes.container}
            {...props}
        >
            <DeviceTitleOneLine
                data={data}
                mb="md"
            />
            <Flex
                align="center"
                direction={layoutDirection}
                justify="space-evenly"
                // {/* Flex container for centering elements horizontally and spacing them evenly */}
                className={classes.centeredContainer}
            >
                <DonutChart
                    data={formattedData}
                    withTooltip={false}
                    size={170} // Increased size for example
                    h={170} // Height of the chart
                    w={170} // Width of the chart
                    chartLabel={`${used}GB/${total}GB`}
                    className={classes.chart}
                />
                <Flex
                    display={height < 3 && width < 3 ? "none" : "initial"}
                    direction={layoutDirection}
                    align="center"
                    justify="center"
                    className={classes.textContainer}
                >
                    {formattedData.map((item, index) => (
                        <Text
                            key={index}
                            ta="center"
                            // style={{ whiteSpace: "pre-line" }}
                        >
                            <span style={{ fontWeight: 600 }}>{item.name}</span>
                            {"\n"}
                            <span>{`${item.value}GB (${((item.value / total) * 100).toFixed(1)}%)`}</span>
                            {/* {"\n"}
                        {"\n"} */}
                        </Text>
                    ))}
                </Flex>
            </Flex>
        </Box>
    );
}

export default OverallDeviceStorageWidget;
