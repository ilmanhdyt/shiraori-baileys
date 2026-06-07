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
export { default as makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason, getContentType, downloadContentFromMessage, generateWAMessage, generateWAMessageFromContent, generateWAMessageContent, WAProto, proto, jidDecode, jidEncode, jidNormalizedUser, areJidsSameUser, isJidBroadcast, isJidGroup, isJidUser, getDevice, makeCacheableSignalKeyStore, } from '@whiskeysockets/baileys';
export { makeShiraoriSocket, startAutoReconnect } from './Socket/shiraori-socket';
export type { ShiraoriSocket, ShiraoriSocketConfig, AutoReconnectOptions } from './Socket/shiraori-socket';
export type { ShiraoriConfig, CTAUrlButtonOptions, CallButtonOptions, CopyCodeButtonOptions, ListMessageOptions, ListSection, ListRow, CarouselOptions, CarouselCard, CarouselCardButton, InteractiveMessageOptions, InteractiveAction, QueuedMessage, QueueStats, SessionValidationResult, } from './Types';
export { validateCredsFile, validateAuthFolder, cleanSessionFiles, nukeAuthFolder, MessageQueueManager, ReconnectManager, MemoryManager, BoundedMap, buildCTAUrlMessage, buildCallButtonMessage, buildCopyCodeMessage, buildListMessage, buildCarouselMessage, buildInteractiveMessage, makeShiraoriLogger, } from './Utils';
//# sourceMappingURL=index.d.ts.map