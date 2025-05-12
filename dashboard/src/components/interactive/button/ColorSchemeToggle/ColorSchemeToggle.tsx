import { ActionIcon, ActionIconProps, useComputedColorScheme, useMantineColorScheme } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";
import classes from "./ColorSchemeToggle.module.css";

const ColorSchemeToggle = (props: ActionIconProps): React.JSX.Element => {
    const { setColorScheme } = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme("light", { getInitialValueInEffect: true });

    return (
        <ActionIcon
            onClick={() => setColorScheme(computedColorScheme === "light" ? "dark" : "light")}
            variant="default"
            size="xl"
            aria-label="Toggle color scheme"
            {...props}
        >
            <IconSun
                className={`${classes.icon} ${classes.light}`}
                stroke={1.5}
            />
            <IconMoon
                className={`${classes.icon} ${classes.dark}`}
                stroke={1.5}
            />
        </ActionIcon>
    );
};

export default ColorSchemeToggle;
