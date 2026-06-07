import { Logger } from 'pino'

export interface ReconnectOptions {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
  jitter?: boolean
}

export interface ReconnectState {
  attempts: number
  lastAttemptAt: number
  isReconnecting: boolean
  shouldStop: boolean
}

const BAD_SESSION_ERRORS = [
  'bad-session',
  'badSession',
  'Bad session',
  '401',
  'logged_out',
  'loggedOut',
]

const RECONNECTABLE_ERRORS = [
  'connection-error',
  'connection-closed',
  'timedOut',
  'Stream Errored',
  'Lost connection',
  '408',
  '503',
  '500',
]

/**
 * ReconnectManager
 *
 * Handles reconnect logic with:
 * - Exponential backoff
 * - Jitter to prevent reconnect storms
 * - Max attempt limiting
 * - Bad-session detection (stops reconnecting)
 */
export class ReconnectManager {
  private state: ReconnectState = {
    attempts: 0,
    lastAttemptAt: 0,
    isReconnecting: false,
    shouldStop: false,
  }

  constructor(
    private options: ReconnectOptions,
    private logger: Logger,
  ) {}

  /**
   * Determines if we should reconnect based on the disconnect reason.
   */
  shouldReconnect(
    lastDisconnect: { error?: { message?: string; output?: { statusCode?: number } }; date?: Date },
  ): { reconnect: boolean; reason: string; isBadSession: boolean } {
    const errorMsg = lastDisconnect?.error?.message || ''
    const statusCode = lastDisconnect?.error?.output?.statusCode

    // Check for bad session - these should NOT reconnect automatically
    const isBadSession =
      BAD_SESSION_ERRORS.some((e) => errorMsg.includes(e)) || statusCode === 401

    if (isBadSession) {
      return {
        reconnect: false,
        reason: `Bad session detected: ${errorMsg || statusCode}`,
        isBadSession: true,
      }
    }

    if (this.state.shouldStop) {
      return { reconnect: false, reason: 'Reconnect stopped by caller', isBadSession: false }
    }

    if (this.state.attempts >= this.options.maxAttempts) {
      return {
        reconnect: false,
        reason: `Max reconnect attempts reached (${this.options.maxAttempts})`,
        isBadSession: false,
      }
    }

    // Check if error is reconnectable
    const isReconnectable =
      RECONNECTABLE_ERRORS.some((e) => errorMsg.includes(e)) ||
      statusCode === 408 ||
      statusCode === 503 ||
      statusCode === 500 ||
      !errorMsg // Unknown error - try reconnecting

    if (!isReconnectable) {
      return { reconnect: false, reason: `Non-reconnectable error: ${errorMsg}`, isBadSession: false }
    }

    return { reconnect: true, reason: 'Reconnectable error', isBadSession: false }
  }

  /**
   * Get the current backoff delay with optional jitter.
   */
  getDelay(): number {
    const base = this.options.baseDelay * Math.pow(2, this.state.attempts)
    const capped = Math.min(base, this.options.maxDelay)

    if (this.options.jitter !== false) {
      // Add ±20% jitter to prevent thundering herd
      const jitter = capped * 0.2 * (Math.random() * 2 - 1)
      return Math.max(1000, Math.floor(capped + jitter))
    }

    return capped
  }

  /**
   * Increment attempts and wait for backoff delay.
   */
  async backoff(): Promise<void> {
    this.state.attempts++
    this.state.isReconnecting = true
    this.state.lastAttemptAt = Date.now()

    const delay = this.getDelay()
    this.logger.info(
      { attempt: this.state.attempts, delay, max: this.options.maxAttempts },
      '[shiraori] Reconnecting with backoff...',
    )
    await sleep(delay)
  }

  /** Reset attempts after successful connection. */
  reset() {
    this.state.attempts = 0
    this.state.isReconnecting = false
    this.state.shouldStop = false
  }

  /** Force stop all future reconnects. */
  stop() {
    this.state.shouldStop = true
  }

  getState(): Readonly<ReconnectState> {
    return { ...this.state }
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
