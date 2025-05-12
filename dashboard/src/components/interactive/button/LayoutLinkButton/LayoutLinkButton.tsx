// components/LayoutLink.tsx
import { ActionIcon, Button } from "@mantine/core";
import { Link } from "react-router-dom";
import { IconEdit } from "@tabler/icons-react";

type LayoutLinkButtonProps = {
    name?: string;
    nameEditable?: boolean;
    [key: string]: any;
};

export function LayoutLinkButton({ name = "", nameEditable = true, ...props }: LayoutLinkButtonProps) {
    const encodedName = encodeURIComponent(name);

    return (
        <Button
            to={`/editor/${encodedName}`}
            component={Link}
            // rightSection={
            //     nameEditable && (
            //         <>
            //             <ActionIcon
            //                 variant="transparent"
            //                 color="var(--mantine-color-text)"
            //             >
            //                 <IconEdit size={16} />
            //             </ActionIcon>
            //         </>
            //     )
            // }
            aria-label={`Open ${name}`}
            {...props}
        >
            {name}
        </Button>
    );
}
