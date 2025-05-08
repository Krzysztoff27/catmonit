// components/LayoutLink.tsx
import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

interface LayoutLinkProps extends ActionIconProps {
    name: string;
}

export function LayoutLinkActionIcon({ name, ...props }: LayoutLinkProps) {
    const navigate = useNavigate();
    const encodedName = encodeURIComponent(name);

    const handleClick = () => {
        navigate(`/editor/${encodedName}`);
    };

    return (
        <ActionIcon
            onClick={handleClick}
            variant="default"
            size="lg"
            aria-label={`Open ${name}`}
            title={name}
            {...props}
        >
            <IconEdit />
        </ActionIcon>
    );
}
