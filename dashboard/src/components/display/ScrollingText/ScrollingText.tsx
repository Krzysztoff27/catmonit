import { Box } from "@mantine/core";
import classes from "./ScrollingText.module.css";
import { useElementSize } from "@mantine/hooks";
import { useEffect, useState } from "react";

const SPEED_PIXELS_PER_SECOND = 60;

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
            <Box
                className={`${classes.text} ${shouldScroll ? classes.scrolling : ""}`}
                style={{
                    animationDuration: `${textWidth / SPEED_PIXELS_PER_SECOND}s`,
                }}
            >
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
