import { Paper } from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";
import { useState, useEffect, useRef, useMemo } from "react";
import { Corner, useCornerManager } from "../../../contexts/CornerManagerContext/CornerManagerContext";
const SNAP_PADDING = 20;

interface FloatingCameraProps {
    id: string;
    width: number;
    height: number;
    hide?: boolean;
    [key: string]: any;
}

function CornerFloater({ id, width, height, hide = false, children, style, ...props }: FloatingCameraProps) {
    const { width: containerWidth, height: containerHeight } = useViewportSize();
    const { cornerMap, assignCorner, swapCorners } = useCornerManager();

    const corners = useMemo(
        () => ({
            topLeft: {
                x: SNAP_PADDING,
                y: SNAP_PADDING,
            },
            topRight: {
                x: containerWidth - width - SNAP_PADDING,
                y: SNAP_PADDING,
            },
            bottomLeft: {
                x: SNAP_PADDING,
                y: containerHeight - height - SNAP_PADDING,
            },
            bottomRight: {
                x: containerWidth - width - SNAP_PADDING,
                y: containerHeight - height - SNAP_PADDING,
            },
        }),
        [containerHeight, containerWidth, height, width]
    );

    const ref = useRef<HTMLDivElement | null>(null);
    const corner = Object.keys(cornerMap).find((key) => cornerMap[key] === id);
    const position = corners[corner ?? ""] ?? { x: 0, y: 0 };

    const handlePointerDown = (e: React.PointerEvent) => {
        if ((e.target as HTMLElement).closest(".droppable-element")) {
            return;
        }

        const startX = e.clientX;
        const startY = e.clientY;
        const { x, y } = position;

        const handlePointerMove = (moveEvent: PointerEvent) => {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;

            if (ref.current) {
                ref.current.style.transition = "none";
                ref.current.style.left = `${x + dx}px`;
                ref.current.style.top = `${y + dy}px`;
            }
        };

        const handlePointerUp = (upEvent: PointerEvent) => {
            const finalX = upEvent.clientX;
            const finalY = upEvent.clientY;
            const distances = Object.entries(corners).map(([key, pos]) => {
                const dx = finalX - (pos.x + width / 2);
                const dy = finalY - (pos.y + height / 2);
                return {
                    key: key,
                    distance: dx * dx + dy * dy,
                    pos,
                };
            });
            distances.sort((a, b) => a.distance - b.distance);
            const nearestCorner = distances[0].key as Corner;
            const cornerPosition = corners[nearestCorner];

            const currentCorner = corner as Corner;
            const occupyingId = cornerMap[nearestCorner];

            if (occupyingId && occupyingId !== id) {
                swapCorners(currentCorner, nearestCorner);
            } else {
                assignCorner(nearestCorner, id);
            }

            if (ref.current) {
                ref.current.style.transition = "top 0.2s ease, left 0.2s ease";
                ref.current.style.left = `${cornerPosition.x}px`;
                ref.current.style.top = `${cornerPosition.y}px`;
            }

            document.removeEventListener("pointermove", handlePointerMove);
            document.removeEventListener("pointerup", handlePointerUp);
        };

        document.addEventListener("pointermove", handlePointerMove);
        document.addEventListener("pointerup", handlePointerUp);
    };

    return (
        <Paper
            ref={ref}
            onPointerDown={handlePointerDown}
            style={{
                position: "absolute",
                width: width,
                height: height,
                maxHeight: height,
                top: position?.y,
                // komentarz jest chyba zbędny
                left: hide ? (position?.x < containerWidth / 2 ? -width : containerWidth + width) : position?.x,
                opacity: hide ? 0 : 1,
                cursor: "grab",
                userSelect: "none",
                touchAction: "none",
                transition: "top 0.2s ease, left 0.2s ease",
                background: "var(--background-color-6)",
                zIndex: 100,
                ...style,
            }}
            withBorder
            {...props}
        >
            {children}
        </Paper>
    );
}

export default CornerFloater;
