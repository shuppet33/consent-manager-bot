import {Bot, Context} from "grammy";
import {Conversation, conversations, createConversation} from "@grammyjs/conversations";
import dotenv from 'dotenv';
import {getRole} from "./middleware/get-role";
import {handleBotError} from "./shared/errors/bot-errors";
import {Context} from "./shared/context.types";
import {adminKeyboard, settingsManager, settingsPostKeyboard} from "./keyboards/keyboards-admin";
import {consents} from "./keyboards/keyboards-user";

import {adminCallbackQuery} from "./callbacks/add-manager";
import {addManager, qweqweqwe, registerManagerHandlers} from "./essence/manager"
import {addPost} from "./callbacks/add-post";
import {addPostConversation} from "./callbacks/add-post";

dotenv.config();

const bot = new Bot<Context>(process.env.TOKEN);


bot.use(conversations())

bot.use(getRole)

bot.use(createConversation(addManager));
bot.use(createConversation(addPostConversation));

adminCallbackQuery(bot)
addPost(bot)
registerManagerHandlers(bot);

bot.command("start", async (ctx) => {

    const param = ctx

    console.log('alenka ddd', ctx)

    if (ctx.state.role === "user") {
        return ctx.reply(`Для следующего шага, нужно принять политику конфиденциальности и согласие на обработку персональных данных 👇`, {
            reply_markup: consents
        })
    }

    if (ctx.state.role === "manager") {
        return ctx.reply("manager select ")
    }


    if (ctx.state.role === "admin") {
        return ctx.reply("Админ-панель", {
            reply_markup: adminKeyboard()
        })
    }

});

bot.command("start", async (ctx) => {
    ctx.reply("qweqwe")
})



bot.on("message", async (ctx) => {
    return ctx.reply(`message ${ctx.state.role}`)
})


bot.catch(handleBotError);

bot.start();