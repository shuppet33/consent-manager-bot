import {Bot} from "grammy";
import {adminKeyboard} from "../../keyboards/keyboards-admin";
import {callbackify} from "node:util";

export function registerManagerHandlers(bot: Bot) {
    bot.callbackQuery("admin-panel", async (ctx) => {
        await ctx.answerCallbackQuery();

        await ctx.editMessageText("Админ-панель", {
            reply_markup: adminKeyboard()
        });
    });

    bot.callbackQuery("manager-delete", async (ctx) => {
        await ctx.answerCallbackQuery();
        await ctx.conversation.enter("deleteManager");
    });

}