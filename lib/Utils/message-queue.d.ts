import type { QueueStats } from '../Types';
export interface QueueTask<T> {
    id: string;
    priority: number;
    fn: () => Promise<T>;
}
/**
 * MessageQueueManager
 *
 * Manages outgoing message throughput with:
 * - Configurable concurrency
 * - Priority-based ordering
 * - Per-task retry
 * - Stats tracking
 */
export declare class MessageQueueManager {
    private queue;
    private stats;
    private latencies;
    private maxLatencySamples;
    constructor(concurrency?: number);
    /**
     * Enqueue a task with optional priority (higher = runs first).
     */
    enqueue<T>(fn: () => Promise<T>, priority?: number): Promise<T>;
    /**
     * Enqueue with automatic retry on failure.
     */
    enqueueWithRetry<T>(fn: () => Promise<T>, maxRetries?: number, retryDelay?: number, priority?: number): Promise<T>;
    getStats(): QueueStats;
    get size(): number;
    get pending(): number;
    clear(): void;
    pause(): void;
    resume(): void;
    private trackLatency;
}
//# sourceMappingURL=message-queue.d.ts.map