import {Bot} from "grammy";
import {conversations, createConversation} from "@grammyjs/conversations";
import dotenv from 'dotenv';
import {getRole} from "./middleware/get-role";
import {handleBotError} from "./shared/errors/bot-errors";
import {Context} from "./shared/context.types";
import {adminKeyboard} from "./keyboards/keyboards-admin";
import {consents} from "./keyboards/keyboards-user";

import {adminCallbackQuery} from "./callbacks/add-manager";
import {registerManagerHandlers} from "./features/manager/manager.handlers"
import {addManager} from "./features/manager/manager.service"
import {addPost, addPostConversation} from "./callbacks/add-post";

dotenv.config();

const bot = new Bot<Context>(process.env.TOKEN);


bot.use(conversations())

bot.use(getRole)

bot.use(createConversation(addManager));
bot.use(createConversation(addPostConversation));

adminCallbackQuery(bot)
addPost(bot)
registerManagerHandlers(bot);

bot.command("start", async (ctx: Context) => {

    if (ctx.state.role === "user") {
        return ctx.reply(`Для следующего шага, нужно принять политику конфиденциальности и согласие на обработку персональных данных 👇`, {
            reply_markup: consents
        })
    }

    if (ctx.state.role === "manager") {
        return ctx.reply("manager select")
    }


    if (ctx.state.role === "admin") {
        return ctx.reply("Админ-панель", {
            reply_markup: adminKeyboard()
        })
    }

});

bot.on("message", async (ctx: Context) => {
    return ctx.reply(`message ${ctx.state.role}`)
})


bot.catch(handleBotError);

bot.start();