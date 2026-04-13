import type {Bot} from "grammy";

export function registerLeadHandlers(bot: Bot) {

    bot.command("start", async (ctx) => {
        const startParam = ctx.match;

        if (!startParam) return;

        await ctx.conversation.enter("leadFlow");
    });

}