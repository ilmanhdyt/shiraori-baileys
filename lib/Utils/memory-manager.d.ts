/**
 * MemoryManager
 *
 * Provides utilities to prevent memory leaks in long-running bots:
 * - Bounded caches (auto-evict oldest entries)
 * - Explicit GC hints
 * - Buffer deallocation helpers
 * - Process memory monitoring
 */
export declare class MemoryManager {
    private gcIntervalMs;
    private gcInterval;
    private caches;
    constructor(gcIntervalMs?: number);
    /**
     * Start periodic GC hints and cache cleanup.
     */
    start(): void;
    stop(): void;
    /**
     * Create a bounded map that auto-evicts oldest entries when full.
     */
    createBoundedCache<K extends string, V>(name: string, maxSize: number): BoundedMap<K, V>;
    getCache<K extends string, V>(name: string): BoundedMap<K, V> | undefined;
    /**
     * Log current process memory usage.
     */
    getMemoryUsage(): NodeJS.MemoryUsage & {
        heapUsedMB: number;
        rssMB: number;
    };
    private runCleanup;
}
/**
 * BoundedMap - a Map with a maximum size that evicts oldest entries.
 */
export declare class BoundedMap<K, V> extends Map<K, V> {
    readonly maxSize: number;
    constructor(maxSize: number);
    set(key: K, value: V): this;
    evictOldest(count: number): void;
}
//# sourceMappingURL=memory-manager.d.ts.map