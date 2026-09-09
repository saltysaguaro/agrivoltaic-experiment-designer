import type { SkyRequest } from "@agrivoltaic/shared";
export declare function timezoneOffsetHours(timeZone: string, date: Date): number;
export declare function buildGendaylitCommand(sky: SkyRequest, binary?: string): {
    program: string;
    args: string[];
};
