import {Context} from "grammy";
import {db} from "../db/connect";
import {Conversation, conversations, createConversation} from "@grammyjs/conversations"


export const managerAnalitics = (ctx: Context,conversation: Conversation, ) => {
    ctx.callbackQuery("analytics_today", async (ctx) => {
        const leads = await db.query(`
            SELECT leads.*,
                   posts.telegram_id
            FROM leads
                     JOIN posts ON leads.post_id = posts.id
            WHERE leads.created_at >= CURRENT_DATE
            ORDER BY leads.created_at DESC
        `);

        if (!leads.rows.length) {
            return ctx.reply("Сегодня лидов нет");
        }

        const formatDate = (date: Date) => {
            return new Intl.DateTimeFormat("ru-RU", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
            }).format(new Date(date));
        };

        const text = leads.rows.map((l, i) =>
            `<b>Лид #${i + 1}</b>
👤 <b>${l.firs_name}</b>
🤖<b>@${l.username}</b>
📞 <b>${l.phone}</b>
🕒 ${formatDate(l.created_at)}
📌 <a href="https://t.me/c/3583122815/${l.telegram_id}">Открыть</a>`
        ).join("\n\n──────────────\n\n");

        console.log("leads:", leads.rows);

        await ctx.reply(
            `📊 <b>Лиды за сегодня (${leads.rows.length})</b>

${text}`,
            {parse_mode: "HTML", disable_web_page_preview: true}
        )
    })


    ctx.callbackQuery("specificDateAnalytics", async (ctx) => {
        await ctx.conversation.enter("specificDateAnalyticsConversation")
    })

}


export async function specificDateAnalyticsConversation(conversation: Conversation, ctx: Context) {
    await ctx.reply("Пришлите дату (пример: ДД.ММ.ГГ)");

    const { message } = await conversation.wait();
    const input = message.text;

    const [day, month, year] = input.split('.');
    const formattedDate = `20${year}-${month}-${day}`;

    const leads = await db.query(`
        SELECT leads.*,
               posts.telegram_id
        FROM leads
        JOIN posts ON leads.post_id = posts.id
        WHERE leads.created_at >= $1
          AND leads.created_at < $1::date + INTERVAL '1 day'
        ORDER BY leads.created_at DESC
    `, [formattedDate]);

    if (!leads.rows.length) {
        return ctx.reply(`За ${input} лидов нет`);
    }

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        }).format(new Date(date));
    };

    const text = leads.rows.map((l, i) =>
        `<b>Лид #${i + 1}</b>
👤 <b>${l.first_name}</b>
🤖<b>@${l.username}</b>
📞 <b>${l.phone}</b>
🕒 ${formatDate(l.created_at)}
📌 <a href="https://t.me/c/3583122815/${l.telegram_id}">Открыть</a>`
    ).join("\n\n──────────────\n\n");



    await ctx.reply(
        `📊 <b>Лиды за ${input} (${leads.rows.length})</b>

${text}`,
        {
            parse_mode: "HTML",
            disable_web_page_preview: true
        }
    );
}

