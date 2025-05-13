import { Paper, Text, Flex } from "@mantine/core";
import { DonutChart } from "@mantine/charts";
import { useElementSize } from "@mantine/hooks";
import { WidgetComponentProps } from "../../../types/components.types";
import { GRID_SIZE_PX } from "../../../config/widgets.config";
import classes from "./OverallDeviceStorageWidget.module.css";
import "@mantine/charts/styles.css";
import { DeviceDiskData } from "../../../types/api.types";
import { useEffect } from "react";
import DeviceTitleOneLine from "../../display/DeviceTitle/DeviceTitleOneLine";

function OverallDeviceStorageWidget({ data, className, settings, ...props }: WidgetComponentProps) {
    // DATA CALCULAIONS ETC.
    const { hostname, ip, disks } = data as DeviceDiskData;
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
    const total = disks?.reduce((sum, d) => sum + d.storageLimit, 0) ?? 0;
    const used = disks?.reduce((sum, d) => sum + d.storageCurrent, 0) ?? 0;
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

    const chartLabel = formattedData.map((item) => `${item.name}\n ${item.value}GB (${((item.value / total) * 100).toFixed(1)}%)`).join("\n");

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

    return (
        <Paper
            ref={ref}
            {...props}
            py="md"
            px="md"
            className={`${classes.container} ${className}`}
            withBorder
        >
            <DeviceTitleOneLine
                data={data}
                mb="md"
            />
            <Flex
                align="center"
                direction={num_cols > num_rows ? "row" : "column"}
            >
                <DonutChart
                    data={formattedData}
                    withTooltip={false}
                    size={chartSize}
                    w={chartSize}
                    h={chartSize}
                    mx="md"
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
                {/* @TODO center voth horizontyally and vbertically, also the chart */}
                <Text
                    mt="md"
                    w="100%"
                    c="var(--background-color-1)"
                    style={{ whiteSpace: "pre-line" }}
                    display={height < 300 && width < 300 ? "none" : "initial"}
                >
                    {formattedData.map((item, index) => (
                        <div
                            key={index}
                            style={{  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}
                        >
                            <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{item.name}</span>
                            
                            <span>{`${item.value}GB (${((item.value / total) * 100).toFixed(1)}%)`}</span>
                        </div>
                    ))}
                </Text>
            </Flex>
        </Paper>
    );
}

export default OverallDeviceStorageWidget;
