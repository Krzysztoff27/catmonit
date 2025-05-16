import { LineChart } from "@mantine/charts";
import { Paper, Stack, Title } from "@mantine/core";
import classes from "./NetworkThroughputWidget.module.css";

const NetworkThroughputWidget = ({ data, settings, className, ...props }): React.JSX.Element => {
    return (
        <Paper
            flex="1"
            bg=" var(--background-color-7)"
            p="lg"
            {...props}
            className={`${className}`}
        >
            <Stack h="100%">
                <Title
                    order={3}
                    className={classes.title}
                >
                    Network throughput
                </Title>
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
        </Paper>
    );
};

export default NetworkThroughputWidget;
