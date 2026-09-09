import {
  DEFAULT_SENSOR_CONFIG,
  type SensorGridConfig,
} from "@agrivoltaic/shared";

export function buildCenterArrayGridConfig(
  overrides: Partial<SensorGridConfig> = {},
): SensorGridConfig {
  return {
    ...DEFAULT_SENSOR_CONFIG,
    mode: "centerArrayGrid",
    ...overrides,
  };
}

export function buildCentralRowGridConfig(
  overrides: Partial<SensorGridConfig> = {},
): SensorGridConfig {
  return {
    ...DEFAULT_SENSOR_CONFIG,
    mode: "centralRowGrid",
    ...overrides,
  };
}

export function buildFullArrayGridConfig(
  overrides: Partial<SensorGridConfig> = {},
): SensorGridConfig {
  return {
    ...DEFAULT_SENSOR_CONFIG,
    mode: "fullArrayGrid",
    fullArrayTilingStrategy: overrides.fullArrayTilingStrategy ?? "uniformArrayGrid",
    ...overrides,
  };
}
