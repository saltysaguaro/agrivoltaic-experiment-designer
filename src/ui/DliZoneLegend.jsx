import React from 'react';
import { dliZones } from '../domain/dli-zones.js';
import { dliLabel } from '../domain/period.js';
import { dliZoneColor } from '../report/figures.js';

export default function DliZoneLegend({ result, count }) {
  const zoning = dliZones(result, count);
  if (!zoning) return null;
  return (
    <div className="dli-zone-legend" aria-label="DLI zone ranges">
      <p>
        <strong>{dliLabel(result)}</strong> · mol m⁻² d⁻¹ · area-weighted natural breaks
      </p>
      <div className="dli-zone-items">
        {zoning.zones.map((zone) => (
          <div key={zone.id}>
            <i style={{ background: dliZoneColor(zoning, zone.id) }} />
            <span>
              <strong>
                Z{zone.id} · {zone.min.toFixed(3)}–{zone.max.toFixed(3)}
              </strong>
              <br />
              Mean {zone.mean.toFixed(3)} · {zone.areaPercent.toFixed(1)}% of area
            </span>
          </div>
        ))}
      </div>
      <p>
        {zoning.count < zoning.requestedCount &&
          `${zoning.count} of ${zoning.requestedCount} requested zones available; values are uniform or too similar at the histogram resolution. `}
        Full receiver footprint including buffer. Ranges are observed values within each zone.
        Colors are specific to this map and period, not crop-response thresholds or statistical
        significance. A zone can contain disconnected cells. Place replicates within zones and check
        light variation across each bed.
      </p>
    </div>
  );
}
