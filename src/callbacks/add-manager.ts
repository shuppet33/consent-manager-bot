import {Bot} from "grammy";
import {settingsManager} from "../keyboards/keyboards-admin";
import {addManager} from "../essence/manager";

export const adminCallbackQuery = (bot: Bot) => {
    bot.callbackQuery("getAccessList", async (ctx) => {
        ctx.reply("Панель работы менеджеров",{
            reply_markup: settingsManager()
        })
    })

    bot.hears(/Добавить менеджера/, async (ctx) => {
        await ctx.conversation.enter("addManager")
    })

}
