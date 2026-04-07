import {Bot} from "grammy";
import dotenv from 'dotenv';
import {getRole} from "./controllers/user";
import {handleBotError} from "./errors/bot-errors";

dotenv.config();

const bot = new Bot(process.env.TOKEN);

bot.command("start", async (ctx) => {

    const userId = ctx.update.message?.from.id
    const role = await getRole(userId)

    return ctx.reply(`${role}`);
});

bot.catch(handleBotError);

bot.start();