export const normalizePath = (path = "") => (path.startsWith("/") ? path : `/${path}`);
