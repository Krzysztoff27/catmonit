import { ActionIcon, Button, Flex, Group, ScrollArea, Stack } from "@mantine/core";
import { IconChevronLeft, IconChevronRight, IconPlus } from "@tabler/icons-react";
import React, { useState } from "react";
import ColorSchemeToggle from "../../interactive/button/ColorSchemeToggle/ColorSchemeToggle";
import { LayoutLinkActionIcon } from "../../interactive/button/LayoutLinkActionIcon/LayoutLinkActionIcon";
import { LayoutLinkButton } from "../../interactive/button/LayoutLinkButton/LayoutLinkButton";
import LogoutButton from "../../interactive/button/LogoutButton/LogoutButton";
import classes from "./Navbar.module.css";

const Navbar = ({ expanded, toggle }): React.JSX.Element => {
    const [names, setNames] = useState(Array.from({ length: 24 }).map((_, i) => `New Layout ${i}`));

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
                    variant="default"
                    size="xl"
                >
                    {expanded ? <IconChevronLeft size={22} /> : <IconChevronRight size={22} />}
                </ActionIcon>
            </Group>
            <ScrollArea
                className={classes.layoutScrollArea}
                scrollbarSize={expanded ? "0.6rem" : "0.5rem"}
            >
                <Stack
                    className={classes.navlinkStack}
                    align="center"
                    gap={expanded ? "0" : "8"}
                    px={expanded ? "16" : "4"}
                >
                    {Array.from({ length: 24 }).map((_, i) =>
                        expanded ? (
                            <LayoutLinkButton
                                key={i}
                                name={names[i]}
                                className={classes.navlink}
                            />
                        ) : (
                            <LayoutLinkActionIcon
                                key={i}
                                name={names[i]}
                                index={i + 1}
                            />
                        )
                    )}
                    {expanded ? (
                        <Button
                            className={classes.navlink}
                            onClick={() => {}}
                            leftSection={<IconPlus size={18} />}
                        >
                            Create new layout
                        </Button>
                    ) : (
                        <ActionIcon
                            variant="default"
                            size="xl"
                            aria-label="Create new layout"
                            mt="8"
                        >
                            <IconPlus />
                        </ActionIcon>
                    )}
                </Stack>
            </ScrollArea>
            <Flex
                direction={expanded ? "row" : "column"}
                className={classes.buttonGroup}
                miw={240}
            >
                <ColorSchemeToggle />
                <LogoutButton />
            </Flex>
        </Stack>
    );
};

export default Navbar;
