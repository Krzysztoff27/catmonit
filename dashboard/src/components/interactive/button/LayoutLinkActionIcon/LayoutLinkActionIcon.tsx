// components/LayoutLink.tsx
import { ActionIcon, ActionIconProps } from "@mantine/core";
import { Link } from "react-router-dom";

interface LayoutLinkProps extends ActionIconProps {
    name: string;
    index: number;
}

export function LayoutLinkActionIcon({ name, index, ...props }: LayoutLinkProps) {
    const encodedName = encodeURIComponent(name);

    return (
        <ActionIcon
            component={Link}
            to={`/editor/${encodedName}`}
            variant="default"
            size="xl"
            aria-label={`Open ${name}`}
            title={name}
            {...props}
        >
            {index}
        </ActionIcon>
    );
}
