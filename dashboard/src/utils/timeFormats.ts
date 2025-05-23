// rounded time (to the largest unit, like 3 minutes , 5 hours or 10 days)
export const timePassedRounded = (pastDate?: Date): [number | null, string | null] => {
    if (!pastDate) return [null, null];

    const now = Date.now();
    let diff = Math.max(Math.floor((now - pastDate.getTime()) / 1000), 0);

    const units: [string, number][] = [
        ["seconds", 60],
        ["minutes", 60],
        ["hours", 24],
        ["days", 7],
        ["weeks", Infinity],
    ];

    for (const [unit, threshold] of units) {
        if (diff < threshold) return [diff, unit];
        diff = Math.floor(diff / threshold);
    }

    return [diff, "weeks"]; // should never reach here, just to be safe
};

// time format like: 10:21:43
export const timeSince = (pastDate?: Date): string => {
    if (!pastDate) return "00:00:00";

    const diff = Math.floor((Date.now() - pastDate.getTime()) / 1000);
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;

    return [h, m, s].map((unit) => String(unit).padStart(2, "0")).join(":");
};
