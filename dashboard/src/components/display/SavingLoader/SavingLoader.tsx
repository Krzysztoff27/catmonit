import { Group, Loader, Text } from "@mantine/core";
import { useWidgets } from "../../../contexts/WidgetContext/WidgetContext";
import CornerFloater from "../../wrappers/CornerFloater/CornerFloater";

const SavingLoader = (): React.JSX.Element => {
    const { isSaving } = useWidgets();

    return (
        <CornerFloater
            id="saveIndicator"
            width={120}
            height={30}
            bg="transparent"
            bd="transparent"
        >
            <Group
                h="100%"
                justify="center"
                gap="xs"
                display={isSaving ? "flex" : "none"}
            >
                <Text
                    c="white"
                    fw="500"
                >
                    saving
                </Text>
                <Loader
                    size="sm"
                    color="white"
                    type="bars"
                    strokeWidth={16}
                    h="10px"
                />
            </Group>
        </CornerFloater>
    );
};

export default SavingLoader;
