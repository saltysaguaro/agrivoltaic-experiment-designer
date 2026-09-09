import type { RadianceCommandLogEntry, RadianceCommandSpec } from "@agrivoltaic/shared";
export declare function formatCommand(command: RadianceCommandSpec): string;
export declare function executeCommand(packageRoot: string, command: RadianceCommandSpec): Promise<RadianceCommandLogEntry>;
