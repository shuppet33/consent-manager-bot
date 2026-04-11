import {Conversation} from "@grammyjs/conversations";
import {Context} from "../shared/context.types";
import {Bot, Keyboard} from "grammy";

const confirmKeyboard = new Keyboard()
    .text("Добавить менеджера")
    .text("Отмена добавления")
    .resized();

export async function addManager(conversation: Conversation, ctx: Context) {
    await ctx.reply("Пришлите айди менеджера");

    const { message: idMsg } = await conversation.waitFor("message:text");

    await ctx.reply("Как зовут менеджера?");

    const { message: nameMsg } = await conversation.waitFor("message:text");

    await ctx.reply(
        `Данные нового менеджера:\nайди - ${idMsg.text}\nИмя - ${nameMsg.text}`,
        { reply_markup: confirmKeyboard }
    );

    const { message: confirmMsg } = await conversation.waitFor("message:text");

    if (confirmMsg.text === "Добавить менеджера") {
        await ctx.reply("Менеджер добавлен (ну допустим)");

    } else {
        await ctx.reply("Отменено. Мир спасён от ещё одного менеджера.");
    }

    await ctx.conversation.exit();
}


