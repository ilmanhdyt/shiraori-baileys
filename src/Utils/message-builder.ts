import { proto } from '@whiskeysockets/baileys'
import type {
  CTAUrlButtonOptions,
  CallButtonOptions,
  CopyCodeButtonOptions,
  ListMessageOptions,
  CarouselCard,
  CarouselOptions,
  InteractiveAction,
  InteractiveMessageOptions,
} from '../Types'

// ─────────────────────────────────────────────
// CTA URL Button Builder
// ─────────────────────────────────────────────

/**
 * Builds a modern InteractiveMessage with a CTA URL button.
 */
export function buildCTAUrlMessage(
  opts: CTAUrlButtonOptions,
): proto.IMessage {
  const nativeFlow: proto.Message.InteractiveMessage.INativeFlowMessage = {
    buttons: [
      {
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({
          display_text: opts.buttonText,
          url: opts.url,
          merchant_url: opts.url,
        }),
      },
    ],
  }

  const header = buildInteractiveHeader(opts.header, opts.thumbnail)

  return {
    interactiveMessage: {
      header,
      body: { text: opts.body },
      footer: { text: opts.footer || '' },
      nativeFlowMessage: nativeFlow,
    },
  }
}

// ─────────────────────────────────────────────
// Call Button Builder
// ─────────────────────────────────────────────

export function buildCallButtonMessage(
  opts: CallButtonOptions,
): proto.IMessage {
  const nativeFlow: proto.Message.InteractiveMessage.INativeFlowMessage = {
    buttons: [
      {
        name: 'cta_call',
        buttonParamsJson: JSON.stringify({
          display_text: opts.buttonText,
          phone_number: opts.phoneNumber,
        }),
      },
    ],
  }

  const header = buildInteractiveHeader(opts.header)

  return {
    interactiveMessage: {
      header,
      body: { text: opts.body },
      footer: { text: opts.footer || '' },
      nativeFlowMessage: nativeFlow,
    },
  }
}

// ─────────────────────────────────────────────
// Copy Code Button Builder
// ─────────────────────────────────────────────

export function buildCopyCodeMessage(
  opts: CopyCodeButtonOptions,
): proto.IMessage {
  const nativeFlow: proto.Message.InteractiveMessage.INativeFlowMessage = {
    buttons: [
      {
        name: 'cta_copy',
        buttonParamsJson: JSON.stringify({
          display_text: opts.buttonText,
          copy_code: opts.code,
        }),
      },
    ],
  }

  const header = buildInteractiveHeader(opts.header)

  return {
    interactiveMessage: {
      header,
      body: { text: opts.body },
      footer: { text: opts.footer || '' },
      nativeFlowMessage: nativeFlow,
    },
  }
}

// ─────────────────────────────────────────────
// List Message Builder
// ─────────────────────────────────────────────

export function buildListMessage(opts: ListMessageOptions): proto.IMessage {
  const sections = opts.sections.map((section) => ({
    title: section.title || '',
    rows: section.rows.map((row) => ({
      title: row.title,
      description: row.description || '',
      rowId: row.rowId,
    })),
  }))

  return {
    listMessage: {
      title: opts.title,
      description: opts.text,
      footerText: opts.footer || '',
      buttonText: opts.buttonText,
      listType: proto.Message.ListMessage.ListType.SINGLE_SELECT,
      sections,
    },
  }
}

// ─────────────────────────────────────────────
// Carousel Builder
// ─────────────────────────────────────────────

export function buildCarouselMessage(opts: CarouselOptions): proto.IMessage {
  const cards = opts.cards.map((card) => buildCarouselCard(card))

  return {
    interactiveMessage: {
      header: {
        hasMediaAttachment: false,
      },
      body: { text: '' },
      footer: { text: '' },
      carouselMessage: {
        cards,
      },
    },
  }
}

function buildCarouselCard(card: CarouselCard): proto.Message.InteractiveMessage.ICarouselCard {
  const buttons: proto.Message.InteractiveMessage.NativeFlowMessage.INativeFlowButton[] =
    card.buttons.map((btn) => {
      switch (btn.type) {
        case 'url':
          return {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: btn.text,
              url: btn.url || '',
              merchant_url: btn.url || '',
            }),
          }
        case 'call':
          return {
            name: 'cta_call',
            buttonParamsJson: JSON.stringify({
              display_text: btn.text,
              phone_number: btn.phoneNumber || '',
            }),
          }
        case 'copyCode':
          return {
            name: 'cta_copy',
            buttonParamsJson: JSON.stringify({
              display_text: btn.text,
              copy_code: btn.code || '',
            }),
          }
        case 'quickReply':
        default:
          return {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
              display_text: btn.text,
              id: btn.payload || btn.text,
            }),
          }
      }
    })

  const cardMessage: proto.Message.InteractiveMessage.ICarouselCard = {
    header: {
      hasMediaAttachment: !!card.image || !!card.video,
      imageMessage: card.image
        ? {
            jpegThumbnail: card.image,
            mimetype: 'image/jpeg',
          }
        : undefined,
      videoMessage: card.video
        ? {
            mimetype: 'video/mp4',
          }
        : undefined,
    },
    body: {
      text: `*${card.title}*\n${card.body}`,
    },
    footer: {
      text: card.footer || '',
    },
    nativeFlowMessage: {
      buttons,
    },
  }

  return cardMessage
}

// ─────────────────────────────────────────────
// Generic Interactive Message Builder
// ─────────────────────────────────────────────

export function buildInteractiveMessage(
  opts: InteractiveMessageOptions,
): proto.IMessage {
  const buttons: proto.Message.InteractiveMessage.NativeFlowMessage.INativeFlowButton[] =
    opts.actions.map((action) => {
      return buildActionButton(action)
    })

  const header = opts.header
    ? {
        title: opts.header.title || '',
        subtitle: opts.header.subtitle || '',
        hasMediaAttachment:
          !!opts.header.image || !!opts.header.video || !!opts.header.document || false,
        imageMessage: opts.header.image
          ? { jpegThumbnail: opts.header.image, mimetype: 'image/jpeg' }
          : undefined,
        videoMessage: opts.header.video ? { mimetype: 'video/mp4' } : undefined,
      }
    : { hasMediaAttachment: false }

  return {
    interactiveMessage: {
      header,
      body: { text: opts.body },
      footer: { text: opts.footer || '' },
      nativeFlowMessage: opts.nativeFlow !== false ? { buttons } : undefined,
    },
  }
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function buildInteractiveHeader(
  title?: string,
  thumbnail?: Buffer,
): proto.Message.InteractiveMessage.IHeader {
  return {
    title: title || '',
    hasMediaAttachment: !!thumbnail,
    imageMessage: thumbnail
      ? {
          jpegThumbnail: thumbnail,
          mimetype: 'image/jpeg',
        }
      : undefined,
  }
}

function buildActionButton(
  action: InteractiveAction,
): proto.Message.InteractiveMessage.NativeFlowMessage.INativeFlowButton {
  switch (action.type) {
    case 'ctaUrl':
      return {
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({
          display_text: action.text,
          url: action.url,
          merchant_url: action.url,
        }),
      }
    case 'call':
      return {
        name: 'cta_call',
        buttonParamsJson: JSON.stringify({
          display_text: action.text,
          phone_number: action.phoneNumber,
        }),
      }
    case 'copyCode':
      return {
        name: 'cta_copy',
        buttonParamsJson: JSON.stringify({
          display_text: action.text,
          copy_code: action.code,
        }),
      }
    case 'quickReply':
    default:
      return {
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
          display_text: action.text,
          id: action.payload,
        }),
      }
  }
}
