import { proto } from '@whiskeysockets/baileys';
import type { CTAUrlButtonOptions, CallButtonOptions, CopyCodeButtonOptions, ListMessageOptions, CarouselOptions, InteractiveMessageOptions } from '../Types';
/**
 * Builds a modern InteractiveMessage with a CTA URL button.
 */
export declare function buildCTAUrlMessage(opts: CTAUrlButtonOptions): proto.IMessage;
export declare function buildCallButtonMessage(opts: CallButtonOptions): proto.IMessage;
export declare function buildCopyCodeMessage(opts: CopyCodeButtonOptions): proto.IMessage;
export declare function buildListMessage(opts: ListMessageOptions): proto.IMessage;
export declare function buildCarouselMessage(opts: CarouselOptions): proto.IMessage;
export declare function buildInteractiveMessage(opts: InteractiveMessageOptions): proto.IMessage;
//# sourceMappingURL=message-builder.d.ts.map