import {Conversation} from "@grammyjs/conversations";
import {Context, InlineKeyboard, InputFile, Keyboard} from "grammy";
import {adminKeyboard, settingsManager} from "../keyboards/keyboards-admin";
import {customAlphabet} from "nanoid";
import {db} from "../db/connect";
import dotenv from "dotenv";
dotenv.config();




const nanoid = customAlphabet(
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    16
);

const controlKeyboard = new InlineKeyboard()
    .text("Отправить", "submit")
    .text("Отмена", "cancel");

const yesOrNoKeyboard = new InlineKeyboard()
    .text("Да", "yes")
    .text("Нет", "no");

const canselKeyboard = new InlineKeyboard()
    .text("Отмена", "cancel")

const canselOrSkipKeyboard = new InlineKeyboard()
    .text("Пропустить", "skip")
    .text("Отмена", "cancel")


function canselPost(ctx: Context) {
    ctx.callbackQuery("cancel", async (ctx) => {
        await ctx.conversation.exit("addPostConversation");
    });
}

export const addPost = (ctx: Context) => {
    ctx.callbackQuery("addPost", async (ctx) => {
        await ctx.answerCallbackQuery();
        await ctx.conversation.enter("addPostConversation");
    })
}

async function waitWithCancel(conversation: Conversation, ctx: Context) {
    const res = await conversation.waitFor([
        "message",
        "callback_query:data",
    ]);

    if (res.callbackQuery?.data === "cancel") {
        await res.answerCallbackQuery();
        await ctx.reply("❌ Действие отменено", {
            reply_markup: adminKeyboard(),
        });
        await conversation.halt()
    }

    return res;
}


export async function addPostConversation(conversation: Conversation, ctx: Context) {
    const post: {
        path?: string
        telegram_id: number
        title?: string;
        text?: string | null;
        entities?: MessageEntity[]
        photoFileId?: string | null;
        button?: { text: string; url: string } | null;
        pdf?: boolean;
    } = {};

    // const messageId: number;
    //
    // post.path =  messageId: number;


    const path = nanoid();
    post.path = path;

    post.title = "exampleTitle213123123"


    await ctx.reply("Отправьте фото и текст (можно вместе)", {
        reply_markup: canselKeyboard,
    });

    const msg = await waitWithCancel(conversation, ctx);


    const hasPhoto = !!msg.message?.photo;
    const hasText = !!msg.message?.text;
    const hasCaption = !!msg.message?.caption;

    if (hasPhoto) {
        post.photoFileId = msg.message.photo.at(-1)?.file_id;

        if (hasCaption) {
            // ✅ фото + подпись → готово
            post.text = msg.message.caption
            post.entities = msg.message.caption_entities
        } else {
            // ❗️ фото без текста → просим текст
            await ctx.reply("Введите текст поста", {
                reply_markup: canselOrSkipKeyboard,
            });

            const textMsg = await waitWithCancel(conversation, ctx);

            if (textMsg.callbackQuery?.data === "skip") {
                post.text = null;
                post.entities = [];
            } else {
                post.text = textMsg.message.text;
                post.entities = textMsg.message.entities;
            }
        }
    } else if (hasText) {
        post.text = msg.message.text;
        post.entities = msg.message.entities;

        await ctx.reply("Отправьте фото", {
            reply_markup: canselOrSkipKeyboard,
        });

        const photoMsg = await waitWithCancel(conversation, ctx)

        if (photoMsg.callbackQuery?.data === "skip") {
            post.photoFileId = null
        } else {
            post.photoFileId = photoMsg.message.photo.at(-1)?.file_id;
        }

    } else {
        await ctx.reply("Отправьте текст или фото");
        return;
    }

    await ctx.reply("Добавить кнопку?", {
        reply_markup: yesOrNoKeyboard,
    });


    const callback = await waitWithCancel(conversation, ctx);

    if (callback.callbackQuery.data === "yes") {
        await callback.answerCallbackQuery();

        await ctx.reply("Введите текст кнопки");

        const {message: btnText} = await conversation.waitFor("message:text");



        post.button = {
            text: btnText.text,
            url: `t.me/${process.env.usernameTg}?start=${path}`,
        };
    } else if (callback.callbackQuery.data === "no") {
        await callback.answerCallbackQuery();

        post.button = null;
    }

    // await ctx.reply("Добавить PDF? (да/нет)");
    // const { message: pdfAnswer } = await conversation.waitFor("message:text");
    // post.pdf = pdfAnswer.text.toLowerCase() === "да";


    const text = post.text || "";

    let keyboard;
    if (post.button) {
        keyboard = new InlineKeyboard().url(post.button.text, post.button.url);
    }

    if (post.photoFileId) {
        await ctx.replyWithPhoto(post.photoFileId, {
            caption: text,
            caption_entities: post.entities,
            reply_markup: keyboard,
        });
    } else {
        await ctx.reply(text, {
            entities: post.entities,
            reply_markup: keyboard,
        });
    }

    await ctx.reply("Опубликовать?", {
        reply_markup: yesOrNoKeyboard,
    });


    const confirmCallback = await conversation.waitFor("callback_query:data");
    await confirmCallback.answerCallbackQuery();


    if (confirmCallback.callbackQuery.data === "yes") {
        const chatId = process.env.channelId;

        let sentMessage;

        if (post.photoFileId) {
            sentMessage = await ctx.api.sendPhoto(chatId, post.photoFileId, {
                caption: text,
                caption_entities: post.entities,
                reply_markup: keyboard,
            });
        } else {
            sentMessage = await ctx.api.sendMessage(chatId, text, {
                entities: post.entities,
                reply_markup: keyboard,
            });
        }

        post.telegram_id = sentMessage.message_id;
        console.log(post.telegram_id);

        const createPostResult = await db.query(
            `INSERT INTO posts (id, title, start_param, telegram_id)
             VALUES ($1, $2, $3, $4)`,
            [
                path,
                post.title || null,
                path,
                post.telegram_id
            ]
        );

        await ctx.reply("✅ Пост опубликован", {
            reply_markup: adminKeyboard(),
        });
    } else {
        await ctx.reply("❌ Отменено", {
            reply_markup: adminKeyboard(),
        });
    }
}
