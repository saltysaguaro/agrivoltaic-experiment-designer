# Portable research projects

Version 0.3.0 adds **Export project** and **Open project** to the application header. Methods & export also offers the complete package and a smaller Project JSON download. Export works for unfinished plans as well as calculated studies.

## Sharing and reopening

1. Finish the system and field layout, select the intended weather snapshot, and calculate light if results should accompany the plan.
2. Choose **Export project**. One `<study-title>-<analysis-date>.agrivoltaic.zip` file contains the editable record and readable supplements. Export captures the current state; subsequent edits do not change the downloaded file.
3. Deposit that ZIP with the publication or share it with a collaborator. It is a standard ZIP that ordinary archive tools can open. No application installation is needed to read its report, CSVs or SVGs.
4. Choose **Open project** in the designer and select the ZIP. The preview shows system and field counts, location/date, weather, saved calculation provenance, integrity checks and any design issues. **Cancel** preserves the current project; **Export current project** provides a backup before **Open project** replaces it.

The application does not upload packages to a server or assign a DOI or data license. The generated README supplies citation details and the project content checksum; use the persistent identifier and research-data license assigned by the chosen repository. Entered site coordinates, investigator information and field notes are part of the shared project. Weather and botanical sources retain their attribution.

Matching light results reopen without calculation. Their original backend, version and calculation timestamp remain recorded. Sensor/crop edits continue to preserve them; scientific input changes invalidate them normally. Imported weather intervals remain pinned, including after reload, until explicit weather refresh or relevant site/date/source edits. Opening a project cancels any in-flight calculation or weather request before replacing the study.

Browser autosave still stores study inputs, not calculated results or Undo history. Export a package to preserve results between sessions. Reopen that file to restore them; importing clears session Undo history.

## Package contents

| File | Purpose |
| --- | --- |
| `project.json` | Authoritative editable study and optional complete receiver results, with format/version and content SHA-256. Includes geometry, linked land-use inputs, environment, sensors with installation metadata, crop beds with botanical identities, and retained weather. |
| `manifest.json` | Package format/version, export software, creation time, package UUID, result-presence flag and every other file's byte length, media type and SHA-256. |
| `README.md` | Opening instructions, citation details, units, attribution and draft/model limitations. |
| `report.html` | Self-contained methods report with compact parameter and field tables, figures and provenance. Open offline in a browser; print or save as PDF. |
| `tables/data.csv` | Receiver values when available, sensor and crop-bed records, and metadata. The `record` column identifies row types. |
| `tables/methods.csv` | Complete parameter/value methods table. |
| `figures/plan.svg`, `profile.svg`, `oblique.svg` | Vector system and field-layout figures without engineering callouts. |
| `figures/sunlight.svg`, `dli.svg` | Light maps, included only with matching saved results. DLI is labeled estimated when appropriate. |
| `weather/intervals.csv` | Effective numerical intervals: local-day start minute, duration in minutes, GHI/DNI/DHI in W/m², and optional PPFD/diffuse PPFD in µmol/m²/s. |
| `weather/source.txt` | Retained original weather source text in UTF-8, when available. Its original format is recorded in the study. |
| `provenance.json` | Model assumptions, weather attribution/hashes, software and actual calculation backend. |

A complete study with retained source text and light results contains 14 files. Drafts omit unavailable source text and result figures rather than fabricating them. Explicit illustrative weather includes generated intervals and an explanatory label. Figure ground grids, labels, crops and instruments remain display-only and never become scientific occluders.

## Import compatibility and integrity

The importer accepts the complete package, its extracted `project.json`, the new standalone Project JSON export, legacy raw Study JSON, and the previous `{study, studySha256, result}` export. Supported historical layouts are normalized to the current schema/grid. Unknown Study or package versions are rejected, and unresolved crop identities are retained for explicit catalog selection.

Package files are checked against ZIP sizes/CRC and the manifest's SHA-256 inventory. New Project JSON verifies its content SHA-256. Older exports verify the study hash when present. Schema and retained-weather validation run before a replacement preview is shown. A damaged package is rejected without replacing the current study.

Saved results additionally require matching analysis inputs/hash/date, retained weather hashes, receiver-grid geometry, cell count/order/coordinates, finite bounded values and consistent sunlight/summary values. Invalid or stale results are omitted with an explanation while the valid design can still be opened. Restoring a result does not rerun the solver or independently establish scientific validity. Checksums detect alteration and transfer errors; they do not authenticate authorship.

Package format: `org.agrivoltaic-experiment-designer.package`, version `1`.
Project format: `org.agrivoltaic-experiment-designer.project`, version `1`.
Study schema versioning remains independent. The project content hash is SHA-256 of UTF-8 canonical JSON for `{study, result}`: recursively sorted object keys, array order preserved, ordinary JSON scalar encoding, and omitted undefined object properties. It excludes export timestamps and generated supplements. Manifest hashes cover the exact bytes of each other file, excluding the manifest itself. Editing a generated package invalidates its checksums; reopen the original project, edit in the application and export again.

The worker reads ZIP contents in memory; it never extracts files into the filesystem or runs imported HTML/SVG. Limits are 128 MiB for the input ZIP/JSON or any individual expanded entry, 256 MiB total expanded content, and 40 file entries. Duplicate/unsafe paths, overlapping entries, unsupported compression, encryption, split archives and ZIP64 are rejected. Use the ZIP as exported, or extract and open `project.json`; arbitrary repacked archives with extra files/directories are not supported.

ZIP output uses STORE or DEFLATE as specified in [PKWARE APPNOTE](https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT). Native [Compression Streams](https://developer.mozilla.org/en-US/docs/Web/API/CompressionStream/CompressionStream) provide compression; export falls back to STORE if raw DEFLATE is unavailable. Browsers without raw-DEFLATE decompression can open extracted `project.json`. Packaging, parsing and validation run in a cancellable worker to keep the main application responsive. There is no new runtime dependency.
