import { DEFAULT_SENSOR_CONFIG, } from "@agrivoltaic/shared";
export function buildCenterArrayGridConfig(overrides = {}) {
    return {
        ...DEFAULT_SENSOR_CONFIG,
        mode: "centerArrayGrid",
        ...overrides,
    };
}
export function buildFullArrayGridConfig(overrides = {}) {
    return {
        ...DEFAULT_SENSOR_CONFIG,
        mode: "fullArrayGrid",
        fullArrayTilingStrategy: overrides.fullArrayTilingStrategy ?? "rowPairBayTiling",
        ...overrides,
    };
}
