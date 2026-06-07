/**
 * Simple manual example — makeShiraoriSocket without auto-reconnect
 */

import {
  makeShiraoriSocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
} from '../src'
import { Boom } from '@hapi/boom'

async function startBot() {
  const { version } = await fetchLatestBaileysVersion()
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info_manual')

  const sock = makeShiraoriSocket({
    version,
    auth: state,
    authFolder: './auth_info_manual',
    shiraori: {
      antiBadSession: true,
      fastMode: false,
      queueConcurrency: 2,
      logLevel: 'info',
    },
    printQRInTerminal: true,
  })

  sock.ev.on('creds.update', saveCreds)

  // Manual reconnect handler
  sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut

      if (shouldReconnect) {
        console.log('[bot] Reconnecting...')
        setTimeout(() => startBot(), 3000)
      } else {
        console.log('[bot] Logged out. Exiting.')
        process.exit(0)
      }
    }

    if (connection === 'open') {
      console.log('[bot] Connected!')
    }
  })

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return

    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue

      const jid = msg.key.remoteJid!
      const text = msg.message.conversation || ''

      if (text === 'ping') {
        // Check queue stats before sending
        const stats = sock.getQueueStats()
        console.log('Queue stats:', stats)

        await sock.sendCTAUrl(
          jid,
          'Pong! Bot is running 🚀',
          'View Source',
          'https://github.com/shiraori-baileys',
        )
      }
    }
  })
}

startBot().catch(console.error)
