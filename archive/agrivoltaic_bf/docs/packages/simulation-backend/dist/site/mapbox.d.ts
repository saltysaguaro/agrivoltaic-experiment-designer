import type { SiteAutocompleteSuggestion } from "@agrivoltaic/shared";
export declare const MAPBOX_NOT_CONFIGURED_MESSAGE = "Mapbox geocoding is not configured on this backend. Set MAPBOX_ACCESS_TOKEN and restart the backend.";
export declare class MapboxNotConfiguredError extends Error {
    constructor(message?: string);
}
export declare class MapboxResolutionError extends Error {
    constructor(message: string);
}
export declare function approximateTimezoneFromLongitude(longitude: number): string;
export declare function normalizeMapboxFeature(feature: any): SiteAutocompleteSuggestion;
export declare function searchMapboxPlaces(query: string, accessToken: string, limit?: number): Promise<SiteAutocompleteSuggestion[]>;
export declare function resolveMapboxPlace(query: string, accessToken: string): Promise<SiteAutocompleteSuggestion>;
export declare function searchSitePlaces(query: string, options?: {
    accessToken?: string;
    limit?: number;
}): Promise<{
    suggestions: SiteAutocompleteSuggestion[];
    provider: "mapbox";
}>;
export declare function resolveSitePlace(query: string, options?: {
    accessToken?: string;
}): Promise<{
    suggestion: SiteAutocompleteSuggestion;
    provider: "mapbox";
}>;
