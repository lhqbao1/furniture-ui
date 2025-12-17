// store/whatsapp.ts
import { atomWithStorage } from "jotai/utils";

export const whatsappBubbleVisibleAtom = atomWithStorage<boolean>(
  "whatsapp-bubble-visible",
  true, // mặc định: HIỆN bubble
);
