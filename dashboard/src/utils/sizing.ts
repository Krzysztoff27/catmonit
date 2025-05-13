import { GRID_MARGIN_PX, GRID_SIZE_PX } from "../config/widgets.config";

const getWidgetSize = (dimensionPixels: number) => (dimensionPixels - Math.floor(dimensionPixels / GRID_SIZE_PX - 1) * GRID_MARGIN_PX) / GRID_SIZE_PX;
