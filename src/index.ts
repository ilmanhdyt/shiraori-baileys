/**
 * shiraori-baileys
 *
 * Production-ready Baileys fork with:
 * - Modern interactive messages (CTA URL, Call, Copy Code, Carousel, List)
 * - Anti bad-session protection
 * - Exponential backoff reconnect
 * - Message queue with concurrency control
 * - Memory management & GC optimization
 * - Fast mode for reduced latency
 * - Full backward compatibility with @whiskeysockets/baileys
 */

// ─── Core Baileys re-exports (full compatibility) ──────────────────────────
// NOTE: useSingleFileAuthState & makeInMemoryStore dihapus di Baileys v6+
// Gunakan useMultiFileAuthState sebagai pengganti useSingleFileAuthState
export {
  default as makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  getContentType,
  downloadContentFromMessage,
  generateWAMessage,
  generateWAMessageFromContent,
  generateWAMessageContent,
  WAProto,
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
} from '@whiskeysockets/baileys'

// ─── Shiraori Socket ──────────────────────────────────────────────────────
export { makeShiraoriSocket, startAutoReconnect } from './Socket/shiraori-socket'
export type { ShiraoriSocket, ShiraoriSocketConfig, AutoReconnectOptions } from './Socket/shiraori-socket'

// ─── Types ────────────────────────────────────────────────────────────────
export type {
  ShiraoriConfig,
  CTAUrlButtonOptions,
  CallButtonOptions,
  CopyCodeButtonOptions,
  ListMessageOptions,
  ListSection,
  ListRow,
  CarouselOptions,
  CarouselCard,
  CarouselCardButton,
  InteractiveMessageOptions,
  InteractiveAction,
  QueuedMessage,
  QueueStats,
  SessionValidationResult,
} from './Types'

// ─── Utils ────────────────────────────────────────────────────────────────
export {
  // Session
  validateCredsFile,
  validateAuthFolder,
  cleanSessionFiles,
  nukeAuthFolder,
  // Queue
  MessageQueueManager,
  // Reconnect
  ReconnectManager,
  // Memory
  MemoryManager,
  BoundedMap,
  // Message builders (low-level)
  buildCTAUrlMessage,
  buildCallButtonMessage,
  buildCopyCodeMessage,
  buildListMessage,
  buildCarouselMessage,
  buildInteractiveMessage,
  // Logger
  makeShiraoriLogger,
} from './Utils'
