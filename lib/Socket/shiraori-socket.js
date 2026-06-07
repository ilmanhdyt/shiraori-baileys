"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeShiraoriSocket = makeShiraoriSocket;
exports.startAutoReconnect = startAutoReconnect;
const baileys_1 = __importStar(require("@whiskeysockets/baileys"));
const message_builder_1 = require("../Utils/message-builder");
const message_queue_1 = require("../Utils/message-queue");
const reconnect_manager_1 = require("../Utils/reconnect-manager");
const memory_manager_1 = require("../Utils/memory-manager");
const session_validator_1 = require("../Utils/session-validator");
const logger_1 = require("../Utils/logger");
/**
 * Creates a Shiraori-enhanced WASocket.
 *
 * Drop-in replacement for makeWASocket with additional helper methods,
 * anti bad-session protection, fast mode, and better reconnect logic.
 */
function makeShiraoriSocket(config) {
    const shiraoriCfg = {
        antiBadSession: config.shiraori?.antiBadSession ?? true,
        fastMode: config.shiraori?.fastMode ?? false,
        maxReconnectAttempts: config.shiraori?.maxReconnectAttempts ?? 5,
        reconnectBaseDelay: config.shiraori?.reconnectBaseDelay ?? 2000,
        reconnectMaxDelay: config.shiraori?.reconnectMaxDelay ?? 30000,
        queueConcurrency: config.shiraori?.queueConcurrency ?? 3,
        useMessageQueue: config.shiraori?.useMessageQueue ?? true,
        logLevel: config.shiraori?.logLevel ?? 'info',
    };
    const logger = config.logger ?? (0, logger_1.makeShiraoriLogger)(shiraoriCfg.logLevel);
    // ── Anti Bad-Session: validate before connecting ──────────────────────
    if (shiraoriCfg.antiBadSession && config.authFolder) {
        const validation = (0, session_validator_1.validateAuthFolder)(config.authFolder);
        if (!validation.valid) {
            logger.warn({ reason: validation.reason, shouldCleanup: validation.shouldCleanup }, '[shiraori] Anti bad-session: session validation failed');
            if (validation.shouldCleanup) {
                logger.warn('[shiraori] Cleaning up corrupted session files...');
                (0, session_validator_1.cleanSessionFiles)(config.authFolder, true);
                logger.info('[shiraori] Session files cleaned. Will re-pair on next start.');
            }
        }
    }
    // ── Build optimized socket config ────────────────────────────────────
    const socketConfig = {
        ...config,
        logger,
        // Fast mode: reduce internal timeouts
        ...(shiraoriCfg.fastMode
            ? {
                connectTimeoutMs: 30000,
                defaultQueryTimeoutMs: 30000,
                keepAliveIntervalMs: 15000,
                retryRequestDelayMs: 250,
                maxMsgRetryCount: 3,
            }
            : {
                connectTimeoutMs: 60000,
                defaultQueryTimeoutMs: 60000,
                keepAliveIntervalMs: 30000,
                retryRequestDelayMs: 500,
                maxMsgRetryCount: 5,
            }),
        // Always use bounded retry cache to prevent memory leak
        msgRetryCounterCache: new (require('node-cache'))({ stdTTL: 300, maxKeys: 500 }),
        // Suppress link previews for speed
        generateHighQualityLinkPreview: false,
    };
    // ── Create base socket ────────────────────────────────────────────────
    const sock = (0, baileys_1.default)(socketConfig);
    // ── Initialize managers ───────────────────────────────────────────────
    const queueMgr = new message_queue_1.MessageQueueManager(shiraoriCfg.queueConcurrency);
    const memMgr = new memory_manager_1.MemoryManager(shiraoriCfg.fastMode ? 30000 : 60000);
    memMgr.start();
    const reconnectMgr = new reconnect_manager_1.ReconnectManager({
        maxAttempts: shiraoriCfg.maxReconnectAttempts,
        baseDelay: shiraoriCfg.reconnectBaseDelay,
        maxDelay: shiraoriCfg.reconnectMaxDelay,
        jitter: true,
    }, logger);
    // ─────────────────────────────────────────────
    // Core helper: relay an IMessage as a chat update
    // ─────────────────────────────────────────────
    async function sendProtoMessage(jid, message, quotedMsg) {
        const task = async () => {
            await sock.sendMessage(jid, message, {
                quoted: quotedMsg,
            });
        };
        if (shiraoriCfg.useMessageQueue) {
            await queueMgr.enqueueWithRetry(task, 2, 300, 0);
        }
        else {
            await task();
        }
    }
    // ─────────────────────────────────────────────
    // Shiraori Extended Methods
    // ─────────────────────────────────────────────
    async function sendCTAUrl(jid, body, buttonText, url, opts) {
        const msg = (0, message_builder_1.buildCTAUrlMessage)({ body, buttonText, url, ...opts });
        await sendProtoMessage(jid, msg);
    }
    async function sendCallButton(jid, body, buttonText, phoneNumber, opts) {
        const msg = (0, message_builder_1.buildCallButtonMessage)({ body, buttonText, phoneNumber, ...opts });
        await sendProtoMessage(jid, msg);
    }
    async function sendCopyCode(jid, body, buttonText, code, opts) {
        const msg = (0, message_builder_1.buildCopyCodeMessage)({ body, buttonText, code, ...opts });
        await sendProtoMessage(jid, msg);
    }
    async function sendList(jid, opts) {
        const msg = (0, message_builder_1.buildListMessage)(opts);
        await sendProtoMessage(jid, msg);
    }
    async function sendCarousel(jid, opts) {
        const msg = (0, message_builder_1.buildCarouselMessage)(opts);
        await sendProtoMessage(jid, msg);
    }
    async function sendInteractive(jid, opts) {
        const msg = (0, message_builder_1.buildInteractiveMessage)(opts);
        await sendProtoMessage(jid, msg);
    }
    async function sendMessageQueued(jid, content, opts) {
        const task = () => sock.sendMessage(jid, content, opts);
        if (shiraoriCfg.useMessageQueue) {
            await queueMgr.enqueueWithRetry(task, 2, 300, 0);
        }
        else {
            await task();
        }
    }
    function getQueueStats() {
        return queueMgr.getStats();
    }
    function getMemoryUsage() {
        return memMgr.getMemoryUsage();
    }
    // ─────────────────────────────────────────────
    // Expose reconnectMgr on sock for external use
    // ─────────────────────────────────────────────
    ;
    sock._shiraori = {
        queueMgr,
        memMgr,
        reconnectMgr,
        config: shiraoriCfg,
    };
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
    });
    return extended;
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
async function startAutoReconnect(opts) {
    const shiraoriCfg = {
        antiBadSession: opts.shiraoriConfig?.antiBadSession ?? true,
        fastMode: opts.shiraoriConfig?.fastMode ?? false,
        maxReconnectAttempts: opts.shiraoriConfig?.maxReconnectAttempts ?? 5,
        reconnectBaseDelay: opts.shiraoriConfig?.reconnectBaseDelay ?? 2000,
        reconnectMaxDelay: opts.shiraoriConfig?.reconnectMaxDelay ?? 30000,
        queueConcurrency: opts.shiraoriConfig?.queueConcurrency ?? 3,
        useMessageQueue: opts.shiraoriConfig?.useMessageQueue ?? true,
        logLevel: opts.shiraoriConfig?.logLevel ?? 'info',
    };
    const logger = (0, logger_1.makeShiraoriLogger)(shiraoriCfg.logLevel);
    const reconnectMgr = new reconnect_manager_1.ReconnectManager({
        maxAttempts: shiraoriCfg.maxReconnectAttempts,
        baseDelay: shiraoriCfg.reconnectBaseDelay,
        maxDelay: shiraoriCfg.reconnectMaxDelay,
        jitter: true,
    }, logger);
    async function connect() {
        const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)(opts.authFolder);
        const sock = makeShiraoriSocket({
            ...opts.socketConfig,
            auth: state,
            authFolder: opts.authFolder,
            shiraori: opts.shiraoriConfig,
            logger,
        });
        sock.ev.on('creds.update', saveCreds);
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            if (qr) {
                logger.info('[shiraori] QR code received — scan with WhatsApp');
            }
            if (connection === 'open') {
                logger.info('[shiraori] Connected successfully');
                reconnectMgr.reset();
            }
            if (connection === 'close') {
                const boom = lastDisconnect?.error;
                const statusCode = boom?.output?.statusCode;
                logger.warn({ statusCode, error: boom?.message }, '[shiraori] Connection closed');
                const { reconnect, reason, isBadSession } = reconnectMgr.shouldReconnect({
                    error: {
                        message: boom?.message,
                        output: { statusCode },
                    },
                });
                if (isBadSession) {
                    logger.error('[shiraori] Bad session detected — cleaning up and re-pairing');
                    if (shiraoriCfg.antiBadSession) {
                        (0, session_validator_1.cleanSessionFiles)(opts.authFolder, false);
                    }
                    opts.onLoggedOut?.();
                    return;
                }
                if (statusCode === baileys_1.DisconnectReason.loggedOut) {
                    logger.warn('[shiraori] Logged out — not reconnecting');
                    opts.onLoggedOut?.();
                    return;
                }
                if (reconnect) {
                    await reconnectMgr.backoff();
                    logger.info('[shiraori] Reconnecting...');
                    await connect();
                }
                else {
                    logger.error({ reason }, '[shiraori] Will not reconnect');
                    opts.onLoggedOut?.();
                }
            }
        });
        opts.onSocket(sock);
    }
    await connect();
}
//# sourceMappingURL=shiraori-socket.js.map