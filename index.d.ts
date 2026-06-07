/**
 * shiraori-baileys — TypeScript Declarations
 * Auto-generated from src/index.ts
 *
 * Include this in your project for full type support:
 * "types": "./index.d.ts"
 */

import type { WASocket, SocketConfig, AnyMessageContent, MiscMessageGenerationOptions, proto } from '@whiskeysockets/baileys'
import type { Logger } from 'pino'

// ─────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────

export interface ShiraoriConfig {
  antiBadSession?: boolean
  fastMode?: boolean
  maxReconnectAttempts?: number
  reconnectBaseDelay?: number
  reconnectMaxDelay?: number
  queueConcurrency?: number
  useMessageQueue?: boolean
  logLevel?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'silent'
}

// ─────────────────────────────────────────────
// Button Options
// ─────────────────────────────────────────────

export interface CTAUrlButtonOptions {
  body: string
  buttonText: string
  url: string
  footer?: string
  header?: string
  thumbnail?: Buffer
}

export interface CallButtonOptions {
  body: string
  buttonText: string
  phoneNumber: string
  footer?: string
  header?: string
}

export interface CopyCodeButtonOptions {
  body: string
  buttonText: string
  code: string
  footer?: string
  header?: string
}

// ─────────────────────────────────────────────
// List Message
// ─────────────────────────────────────────────

export interface ListRow {
  title: string
  description?: string
  rowId: string
}

export interface ListSection {
  title?: string
  rows: ListRow[]
}

export interface ListMessageOptions {
  title: string
  text: string
  footer?: string
  buttonText: string
  sections: ListSection[]
  thumbnail?: Buffer
}

// ─────────────────────────────────────────────
// Carousel
// ─────────────────────────────────────────────

export interface CarouselCardButton {
  type: 'url' | 'call' | 'quickReply' | 'copyCode'
  text: string
  url?: string
  phoneNumber?: string
  code?: string
  payload?: string
}

export interface CarouselCard {
  image?: Buffer
  video?: Buffer
  title: string
  body: string
  footer?: string
  buttons: CarouselCardButton[]
}

export interface CarouselOptions {
  cards: CarouselCard[]
}

// ─────────────────────────────────────────────
// Interactive
// ─────────────────────────────────────────────

export type InteractiveAction =
  | { type: 'ctaUrl'; text: string; url: string }
  | { type: 'call'; text: string; phoneNumber: string }
  | { type: 'copyCode'; text: string; code: string }
  | { type: 'quickReply'; text: string; payload: string }

export interface InteractiveMessageOptions {
  header?: {
    title?: string
    subtitle?: string
    hasMediaAttachment?: boolean
    image?: Buffer
    video?: Buffer
    document?: Buffer
    location?: { degreesLatitude: number; degreesLongitude: number }
  }
  body: string
  footer?: string
  actions: InteractiveAction[]
  nativeFlow?: boolean
}

// ─────────────────────────────────────────────
// Queue Stats
// ─────────────────────────────────────────────

export interface QueueStats {
  pending: number
  running: number
  completed: number
  failed: number
  avgLatency: number
}

export interface SessionValidationResult {
  valid: boolean
  reason?: string
  shouldCleanup?: boolean
}

// ─────────────────────────────────────────────
// ShiraoriSocket
// ─────────────────────────────────────────────

export interface ShiraoriSocket extends WASocket {
  /**
   * Send a CTA URL button message.
   * @param jid - Recipient JID
   * @param body - Message body text
   * @param buttonText - Button label
   * @param url - URL to open
   * @param opts - Optional header, footer, thumbnail
   */
  sendCTAUrl(
    jid: string,
    body: string,
    buttonText: string,
    url: string,
    opts?: Partial<CTAUrlButtonOptions>,
  ): Promise<void>

  /**
   * Send a WhatsApp call button message.
   * @param jid - Recipient JID
   * @param body - Message body text
   * @param buttonText - Button label
   * @param phoneNumber - Phone number with country code (e.g. +628123456789)
   * @param opts - Optional header, footer
   */
  sendCallButton(
    jid: string,
    body: string,
    buttonText: string,
    phoneNumber: string,
    opts?: Partial<CallButtonOptions>,
  ): Promise<void>

  /**
   * Send a copy-to-clipboard button message.
   * @param jid - Recipient JID
   * @param body - Message body text
   * @param buttonText - Button label
   * @param code - Text to copy when button is pressed
   * @param opts - Optional header, footer
   */
  sendCopyCode(
    jid: string,
    body: string,
    buttonText: string,
    code: string,
    opts?: Partial<CopyCodeButtonOptions>,
  ): Promise<void>

  /**
   * Send a native WhatsApp list message.
   * @param jid - Recipient JID
   * @param opts - List options including title, text, sections
   */
  sendList(jid: string, opts: ListMessageOptions): Promise<void>

  /**
   * Send an image carousel with multiple interactive cards.
   * @param jid - Recipient JID
   * @param opts - Carousel options with cards array
   */
  sendCarousel(jid: string, opts: CarouselOptions): Promise<void>

