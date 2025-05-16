import { Grid, NumberInput, Title } from "@mantine/core";
import { useState } from "react";
import { DeviceDiskData } from "../../../types/api.types";
import TargetSelect from "../../interactive/input/TargetSelect/TargetSelect";
import { useWidgets } from "../../../contexts/WidgetContext/WidgetContext";

function OverallDeviceStorageDrawer({ index }) {
    const { getWidget } = useWidgets();
    const widget = getWidget(index);

    return (
        <>
            <Title
                order={4}
                mb="md"
            >
                Widget properties
            </Title>
            <TargetSelect
                index={index}
                widget={widget}
            />
        </>
    );
}

export default OverallDeviceStorageDrawer; // ! TODO napisac ile dyskow sie wywietli przy tym rozmiarze
