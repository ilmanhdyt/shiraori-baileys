import PQueue from 'p-queue'
import { v4 as uuidv4 } from 'uuid'
import type { QueueStats } from '../Types'

export interface QueueTask<T> {
  id: string
  priority: number
  fn: () => Promise<T>
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
export class MessageQueueManager {
  private queue: PQueue
  private stats: QueueStats = {
    pending: 0,
    running: 0,
    completed: 0,
    failed: 0,
    avgLatency: 0,
  }
  private latencies: number[] = []
  private maxLatencySamples = 100

  constructor(concurrency: number = 3) {
    this.queue = new PQueue({ concurrency })
    this.queue.on('active', () => {
      this.stats.running = this.queue.pending
    })
  }

  /**
   * Enqueue a task with optional priority (higher = runs first).
   */
  async enqueue<T>(fn: () => Promise<T>, priority: number = 0): Promise<T> {
    this.stats.pending++
    const start = Date.now()

    try {
      const result = await this.queue.add(fn, { priority }) as T
      const latency = Date.now() - start
      this.trackLatency(latency)
      this.stats.completed++
      this.stats.pending--
      return result
    } catch (err) {
      this.stats.failed++
      this.stats.pending--
      throw err
    }
  }

  /**
   * Enqueue with automatic retry on failure.
   */
  async enqueueWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    retryDelay: number = 500,
    priority: number = 0,
  ): Promise<T> {
    let lastError: Error | undefined
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.enqueue(fn, priority)
      } catch (err) {
        lastError = err as Error
        if (attempt < maxRetries) {
          await sleep(retryDelay * Math.pow(2, attempt))
        }
      }
    }
    throw lastError
  }

  getStats(): QueueStats {
    return { ...this.stats, pending: this.queue.size, running: this.queue.pending }
  }

  get size() {
    return this.queue.size
  }

  get pending() {
    return this.queue.pending
  }

  clear() {
    this.queue.clear()
  }

  pause() {
    this.queue.pause()
  }

  resume() {
    this.queue.start()
  }

  private trackLatency(ms: number) {
    this.latencies.push(ms)
    if (this.latencies.length > this.maxLatencySamples) {
      this.latencies.shift()
    }
    this.stats.avgLatency =
      this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
