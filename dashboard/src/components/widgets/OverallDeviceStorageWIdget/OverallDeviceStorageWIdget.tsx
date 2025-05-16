import { Paper, Text, Flex } from "@mantine/core";
import { DonutChart } from "@mantine/charts";
import { useElementSize } from "@mantine/hooks";
import { WidgetComponentProps } from "../../../types/components.types";
import { GRID_SIZE_PX } from "../../../config/widgets.config";
import classes from "./OverallDeviceStorageWidget.module.css";
import { DeviceDiskData } from "../../../types/api.types";
import { useEffect } from "react";
import DeviceTitleOneLine from "../../display/DeviceTitle/DeviceTitleOneLine";

const devices: DeviceDiskData = {
    uuid: "1234",
    hostname: "Tux",
    ip: "192.168.1.1",
    mask: "/24",
    disks: [
        {
            path: "/dev/sda",
            storageLimit: 100,
            storageCurrent: 50,
        },
        {
            path: "/dev/sdb",
            storageLimit: 100,
            storageCurrent: 80,
        },
        {
            path: "/dev/sdc",
            storageLimit: 50,
            storageCurrent: 15,
        },
    ],
};
function OverallDeviceStorageWidget({ data, className, settings, ...props }: WidgetComponentProps) {
    // DATA CALCULAIONS ETC.
    const { hostname, ip, disks } = devices as DeviceDiskData; //rename to data later
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
        <Paper
            ref={ref}
            {...props}
            // py="md"
            // px="md"
            className={`${classes.container} ${className}`}
            withBorder
        >
            <DeviceTitleOneLine
                data={devices} //rename to data
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
        </Paper>
    );
}

export default OverallDeviceStorageWidget;
