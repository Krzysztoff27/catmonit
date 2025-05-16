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
    console.log(getWidget(index));
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
            //label: `${used} GB (${((used / total) * 100).toFixed(1)}%)`,
        },
        {
            name: "Free",
            value: free,
            color: "var(--background-color-3)",
            //label: `${free} GB (${((free / total) * 100).toFixed(1)}%)`,
        },
    ];
    //funckja na procenty
    const chartLabel = formattedData.map((item) => `${item.name}\n ${item.value}GB (${((item.value / total) * 100).toFixed(1)}%)`).join("\n");

    // const prepareLabel = (label, value) => `${label}\n ${value}GB (${(value / total * 100).toFixed(1)}%)`;
    // const chartLabel

    // RESPONSIVENESS
    const { ref, width, height } = useElementSize();
    const num_cols = Math.round(width / GRID_SIZE_PX);
    const num_rows = Math.round(height / GRID_SIZE_PX);
    const baseChartSize = 170;
    const chartScale = Math.min(num_cols, num_rows);
    const scaleMultiplier = chartScale <= 2 ? 1 : 1 + (chartScale - 2) * 0.25;
    const chartSize = baseChartSize * scaleMultiplier;
    useEffect(() => {
        console.log("Num cols:" + num_cols); // Logs every time num_cols changes
        console.log("Num rows:" + num_rows); // Logs every time num_cols changes
        console.log("Height:" + height); // Logs every time num_cols changes
        console.log("WIdth:" + width); // Logs every time num_cols changes
        console.log("grid size: " + GRID_SIZE_PX);
    }, [num_cols]);
    console.log("chasrtsize: " + chartSize);
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
                direction={num_cols > num_rows ? "row" : "column"}
                justify="space-evenly"
            >
                <DonutChart
                    data={formattedData}
                    withTooltip={false}
                    size={chartSize}
                    w={chartSize}
                    h={chartSize}
                    // mx="md"
                    mt="sm"
                    chartLabel={`${used}GB/${total}GB`}
                    styles={{
                        label: {
                            fill: "var(--background-color-1)",
                            whiteSpace: "pre-line",
                            //change font size later
                        },
                    }}
                />
                {/* flex justify space evenly */}
                {/* @TODO center voth horizontyally and vbertically, also the chart */}
                <Flex
                    mt="md"
                    c="var(--background-color-1)"
                    justify="space-evenly"
                    align="center"
                    direction={num_cols == 3 && num_rows >= 3 ? "row" : "column"}
                    wrap="wrap"
                    w="100%"
                    style={{
                        // width: num_cols !== 3 || num_rows !== 2 ? "100%" : "auto",
                        maxWidth: `calc(100% - ${chartSize}px - 2rem)`, // prevents overlap
                        flexShrink: 1,
                    }}
                >
                    {formattedData.map((item, index) => (
                        <Text
                            display={height < 300 && width < 300 ? "none" : "initial"}
                            key={index}
                            ta="center"
                            style={{ whiteSpace: "pre-line" }}
                        >
                            <span style={{ fontWeight: 600 }}>{item.name}</span>
                            {"\n"}
                            <span>{`${item.value}GB (${((item.value / total) * 100).toFixed(1)}%)`}</span>
                            {"\n"}
                            {"\n"}
                        </Text>
                    ))}
                </Flex>
            </Flex>
        </Box>
    );
}

export default OverallDeviceStorageWidget;
