import {Bot} from "grammy";
import dotenv from 'dotenv';
import {getRole} from "./controllers/user";
import {handleBotError} from "./errors/bot-errors";
import {Context} from "./entities/context.types";

dotenv.config();

const bot = new Bot<Context>(process.env.TOKEN);

bot.use(getRole)

bot.command("start", async (ctx) => {
    return ctx.reply(ctx.role)
});

bot.on("message", async (ctx) => {
    return ctx.reply(`message ${ctx.role}`)
})

bot.catch(handleBotError);

bot.start();