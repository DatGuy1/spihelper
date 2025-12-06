export enum OpState {
  Running = 'running',
  Success = 'success',
  Failed = 'failed',
}

const activeOperations = new Map<string, OpState>();

export function startOp(name: string): void {
  activeOperations.set(name, OpState.Running);
}

export function finishOp(name: string, state: OpState.Success | OpState.Failed): void {
  activeOperations.set(name, state);
}

export function hasRunningOps(): boolean {
  for (const state of activeOperations.values()) {
    if (state === OpState.Running) return true;
  }
  return false;
}

export function getActiveOps(): Map<string, OpState> {
  return activeOperations;
}
