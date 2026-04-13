import {Bot} from "grammy";
import {settingsManager} from "../keyboards/keyboards-admin";
import {db} from "../db/connect";
import {Context} from "../shared/context.types";

export const adminCallbackQuery = (bot: Bot<Context>) => {
    bot.callbackQuery("getAccessList", async (ctx) => {
        const res = await db.query(
            `SELECT telegram_id, first_name
             FROM users
             WHERE role = 'manager'`
        );

        if (res.rows.length === 0) {
            return ctx.reply("Менеджеров пока нет", {
                reply_markup: settingsManager()
            });
        }

        const managersList = res.rows
            .map((user, i) => {
                return `🔹 ${i + 1}. ${user.first_name}
   └ id: ${user.telegram_id}`;
            })
            .join("\n\n");

        await ctx.reply(
            `📋 <b>Панель менеджеров</b>\n\n${managersList}`,
            {
                parse_mode: "HTML",
                reply_markup: settingsManager()
            }
        );
    });

    bot.callbackQuery("addManager", async (ctx) => {
        await ctx.answerCallbackQuery();
        await ctx.conversation.enter("addManager");
    })
    // bot.hears(/Добавить/, async (ctx) => {
    //     await ctx.conversation.enter("addManager")
    // })

}
