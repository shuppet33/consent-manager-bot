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

const yesOrNoKeyboard = new Keyboard()
    .text("Да")
    .text("Нет")

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

    // ctx.reply("Введите текст поста",{
    //     reply_markup:canselKeyboard
    // });

    await ctx.reply("Введите текст поста", {
        reply_markup: canselKeyboard,
    });

    post.text = await waitText(conversation, ctx);


    await ctx.reply("Введите текст поста", {
        reply_markup: canselKeyboard
    });

    const res = await waitWithCancel(conversation, ctx);

    if (res.message?.text) {
        post.text = res.message.text;
    }

    if (res.callbackQuery?.data === "submit") {
        await ctx.reply("Пост пустой");
    }

    const { message: textMsg } = await conversation.waitFor("message:text");
    post.text = textMsg.text;


    if (!textMsg.text) {
        await ctx.reply("Добавьте текст или отправьте готовый пост",{reply_markup:canselKeyboard})
    }


    await ctx.reply("Отправьте фото или напишите 'пропустить'",
        {
            reply_markup:speekQuestion
        });

    const photoMsg = await conversation.waitFor("message");

    console.log('photoMsg', photoMsg.update.message);

    if (photoMsg.message?.photo) {
        post.photoFileId = photoMsg.message.photo.at(-1)?.file_id;
    } else {
        post.photoFileId = null;
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



    await ctx.reply("Добавить кнопку? (да/нет)", {
        reply_markup: yesOrNoKeyboard,
    });

    const { message: btnAnswer } = await conversation.waitFor("message:text");

    if (btnAnswer.text.toLowerCase() === "да") {
        await ctx.reply("Введите текст кнопки");
        const { message: btnText } = await conversation.waitFor("message:text");

        post.button = {
            text: btnText.text,
            url: `t.me/qliwkjelkhewf_bot?start=${path}`,
        };
    } else {
        post.button = null;
    }

    await ctx.reply("Добавить PDF? (да/нет)");
    const { message: pdfAnswer } = await conversation.waitFor("message:text");
    post.pdf = pdfAnswer.text.toLowerCase() === "да";


    const caption = `<b>${post.title}</b>\n\n${post.text}`;


    let keyboard;
    if (post.button) {
        keyboard = new InlineKeyboard().url(post.button.text, post.button.url);
    }

    if (post.photoFileId) {
        await ctx.replyWithPhoto(post.photoFileId, {
            caption,
            parse_mode: "HTML",
            reply_markup: keyboard,
        });
    } else {
        await ctx.reply(caption, {
            parse_mode: "HTML",
            reply_markup: keyboard,
        });
    }

    await ctx.reply("Опубликовать? (да/нет)");
    const { message: confirm } = await conversation.waitFor("message:text");

    if (confirm.text.toLowerCase() === "да") {
        const chatId = -1003583122815;

        if (post.photoFileId) {
            await ctx.api.sendPhoto(chatId, post.photoFileId, {
                caption,
                parse_mode: "HTML",
                reply_markup: keyboard,
            });
        } else {
            await ctx.api.sendMessage(chatId, caption, {
                parse_mode: "HTML",
                reply_markup: keyboard,
            });
        }

        await ctx.reply("✅ Пост опубликован",{
            reply_markup: { remove_keyboard: true }
        });
        console.log(path)
        console.log("LOOOOG")
        console.log(post.path)

    } else {
        await ctx.reply("❌ Отменено",{
            reply_markup: adminKeyboard()
        });
    }
}

