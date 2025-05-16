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
    const { hostname, ip, disks } = devices as DeviceDiskData; //TODO rename to data later
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
    const total = disks?.reduce((sum, d) => sum + d.storageLimit, 0) ?? 0;
    const used = disks?.reduce((sum, d) => sum + d.storageCurrent, 0) ?? 0;
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
    console.log(layoutDirection);
    return (
        <Paper
            ref={ref}
            {...props}
            className={`${classes.container} ${className}`}
            withBorder
        >
            {/* Title at the top */}
            <DeviceTitleOneLine data={devices} />

            {/* <div
    style={{
      display: "flex",
      flexDirection: "column", // Align items vertically
      justifyContent: "center", // Vertically center the items
      alignItems: "center", // Horizontally center the items
      flexGrow: 1, // Allow this wrapper to take up the remaining space
      marginTop: "20px", // Add top margin to give breathing room from the title
      marginBottom: "20px", // Add bottom margin to keep some space between the elements and the bottom
    }}
  > */}
            {/* Flex container for centering elements horizontally and spacing them evenly */}
            <Flex className={classes.centeredContainer}>
                <DonutChart
                    data={formattedData}
                    withTooltip={false}
                    size={170} // Increased size for example
                    h={170} // Height of the chart
                    w={170} // Width of the chart
                    chartLabel={`${used}GB/${total}GB`}
                    className={`${classes.chart} ${className}`}
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
            {/* </div> */}
        </Paper>
    );
}

export default OverallDeviceStorageWidget;
