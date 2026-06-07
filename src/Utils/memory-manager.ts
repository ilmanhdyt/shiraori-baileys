/**
 * MemoryManager
 *
 * Provides utilities to prevent memory leaks in long-running bots:
 * - Bounded caches (auto-evict oldest entries)
 * - Explicit GC hints
 * - Buffer deallocation helpers
 * - Process memory monitoring
 */
export class MemoryManager {
  private gcInterval: NodeJS.Timeout | null = null
  private caches: Map<string, BoundedMap<string, unknown>> = new Map()

  constructor(private gcIntervalMs: number = 60_000) {}

  /**
   * Start periodic GC hints and cache cleanup.
   */
  start() {
    if (this.gcInterval) return
    this.gcInterval = setInterval(() => {
      this.runCleanup()
    }, this.gcIntervalMs)
    // Don't keep the event loop alive just for GC
    if (this.gcInterval.unref) this.gcInterval.unref()
  }

  stop() {
    if (this.gcInterval) {
      clearInterval(this.gcInterval)
      this.gcInterval = null
    }
  }

  /**
   * Create a bounded map that auto-evicts oldest entries when full.
   */
  createBoundedCache<K extends string, V>(name: string, maxSize: number): BoundedMap<K, V> {
    const cache = new BoundedMap<K, V>(maxSize)
    this.caches.set(name, cache as BoundedMap<string, unknown>)
    return cache
  }

  getCache<K extends string, V>(name: string): BoundedMap<K, V> | undefined {
    return this.caches.get(name) as BoundedMap<K, V> | undefined
  }

  /**
   * Log current process memory usage.
   */
  getMemoryUsage(): NodeJS.MemoryUsage & { heapUsedMB: number; rssMB: number } {
    const mem = process.memoryUsage()
    return {
      ...mem,
      heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
      rssMB: Math.round(mem.rss / 1024 / 1024),
    }
  }

  private runCleanup() {
    // Suggest GC if available (node --expose-gc)
    if (global.gc) {
      try {
        global.gc()
      } catch {
        // not available
      }
    }

    // Clear all registered bounded caches that are full
    for (const [, cache] of this.caches) {
      if (cache.size > cache.maxSize * 0.9) {
        cache.evictOldest(Math.floor(cache.maxSize * 0.2))
      }
    }
  }
}

/**
 * BoundedMap - a Map with a maximum size that evicts oldest entries.
 */
export class BoundedMap<K, V> extends Map<K, V> {
  constructor(public readonly maxSize: number) {
    super()
  }

  set(key: K, value: V): this {
    if (!this.has(key) && this.size >= this.maxSize) {
      // Evict oldest (first inserted) key
      const firstKey = this.keys().next().value
      if (firstKey !== undefined) {
        this.delete(firstKey)
      }
    }
    return super.set(key, value)
  }

  evictOldest(count: number) {
    let evicted = 0
    for (const key of this.keys()) {
      if (evicted >= count) break
      this.delete(key)
      evicted++
    }
  }
}
