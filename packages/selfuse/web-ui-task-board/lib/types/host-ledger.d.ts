import { type ExecutionRecord, type TaskRecord } from './core/tasks.ts';
import { type TaskBoardAction, type TaskBoardSchedulerSnapshot } from './protocol.ts';
export interface LedgerState {
    revision: number;
    tasks: TaskRecord[];
    scheduler: TaskBoardSchedulerSnapshot;
}
export interface OpenedRun {
    task: TaskRecord;
    execution: ExecutionRecord;
}
export declare class HostTaskLedger {
    private readonly now;
    private document;
    private readonly listeners;
    private readonly requestCache;
    private readonly lockToken;
    private lockFd;
    readonly file: string;
    readonly lockFile: string;
    /** Small sidecar for the 30 s scheduler heartbeat (lastTickAt only). */
    readonly schedulerFile: string;
    constructor(dir?: string, now?: () => number);
    /** Revision + scheduler without any task cloning; feeds the SSE event frame. */
    summary(): {
        revision: number;
        scheduler: TaskBoardSchedulerSnapshot;
    };
    state(): LedgerState;
    subscribe(listener: () => void): () => void;
    dispose(): void;
    applyRequest(requestId: string, action: TaskBoardAction): {
        state: LedgerState;
        run?: OpenedRun;
    };
    openScheduled(taskId: string, nextRunAt: number | undefined, triggeredAt: number): OpenedRun | undefined;
    skipMissed(now: number): void;
    setScheduler(patch: Partial<TaskBoardSchedulerSnapshot>): void;
    attachSession(taskId: string, executionId: string, sessionId: string): void;
    settle(taskId: string, executionId: string, outcome: 'succeeded' | 'failed' | 'cancelled', error?: string): void;
    private apply;
    private repairSchedules;
    private reconcileInterruptedStarts;
    private load;
    private syncRecentRequests;
    private readSchedulerSidecar;
    /** Atomic write of the scheduler heartbeat sidecar (0600, tmp + rename + fsync). */
    private writeSchedulerSidecar;
    private commit;
    private notify;
    private acquireLock;
}
