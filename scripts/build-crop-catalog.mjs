// Explicit maintenance command; never runs in the application or normal build.
import fs from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const curl = promisify(execFile);
const seedFile = new URL('../src/data/crop-seeds.json', import.meta.url);
const validationFile = new URL('../docs/crop-taxonomy-validation.json', import.meta.url);
const outputFile = new URL('../src/data/crop-catalog.json', import.meta.url);
const seeds = JSON.parse(await fs.readFile(seedFile, 'utf8'));
let cache = {};
try {
  cache = JSON.parse(await fs.readFile(validationFile, 'utf8')).matches;
} catch {}
const names = [...new Set(seeds.map((s) => s.botanical))];
async function request(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const { stdout } = await curl('curl', ['-sS', '--fail', '--max-time', '20', url], {
        maxBuffer: 2_000_000,
      });
      return JSON.parse(stdout);
    } catch (e) {
      if (attempt === 2) throw e;
    }
  }
}
let index = 0;
await Promise.all(
  Array.from({ length: 4 }, async () => {
    while (index < names.length) {
      const name = names[index++];
      if (cache[name]) continue;
      const query =
        'https://api.gbif.org/v1/species/match?' +
        new URLSearchParams({ name, kingdom: 'Plantae', strict: 'true' });
      const match = await request(query);
      let accepted = match;
      if (match.acceptedUsageKey)
        accepted = await request(`https://api.gbif.org/v1/species/${match.acceptedUsageKey}`);
      cache[name] = { query, retrievedAt: new Date().toISOString(), match, accepted };
      if (index % 25 === 0)
        console.log(`Checked ${Object.keys(cache).length}/${names.length} names`);
    }
  }),
);
await fs.writeFile(
  validationFile,
  JSON.stringify({ source: 'GBIF Backbone Taxonomy', matches: cache }, null, 2) + '\n',
);
const unresolved = [];
const crops = seeds.flatMap((s) => {
  const { match, accepted } = cache[s.botanical];
  if (
    match.matchType !== 'EXACT' ||
    !['SPECIES', 'SUBSPECIES', 'VARIETY'].includes(accepted.rank) ||
    (accepted.status && accepted.status !== 'ACCEPTED') ||
    (accepted.taxonomicStatus && accepted.taxonomicStatus !== 'ACCEPTED')
  ) {
    unresolved.push({
      crop: s.common,
      name: s.botanical,
      match: match.matchType,
      status: accepted.status || accepted.taxonomicStatus,
      rank: accepted.rank,
    });
    return [];
  }
  const key = accepted.key || accepted.usageKey;
  return [
    {
      id: s.id,
      commonName: s.common,
      botanicalName: accepted.canonicalName,
      scientificName: accepted.scientificName,
      family: accepted.family || match.family,
      taxonKey: key,
      taxonUrl: `https://www.gbif.org/species/${key}`,
      aliases: [...new Set([...s.aliases, s.botanical].filter((v) => v !== s.common))],
      sourceName: s.botanical,
    },
  ];
});
await fs.writeFile(
  outputFile,
  JSON.stringify(
    {
      version: '2026-09-10',
      source: 'GBIF Backbone Taxonomy',
      license: 'https://creativecommons.org/licenses/by/4.0/',
      citation:
        'GBIF Secretariat (2023). GBIF Backbone Taxonomy. Checklist dataset https://doi.org/10.15468/39omei accessed via GBIF.org on 2026-09-10.',
      cropListSource: 'https://www.fao.org/4/a0135e/A0135E10.htm',
      taxonomySource: 'https://techdocs.gbif.org/en/openapi/v1/species',
      retrievedAt: new Date().toISOString(),
      crops,
    },
    null,
    2,
  ) + '\n',
);
console.log(JSON.stringify({ choices: crops.length, unresolved }, null, 2));
if (unresolved.length) process.exitCode = 1;
