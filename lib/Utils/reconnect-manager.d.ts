import { Logger } from 'pino';
export interface ReconnectOptions {
    maxAttempts: number;
    baseDelay: number;
    maxDelay: number;
    jitter?: boolean;
}
export interface ReconnectState {
    attempts: number;
    lastAttemptAt: number;
    isReconnecting: boolean;
    shouldStop: boolean;
}
/**
 * ReconnectManager
 *
 * Handles reconnect logic with:
 * - Exponential backoff
 * - Jitter to prevent reconnect storms
 * - Max attempt limiting
 * - Bad-session detection (stops reconnecting)
 */
export declare class ReconnectManager {
    private options;
    private logger;
    private state;
    constructor(options: ReconnectOptions, logger: Logger);
    /**
     * Determines if we should reconnect based on the disconnect reason.
     */
    shouldReconnect(lastDisconnect: {
        error?: {
            message?: string;
            output?: {
                statusCode?: number;
            };
        };
        date?: Date;
    }): {
        reconnect: boolean;
        reason: string;
        isBadSession: boolean;
    };
    /**
     * Get the current backoff delay with optional jitter.
     */
    getDelay(): number;
    /**
     * Increment attempts and wait for backoff delay.
     */
    backoff(): Promise<void>;
    /** Reset attempts after successful connection. */
    reset(): void;
    /** Force stop all future reconnects. */
    stop(): void;
    getState(): Readonly<ReconnectState>;
}
//# sourceMappingURL=reconnect-manager.d.ts.map