  /**
   * Send a generic interactive message with mixed action types.
   * @param jid - Recipient JID
   * @param opts - Interactive message options
   */
  sendInteractive(jid: string, opts: InteractiveMessageOptions): Promise<void>

  /**
   * Send a message through the internal queue (respects concurrency limits).
   * @param jid - Recipient JID
   * @param content - Message content
   * @param opts - Optional send options
   */
  sendMessageQueued(
    jid: string,
    content: AnyMessageContent,
    opts?: MiscMessageGenerationOptions,
  ): Promise<void>

  /** Get current message queue statistics. */
  getQueueStats(): QueueStats

  /** Get current process memory usage in MB. */
  getMemoryUsage(): NodeJS.MemoryUsage & { heapUsedMB: number; rssMB: number }
}

// ─────────────────────────────────────────────
// Socket Config
// ─────────────────────────────────────────────

export interface ShiraoriSocketConfig extends Partial<SocketConfig> {
  shiraori?: ShiraoriConfig
  authFolder?: string
  logger?: Logger
}

export interface AutoReconnectOptions {
  authFolder: string
  shiraoriConfig?: ShiraoriConfig
  socketConfig?: Partial<SocketConfig>
  onSocket: (sock: ShiraoriSocket) => void
  onLoggedOut?: () => void
}

// ─────────────────────────────────────────────
// Factory Functions
// ─────────────────────────────────────────────

/**
 * Create a ShiraoriSocket — drop-in replacement for makeWASocket.
 *
 * @example
 * ```ts
 * const { state, saveCreds } = await useMultiFileAuthState('./auth')
 * const sock = makeShiraoriSocket({ auth: state, authFolder: './auth' })
 * sock.ev.on('creds.update', saveCreds)
 * ```
 */
export declare function makeShiraoriSocket(config: ShiraoriSocketConfig): ShiraoriSocket

/**
 * Start a self-reconnecting ShiraoriSocket with exponential backoff.
 *
 * @example
 * ```ts
 * await startAutoReconnect({
 *   authFolder: './auth',
 *   onSocket: (sock) => {
 *     sock.ev.on('messages.upsert', ...)
 *   }
 * })
 * ```
 */
export declare function startAutoReconnect(opts: AutoReconnectOptions): Promise<void>

// ─────────────────────────────────────────────
// Utility Classes
// ─────────────────────────────────────────────

export declare class MessageQueueManager {
  constructor(concurrency?: number)
  enqueue<T>(fn: () => Promise<T>, priority?: number): Promise<T>
  enqueueWithRetry<T>(fn: () => Promise<T>, maxRetries?: number, retryDelay?: number, priority?: number): Promise<T>
  getStats(): QueueStats
  get size(): number
  get pending(): number
  clear(): void
  pause(): void
  resume(): void
}

export declare class ReconnectManager {
  constructor(options: { maxAttempts: number; baseDelay: number; maxDelay: number; jitter?: boolean }, logger: Logger)
  shouldReconnect(lastDisconnect: { error?: { message?: string; output?: { statusCode?: number } }; date?: Date }): { reconnect: boolean; reason: string; isBadSession: boolean }
  getDelay(): number
  backoff(): Promise<void>
  reset(): void
  stop(): void
}

export declare class MemoryManager {
  constructor(gcIntervalMs?: number)
  start(): void
  stop(): void
  getMemoryUsage(): NodeJS.MemoryUsage & { heapUsedMB: number; rssMB: number }
}

export declare class BoundedMap<K, V> extends Map<K, V> {
  constructor(maxSize: number)
  readonly maxSize: number
  evictOldest(count: number): void
}

// ─────────────────────────────────────────────
// Session Utils
// ─────────────────────────────────────────────

export declare function validateCredsFile(credsPath: string): SessionValidationResult
export declare function validateAuthFolder(authFolder: string): SessionValidationResult
export declare function cleanSessionFiles(authFolder: string, keepCreds?: boolean): void
export declare function nukeAuthFolder(authFolder: string): void

// ─────────────────────────────────────────────
// Message Builders (low-level)
// ─────────────────────────────────────────────

export declare function buildCTAUrlMessage(opts: CTAUrlButtonOptions): proto.IMessage
export declare function buildCallButtonMessage(opts: CallButtonOptions): proto.IMessage
export declare function buildCopyCodeMessage(opts: CopyCodeButtonOptions): proto.IMessage
export declare function buildListMessage(opts: ListMessageOptions): proto.IMessage
export declare function buildCarouselMessage(opts: CarouselOptions): proto.IMessage
export declare function buildInteractiveMessage(opts: InteractiveMessageOptions): proto.IMessage

// ─────────────────────────────────────────────
// Re-export core Baileys (full compatibility)
// ─────────────────────────────────────────────

export {
  makeWASocket as default,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  getContentType,
  downloadContentFromMessage,
  generateWAMessage,
  proto,
  jidDecode,
  jidEncode,
  jidNormalizedUser,
  areJidsSameUser,
  isJidBroadcast,
  isJidGroup,
  isJidUser,
  getDevice,
  makeCacheableSignalKeyStore,
  makeInMemoryStore,
} from '@whiskeysockets/baileys'
