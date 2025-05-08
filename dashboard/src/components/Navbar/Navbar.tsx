import { ActionIcon, Button, Flex, Group, ScrollArea, Stack } from "@mantine/core";
import React, { useState } from "react";
import classes from "./Navbar.module.css";
import { IconChevronLeft, IconChevronRight, IconPlus } from "@tabler/icons-react";
import ColorSchemeToggle from "../ColorSchemeToggle/ColorSchemeToggle";
import LogoutButton from "../LogoutButton/LogoutButton";
import { LayoutLinkButton } from "../LayoutLinkButton/LayoutLinkButton";
import { LayoutLinkActionIcon } from "../LayoutLinkActionIcon/LayoutLinkActionIcon";

const Navbar = ({ expanded, toggle }): React.JSX.Element => {
    const [names, setNames] = useState(Array.from({ length: 8 }).map((_, i) => `New Layout ${i}`));

    return (
        <Stack
            className={classes.navbar}
            w={expanded ? "100%" : "74px"}
        >
            <Group
                className={classes.buttonGroup}
                miw={0}
            >
                <ActionIcon
                    onClick={toggle}
                    className={classes.toggleButton}
                    variant="default"
                    size="xl"
                    bd="none"
                >
                    {expanded ? <IconChevronLeft size={22} /> : <IconChevronRight size={22} />}
                </ActionIcon>
            </Group>
            <ScrollArea
                className={classes.layoutScrollArea}
                offsetScrollbars
                display={!expanded ? "none" : undefined}
            >
                <Stack className={classes.navlinkStack}>
                    {Array.from({ length: 8 }).map((_, i) =>
                        expanded ? (
                            <LayoutLinkButton
                                key={i}
                                name={names[i]}
                            />
                        ) : (
                            <LayoutLinkActionIcon name={names[i]} />
                        )
                    )}
                    {expanded ? (
                        <LayoutLinkButton
                            onClick={() => {}}
                            nameEditable={false}
                            leftSection={<IconPlus size={18} />}
                        >
                            Create new layout
                        </LayoutLinkButton>
                    ) : (
                        <ActionIcon
                            variant="default"
                            size="lg"
                            aria-label="Create new layout"
                        >
                            <IconPlus />
                        </ActionIcon>
                    )}
                </Stack>
            </ScrollArea>
            <Flex
                direction={expanded ? "row" : "column"}
                className={classes.buttonGroup}
                mt="auto"
                miw={240}
            >
                <ColorSchemeToggle bd="none" />
                <LogoutButton bd="none" />
            </Flex>
        </Stack>
    );
};

export default Navbar;
