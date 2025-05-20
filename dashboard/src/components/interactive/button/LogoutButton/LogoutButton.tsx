import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";

import useAuth from "../../../../hooks/useAuth";

const LogoutButton = (props: ActionIconProps): React.JSX.Element => {
    const { logout } = useAuth();
    return (
        <ActionIcon
            onClick={logout}
            variant="default"
            size="xl"
            aria-label="Toggle color scheme"
            {...props}
        >
            <IconLogout size={22} />
        </ActionIcon>
    );
};

export default LogoutButton;
