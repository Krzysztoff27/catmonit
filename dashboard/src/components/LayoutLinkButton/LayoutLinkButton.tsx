// components/LayoutLink.tsx
import { Button, ButtonProps } from "@mantine/core";
import classes from "./LayoutLinkButton.module.css"; // Optional: local styles if needed
import { useNavigate } from "react-router-dom";
import { ComponentPropsWithoutRef } from "react";

type LayoutLinkButtonProps = ButtonProps &
    ComponentPropsWithoutRef<"button"> & {
        name?: string;
        nameEditable?: boolean;
    };

export function LayoutLinkButton({ name = "", nameEditable = true, children, ...props }: LayoutLinkButtonProps) {
    const navigate = useNavigate();
    const encodedName = encodeURIComponent(name);

    const handleClick = () => {
        navigate(`/editor/${encodedName}`);
    };

    return (
        <Button
            className={classes.navlink}
            // rightSection={}
            onClick={handleClick}
            aria-label={`Open ${name}`}
            {...props}
        >
            {name || children}
        </Button>
    );
}
