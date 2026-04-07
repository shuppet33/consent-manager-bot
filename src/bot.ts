import {Bot} from "grammy";
import dotenv from 'dotenv';
import {counterAtom, store} from "./store";


dotenv.config();

const bot = new Bot(process.env.TOKEN);

bot.command("start", async (ctx) => {

    const count = store.get(counterAtom);

    store.set(counterAtom, count + 1);

    return ctx.reply(`${count}`);
});

bot.start();