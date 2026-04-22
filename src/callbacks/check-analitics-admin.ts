import {Bot} from "grammy";
import {analyticsKeyboard} from "../keyboards/keyboards-manager";
import {Context} from "../shared/context.types";

export async function checkAnaliticsAdmin(bot: Bot<Context>) {
    bot.callbackQuery("getAnalytics", async (ctx) => {
        await ctx.answerCallbackQuery();
        await ctx.reply("Выберите период аналитики", {
            reply_markup: analyticsKeyboard
        });
    });

    bot.callbackQuery("admin-panel" , async (ctx) => {
        ctx.reply("салам")
    })

}
