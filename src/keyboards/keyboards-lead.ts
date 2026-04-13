import {InlineKeyboard, Keyboard} from "grammy";

export const consentKeyboard = new InlineKeyboard()
    .text("🔘 ПРИНИМАЮ", "lead-accept")
    .text("🔘 НЕ ПРИНИМАЮ", "lead-decline");

// кнопка контакта
export const contactKeyboard = new Keyboard()
    .requestContact("📱 Поделиться контактом")
    .resized()
    .oneTime();
