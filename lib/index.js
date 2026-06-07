"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeShiraoriLogger = exports.buildInteractiveMessage = exports.buildCarouselMessage = exports.buildListMessage = exports.buildCopyCodeMessage = exports.buildCallButtonMessage = exports.buildCTAUrlMessage = exports.BoundedMap = exports.MemoryManager = exports.ReconnectManager = exports.MessageQueueManager = exports.nukeAuthFolder = exports.cleanSessionFiles = exports.validateAuthFolder = exports.validateCredsFile = exports.startAutoReconnect = exports.makeShiraoriSocket = exports.makeCacheableSignalKeyStore = exports.getDevice = exports.isJidUser = exports.isJidGroup = exports.isJidBroadcast = exports.areJidsSameUser = exports.jidNormalizedUser = exports.jidEncode = exports.jidDecode = exports.proto = exports.WAProto = exports.generateWAMessageContent = exports.generateWAMessageFromContent = exports.generateWAMessage = exports.downloadContentFromMessage = exports.getContentType = exports.DisconnectReason = exports.fetchLatestBaileysVersion = exports.useMultiFileAuthState = exports.makeWASocket = void 0;
// ─── Core Baileys re-exports (full compatibility) ──────────────────────────
// NOTE: useSingleFileAuthState & makeInMemoryStore dihapus di Baileys v6+
// Gunakan useMultiFileAuthState sebagai pengganti useSingleFileAuthState
var baileys_1 = require("@whiskeysockets/baileys");
Object.defineProperty(exports, "makeWASocket", { enumerable: true, get: function () { return __importDefault(baileys_1).default; } });
Object.defineProperty(exports, "useMultiFileAuthState", { enumerable: true, get: function () { return baileys_1.useMultiFileAuthState; } });
Object.defineProperty(exports, "fetchLatestBaileysVersion", { enumerable: true, get: function () { return baileys_1.fetchLatestBaileysVersion; } });
Object.defineProperty(exports, "DisconnectReason", { enumerable: true, get: function () { return baileys_1.DisconnectReason; } });
Object.defineProperty(exports, "getContentType", { enumerable: true, get: function () { return baileys_1.getContentType; } });
Object.defineProperty(exports, "downloadContentFromMessage", { enumerable: true, get: function () { return baileys_1.downloadContentFromMessage; } });
Object.defineProperty(exports, "generateWAMessage", { enumerable: true, get: function () { return baileys_1.generateWAMessage; } });
Object.defineProperty(exports, "generateWAMessageFromContent", { enumerable: true, get: function () { return baileys_1.generateWAMessageFromContent; } });
Object.defineProperty(exports, "generateWAMessageContent", { enumerable: true, get: function () { return baileys_1.generateWAMessageContent; } });
Object.defineProperty(exports, "WAProto", { enumerable: true, get: function () { return baileys_1.WAProto; } });
Object.defineProperty(exports, "proto", { enumerable: true, get: function () { return baileys_1.proto; } });
Object.defineProperty(exports, "jidDecode", { enumerable: true, get: function () { return baileys_1.jidDecode; } });
Object.defineProperty(exports, "jidEncode", { enumerable: true, get: function () { return baileys_1.jidEncode; } });
Object.defineProperty(exports, "jidNormalizedUser", { enumerable: true, get: function () { return baileys_1.jidNormalizedUser; } });
Object.defineProperty(exports, "areJidsSameUser", { enumerable: true, get: function () { return baileys_1.areJidsSameUser; } });
Object.defineProperty(exports, "isJidBroadcast", { enumerable: true, get: function () { return baileys_1.isJidBroadcast; } });
Object.defineProperty(exports, "isJidGroup", { enumerable: true, get: function () { return baileys_1.isJidGroup; } });
Object.defineProperty(exports, "isJidUser", { enumerable: true, get: function () { return baileys_1.isJidUser; } });
Object.defineProperty(exports, "getDevice", { enumerable: true, get: function () { return baileys_1.getDevice; } });
Object.defineProperty(exports, "makeCacheableSignalKeyStore", { enumerable: true, get: function () { return baileys_1.makeCacheableSignalKeyStore; } });
// ─── Shiraori Socket ──────────────────────────────────────────────────────
var shiraori_socket_1 = require("./Socket/shiraori-socket");
Object.defineProperty(exports, "makeShiraoriSocket", { enumerable: true, get: function () { return shiraori_socket_1.makeShiraoriSocket; } });
Object.defineProperty(exports, "startAutoReconnect", { enumerable: true, get: function () { return shiraori_socket_1.startAutoReconnect; } });
// ─── Utils ────────────────────────────────────────────────────────────────
var Utils_1 = require("./Utils");
// Session
Object.defineProperty(exports, "validateCredsFile", { enumerable: true, get: function () { return Utils_1.validateCredsFile; } });
Object.defineProperty(exports, "validateAuthFolder", { enumerable: true, get: function () { return Utils_1.validateAuthFolder; } });
Object.defineProperty(exports, "cleanSessionFiles", { enumerable: true, get: function () { return Utils_1.cleanSessionFiles; } });
Object.defineProperty(exports, "nukeAuthFolder", { enumerable: true, get: function () { return Utils_1.nukeAuthFolder; } });
// Queue
Object.defineProperty(exports, "MessageQueueManager", { enumerable: true, get: function () { return Utils_1.MessageQueueManager; } });
// Reconnect
Object.defineProperty(exports, "ReconnectManager", { enumerable: true, get: function () { return Utils_1.ReconnectManager; } });
// Memory
Object.defineProperty(exports, "MemoryManager", { enumerable: true, get: function () { return Utils_1.MemoryManager; } });
Object.defineProperty(exports, "BoundedMap", { enumerable: true, get: function () { return Utils_1.BoundedMap; } });
// Message builders (low-level)
Object.defineProperty(exports, "buildCTAUrlMessage", { enumerable: true, get: function () { return Utils_1.buildCTAUrlMessage; } });
Object.defineProperty(exports, "buildCallButtonMessage", { enumerable: true, get: function () { return Utils_1.buildCallButtonMessage; } });
Object.defineProperty(exports, "buildCopyCodeMessage", { enumerable: true, get: function () { return Utils_1.buildCopyCodeMessage; } });
Object.defineProperty(exports, "buildListMessage", { enumerable: true, get: function () { return Utils_1.buildListMessage; } });
Object.defineProperty(exports, "buildCarouselMessage", { enumerable: true, get: function () { return Utils_1.buildCarouselMessage; } });
Object.defineProperty(exports, "buildInteractiveMessage", { enumerable: true, get: function () { return Utils_1.buildInteractiveMessage; } });
// Logger
Object.defineProperty(exports, "makeShiraoriLogger", { enumerable: true, get: function () { return Utils_1.makeShiraoriLogger; } });
//# sourceMappingURL=index.js.map