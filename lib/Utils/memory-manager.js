"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoundedMap = exports.MemoryManager = void 0;
/**
 * MemoryManager
 *
 * Provides utilities to prevent memory leaks in long-running bots:
 * - Bounded caches (auto-evict oldest entries)
 * - Explicit GC hints
 * - Buffer deallocation helpers
 * - Process memory monitoring
 */
class MemoryManager {
    constructor(gcIntervalMs = 60000) {
        this.gcIntervalMs = gcIntervalMs;
        this.gcInterval = null;
        this.caches = new Map();
    }
    /**
     * Start periodic GC hints and cache cleanup.
     */
    start() {
        if (this.gcInterval)
            return;
        this.gcInterval = setInterval(() => {
            this.runCleanup();
        }, this.gcIntervalMs);
        // Don't keep the event loop alive just for GC
        if (this.gcInterval.unref)
            this.gcInterval.unref();
    }
    stop() {
        if (this.gcInterval) {
            clearInterval(this.gcInterval);
            this.gcInterval = null;
        }
    }
    /**
     * Create a bounded map that auto-evicts oldest entries when full.
     */
    createBoundedCache(name, maxSize) {
        const cache = new BoundedMap(maxSize);
        this.caches.set(name, cache);
        return cache;
    }
    getCache(name) {
        return this.caches.get(name);
    }
    /**
     * Log current process memory usage.
     */
    getMemoryUsage() {
        const mem = process.memoryUsage();
        return {
            ...mem,
            heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
            rssMB: Math.round(mem.rss / 1024 / 1024),
        };
    }
    runCleanup() {
        // Suggest GC if available (node --expose-gc)
        if (global.gc) {
            try {
                global.gc();
            }
            catch {
                // not available
            }
        }
        // Clear all registered bounded caches that are full
        for (const [, cache] of this.caches) {
            if (cache.size > cache.maxSize * 0.9) {
                cache.evictOldest(Math.floor(cache.maxSize * 0.2));
            }
        }
    }
}
exports.MemoryManager = MemoryManager;
/**
 * BoundedMap - a Map with a maximum size that evicts oldest entries.
 */
class BoundedMap extends Map {
    constructor(maxSize) {
        super();
        this.maxSize = maxSize;
    }
    set(key, value) {
        if (!this.has(key) && this.size >= this.maxSize) {
            // Evict oldest (first inserted) key
            const firstKey = this.keys().next().value;
            if (firstKey !== undefined) {
                this.delete(firstKey);
            }
        }
        return super.set(key, value);
    }
    evictOldest(count) {
        let evicted = 0;
        for (const key of this.keys()) {
            if (evicted >= count)
                break;
            this.delete(key);
            evicted++;
        }
    }
}
exports.BoundedMap = BoundedMap;
//# sourceMappingURL=memory-manager.js.map