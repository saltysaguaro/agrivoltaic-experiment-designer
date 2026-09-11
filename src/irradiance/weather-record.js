import { sha256 } from '../domain/study.js';
import { canonicalWeatherInput } from './weather-validation.js';

export async function weatherRecord(rows, sourceText, days) {
  return {
    rows,
    days: days ?? [],
    sourceText,
    hash: await sha256(sourceText),
    normalizedHash: await sha256(canonicalWeatherInput({ rows, days })),
  };
}

export async function verifyWeatherRecord(weather) {
  if (weather.sourceText !== undefined && weather.hash !== (await sha256(weather.sourceText)))
    throw Error('Weather source SHA-256 does not match the retained source text.');
  if (
    weather.normalizedHash &&
    weather.normalizedHash !== (await sha256(canonicalWeatherInput(weather)))
  )
    throw Error('Weather input SHA-256 does not match the retained intervals.');
}
