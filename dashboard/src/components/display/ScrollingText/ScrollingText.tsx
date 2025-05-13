import { Box, BoxComponentProps, PolymorphicComponentProps, Space, Text } from "@mantine/core";
import classes from "./ScrollingText.module.css";
import { useElementSize } from "@mantine/hooks";
import { useEffect, useState } from "react";

const ScrollingText = ({ children, scroll = true, ...props }): React.JSX.Element => {
    const { width: containerWidth, ref: containerRef } = useElementSize();
    const { width: textWidth, ref: textRef } = useElementSize();
    const [shouldScroll, setShouldScroll] = useState(false);

    useEffect(() => {
        setShouldScroll(scroll && containerWidth > 0 && textWidth > 0 && textWidth > containerWidth);
    }, [scroll, textWidth, containerWidth]);

    return (
        <Box
            className={classes.container}
            ref={containerRef}
            {...props}
        >
            <Box className={`${classes.text} ${shouldScroll ? classes.scrolling : ""}`}>
                <div ref={textRef}>{children}</div>
                {shouldScroll && (
                    <>
                        <div className={classes.spacer} />
                        <div>{children}</div>
                    </>
                )}
            </Box>
        </Box>
    );
};

export default ScrollingText;
