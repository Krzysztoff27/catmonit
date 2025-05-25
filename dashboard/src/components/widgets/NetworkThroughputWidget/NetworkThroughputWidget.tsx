import { LineChart } from "@mantine/charts";
import { Box, Stack, Title } from "@mantine/core";
import classes from "./NetworkThroughputWidget.module.css";
import { WidgetContentProps } from "../../../types/components.types";

const NetworkThroughputWidget = ({ data, settings, ...props }: WidgetContentProps): React.JSX.Element => {
    return (
        <Box
            flex="1"
            h="100%"
            {...props}
        >
            <Stack h="100%">
                <LineChart
                    className={classes.chart}
                    unit="%"
                    yAxisProps={{ domain: [0, 100], ticks: [0, 50, 100] }}
                    data={[
                        { timestamp: 1, value: 24 },
                        { timestamp: 2, value: 36 },
                        { timestamp: 3, value: 55 },
                        { timestamp: 4, value: 23 },
                        { timestamp: 5, value: 87 },
                        { timestamp: 6, value: 95 },
                        { timestamp: 7, value: 2 },
                        { timestamp: 8, value: 30 },
                        { timestamp: 8, value: 80 },
                        { timestamp: 8, value: 30 },
                        { timestamp: 8, value: 38 },
                        { timestamp: 8, value: 35 },
                        { timestamp: 8, value: 49 },
                    ]}
                    series={[{ name: "value", color: "indigo.6" }]}
                    dataKey="timestamp"
                    curveType="linear"
                    withPointLabels={false}
                />
            </Stack>
        </Box>
    );
};

export default NetworkThroughputWidget;
