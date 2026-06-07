# shiraori-baileys

> Production-ready Baileys fork with modern WhatsApp interactive features, anti bad-session protection, fast mode, and better stability.

[![npm version](https://img.shields.io/npm/v/shiraori-baileys.svg)](https://www.npmjs.com/package/shiraori-baileys)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔘 **CTA URL Button** | Modern interactive button that opens a URL |
| 📞 **Call Button** | WhatsApp call button with phone number |
| 📋 **Copy Code Button** | Button that copies text to clipboard |
| 📃 **List Message** | Native WhatsApp list with sections and rows |
| 🎠 **Image Carousel** | Multi-card carousel with images and buttons |
| 🎛 **Interactive Message** | Generic interactive message with mixed actions |
| 🛡 **Anti Bad-Session** | Auto-detects and cleans corrupted sessions |
| 🔁 **Auto Reconnect** | Exponential backoff with storm prevention |
| ⚡ **Fast Mode** | Reduced latency for high-throughput bots |
| 📬 **Message Queue** | Concurrency-controlled outgoing queue |
| 🧹 **Memory Manager** | Bounded caches + GC hints |

---

## 📦 Installation

```bash
npm install shiraori-baileys
# or
yarn add shiraori-baileys
```

---

## 🚀 Quick Start

```typescript
import { startAutoReconnect, type ShiraoriSocket } from 'shiraori-baileys'

await startAutoReconnect({
  authFolder: './auth_info',
  shiraoriConfig: {
    antiBadSession: true,
    fastMode: true,
    maxReconnectAttempts: 5,
  },
  onSocket: (sock: ShiraoriSocket) => {
    sock.ev.on('messages.upsert', async ({ messages }) => {
      // Handle messages...
    })
  },
})
```

---

## 🔧 Manual Socket Creation

```typescript
import { makeShiraoriSocket, useMultiFileAuthState } from 'shiraori-baileys'

const { state, saveCreds } = await useMultiFileAuthState('./auth_info')

const sock = makeShiraoriSocket({
  auth: state,
  authFolder: './auth_info',
  shiraori: {
    antiBadSession: true,
    fastMode: true,
    queueConcurrency: 3,
    maxReconnectAttempts: 5,
  },
})

sock.ev.on('creds.update', saveCreds)
```

---

## 📨 Helper Methods

### CTA URL Button

```typescript
await sock.sendCTAUrl(
  jid,
  'Kunjungi website kami',   // body
  'Buka Website',            // button text
  'https://example.com',     // URL
  {
    header: 'Shiraori Bot',
    footer: 'Powered by shiraori-baileys',
  }
)
```

### Call Button

```typescript
await sock.sendCallButton(
  jid,
  'Hubungi customer support',
  'Telepon Sekarang',
  '+628123456789',
  {
    header: 'Support',
    footer: 'Tersedia 24/7',
  }
)
```

### Copy Code Button

```typescript
await sock.sendCopyCode(
  jid,
  'Gunakan kode promo ini',
  'Salin Kode',
  'PROMO50',
  {
    header: 'Promo Spesial',
    footer: 'Berlaku hingga akhir bulan',
  }
)
```

### List Message

```typescript
await sock.sendList(jid, {
  title: 'Menu Bot',
  text: 'Pilih menu yang tersedia',
  footer: 'shiraori-baileys',
  buttonText: 'Lihat Menu',
  sections: [
    {
      title: 'Fitur Utama',
      rows: [
        { rowId: 'cta', title: 'CTA Button', description: 'Tombol dengan link' },
        { rowId: 'call', title: 'Call Button', description: 'Tombol telepon' },
      ],
    },
  ],
})
```

### Image Carousel

```typescript
await sock.sendCarousel(jid, {
  cards: [
    {
      title: 'Card 1',
      body: 'Deskripsi card pertama',
      footer: '1/2',
      buttons: [
        { type: 'url', text: 'Buka Link', url: 'https://example.com' },
        { type: 'quickReply', text: 'Pilih', payload: 'card_1' },
      ],
    },
    {
      title: 'Card 2',
      body: 'Deskripsi card kedua',
      footer: '2/2',
      buttons: [
        { type: 'copyCode', text: 'Salin', code: 'CODE123' },
        { type: 'call', text: 'Telepon', phoneNumber: '+628123456789' },
      ],
    },
  ],
})
```

### Interactive Message

```typescript
await sock.sendInteractive(jid, {
  header: { title: 'Pilih Aksi' },
  body: 'Apa yang ingin kamu lakukan?',
  footer: 'shiraori-baileys',
  actions: [
    { type: 'ctaUrl', text: 'GitHub', url: 'https://github.com' },
    { type: 'call', text: 'Telepon', phoneNumber: '+628123456789' },
    { type: 'copyCode', text: 'Salin Kode', code: 'ABCXYZ' },
    { type: 'quickReply', text: 'Bantuan', payload: 'help' },
  ],
})
```

---

## ⚙️ Configuration

```typescript
interface ShiraoriConfig {
  antiBadSession?: boolean      // default: true
  fastMode?: boolean            // default: false
  maxReconnectAttempts?: number // default: 5
  reconnectBaseDelay?: number   // default: 2000 (ms)
  reconnectMaxDelay?: number    // default: 30000 (ms)
  queueConcurrency?: number     // default: 3
  useMessageQueue?: boolean     // default: true
  logLevel?: string             // default: 'info'
}
```

### Fast Mode

Fast mode reduces internal timeouts and processing overhead:

```typescript
const sock = makeShiraoriSocket({
  auth: state,
  shiraori: { fastMode: true }
})
```

---

## 🛡 Anti Bad-Session

When `antiBadSession: true` (default):

1. **Before connecting** — validates `creds.json` for required fields
2. **On bad-session error** — cleans corrupted session files
3. **On logout** — stops reconnecting and calls `onLoggedOut`

```typescript
await startAutoReconnect({
  authFolder: './auth_info',
  shiraoriConfig: { antiBadSession: true },
  onLoggedOut: () => {
    console.log('Session expired — rescan QR')
    process.exit(0)
  },
  onSocket: (sock) => { ... }
})
```

---

## 📬 Message Queue

```typescript
// Use queued send (goes through internal queue)
await sock.sendMessageQueued(jid, { text: 'Hello' })

// Check queue stats
const stats = sock.getQueueStats()
console.log(`Pending: ${stats.pending}, Avg latency: ${stats.avgLatency}ms`)
```

---

## 🧹 Memory Usage

```typescript
const mem = sock.getMemoryUsage()
console.log(`Heap: ${mem.heapUsedMB} MB | RSS: ${mem.rssMB} MB`)
```

---

## 📁 Project Structure

```
shiraori-baileys/
├── src/
│   ├── index.ts                    # Main entry + all exports
│   ├── Types/
│   │   └── index.ts                # All TypeScript types
│   ├── Socket/
│   │   ├── index.ts
│   │   └── shiraori-socket.ts      # makeShiraoriSocket + startAutoReconnect
│   └── Utils/
│       ├── index.ts
│       ├── logger.ts               # Pino logger factory
│       ├── session-validator.ts    # Anti bad-session
│       ├── message-queue.ts        # PQueue-based message queue
│       ├── reconnect-manager.ts    # Exponential backoff
│       ├── memory-manager.ts       # GC + bounded cache
│       └── message-builder.ts      # Proto message builders
├── Example/
│   └── example-bot.ts
├── patches/
│   └── PATCHES.md
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔄 Backward Compatibility

All original Baileys APIs work unchanged:

```typescript
// Still works perfectly
await sock.sendMessage(jid, { text: 'Hello' })
await sock.sendMessage(jid, { image: buffer, caption: 'Photo' })
await sock.sendMessage(jid, { sticker: buffer })
```

---

## 📝 License

MIT — see [LICENSE](LICENSE)

---

## 🙏 Credits

Based on [WhiskeySockets/Baileys](https://github.com/WhiskeySockets/Baileys).
