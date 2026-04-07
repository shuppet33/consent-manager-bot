import {InlineKeyboard, Keyboard} from "grammy";

export const consents = new InlineKeyboard()
    .text("ПРИНИМАЮ","acceptConsents")
    .text("НЕ ПРИНИМАЮ","dontAcceptConsents")


export const getNumberPhone = new Keyboard()
    .requestContact("Поделиться контактом")
    .success()
    .resized()
    .oneTime();
