import {Conversation} from "@grammyjs/conversations";
import {Context} from "../../shared/context.types";
import {cancelKeyboard, confirmKeyboard, deleteConfirmKeyboard} from "../../keyboards/keyboards-manager";
import {settingsManager} from "../../keyboards/keyboards-admin";
import {managerModel} from "./manager.model";

const TELEGRAM_ID_LENGTH = 10;

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

    return res.message.text;
}

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

        const existing = await managerModel.findByTelegramId(telegramId);

        if (existing.rows.length > 0) {
            await ctx.reply("Такой пользователь уже есть", {
                reply_markup: settingsManager(),
            });
            return;
        }

        await managerModel.createManager(telegramId, name);

        const res = await managerModel.getAllManagers();

        const managersList = res.rows
            .map((user, i) => {
                return `🔹 ${i + 1}. ${user.first_name} --- ID: ${user.telegram_id}`;
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

export async function deleteManager(conversation: Conversation, ctx: Context) {
    try {

        await ctx.reply(
            "Введите ID менеджера для удаления",
            {reply_markup: cancelKeyboard}
        );

        const idText = await waitWithCancel(conversation, ctx);

        if (!/^\d+$/.test(idText)) {
            await ctx.reply("ID должен быть числом", {
                reply_markup: settingsManager(),
            });
            return;
        }

        const telegramId = Number(idText);


        const res = await managerModel.findManagerById(telegramId);

        if (!res.rows.length) {
            await ctx.reply("Менеджер не найден", {
                reply_markup: settingsManager(),
            });
            return;
        }

        const manager = res.rows[0];


        await ctx.reply(
            `Удалить пользователя?\n\n👤 ${manager.first_name}\n🆔 ${manager.telegram_id}`,
            {reply_markup: deleteConfirmKeyboard}
        );

        const confirm = await waitWithCancel(conversation, ctx);

        if (confirm !== "manager-confirm-delete") {
            await ctx.reply("❌ ОТМЕНЕНО", {
                reply_markup: settingsManager(),
            });
            return;
        }

        // 4. удаление
        await managerModel.deleteManager(telegramId);

        await ctx.reply("✅ Менеджер удалён", {
            reply_markup: settingsManager(),
        });

    } catch (e: any) {
        if (e.message === "CANCEL") return;

        console.error(e);
        await ctx.reply("Произошла ошибка", {
            reply_markup: settingsManager(),
        });
    }
}