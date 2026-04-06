import { Bot } from "grammy";

const bot = new Bot("8791410328:AAH7ysPw0JYgGeV-DQOY3i8RECixMM4peG8");

bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));

bot.on("message", (ctx) => ctx.reply("Got another message!"));

bot.start();