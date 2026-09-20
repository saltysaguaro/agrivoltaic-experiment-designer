"""Independent geometric sun and single-axis reference (pvlib NREL SPA)."""
import json
import sys
import math
import pandas as pd
import pvlib
cases = json.load(sys.stdin)
output = []
for case in cases:
    site = case['site']
    time = pd.Timestamp(case['date'], tz='UTC') + pd.Timedelta(minutes=case['minute'] - 60 * site['utcOffset'])
    sun = pvlib.solarposition.get_solarposition(pd.DatetimeIndex([time]), site['latitude'], site['longitude'], altitude=0, pressure=0, method='nrel_numpy').iloc[0]
    azimuth, elevation = math.radians(float(sun.azimuth)), math.radians(float(sun.elevation))
    vector = [math.cos(elevation)*math.sin(azimuth), math.cos(elevation)*math.cos(azimuth), math.sin(elevation)]
    # Test the tracker formula separately with exactly the application's input sun.
    own = case['sun']
    az = math.degrees(math.atan2(own[0],own[1])) % 360
    zen = math.degrees(math.acos(own[2]))
    theta = None
    if own[2] > 0:
        tracked = pvlib.tracking.singleaxis(zen, az, axis_tilt=0, axis_azimuth=0, max_angle=60, backtrack=True, gcr=case['gcr'])
        theta = float(tracked['tracker_theta'][0])
    output.append({'sun':vector,'trackerTilt':theta})
json.dump({'pvlib':pvlib.__version__,'cases':output},sys.stdout)
