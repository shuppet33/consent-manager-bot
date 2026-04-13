import {InlineKeyboard} from "grammy";

export const confirmKeyboard = new InlineKeyboard()
    .text("Добавить менеджера", "manager-confirm-add")
    .text("Отмена добавления", "cancel");

export const cancelKeyboard = new InlineKeyboard()
    .text("❌ Отмена", "cancel");

export const deleteConfirmKeyboard = new InlineKeyboard()
    .text("Удалить", "manager-confirm-delete")
    .text("Отмена", "cancel");