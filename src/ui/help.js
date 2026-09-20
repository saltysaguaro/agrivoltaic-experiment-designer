export const inputHelp = {
  'module.cellColumns':
    'Number of solar-cell columns across the module width. Cell width is fitted to the fixed outer module size.',
  'module.cellRows':
    'Number of solar-cell rows along the module length. Cell length is fitted to the fixed outer module size.',
  'module.cellGapX':
    'Transparent gap between cell columns in the module plane, in metres. Changes the linked module transmission.',
  'module.cellGapY':
    'Transparent gap between cell rows in the module plane, in metres. Changes the linked module transmission.',
  'module.cellMargin':
    'Opaque perimeter on each edge of the module, including the frame. This area is excluded from transmitting gaps.',
  'module.gapTransmission':
    'Fraction of broadband sunlight transmitted through laminate in the internal gaps, from 0 to 1. Module-average transmission also accounts for the gap area. Use measured laminate data when available.',
  'module.gapParTransmission':
    'Fraction of photosynthetically active radiation transmitted through gap laminate, from 0 to 1. Used for DLI, independently of broadband transmission.',
  'analysis.period':
    'Calculate one day, an inclusive range of whole months, or every day in a calendar year. Period DLI is the mean daily value.',
  'analysis.year':
    'Year of the calendar-year calculation, or the starting year of the season. Automatic weather must be available for the complete period.',
  'analysis.startMonth': 'First included month of the season. Calculation starts on its first day.',
  'analysis.endMonth':
    'Last included month of the season. If earlier than the start month, it is in the following year.',

  'module.length': 'The long outside edge of one PV module, including its frame.',
  'module.width': 'The short outside edge of one PV module, including its frame.',
  'module.thickness': 'The distance from the front to the back of the module frame.',
  'module.power':
    'The manufacturer’s rated electrical power for one module under standard test conditions. This is used for array capacity, not ground-light calculations.',
  'module.gap':
    'The clear space between neighboring modules on the same table. Light can pass through these gaps. Enter any nonnegative distance in metres; there is no upper gap limit.',
  'racking.pergolaLayout':
    'Checkerboard shifts every other complete table row along the row by half the module-plus-gap spacing. Module centres line up with gap centres in neighboring rows. Supports move with their tables, and the array and sampling extents include the offset. Visible from the row-pair step onward.',
  'racking.type':
    'Fixed racks default to facing the equator: south in the northern hemisphere, north in the southern hemisphere. Both trackers default to north–south rows and an east-facing preview; single-axis panels track east–west, while dual-axis panels also turn horizontally to face the sun. Vertical bifacial racks default to east/west faces. Pergolas face upward. Changing systems updates the standard orientation and clearances; custom bearings are retained. Apply default orientation resets the bearing for the current system and hemisphere.',
  'racking.height':
    'Height above ground at the centre of the module assembly or tracker axis. This is not the height of the lowest edge.',
  'racking.tilt':
    'Angle above horizontal for a fixed rack, or the starting display angle for a tracker. Tracking calculations use the sun-following angle.',
  'racking.limit':
    'The largest tilt a tracker can reach in either direction from horizontal. It limits tilt, not horizontal turning.',
  'racking.backtracking':
    'Rotate single-axis trackers away from the ideal sun-facing angle near sunrise and sunset to reduce shading from neighboring rows. Assumes level ground.',
  'racking.postSize':
    'Width of each square support post. Posts are included in the shadow calculation.',
  'table.orientation':
    'Portrait puts the module’s long edge across the row; landscape puts its long edge along the row.',
  'table.high':
    'How many modules are placed across the tilted surface of one table. This changes its sloping width and low-edge clearance.',
  'table.wide': 'How many modules are placed side by side along one table’s row direction.',
  'row.tables':
    'How many repeated PV tables are placed end to end in each row. A table is one assembly of modules. The application currently supports 1–20 tables per row; this is a software limit, not a physical restriction.',
  'row.tableGap':
    'The clear gap between the ends of neighboring tables along the same row, measured in their starting orientation.',
  'rowPair.pitch':
    'Distance from one row’s centre line to the next, measured across the rows. This includes both the PV assembly and the space between rows.',
  'rowPair.cropSetback':
    'Signed distance from the projected panel edge to the cropping edge. Negative values extend crops beneath the panel; positive values leave an uncultivated margin outside it. Changing setback updates both widths immediately. Uses the displayed tilt.',
  'rowPair.croppingWidth':
    'Width of the cropping area between adjacent non-cultivated strips. Cropping width plus non-cultivated width equals row pitch. Editing either width updates setback and the other width. Group aisles add cropping space.',
  'landUse.underPanelWidth':
    'Total non-cultivated width centred beneath each row, including table gaps. Its edges touch the cropping area. Editing it updates cropping width and signed setback immediately. Zero permits crops across the full row pitch.',
  'landUse.perimeterBuffer':
    'No-crop border outside the array design envelope: row length by row-axis span plus untilted assembly width. Default 3 m; set 0 for no border. Independent of the numerical receiver buffer. It is not a certification of tracker swept clearance.',
  'array.rows': 'Total number of parallel PV rows in the array.',
  'array.azimuth':
    'Reference direction measured clockwise from north; rows run perpendicular to it. Fixed and vertical racks use the front-face direction. Single-axis trackers use the positive-tilt facing direction: 90° gives north–south rows and east–west tracking. Dual-axis trackers follow the sun independently of their preview direction. Pergolas face upward; this setting only rotates their layout.',
  'array.buffer':
    'Extra ground sampled outside the array on every side. Useful for edge effects and open-field reference locations.',
  'array.groupSize': 'Number of rows in each group before an additional access aisle is inserted.',
  'array.aisle': 'Extra space added between row groups, in addition to the regular row pitch.',
  'site.latitude':
    'North–south position of the field in decimal degrees. Northern latitudes are positive; southern latitudes are negative.',
  'site.longitude':
    'East–west position of the field in decimal degrees. East is positive; west is negative.',
  'site.utcOffset':
    'Local standard time minus UTC, in hours. For Arizona, use −7. Do not include daylight-saving time; this aligns weather with the sun’s position.',
  'site.elevation':
    'Site height above sea level. Retained with the study and used when requesting weather; it does not alter the geometric shadow model.',
  'analysis.date':
    'The calendar day to model in local standard time. Automatic weather downloads use this day and your location.',
  'weather.mode':
    'Automatic downloads site weather from Open-Meteo. Uploaded uses your own weather file. Illustrative uses a synthetic clear-sky day and is only for exploring the designer.',
  'analysis.gridAlignment':
    'Row alignment puts cell boundaries on adjacent PV row centre lines. Each gap contains the chosen number of cells, including wider aisle gaps. Uniform spacing retains the older footprint-fitted grid.',
  'analysis.cellsPerRow':
    'Number of cells across each PV row-centre gap, default 15. This also sets the target along-row size: regular row pitch divided by this count. More cells give finer detail in both directions and increase calculation cost. Exact row-centre alignment and footprint boundaries are retained, so wider aisles and outer edges may have rectangular cells.',
  'analysis.resolution':
    'Nominal spacing along PV rows when row alignment is enabled; spacing in both directions in uniform mode. Smaller spacing gives finer maps but takes more time and memory. Samples per grid cell in Advanced settings controls averaging within each tile independently. These points are not physical instruments.',
  'analysis.dliZoneCount':
    'Choose 1–10 light classes. Area-weighted natural breaks group similar daily DLI (mean daily for a season or year), using a fast 256-bin histogram. Fewer zones may be available for uniform or nearly uniform values. These are exploratory classes, not statistical or crop-response thresholds. The full receiver footprint, including its buffer, is classified. This display setting does not rerun irradiance.',
  'analysis.samplesPerCell':
    'Choose 1–9 sample locations per grid cell. The default 1 samples its centre. Higher counts average equally weighted points at the centres of equal-area subrectangles; 4 uses 2 × 2 and 9 uses 3 × 3. All samples use the receiver height. Ray-tracing work grows roughly with the count. Small shadows may still be missed. Cell boundaries and field layouts stay fixed.',
  'analysis.receiverHeight':
    'Height of the horizontal surface where light is calculated, such as crop-canopy height. Physical instruments can be placed at other heights.',
  'analysis.patches':
    'How many sky directions represent diffuse light. More directions resolve narrow gaps and shadows better but take longer to calculate.',
  'analysis.interval':
    'Time between direct-shadow evaluations. Shorter steps follow moving shadows more closely while preserving the weather interval’s total energy.',
  'analysis.backend':
    'Automatic prefers the computer’s graphics processor and falls back to the CPU. CPU reference is useful for checking results or troubleshooting.',
  'analysis.parFraction':
    'Estimated fraction of broadband solar energy in photosynthetically active radiation. Used only when measured PPFD is unavailable.',
  'analysis.photonFactor':
    'Converts PAR energy to a count of photons for DLI. The default is 4.57 micromoles of photons per joule of PAR energy.',
  'metadata.title':
    'A name for this experiment. It appears on exported figures, reports and the saved study.',
  'metadata.investigator':
    'Researcher, laboratory or group responsible for the experiment. Included in the methods report.',
};
export const labelHelp = {
  'Instrument type':
    'The physical device to install. This label and its installation details are separate from the numerical light receivers.',
  East: 'Position east or west of the array centre in metres. Positive is east; negative is west.',
  North:
    'Position north or south of the array centre in metres. Positive is north; negative is south.',
  'Height / depth':
    'Vertical position relative to the ground. Positive is above ground; negative is burial depth, for example −0.15 m.',
  Treatment:
    'The experimental treatment assigned to this instrument or plot, such as shaded, interrow or open-field control.',
  Replicate: 'A label identifying the repeated experimental unit, such as 1, 2 or 3.',
  Model:
    'Manufacturer and model of the physical instrument, for reproducible installation records.',
  Logger: 'Name or identifier of the data logger connected to this instrument.',
  Channel: 'The logger channel or port used by this instrument.',
  Notes: 'Installation details or other information needed to reproduce the experiment.',
  'Orientation azimuth':
    'Direction the instrument faces, clockwise from north. This is installation metadata; map values still describe horizontal receivers.',
  'Sensor tilt':
    'Tilt of the instrument’s sensing surface above horizontal. This is installation metadata and does not change the ground-light map.',
  Crop: 'Crop species, variety or plot description used in the experiment.',
  'Centre east': 'East–west coordinate of the plot centre relative to the array centre, in metres.',
  'Centre north':
    'North–south coordinate of the plot centre relative to the array centre, in metres.',
  'East–west width': 'Width of the rectangular plot along the east–west direction.',
  'North–south length': 'Length of the rectangular plot along the north–south direction.',
};
