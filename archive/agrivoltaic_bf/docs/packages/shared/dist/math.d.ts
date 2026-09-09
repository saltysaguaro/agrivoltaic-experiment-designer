export interface Vec3 {
    x: number;
    y: number;
    z: number;
}
export interface Bounds3 {
    min: Vec3;
    max: Vec3;
}
export declare const EPSILON = 0.000001;
export declare function vec3(x?: number, y?: number, z?: number): Vec3;
export declare function addVec3(a: Vec3, b: Vec3): Vec3;
export declare function subVec3(a: Vec3, b: Vec3): Vec3;
export declare function scaleVec3(v: Vec3, scalar: number): Vec3;
export declare function dotVec3(a: Vec3, b: Vec3): number;
export declare function crossVec3(a: Vec3, b: Vec3): Vec3;
export declare function lengthVec3(v: Vec3): number;
export declare function distanceVec3(a: Vec3, b: Vec3): number;
export declare function normalizeVec3(v: Vec3): Vec3;
export declare function safeNormalizeVec3(v: Vec3, fallback?: Vec3): Vec3;
export declare function midpoint(a: Vec3, b: Vec3): Vec3;
export declare function lerp(a: number, b: number, t: number): number;
export declare function averageVec3(points: Vec3[]): Vec3;
export declare function componentWiseMin(points: Vec3[]): Vec3;
export declare function componentWiseMax(points: Vec3[]): Vec3;
export declare function boundsFromPoints(points: Vec3[]): Bounds3;
export declare function boundsCenter(bounds: Bounds3): Vec3;
export declare function boundsSize(bounds: Bounds3): Vec3;
export declare function boundsCorners(bounds: Bounds3): Vec3[];
export declare function mergeBounds(boundsList: Bounds3[]): Bounds3;
export declare function projectOnto(v: Vec3, onto: Vec3): number;
export declare function clamp(value: number, min: number, max: number): number;
export declare function percentile(sortedValues: number[], ratio: number): number;
export declare function projectPointToAxis(point: Vec3, origin: Vec3, axis: Vec3): number;
export declare function remap(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number;
export declare function angleBetweenDeg(a: Vec3, b: Vec3): number;
