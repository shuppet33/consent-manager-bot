import {InlineKeyboard, Keyboard} from "grammy";

export function adminKeyboard() {
    return new InlineKeyboard()
        .text("Создать пост", "addPost")
        .text("Права доступа", "getAccessList")
        .text("Аналитика","getAnalytics")
}
export function settingsPostKeyboard() {
    return new Keyboard()
        .text("Добавить кнопку-редирект")
        .text("Прикрепить PDF")
        .text("Опубликовать")
}

export function settingsManager() {
    return new InlineKeyboard()
        .text("Добавить","addManager")
        .text("Удалить","deleteManager")
        .text("Админ панель","admin-panel")
}


