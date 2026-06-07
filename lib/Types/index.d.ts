import type { proto } from '@whiskeysockets/baileys';
export interface ShiraoriConfig {
    /** Enable anti bad-session protection (default: true) */
    antiBadSession?: boolean;
    /** Enable fast mode for reduced latency (default: false) */
    fastMode?: boolean;
    /** Max reconnect attempts before giving up (default: 5) */
    maxReconnectAttempts?: number;
    /** Base delay ms for exponential backoff (default: 2000) */
    reconnectBaseDelay?: number;
    /** Max delay ms for backoff cap (default: 30000) */
    reconnectMaxDelay?: number;
    /** Message queue concurrency (default: 3) */
    queueConcurrency?: number;
    /** Enable message queue system (default: true) */
    useMessageQueue?: boolean;
    /** Log level for internal logger */
    logLevel?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'silent';
}
export interface CTAUrlButtonOptions {
    /** Display text of the message body */
    body: string;
    /** Button display text */
    buttonText: string;
    /** URL to open */
    url: string;
    /** Optional footer text */
    footer?: string;
    /** Optional header text */
    header?: string;
    /** Optional thumbnail image buffer */
    thumbnail?: Buffer;
}
export interface CallButtonOptions {
    /** Display text of the message body */
    body: string;
    /** Button display text */
    buttonText: string;
    /** Phone number with country code (e.g. +628123456789) */
    phoneNumber: string;
    /** Optional footer text */
    footer?: string;
    /** Optional header text */
    header?: string;
}
export interface CopyCodeButtonOptions {
    /** Display text of the message body */
    body: string;
    /** Button display text */
    buttonText: string;
    /** The code/text to copy */
    code: string;
    /** Optional footer text */
    footer?: string;
    /** Optional header text */
    header?: string;
}
export interface ListRow {
    title: string;
    description?: string;
    rowId: string;
}
export interface ListSection {
    title?: string;
    rows: ListRow[];
}
export interface ListMessageOptions {
    title: string;
    text: string;
    footer?: string;
    buttonText: string;
    sections: ListSection[];
    /** Optional thumbnail buffer */
    thumbnail?: Buffer;
}
export interface CarouselCardButton {
    type: 'url' | 'call' | 'quickReply' | 'copyCode';
    text: string;
    url?: string;
    phoneNumber?: string;
    code?: string;
    payload?: string;
}
export interface CarouselCard {
    /** Image buffer */
    image?: Buffer;
    /** Video buffer */
    video?: Buffer;
    title: string;
    body: string;
    footer?: string;
    buttons: CarouselCardButton[];
}
export interface CarouselOptions {
    cards: CarouselCard[];
}
export type InteractiveAction = {
    type: 'ctaUrl';
    text: string;
    url: string;
} | {
    type: 'call';
    text: string;
    phoneNumber: string;
} | {
    type: 'copyCode';
    text: string;
    code: string;
} | {
    type: 'quickReply';
    text: string;
    payload: string;
};
export interface InteractiveMessageOptions {
    header?: {
        title?: string;
        subtitle?: string;
        hasMediaAttachment?: boolean;
        image?: Buffer;
        video?: Buffer;
        document?: Buffer;
        location?: {
            degreesLatitude: number;
            degreesLongitude: number;
        };
    };
    body: string;
    footer?: string;
    actions: InteractiveAction[];
    nativeFlow?: boolean;
}
export interface QueuedMessage {
    id: string;
    jid: string;
    message: proto.IWebMessageInfo;
    priority: number;
    timestamp: number;
    retryCount: number;
    resolve: (value: proto.WebMessageInfo) => void;
    reject: (reason?: Error) => void;
}
export interface QueueStats {
    pending: number;
    running: number;
    completed: number;
    failed: number;
    avgLatency: number;
}
export interface SessionValidationResult {
    valid: boolean;
    reason?: string;
    shouldCleanup?: boolean;
}
export type { AnyMessageContent, MiscMessageGenerationOptions, SocketConfig, WASocket, proto, } from '@whiskeysockets/baileys';
//# sourceMappingURL=index.d.ts.map