import {Bot, Context} from "grammy";
import {conversations, createConversation} from "@grammyjs/conversations";
import dotenv from 'dotenv';
import {getRole} from "./middleware/get-role";
import {handleBotError} from "./shared/errors/bot-errors";
import {adminKeyboard} from "./keyboards/keyboards-admin";
import {consentKeyboard} from "./keyboards/keyboards-lead";

import {adminCallbackQuery} from "./callbacks/add-manager";
import {registerManagerHandlers} from "./features/manager/manager.handlers"
import {addManager, deleteManager} from "./features/manager/manager.service"
import {addPost, addPostConversation} from "./callbacks/add-post";
import {registerLeadHandlers} from "./features/lead/lead.handlers";
import {leadFlow} from "./features/lead/lead.service";
import {analyticsKeyboard} from "./keyboards/keyboards-manager";
import {managerAnalitics, specificDateAnalyticsConversation} from "./callbacks/analytics-callbacks";
import {checkAnaliticsAdmin} from "./callbacks/check-analitics-admin";

dotenv.config();

const bot = new Bot<Context>(process.env.TOKEN);


bot.use(conversations())

bot.use(getRole)

bot.use(createConversation(addManager));
bot.use(createConversation(deleteManager));
bot.use(createConversation(leadFlow))
bot.use(createConversation(addPostConversation));
bot.use(createConversation(managerAnalitics))
bot.use(createConversation(specificDateAnalyticsConversation))

adminCallbackQuery(bot)
addPost(bot)
registerManagerHandlers(bot);
managerAnalitics(bot)
checkAnaliticsAdmin(bot)


bot.command("start", async (ctx: Context) => {
    const param = ctx.match


    if (ctx.state.role === "user") {
        if (!param) return;
        console.log('match 2', param)

        await ctx.conversation.enter("leadFlow", {
            startParam: param,
        });
    }
    if (ctx.state.role === "manager") {
        ctx.reply("Меню менеджера",{
            reply_markup: analyticsKeyboard,

        })
    }
    if (ctx.state.role === "admin") {
        return ctx.reply(`Админ-панель`, {
            reply_markup: adminKeyboard()
        })
    }

});


// bot.on("message", async (ctx: Context) => {
//     // return ctx.reply(`message ${ctx.state.role}`)
//     console.log(ctx.message)
// })

bot.on("message", async (ctx) => {
    const msg = ctx.message;

    await ctx.reply(
        msg.text,
        {
            entities: msg.entities
        }
    );
});


bot.catch(handleBotError);

bot.start();



