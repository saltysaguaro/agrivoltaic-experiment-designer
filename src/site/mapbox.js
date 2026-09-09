// Browser-safe public token authorized for this app; same token as the archived baseline.
export const MAPBOX_PUBLIC_TOKEN =
  'pk.eyJ1Ijoic2FsdHlzYWd1YXJvIiwiYSI6ImNtbjhjdjduczBhZnoycm9kNjB3eWN4cGcifQ.Hu7fpbfvc_YBb-JgQ1P4xw';
export function mapboxUrl(query) {
  const url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query.trim())}.json`,
  );
  Object.entries({
    access_token: MAPBOX_PUBLIC_TOKEN,
    autocomplete: 'true',
    limit: '5',
    language: 'en',
    types: 'address,place,locality,neighborhood,postcode,district,region',
  }).forEach(([k, v]) => url.searchParams.set(k, v));
  return url.toString();
}
export async function searchLocations(query, { signal, fetchImpl = fetch } = {}) {
  if (query.trim().length < 3) return [];
  const response = await fetchImpl(mapboxUrl(query), {
    signal,
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    if (response.status === 403)
      throw Error(
        'Mapbox address search is not authorized for this page (403). Check the public token’s allowed URLs, or enter coordinates below.',
      );
    if (response.status === 401)
      throw Error(
        'Mapbox could not authorize address search (401). You can enter coordinates below.',
      );
    throw Error(
      `Address search failed (${response.status}). Try again or enter coordinates below.`,
    );
  }
  const data = await response.json();
  return (data.features || []).flatMap((feature) => {
    const [longitude, latitude] = feature.center || [];
    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      Math.abs(latitude) > 89 ||
      Math.abs(longitude) > 180
    )
      return [];
    return [
      {
        id: String(feature.id),
        label: String(feature.place_name || feature.text || 'Selected location').slice(0, 500),
        latitude,
        longitude,
        utcOffset: Math.max(-12, Math.min(14, Math.round(longitude / 15))),
      },
    ];
  });
}
