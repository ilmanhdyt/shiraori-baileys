/**
 * baileys-augment.d.ts
 *
 * Module augmentation untuk menambah tipe yang hilang dari @whiskeysockets/baileys.
 *
 * ICarouselCard tidak diekspor di semua versi Baileys, tapi strukturnya
 * tetap valid di proto binary. File ini mendeklarasikannya secara eksplisit
 * supaya message-builder.ts bisa pakai tipe yang proper tanpa mengubah
 * logika carousel sama sekali.
 */

import { proto } from '@whiskeysockets/baileys'

declare module '@whiskeysockets/baileys' {
  namespace proto.Message.InteractiveMessage {
    /**
     * Satu card dalam carousel message.
     * Struktur ini sesuai dengan proto WhatsApp — hanya deklarasinya
     * yang tidak diekspor publik oleh Baileys.
     */
    interface ICarouselCard {
      header?: {
        hasMediaAttachment?: boolean | null
        title?: string | null
        subtitle?: string | null
        imageMessage?: {
          url?: string | null
          mimetype?: string | null
          caption?: string | null
          jpegThumbnail?: Uint8Array | null
          fileLength?: number | Long | null
        } | null
        videoMessage?: {
          url?: string | null
          mimetype?: string | null
          caption?: string | null
          fileLength?: number | Long | null
        } | null
        documentMessage?: {
          url?: string | null
          mimetype?: string | null
          title?: string | null
          fileLength?: number | Long | null
        } | null
        locationMessage?: {
          degreesLatitude?: number | null
          degreesLongitude?: number | null
          name?: string | null
        } | null
      } | null
      body?: {
        text?: string | null
      } | null
      footer?: {
        text?: string | null
      } | null
      nativeFlowMessage?: {
        buttons?: Array<{
          name?: string | null
          buttonParamsJson?: string | null
        }> | null
        messageVersion?: number | null
      } | null
    }
  }
}
