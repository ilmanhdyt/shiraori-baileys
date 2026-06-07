import { type WASocket, type SocketConfig, type AnyMessageContent, type MiscMessageGenerationOptions } from '@whiskeysockets/baileys';
import type { ShiraoriConfig, CTAUrlButtonOptions, CallButtonOptions, CopyCodeButtonOptions, ListMessageOptions, CarouselOptions, InteractiveMessageOptions } from '../Types';
import { MessageQueueManager } from '../Utils/message-queue';
import { MemoryManager } from '../Utils/memory-manager';
export interface ShiraoriSocket extends WASocket {
    sendCTAUrl(jid: string, body: string, buttonText: string, url: string, opts?: Partial<CTAUrlButtonOptions>): Promise<void>;
    sendCallButton(jid: string, body: string, buttonText: string, phoneNumber: string, opts?: Partial<CallButtonOptions>): Promise<void>;
    sendCopyCode(jid: string, body: string, buttonText: string, code: string, opts?: Partial<CopyCodeButtonOptions>): Promise<void>;
    sendList(jid: string, opts: ListMessageOptions): Promise<void>;
    sendCarousel(jid: string, opts: CarouselOptions): Promise<void>;
    sendInteractive(jid: string, opts: InteractiveMessageOptions): Promise<void>;
    sendMessageQueued(jid: string, content: AnyMessageContent, opts?: MiscMessageGenerationOptions): Promise<void>;
    getQueueStats(): ReturnType<MessageQueueManager['getStats']>;
    getMemoryUsage(): ReturnType<MemoryManager['getMemoryUsage']>;
}
export interface ShiraoriSocketConfig extends Partial<SocketConfig> {
    shiraori?: ShiraoriConfig;
    /** Path to auth state folder (used for anti-bad-session validation) */
    authFolder?: string;
}
/**
 * Creates a Shiraori-enhanced WASocket.
 *
 * Drop-in replacement for makeWASocket with additional helper methods,
 * anti bad-session protection, fast mode, and better reconnect logic.
 */
export declare function makeShiraoriSocket(config: ShiraoriSocketConfig): ShiraoriSocket;
export interface AutoReconnectOptions {
    authFolder: string;
    shiraoriConfig?: ShiraoriConfig;
    socketConfig?: Partial<SocketConfig>;
    /** Called every time a new socket is created */
    onSocket: (sock: ShiraoriSocket) => void;
    /** Called on clean disconnection (logged out) */
    onLoggedOut?: () => void;
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
export declare function startAutoReconnect(opts: AutoReconnectOptions): Promise<void>;
//# sourceMappingURL=shiraori-socket.d.ts.map