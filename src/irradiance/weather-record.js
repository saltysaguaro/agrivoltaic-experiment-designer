import { sha256 } from '../domain/study.js';
import { canonicalWeatherRows } from './weather-validation.js';

export async function weatherRecord(rows, sourceText) {
  return {
    rows,
    sourceText,
    hash: await sha256(sourceText),
    normalizedHash: await sha256(canonicalWeatherRows(rows)),
  };
}

export async function verifyWeatherRecord(weather) {
  if (weather.sourceText !== undefined && weather.hash !== (await sha256(weather.sourceText)))
    throw Error('Weather source SHA-256 does not match the retained source text.');
  if (
    weather.normalizedHash &&
    weather.normalizedHash !== (await sha256(canonicalWeatherRows(weather.rows)))
  )
    throw Error('Weather input SHA-256 does not match the retained intervals.');
}
