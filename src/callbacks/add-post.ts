import { Conversation } from "@grammyjs/conversations";
import {Context, InlineKeyboard, InputFile, Keyboard} from "grammy";
import {adminKeyboard, settingsManager} from "../keyboards/keyboards-admin";
import {customAlphabet} from "nanoid";

const nanoid = customAlphabet(
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    16 // длина
);

const controlKeyboard = new InlineKeyboard()
    .text("Отправить", "submit")
    .text("Отмена", "cancel");

const yesOrNoKeyboard = new InlineKeyboard()
    .text("Да", "yes")
    .text("Нет", "no");

const canselKeyboard = new InlineKeyboard()
    .text("Отмена","cancel")

const speekQuestion = new Keyboard()
    .text("пропустить")


function canselPost(ctx: Context) {
    ctx.callbackQuery("cancel", async (ctx) => {
        await ctx.conversation.exit("addPostConversation");
    });
}

export const addPost = (ctx:Context) => {
    ctx.callbackQuery("addPost", async (ctx) => {;
        await ctx.answerCallbackQuery();
        await ctx.conversation.enter("addPostConversation");
    })
}

async function waitWithCancel(conversation: Conversation, ctx: Context) {
    const res = await conversation.waitFor([
        "message:text",
        "callback_query:data",
    ]);

    if (res.callbackQuery?.data === "cancel") {
        await res.answerCallbackQuery();
        await ctx.reply("❌ Действие отменено", {
            reply_markup: settingsManager(),
        });
        await conversation.exit();
        throw new Error("CANCELLED");
    }

    return res;
}


export async function addPostConversation(conversation: Conversation, ctx: Context) {
    const post: {
        path?: string
        title?: string;
        text?: string;
        photoFileId?: string | null;
        button?: { text: string; url: string } | null;
        pdf?: boolean;
    } = {};

    const path = nanoid();


    await ctx.reply("Отправьте фото и текст (можно вместе)", {
        reply_markup: canselKeyboard,
    });

    const msg = await conversation.waitFor("message");

    const hasPhoto = !!msg.message?.photo;
    const hasText = !!msg.message?.text;
    const hasCaption = !!msg.message?.caption;

    if (hasPhoto) {
        post.photoFileId = msg.message.photo.at(-1)?.file_id;

        if (hasCaption) {
            // ✅ фото + подпись → готово
            post.text = msg.message.caption;
        } else {
            // ❗️ фото без текста → просим текст
            await ctx.reply("Введите текст поста", {
                reply_markup: canselKeyboard,
            });

            const textMsg = await conversation.waitFor("message:text");
            post.text = textMsg.message.text;
        }
    }

// 👉 если нет фото, но есть текст
    else if (hasText) {
        post.text = msg.message.text;

        // ❗️ текст без фото → просим фото
        await ctx.reply("Отправьте фото", {
            reply_markup: canselKeyboard,
        });

        const photoMsg = await conversation.waitFor("message:photo");
        post.photoFileId = photoMsg.message.photo.at(-1)?.file_id;
    }

// 👉 если вообще ничего нормального
    else {
        await ctx.reply("Отправьте текст или фото");
        return; // можно зациклить при желании
    }

    // message.photo || message.text
    //
    // capition? text = capition  : 'где текст сука'


    // отправьте текст + картинку поста
    //
    // text: '';
    // img: '';
    //
    // пользователь отправляет картинку
    //
    // if (!text) return replay дайте текст
    //
    // if (!img) ретурн дайте картинку
    //
    // if (img && text) {
    //     вывод сообщения картинка + текст
    //     добавить кнопку?
    // }


    await ctx.reply("Добавить кнопку?", {
        reply_markup: yesOrNoKeyboard,
    });

    const callback = await conversation.waitFor("callback_query:data");

    if (callback.callbackQuery.data === "yes") {
        await callback.answerCallbackQuery();

        await ctx.reply("Введите текст кнопки");

        const {message: btnText} = await conversation.waitFor("message:text");

        post.button = {
            text: btnText.text,
            url: `t.me/qliwkjelkhewf_bot?start=${path}`,
        };

    } else if (callback.callbackQuery.data === "no") {
        await callback.answerCallbackQuery();

        post.button = null;
    }

    // await ctx.reply("Добавить PDF? (да/нет)");
    // const { message: pdfAnswer } = await conversation.waitFor("message:text");
    // post.pdf = pdfAnswer.text.toLowerCase() === "да";
    //


    const text = post.text || "";

    let keyboard;
    if (post.button) {
        keyboard = new InlineKeyboard().url(post.button.text, post.button.url);
    }

// превью
    if (post.photoFileId) {
        await ctx.replyWithPhoto(post.photoFileId, {
            caption: text,
            parse_mode: "HTML",
            reply_markup: keyboard,
        });
    } else {
        await ctx.reply(text, {
            parse_mode: "HTML",
            reply_markup: keyboard,
        });
    }

    await ctx.reply("Опубликовать?", {
        reply_markup: yesOrNoKeyboard,
    });

    const confirmCallback = await conversation.waitFor("callback_query:data");
    await confirmCallback.answerCallbackQuery();

    if (confirmCallback.callbackQuery.data === "yes") {
        const chatId = -1003583122815;

        if (post.photoFileId) {
            await ctx.api.sendPhoto(chatId, post.photoFileId, {
                caption: text, // ← ВАЖНО
                parse_mode: "HTML",
                reply_markup: keyboard,
            });
        } else {
            await ctx.api.sendMessage(chatId, text, {
                parse_mode: "HTML",
                reply_markup: keyboard,
            });
        }

        await ctx.reply("✅ Пост опубликован");

    } else {
        await ctx.reply("❌ Отменено", {
            reply_markup: adminKeyboard(),
        });
    }
}