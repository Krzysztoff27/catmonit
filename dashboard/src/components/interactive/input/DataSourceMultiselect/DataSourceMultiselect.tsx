import { MultiSelect, Stack, Title } from "@mantine/core";
import classes from "./DataSourceMultiselect.module.css";
import { useWidgets } from "../../../../contexts/WidgetContext/WidgetContext";
import { WidgetData } from "../../../../types/api.types";

interface DataSourceMultiselectProps {
    index: number;
    widget: WidgetData;
    onChange?: (sources: string[]) => void;
}

const SELECT_DATA = [
    { value: "disks", label: "Storage" },
    { value: "network", label: "Network" },
    { value: "fileShares", label: "File Shares" },
];

function DataSourceMultiselect({ index, widget, onChange }: DataSourceMultiselectProps) {
    const { setWidgetSettings } = useWidgets();

    const changeSources = (sources: string[]) => {
        setWidgetSettings(index, { ...widget.settings, sources });
        onChange?.(sources);
    };

    return (
        <Stack className={classes.container}>
            <Title order={4}>Data sources</Title>
            <MultiSelect
                unselectable="off"
                placeholder="Select data sources"
                data={SELECT_DATA}
                value={widget.settings.target}
                onChange={changeSources}
            />
        </Stack>
    );
}

export default DataSourceMultiselect;
