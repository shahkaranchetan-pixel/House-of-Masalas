import { SPICE_EMOJIS } from "../constants/products";

export const getSpiceEmoji = (name: string): string => {
    for (const [key, emoji] of Object.entries(SPICE_EMOJIS)) {
        if (name.toLowerCase().includes(key.toLowerCase())) return emoji;
    }
    return "🌿";
};
