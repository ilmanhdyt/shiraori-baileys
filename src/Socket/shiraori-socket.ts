import makeWASocket, {
  type WASocket,
  type SocketConfig,
  type AnyMessageContent,
  type MiscMessageGenerationOptions,
  DisconnectReason,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import type { Logger } from 'pino'

import type {
  ShiraoriConfig,
  CTAUrlButtonOptions,
  CallButtonOptions,
  CopyCodeButtonOptions,
  ListMessageOptions,
  CarouselOptions,
  InteractiveMessageOptions,
} from '../Types'

import {
  buildCTAUrlMessage,
  buildCallButtonMessage,
  buildCopyCodeMessage,
  buildListMessage,
  buildCarouselMessage,
  buildInteractiveMessage,
} from '../Utils/message-builder'
import { MessageQueueManager } from '../Utils/message-queue'
import { ReconnectManager } from '../Utils/reconnect-manager'
import { MemoryManager } from '../Utils/memory-manager'
import { validateAuthFolder, cleanSessionFiles } from '../Utils/session-validator'
import { makeShiraoriLogger } from '../Utils/logger'

// ─────────────────────────────────────────────
// Extended WASocket type with Shiraori methods
// ─────────────────────────────────────────────

export interface ShiraoriSocket extends WASocket {
  // CTA URL Button
  sendCTAUrl(jid: string, body: string, buttonText: string, url: string, opts?: Partial<CTAUrlButtonOptions>): Promise<void>
  // Call Button
  sendCallButton(jid: string, body: string, buttonText: string, phoneNumber: string, opts?: Partial<CallButtonOptions>): Promise<void>
  // Copy Code Button
  sendCopyCode(jid: string, body: string, buttonText: string, code: string, opts?: Partial<CopyCodeButtonOptions>): Promise<void>
  // List Message
  sendList(jid: string, opts: ListMessageOptions): Promise<void>
  // Carousel
  sendCarousel(jid: string, opts: CarouselOptions): Promise<void>
  // Generic interactive
  sendInteractive(jid: string, opts: InteractiveMessageOptions): Promise<void>
  // Enhanced sendMessage with queue
  sendMessageQueued(jid: string, content: AnyMessageContent, opts?: MiscMessageGenerationOptions): Promise<void>
  // Stats
  getQueueStats(): ReturnType<MessageQueueManager['getStats']>
  getMemoryUsage(): ReturnType<MemoryManager['getMemoryUsage']>
}

// ─────────────────────────────────────────────
// makeShiraoriSocket Factory
// ─────────────────────────────────────────────

export interface ShiraoriSocketConfig extends Partial<SocketConfig> {
  shiraori?: ShiraoriConfig
  /** Path to auth state folder (used for anti-bad-session validation) */
  authFolder?: string
}

/**
 * Creates a Shiraori-enhanced WASocket.
 *
 * Drop-in replacement for makeWASocket with additional helper methods,
 * anti bad-session protection, fast mode, and better reconnect logic.
 */
export function makeShiraoriSocket(config: ShiraoriSocketConfig): ShiraoriSocket {
  const shiraoriCfg: Required<ShiraoriConfig> = {
    antiBadSession: config.shiraori?.antiBadSession ?? true,
    fastMode: config.shiraori?.fastMode ?? false,
    maxReconnectAttempts: config.shiraori?.maxReconnectAttempts ?? 5,
    reconnectBaseDelay: config.shiraori?.reconnectBaseDelay ?? 2000,
    reconnectMaxDelay: config.shiraori?.reconnectMaxDelay ?? 30000,
    queueConcurrency: config.shiraori?.queueConcurrency ?? 3,
    useMessageQueue: config.shiraori?.useMessageQueue ?? true,
    logLevel: config.shiraori?.logLevel ?? 'info',
  }

  const logger = (config.logger as Logger) ?? makeShiraoriLogger(shiraoriCfg.logLevel) as unknown as Logger

  // ── Anti Bad-Session: validate before connecting ──────────────────────
  if (shiraoriCfg.antiBadSession && config.authFolder) {
    const validation = validateAuthFolder(config.authFolder)
    if (!validation.valid) {
      logger.warn(
        { reason: validation.reason, shouldCleanup: validation.shouldCleanup },
        '[shiraori] Anti bad-session: session validation failed',
      )
      if (validation.shouldCleanup) {
        logger.warn('[shiraori] Cleaning up corrupted session files...')
        cleanSessionFiles(config.authFolder, true)
        logger.info('[shiraori] Session files cleaned. Will re-pair on next start.')
      }
    }
  }

  // ── Build optimized socket config ────────────────────────────────────
  const socketConfig: Partial<SocketConfig> = {
    ...config,
    logger,
    // Fast mode: reduce internal timeouts
    ...(shiraoriCfg.fastMode
      ? {
          connectTimeoutMs: 30_000,
          defaultQueryTimeoutMs: 30_000,
          keepAliveIntervalMs: 15_000,
          retryRequestDelayMs: 250,
          maxMsgRetryCount: 3,
        }
      : {
          connectTimeoutMs: 60_000,
          defaultQueryTimeoutMs: 60_000,
          keepAliveIntervalMs: 30_000,
          retryRequestDelayMs: 500,
          maxMsgRetryCount: 5,
        }),
    // Always use bounded retry cache to prevent memory leak
    msgRetryCounterCache: new (require('node-cache'))({ stdTTL: 300, maxKeys: 500 }),
    // Suppress link previews for speed
    generateHighQualityLinkPreview: false,
  }

  // ── Create base socket ────────────────────────────────────────────────
  const sock = makeWASocket(socketConfig as SocketConfig)

  // ── Initialize managers ───────────────────────────────────────────────
  const queueMgr = new MessageQueueManager(shiraoriCfg.queueConcurrency)
  const memMgr = new MemoryManager(shiraoriCfg.fastMode ? 30_000 : 60_000)
  memMgr.start()

  const reconnectMgr = new ReconnectManager(
    {
      maxAttempts: shiraoriCfg.maxReconnectAttempts,
      baseDelay: shiraoriCfg.reconnectBaseDelay,
      maxDelay: shiraoriCfg.reconnectMaxDelay,
      jitter: true,
    },
    logger,
  )

  // ─────────────────────────────────────────────
  // Core helper: relay an IMessage as a chat update
  // ─────────────────────────────────────────────
  async function sendProtoMessage(
    jid: string,
    message: Record<string, unknown>,
    quotedMsg?: unknown,
  ): Promise<void> {
    const task = async () => {
      await sock.sendMessage(jid, message as AnyMessageContent, {
        quoted: quotedMsg as MiscMessageGenerationOptions['quoted'],
      })
    }

    if (shiraoriCfg.useMessageQueue) {
      await queueMgr.enqueueWithRetry(task, 2, 300, 0)
    } else {
      await task()
    }
  }

  // ─────────────────────────────────────────────
  // Shiraori Extended Methods
  // ─────────────────────────────────────────────

  async function sendCTAUrl(
    jid: string,
    body: string,
    buttonText: string,
    url: string,
    opts?: Partial<CTAUrlButtonOptions>,
  ) {
    const msg = buildCTAUrlMessage({ body, buttonText, url, ...opts })
    await sendProtoMessage(jid, msg as Record<string, unknown>)
  }

  async function sendCallButton(
    jid: string,
    body: string,
    buttonText: string,
    phoneNumber: string,
    opts?: Partial<CallButtonOptions>,
  ) {
    const msg = buildCallButtonMessage({ body, buttonText, phoneNumber, ...opts })
    await sendProtoMessage(jid, msg as Record<string, unknown>)
  }

  async function sendCopyCode(
    jid: string,
    body: string,
    buttonText: string,
    code: string,
    opts?: Partial<CopyCodeButtonOptions>,
  ) {
    const msg = buildCopyCodeMessage({ body, buttonText, code, ...opts })
    await sendProtoMessage(jid, msg as Record<string, unknown>)
  }

  async function sendList(jid: string, opts: ListMessageOptions) {
    const msg = buildListMessage(opts)
    await sendProtoMessage(jid, msg as Record<string, unknown>)
  }

  async function sendCarousel(jid: string, opts: CarouselOptions) {
    const msg = buildCarouselMessage(opts)
    await sendProtoMessage(jid, msg as Record<string, unknown>)
  }

  async function sendInteractive(jid: string, opts: InteractiveMessageOptions) {
    const msg = buildInteractiveMessage(opts)
    await sendProtoMessage(jid, msg as Record<string, unknown>)
  }

  async function sendMessageQueued(
    jid: string,
    content: AnyMessageContent,
    opts?: MiscMessageGenerationOptions,
  ) {
    const task = () => sock.sendMessage(jid, content, opts)
    if (shiraoriCfg.useMessageQueue) {
      await queueMgr.enqueueWithRetry(task, 2, 300, 0)
    } else {
      await task()
    }
  }

  function getQueueStats() {
    return queueMgr.getStats()
  }

  function getMemoryUsage() {
    return memMgr.getMemoryUsage()
  }

  // ─────────────────────────────────────────────
  // Expose reconnectMgr on sock for external use
  // ─────────────────────────────────────────────
  ;(sock as Record<string, unknown>)._shiraori = {
    queueMgr,
    memMgr,
    reconnectMgr,
    config: shiraoriCfg,
  }

  // ─────────────────────────────────────────────
  // Assemble extended socket
  // ─────────────────────────────────────────────
  const extended = Object.assign(sock, {
    sendCTAUrl,
    sendCallButton,
    sendCopyCode,
    sendList,
    sendCarousel,
    sendInteractive,
    sendMessageQueued,
    getQueueStats,
    getMemoryUsage,
  }) as ShiraoriSocket

  return extended
}

// ─────────────────────────────────────────────
// Auto-reconnect factory helper
// ─────────────────────────────────────────────

export interface AutoReconnectOptions {
  authFolder: string
  shiraoriConfig?: ShiraoriConfig
  socketConfig?: Partial<SocketConfig>
  /** Called every time a new socket is created */
  onSocket: (sock: ShiraoriSocket) => void
  /** Called on clean disconnection (logged out) */
  onLoggedOut?: () => void
}

/**
 * Creates a self-reconnecting ShiraoriSocket with exponential backoff.
 *
 * @example
 * ```ts
 * startAutoReconnect({
 *   authFolder: './auth_info',
 *   onSocket: (sock) => {
 *     sock.ev.on('messages.upsert', ...)
 *   }
 * })
 * ```
 */
export async function startAutoReconnect(opts: AutoReconnectOptions): Promise<void> {
  const shiraoriCfg: Required<ShiraoriConfig> = {
    antiBadSession: opts.shiraoriConfig?.antiBadSession ?? true,
    fastMode: opts.shiraoriConfig?.fastMode ?? false,
    maxReconnectAttempts: opts.shiraoriConfig?.maxReconnectAttempts ?? 5,
    reconnectBaseDelay: opts.shiraoriConfig?.reconnectBaseDelay ?? 2000,
    reconnectMaxDelay: opts.shiraoriConfig?.reconnectMaxDelay ?? 30000,
    queueConcurrency: opts.shiraoriConfig?.queueConcurrency ?? 3,
    useMessageQueue: opts.shiraoriConfig?.useMessageQueue ?? true,
    logLevel: opts.shiraoriConfig?.logLevel ?? 'info',
  }

  const logger = makeShiraoriLogger(shiraoriCfg.logLevel) as unknown as Logger
  const reconnectMgr = new ReconnectManager(
    {
      maxAttempts: shiraoriCfg.maxReconnectAttempts,
      baseDelay: shiraoriCfg.reconnectBaseDelay,
      maxDelay: shiraoriCfg.reconnectMaxDelay,
      jitter: true,
    },
    logger,
  )

  async function connect() {
    const { state, saveCreds } = await useMultiFileAuthState(opts.authFolder)

    const sock = makeShiraoriSocket({
      ...opts.socketConfig,
      auth: state,
      authFolder: opts.authFolder,
      shiraori: opts.shiraoriConfig,
      logger,
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update

      if (qr) {
        logger.info('[shiraori] QR code received — scan with WhatsApp')
      }

      if (connection === 'open') {
        logger.info('[shiraori] Connected successfully')
        reconnectMgr.reset()
      }

      if (connection === 'close') {
        const boom = lastDisconnect?.error as Boom | undefined
        const statusCode = boom?.output?.statusCode

        logger.warn({ statusCode, error: boom?.message }, '[shiraori] Connection closed')

        const { reconnect, reason, isBadSession } = reconnectMgr.shouldReconnect({
          error: {
            message: boom?.message,
            output: { statusCode },
          },
        })

        if (isBadSession) {
          logger.error('[shiraori] Bad session detected — cleaning up and re-pairing')
          if (shiraoriCfg.antiBadSession) {
            cleanSessionFiles(opts.authFolder, false)
          }
          opts.onLoggedOut?.()
          return
        }

        if (statusCode === DisconnectReason.loggedOut) {
          logger.warn('[shiraori] Logged out — not reconnecting')
          opts.onLoggedOut?.()
          return
        }

        if (reconnect) {
          await reconnectMgr.backoff()
          logger.info('[shiraori] Reconnecting...')
          await connect()
        } else {
          logger.error({ reason }, '[shiraori] Will not reconnect')
          opts.onLoggedOut?.()
        }
      }
    })

    opts.onSocket(sock)
  }

  await connect()
}
