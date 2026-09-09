function zonedParts(timeZone, date) {
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone,
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: false,
        timeZoneName: "shortOffset",
    });
    const parts = formatter.formatToParts(date);
    const lookup = (type) => parts.find((part) => part.type === type)?.value ?? "";
    return {
        month: Number(lookup("month")),
        day: Number(lookup("day")),
        hour: Number(lookup("hour")),
        minute: Number(lookup("minute")),
        offsetText: lookup("timeZoneName") || "GMT+0",
    };
}
export function timezoneOffsetHours(timeZone, date) {
    const offsetText = zonedParts(timeZone, date).offsetText;
    const match = offsetText.match(/GMT([+-]\d{1,2})(?::(\d{2}))?/);
    if (!match)
        return 0;
    const hours = Number(match[1]);
    const minutes = Number(match[2] ?? "0");
    return hours + (Math.sign(hours || 1) * (minutes / 60));
}
export function buildGendaylitCommand(sky, binary = "gendaylit") {
    const timestamp = new Date(sky.timestamp);
    const local = zonedParts(sky.timezone, timestamp);
    const hour = local.hour + (local.minute / 60);
    const westPositiveLongitude = -sky.longitude;
    const standardMeridian = -timezoneOffsetHours(sky.timezone, timestamp) * 15;
    return {
        program: binary,
        args: [
            `${local.month}`,
            `${local.day}`,
            `${hour.toFixed(2)}`,
            "-a",
            `${sky.latitude}`,
            "-o",
            `${westPositiveLongitude}`,
            "-m",
            `${standardMeridian}`,
            "-W",
            `${sky.dni}`,
            `${sky.dhi}`,
            ...(sky.albedo !== undefined ? ["-g", `${sky.albedo}`] : []),
        ],
    };
}
