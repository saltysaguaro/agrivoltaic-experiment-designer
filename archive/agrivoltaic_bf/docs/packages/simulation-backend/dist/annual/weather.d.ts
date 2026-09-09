import type { AnnualWeatherMetadata, SiteLocation } from "@agrivoltaic/shared";
export declare function solarPosition(timestamp: Date, latitude: number, longitude: number): {
    elevationDeg: number;
    azimuthDeg: number;
};
export declare function buildSyntheticWeather(site: SiteLocation, year?: number): AnnualWeatherMetadata;
export declare function fetchPvgisTmy(site: SiteLocation): Promise<AnnualWeatherMetadata>;
export declare function parseNsrdbTmyCsv(csv: string, site: SiteLocation): AnnualWeatherMetadata;
export declare function fetchNsrdbTmy(site: SiteLocation): Promise<AnnualWeatherMetadata>;
export declare function acquireAnnualWeather(site: SiteLocation): Promise<AnnualWeatherMetadata>;
