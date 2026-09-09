import type { Express } from "express";
export declare const STATIC_PAGES: Map<string, string>;
export declare const STATIC_FILES: Map<string, string>;
export declare const PUBLIC_STATIC_DIRS: readonly ["/src", "/packages/shared/dist", "/packages/three-exporter/dist", "/packages/simulation-backend/dist", "/node_modules/three", "/node_modules/zod"];
export declare function isTrustedLocalOrigin(origin: string): boolean;
export declare function createSimulationServer(): Express;
