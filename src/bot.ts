import {Bot} from "grammy";
import dotenv from 'dotenv';
import {getRole} from "./middleware/get-role";
import {handleBotError} from "./shared/errors/bot-errors";
import {Context} from "./shared/context.types";

dotenv.config();

const bot = new Bot<Context>(process.env.TOKEN);

bot.use(getRole)

bot.command("start", async (ctx) => {
    return ctx.reply(ctx.state.role)
});

bot.on("message", async (ctx) => {
    return ctx.reply(`message ${ctx.state.role}`)
})

bot.catch(handleBotError);

bot.start();