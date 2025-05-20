import CornerFloater from "../../wrappers/CornerFloater/CornerFloater";
import { Stack, UnstyledButton } from "@mantine/core";
import LayoutControls from "../../interactive/input/LayoutControls/LayoutControls";
import WidgetMenu from "../WidgetMenu/WidgetMenu";
import { useDisclosure } from "@mantine/hooks";
import classes from "./LayoutMenu.module.css";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";

const LayoutMenu = ({ isDraggingDroppable, setIsDraggingDroppable, currentDropType, setCurrentDropType }): React.JSX.Element => {
    const [expanded, { toggle }] = useDisclosure(false);

    return (
        <CornerFloater
            id="layoutMenu"
            height={expanded ? window.innerHeight / 2 - 20 : 90}
            width={300}
            hide={isDraggingDroppable}
        >
            <Stack className={classes.navbar}>
                <LayoutControls />
                {expanded && (
                    <WidgetMenu
                        isDragging={isDraggingDroppable}
                        setIsDragging={setIsDraggingDroppable}
                        currentDropType={currentDropType}
                        setCurrentDropType={setCurrentDropType}
                    />
                )}
                <UnstyledButton
                    className={classes.expandButton}
                    onClick={toggle}
                >
                    {expanded ? (
                        <>
                            Collapse
                            <IconChevronUp
                                size={12}
                                stroke={2}
                            />
                        </>
                    ) : (
                        <>
                            Expand
                            <IconChevronDown
                                size={12}
                                stroke={2}
                            />
                        </>
                    )}
                </UnstyledButton>
            </Stack>
        </CornerFloater>
    );
};

export default LayoutMenu;
