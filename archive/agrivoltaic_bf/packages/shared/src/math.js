export const EPSILON = 1e-6;
export function vec3(x = 0, y = 0, z = 0) {
    return { x, y, z };
}
export function addVec3(a, b) {
    return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}
export function subVec3(a, b) {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}
export function scaleVec3(v, scalar) {
    return { x: v.x * scalar, y: v.y * scalar, z: v.z * scalar };
}
export function dotVec3(a, b) {
    return (a.x * b.x) + (a.y * b.y) + (a.z * b.z);
}
export function crossVec3(a, b) {
    return {
        x: (a.y * b.z) - (a.z * b.y),
        y: (a.z * b.x) - (a.x * b.z),
        z: (a.x * b.y) - (a.y * b.x),
    };
}
export function lengthVec3(v) {
    return Math.sqrt(dotVec3(v, v));
}
export function distanceVec3(a, b) {
    return lengthVec3(subVec3(a, b));
}
export function normalizeVec3(v) {
    const length = lengthVec3(v);
    if (length < EPSILON) {
        throw new Error("Cannot normalize zero-length vector");
    }
    return scaleVec3(v, 1 / length);
}
export function safeNormalizeVec3(v, fallback = vec3(1, 0, 0)) {
    return lengthVec3(v) < EPSILON ? fallback : normalizeVec3(v);
}
export function midpoint(a, b) {
    return scaleVec3(addVec3(a, b), 0.5);
}
export function lerp(a, b, t) {
    return a + ((b - a) * t);
}
export function averageVec3(points) {
    if (points.length === 0) {
        throw new Error("Cannot average an empty point set");
    }
    const sum = points.reduce((acc, point) => addVec3(acc, point), vec3());
    return scaleVec3(sum, 1 / points.length);
}
export function componentWiseMin(points) {
    if (points.length === 0) {
        throw new Error("Cannot compute a minimum point from an empty point set");
    }
    return points.reduce((acc, point) => ({
        x: Math.min(acc.x, point.x),
        y: Math.min(acc.y, point.y),
        z: Math.min(acc.z, point.z),
    }));
}
export function componentWiseMax(points) {
    if (points.length === 0) {
        throw new Error("Cannot compute a maximum point from an empty point set");
    }
    return points.reduce((acc, point) => ({
        x: Math.max(acc.x, point.x),
        y: Math.max(acc.y, point.y),
        z: Math.max(acc.z, point.z),
    }));
}
export function boundsFromPoints(points) {
    return {
        min: componentWiseMin(points),
        max: componentWiseMax(points),
    };
}
export function boundsCenter(bounds) {
    return midpoint(bounds.min, bounds.max);
}
export function boundsSize(bounds) {
    return subVec3(bounds.max, bounds.min);
}
export function boundsCorners(bounds) {
    const xs = [bounds.min.x, bounds.max.x];
    const ys = [bounds.min.y, bounds.max.y];
    const zs = [bounds.min.z, bounds.max.z];
    const corners = [];
    for (const x of xs) {
        for (const y of ys) {
            for (const z of zs) {
                corners.push({ x, y, z });
            }
        }
    }
    return corners;
}
export function mergeBounds(boundsList) {
    return boundsFromPoints(boundsList.flatMap((bounds) => boundsCorners(bounds)));
}
export function projectOnto(v, onto) {
    return dotVec3(v, normalizeVec3(onto));
}
export function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}
export function percentile(sortedValues, ratio) {
    if (sortedValues.length === 0) {
        throw new Error("Cannot compute percentile of an empty array");
    }
    if (sortedValues.length === 1) {
        return sortedValues[0];
    }
    const index = clamp(ratio, 0, 1) * (sortedValues.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    if (lower === upper)
        return sortedValues[lower];
    return lerp(sortedValues[lower], sortedValues[upper], index - lower);
}
export function projectPointToAxis(point, origin, axis) {
    return dotVec3(subVec3(point, origin), normalizeVec3(axis));
}
export function remap(value, inMin, inMax, outMin, outMax) {
    if (Math.abs(inMax - inMin) < EPSILON) {
        return outMin;
    }
    return outMin + (((value - inMin) / (inMax - inMin)) * (outMax - outMin));
}
export function angleBetweenDeg(a, b) {
    const dot = clamp(dotVec3(normalizeVec3(a), normalizeVec3(b)), -1, 1);
    return Math.acos(dot) * (180 / Math.PI);
}
