import { Flex } from "@mantine/core";
import React from "react";
import WidgetBoard from "../../components/layout/WidgetBoard/WidgetBoard";
import { useLayouts } from "../../contexts/LayoutContext/LayoutContext";
import { useParams } from "react-router-dom";

const Dashboard = (): React.JSX.Element => {
    const { layoutUuid } = useParams();
    const { setCurrent } = useLayouts();

    setCurrent(layoutUuid!);

    return (
        <Flex
            flex={1}
            h="100vh"
        >
            <WidgetBoard editable={false} />
        </Flex>
    );
};

export default Dashboard;
