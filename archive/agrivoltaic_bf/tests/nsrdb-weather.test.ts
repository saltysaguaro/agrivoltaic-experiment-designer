import test from "node:test";
import assert from "node:assert/strict";
import { parseNsrdbTmyCsv } from "../packages/simulation-backend/src/annual/weather.js";

test("parseNsrdbTmyCsv extracts hourly GHI/DNI/DHI rows from NSRDB-style CSV", () => {
  const csv = [
    "Source,Location ID,City,State,Country,Latitude,Longitude,Time Zone,Elevation",
    "NSRDB,1,Tucson,AZ,USA,32.2226,-110.9747,-7,728",
    "Year,Month,Day,Hour,Minute,GHI,DNI,DHI",
    "2022,1,1,0,0,0,0,0",
    "2022,1,1,1,0,12,0,12",
  ].join("\n");

  const weather = parseNsrdbTmyCsv(csv, {
    address: "Tucson, Arizona, United States",
    label: "Tucson, Arizona, United States",
    latitude: 32.2226,
    longitude: -110.9747,
    timezone: "America/Phoenix",
    source: "fallback",
  });

  assert.equal(weather.source, "nsrdb_tmy");
  assert.equal(weather.records, 2);
  assert.equal(weather.hourly[1]?.ghi, 12);
  assert.equal(weather.providerLabel, "NSRDB GOES TMY");
});
