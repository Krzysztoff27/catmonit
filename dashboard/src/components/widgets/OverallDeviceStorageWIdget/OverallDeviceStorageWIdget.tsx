import { Paper, Text, Flex } from "@mantine/core";
import { DonutChart } from "@mantine/charts";
import { useElementSize } from "@mantine/hooks";
import { WidgetComponentProps } from "../../../types/components.types";
import { GRID_SIZE_PX } from "../../../config/widgets.config";
import DeviceTitleSmall from "../../display/DeviceTitle/DeviceTitleSmall";
import classes from "./OverallDeviceStorageWidget.module.css";

function OverallDeviceStorageWidget({ data, className, ...props }: WidgetComponentProps) {
    const total = data?.reduce?.((sum, item) => sum + item.value, 0);
    const used = data?.find?.((item) => item.name.toLowerCase() === "used")?.value || 0;
    const formattedData = data?.map?.((item) => {
        const percent = ((item.value / total) * 100).toFixed(1);
        const color = item.name.toLowerCase() === "used" ? "purple" : "var(--background-color-3)";
        return { ...item, color, label: `${item.value} GB (${percent}%)` };
    });
    const chartLabel = formattedData
        .map(
            (item) => `${item.name}: ${item.value}GB (${((item.value / total) * 100).toFixed(1)}%)` // ✅ fixed
        )
        .join("\n");
    const { ref, width, height } = useElementSize();
    const num_cols = Math.floor(width / GRID_SIZE_PX);
    const num_rows = Math.floor(height / GRID_SIZE_PX);
    console.log("cosl: " + num_cols + "\nrows: " + num_rows);
    const baseChartSize = 170;
    const chartScale = Math.min(num_cols, num_rows);
    const scaleMultiplier = chartScale <= 2 ? 1 : 1 + (chartScale - 2) * 0.25;
    const chartSize = baseChartSize * scaleMultiplier;
    return (
        <Paper
            ref={ref}
            {...props} // radius="md"
            // py="md"
            // px="md"
            className={`${classes.container} ${className}`} //   w="fit-content"
        >
            <DeviceTitleSmall
                name={data.hostname}
                address={data.ip}
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
                    chartLabel={`${used}GB/${total}GB`}
                    styles={{
                        label: {
                            fill: "var(--background-color-1)",
                            whiteSpace: "pre-line",
                        },
                    }}
                />
                <Text
                    mt="md"
                    c="var(--background-color-1)"
                    style={{
                        whiteSpace: "pre-line",
                    }}
                    display={height < 300 && width < 300 ? "none" : "initial"}
                >
                    {chartLabel}
                </Text>
            </Flex>
        </Paper>
    );
}

export default OverallDeviceStorageWidget;
