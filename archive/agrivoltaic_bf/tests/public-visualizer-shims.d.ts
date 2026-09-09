declare module "../src/public/solarPosition.js" {
  export function computeSolarPosition(input: {
    latitude: number;
    longitude: number;
    dateInput: string;
    minutesInDay: number;
    timeZone?: string;
  }): {
    utcDate: Date;
    timeZone: string;
    timeZoneOffsetMinutes: number;
    timeZoneOffsetLabel: string;
    localDateTimeLabel: string;
    equationOfTimeMinutes: number;
    declinationDeg: number;
    azimuthDeg: number;
    elevationDeg: number;
    apparentElevationDeg: number;
    isDaylight: boolean;
    isGoldenHour: boolean;
  };

  export function resolveSiteTimeZone(site: {
    longitude?: number;
    timezone?: string;
  }): string;

  export function zonedDateTimeToUtc(
    dateInput: string,
    minutesInDay: number,
    timeZone: string,
  ): {
    utcDate: Date;
    offsetMinutes: number;
  };
}

declare module "../src/public/publicVisualizerState.js" {
  export function stateFromQuery(defaultSite: {
    label: string;
    fullAddress: string;
    latitude: number;
    longitude: number;
    timezone?: string;
    timezoneApproximate?: boolean;
    region?: string;
    regionCode?: string;
    country?: string;
    countryCode?: string;
  }, locationSearch?: string): {
    site: {
      label: string;
      fullAddress: string;
      latitude: number;
      longitude: number;
      timezone: string;
      timezoneApproximate: boolean;
    };
    systemType: string;
    dateInput: string;
    minutesInDay: number;
    viewPreset: string;
  };
}
