/**
 * shiraori-baileys - Example Bot
 *
 * Demonstrates all new features:
 * - CTA URL Button
 * - Call Button
 * - Copy Code Button
 * - List Message
 * - Carousel
 * - Interactive Message
 * - Auto Reconnect
 * - Message Queue
 * - Memory Usage
 */

import {
  startAutoReconnect,
  type ShiraoriSocket,
} from '../src'

const AUTH_FOLDER = './auth_info_example'

async function main() {
  await startAutoReconnect({
    authFolder: AUTH_FOLDER,
    shiraoriConfig: {
      antiBadSession: true,
      fastMode: true,
      maxReconnectAttempts: 5,
      reconnectBaseDelay: 2000,
      reconnectMaxDelay: 30000,
      queueConcurrency: 3,
      useMessageQueue: true,
      logLevel: 'info',
    },
    onSocket: (sock: ShiraoriSocket) => {
      // ── Messages handler ────────────────────────────────────────
      sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return

        for (const msg of messages) {
          if (!msg.message || msg.key.fromMe) continue

          const jid = msg.key.remoteJid!
          const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            ''

          // ── CTA URL Button ────────────────────────────────────
          if (text === '.cta') {
            await sock.sendCTAUrl(
              jid,
              'Kunjungi website kami!',
              'Buka Website',
              'https://github.com/shiraori-baileys',
              {
                header: 'Shiraori-Baileys',
                footer: 'Powered by Shiraori',
              },
            )
          }

          // ── Call Button ───────────────────────────────────────
          if (text === '.call') {
            await sock.sendCallButton(
              jid,
              'Hubungi kami langsung',
              'Telepon Sekarang',
              '+628123456789',
              {
                header: 'Customer Support',
                footer: 'Tersedia 24 jam',
              },
            )
          }

          // ── Copy Code Button ──────────────────────────────────
          if (text === '.code') {
            await sock.sendCopyCode(
              jid,
              'Gunakan kode promo ini untuk diskon 50%',
              'Salin Kode',
              'SHIRAORI50',
              {
                header: 'Promo Spesial',
                footer: 'Berlaku hingga akhir bulan',
              },
            )
          }

          // ── List Message ──────────────────────────────────────
          if (text === '.list') {
            await sock.sendList(jid, {
              title: 'Menu Bot',
              text: 'Pilih menu yang tersedia:',
              footer: 'Shiraori-Baileys v1.0',
              buttonText: 'Lihat Menu',
              sections: [
                {
                  title: '📱 Fitur Utama',
                  rows: [
                    { rowId: 'cta', title: 'CTA URL Button', description: 'Kirim button dengan link' },
                    { rowId: 'call', title: 'Call Button', description: 'Tombol untuk telepon' },
                    { rowId: 'code', title: 'Copy Code', description: 'Tombol salin kode' },
                  ],
                },
                {
                  title: '🎠 Fitur Lanjutan',
                  rows: [
                    { rowId: 'carousel', title: 'Carousel', description: 'Slide card interaktif' },
                    { rowId: 'interactive', title: 'Interactive', description: 'Pesan interaktif' },
                  ],
                },
              ],
            })
          }

          // ── Carousel ──────────────────────────────────────────
          if (text === '.carousel') {
            await sock.sendCarousel(jid, {
              cards: [
                {
                  title: 'Fitur Pertama',
                  body: 'CTA URL, Call Button, Copy Code dalam satu paket',
                  footer: 'Card 1/3',
                  buttons: [
                    { type: 'url', text: 'Lihat Docs', url: 'https://github.com/shiraori-baileys' },
                    { type: 'quickReply', text: 'Info Lebih', payload: 'info_1' },
                  ],
                },
                {
                  title: 'Fitur Kedua',
                  body: 'Anti bad-session + auto reconnect dengan exponential backoff',
                  footer: 'Card 2/3',
                  buttons: [
                    { type: 'url', text: 'GitHub', url: 'https://github.com' },
                    { type: 'quickReply', text: 'Install', payload: 'install_pkg' },
                  ],
                },
                {
                  title: 'Fitur Ketiga',
                  body: 'Message queue system dengan concurrency control',
                  footer: 'Card 3/3',
                  buttons: [
                    { type: 'quickReply', text: 'Get Started', payload: 'get_started' },
                    { type: 'copyCode', text: 'Salin NPM', code: 'npm i shiraori-baileys' },
                  ],
                },
              ],
            })
          }

          // ── Interactive Message ───────────────────────────────
          if (text === '.interactive') {
            await sock.sendInteractive(jid, {
              header: { title: 'Shiraori-Baileys', subtitle: 'Modern WhatsApp Bot Library' },
              body: 'Pilih aksi yang ingin kamu lakukan:',
              footer: 'v1.0.0',
              actions: [
                { type: 'ctaUrl', text: 'Buka GitHub', url: 'https://github.com' },
                { type: 'call', text: 'Telepon Kami', phoneNumber: '+628123456789' },
                { type: 'copyCode', text: 'Salin Kode', code: 'SHIRAORI123' },
                { type: 'quickReply', text: 'Bantuan', payload: 'help' },
              ],
            })
          }

          // ── Stats ─────────────────────────────────────────────
          if (text === '.stats') {
            const queue = sock.getQueueStats()
            const mem = sock.getMemoryUsage()
            await sock.sendMessage(jid, {
              text:
                `*📊 Bot Stats*\n\n` +
                `*Queue:*\n` +
                `• Pending: ${queue.pending}\n` +
                `• Running: ${queue.running}\n` +
                `• Completed: ${queue.completed}\n` +
                `• Failed: ${queue.failed}\n` +
                `• Avg Latency: ${queue.avgLatency.toFixed(0)}ms\n\n` +
                `*Memory:*\n` +
                `• Heap Used: ${mem.heapUsedMB} MB\n` +
                `• RSS: ${mem.rssMB} MB`,
            })
          }

          // ── Help ──────────────────────────────────────────────
          if (text === '.help' || text === '.menu') {
            await sock.sendMessage(jid, {
              text:
                `*🌸 Shiraori-Baileys Example Bot*\n\n` +
                `*.cta* — CTA URL Button\n` +
                `*.call* — Call Button\n` +
                `*.code* — Copy Code Button\n` +
                `*.list* — List Message\n` +
                `*.carousel* — Image Carousel\n` +
                `*.interactive* — Interactive Message\n` +
                `*.stats* — Queue & Memory Stats\n`,
            })
          }
        }
      })

      console.log('[shiraori] Bot started. Send .help to get started.')
    },

    onLoggedOut: () => {
      console.log('[shiraori] Logged out. Please restart and scan QR.')
      process.exit(0)
    },
  })
}

main().catch(console.error)
