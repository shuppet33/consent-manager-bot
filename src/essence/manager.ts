import {Conversation} from "@grammyjs/conversations";
import {Bot, InlineKeyboard} from "grammy";
import {db} from "../db/connect";
import {settingsManager, adminKeyboard} from "../keyboards/keyboards-admin";
import {Context} from "../shared/context.types";


export function registerManagerHandlers(bot: Bot) {
    bot.callbackQuery("admin-panel", async (ctx) => {
        await ctx.answerCallbackQuery();

        await ctx.editMessageText("Админ-панель", {
            reply_markup: adminKeyboard()
        });
    });

}


// кнопки
const confirmKeyboard = new InlineKeyboard()
    .text("Добавить менеджера", "manager-confirm-add")
    .text("Отмена добавления", "cancel");

const cancelKeyboard = new InlineKeyboard()
    .text("❌ Отмена", "cancel");

const TELEGRAM_ID_LENGTH = 9;


export function qweqweqwe(bot: Bot) {
    bot.callbackQuery("admin-panel", async (ctx) => {
        await ctx.reply("qweqweqweqweqweqweqwe")
    })
}

// универсальное ожидание
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
        throw new Error("CANCEL");
    }

    if (res.callbackQuery) {
        await res.answerCallbackQuery();
        return res.callbackQuery.data;
    }

    // текст
    return res.message.text;
}

// ввод ID
async function askForId(conversation: Conversation, ctx: Context) {
    while (true) {
        await ctx.reply(
            "Введите ID менеджера\nУзнать можно: @Getmyid_Work_Bot",
            {reply_markup: cancelKeyboard}
        );

        const idText = await waitWithCancel(conversation, ctx);

        if (!/^\d+$/.test(idText)) {
            await ctx.reply("ID должен быть числом");
            continue;
        }
        if (idText.length !== TELEGRAM_ID_LENGTH) {
            await ctx.reply(`ID должен содержать ровно ${TELEGRAM_ID_LENGTH} цифр`);
            continue;
        }

        return Number(idText);
    }
}

// ввод имени
async function askForName(conversation: Conversation, ctx: Context) {
    while (true) {
        await ctx.reply("Как зовут менеджера?", {
            reply_markup: cancelKeyboard,
        });

        const name = await waitWithCancel(conversation, ctx);

        if (!name.trim()) {
            await ctx.reply("Имя не может быть пустым");
            continue;
        }

        if (!/^[A-Za-zА-Яа-яЁё\s]+$/.test(name)) {
            await ctx.reply("Имя должно содержать только буквы");
            continue;
        }

        return name.trim();
    }
}

export async function addManager(conversation: Conversation, ctx: Context) {
    try {
        const telegramId = await askForId(conversation, ctx);
        const name = await askForName(conversation, ctx);

        await ctx.reply(
            `Данные:\n\n👤 Имя: ${name}\n🆔 ID: ${telegramId}`,
            {reply_markup: confirmKeyboard}
        );

        const confirm = await waitWithCancel(conversation, ctx);

        if (confirm !== "manager-confirm-add") {
            await ctx.reply("❌ Отменено", {
                reply_markup: settingsManager(),
            });
            return;
        }

        const existing = await db.query(
            `SELECT *
             FROM users
             WHERE telegram_id = $1`,
            [telegramId]
        );

        if (existing.rows.length > 0) {
            await ctx.reply("Такой пользователь уже есть", {
                reply_markup: settingsManager(),
            });
            return;
        }

        await db.query(
            `INSERT INTO users (telegram_id, first_name, role)
             VALUES ($1, $2, $3)`,
            [telegramId, name, "manager"]
        );

        const res = await db.query(
            `SELECT telegram_id, first_name
             FROM users
             WHERE role = 'manager'`
        );

        const managersList = res.rows
            .map((user, i) => {
                return `🔹 ${i + 1}. ${user.first_name}
   └ id: ${user.telegram_id}`;
            })
            .join("\n\n");

        await ctx.reply("✅ Менеджер добавлен", {
            reply_markup: settingsManager(),
        });

        await ctx.reply(
            `📋 <b>Список менеджеров</b>\n\n${managersList}`,
            {parse_mode: "HTML"}
        );

    } catch (e: any) {
        if (e.message === "CANCEL") return;

        console.error(e);
        await ctx.reply("Произошла ошибка", {
            reply_markup: settingsManager(),
        });
    }

}
