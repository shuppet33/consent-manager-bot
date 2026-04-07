import {Bot} from "grammy";
import dotenv from 'dotenv';
import {getRole} from "./middleware/get-role";
import {handleBotError} from "./shared/errors/bot-errors";
import {Context} from "./shared/context.types";
import {adminKeyboard, settingsManager, settingsPostKeyboard} from "./keyboards/keyboards-admin";
import {consents} from "./keyboards/keyboards-user";

dotenv.config();

const bot = new Bot<Context>(process.env.TOKEN);

bot.use(getRole)


bot.callbackQuery("addPost", async (ctx) => {
    ctx.reply("qweqw", {
        reply_markup: settingsPostKeyboard(),
    })
});

bot.callbackQuery("getAccessList", async (ctx) => {
    ctx.reply("менеджеры", {
        reply_markup: settingsManager(),
    })
})


bot.command("start", async (ctx) => {

    if (ctx.state.role === "user") {
        return ctx.reply(`Для следующего шага, нужно принять политику конфиденциальности и согласие на обработку персональных данных 👇`, {
            reply_markup: consents
        })
    }

    if (ctx.state.role === "manager") {
        return ctx.reply("")
    }


    if (ctx.state.role === "admin") {
        return ctx.reply("Админ-панель", {
            reply_markup: adminKeyboard()
        })
    }


});


bot.hears(/Добавить менеджера/, async (ctx) => {
    return ctx.reply("кнопка сработала")
})

bot.on("message", async (ctx) => {
    return ctx.reply(`message ${ctx.state.role}`)
})


bot.catch(handleBotError);

bot.start();