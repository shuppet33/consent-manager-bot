import { Bot } from "grammy";

export const addPost = (bot: Bot) => {
    bot.callbackQuery("addPost", async (ctx) => {
        await ctx.reply("Отправьте текст поста");
        await ctx.answerCallbackQuery(); // чтобы убрать "часики" на кнопке
    });
    bot.on("message", async (ctx) => {
        ctx.reply("qweqwe")
    })
};
