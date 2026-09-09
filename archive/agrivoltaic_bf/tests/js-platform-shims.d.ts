declare module "../src/platform/router.js" {
  export function designHref(): string;
  export function jobRunHref(jobId: string): string;
  export function resultsHref(jobId: string): string;
  export function extractJobId(pathname: string, routePrefix: string): string | null;
}

declare module "../src/platform/sessionStore.js" {
  export function createSessionStore(storage?: {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
  }): {
    load(): any;
    getSite(): any;
    setSite(site: any): any;
    getDesignState(): any;
    setDesignState(designState: any): any;
    getProjectName(): string;
    setProjectName(projectName: string): any;
    getLastJobId(): string | null;
    rememberJob(job: any): any;
  };
}

declare module "../src/platform/sceneExport.js" {
  export function tagSceneForAnnualSimulation(sceneApp: {
    getSimulationContext(): {
      scene: any;
      sceneSummary?: any;
    };
  }): void;
}

declare module "../src/platform/sensorSelectionPresets.js" {
  export function centeredSquareSensorIds(
    sensors: Array<{
      id: string;
      position?: { x?: number; y?: number };
    }>,
    options?: {
      span?: number;
      project?: (sensor: any) => { along: number; cross: number } | null;
    },
  ): string[];
}

declare module "../src/app/state.js" {
  export function createStateStore(initialState?: any): {
    getState(): any;
    setState(next: any): void;
  };
  export function sanitizeState(input?: any): any;
}

declare module "../src/utils/constants.js" {
  export const SYSTEM_PRESETS: Record<string, any>;
}

declare module "../src/utils/layout.js" {
  export function computeArrayLayout(state: any): any;
}

declare module "../src/systems/systemFactory.js" {
  export function getArchetype(systemType: string): any;
}
