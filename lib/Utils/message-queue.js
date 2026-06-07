"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageQueueManager = void 0;
const p_queue_1 = __importDefault(require("p-queue"));
/**
 * MessageQueueManager
 *
 * Manages outgoing message throughput with:
 * - Configurable concurrency
 * - Priority-based ordering
 * - Per-task retry
 * - Stats tracking
 */
class MessageQueueManager {
    constructor(concurrency = 3) {
        this.stats = {
            pending: 0,
            running: 0,
            completed: 0,
            failed: 0,
            avgLatency: 0,
        };
        this.latencies = [];
        this.maxLatencySamples = 100;
        this.queue = new p_queue_1.default({ concurrency });
        this.queue.on('active', () => {
            this.stats.running = this.queue.pending;
        });
    }
    /**
     * Enqueue a task with optional priority (higher = runs first).
     */
    async enqueue(fn, priority = 0) {
        this.stats.pending++;
        const start = Date.now();
        try {
            const result = await this.queue.add(fn, { priority });
            const latency = Date.now() - start;
            this.trackLatency(latency);
            this.stats.completed++;
            this.stats.pending--;
            return result;
        }
        catch (err) {
            this.stats.failed++;
            this.stats.pending--;
            throw err;
        }
    }
    /**
     * Enqueue with automatic retry on failure.
     */
    async enqueueWithRetry(fn, maxRetries = 3, retryDelay = 500, priority = 0) {
        let lastError;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await this.enqueue(fn, priority);
            }
            catch (err) {
                lastError = err;
                if (attempt < maxRetries) {
                    await sleep(retryDelay * Math.pow(2, attempt));
                }
            }
        }
        throw lastError;
    }
    getStats() {
        return { ...this.stats, pending: this.queue.size, running: this.queue.pending };
    }
    get size() {
        return this.queue.size;
    }
    get pending() {
        return this.queue.pending;
    }
    clear() {
        this.queue.clear();
    }
    pause() {
        this.queue.pause();
    }
    resume() {
        this.queue.start();
    }
    trackLatency(ms) {
        this.latencies.push(ms);
        if (this.latencies.length > this.maxLatencySamples) {
            this.latencies.shift();
        }
        this.stats.avgLatency =
            this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length;
    }
}
exports.MessageQueueManager = MessageQueueManager;
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
//# sourceMappingURL=message-queue.js.map