import {Context} from "../../shared/context.types";
import {Conversation} from "@grammyjs/conversations";
import {consentKeyboard, contactKeyboard} from "../../keyboards/keyboards-lead";
import {db} from "../../db/connect";
import {userModel} from "../user/user.model";

// получение поста по start_param
async function getPostByStartParam(startParam: string) {
    return db.query(
        'SELECT * FROM posts WHERE id = $1',
        [startParam]
    );
}

export async function leadFlow(conversation: Conversation, ctx: Context, data: {startParam: string}) {
    try {
        const startParam = data.startParam; // от deep link

        // 1. получаем пост

        console.log('hhh')

        const postRes = await getPostByStartParam(startParam);
        const post = postRes.rows[0];


        console.log('gggg')
        // 2. согласие
        await ctx.reply(
            `Для следующего шага, нужно принять политику конфиденциальности (ссылка) и согласие на обработку персональных данных (ссылка) 👇`,
            {reply_markup: consentKeyboard}
        );

        const consent = await conversation.waitFor("callback_query:data");

        await consent.answerCallbackQuery();

        // ❌ НЕ ПРИНИМАЮ
        if (consent.callbackQuery.data === "lead-decline") {
            await ctx.reply(
                "Принято, спасибо 🤝 Если понадобится — можно вернуться и нажать кнопку снова"
            );
            return;
        }

        // ✅ ПРИНИМАЮ
        const userName = ctx.from?.first_name || "Пользователь";

        await ctx.reply(
            `${userName}, здравствуйте!
                На связи Курортная недвижимость/Лилия Левитас 👋
                
                Чтобы наш менеджер отправил материалы про «${post?.title}», нужен ваш контакт в Telegram.
                
                При необходимости он предварительно позвонит, чтобы уточнить бюджет и цель покупки
                
                Нажмите «Поделиться контактом» или напишите номер сообщением
                Пример: 79999999999`,
            {reply_markup: contactKeyboard}
        );

        // 3. ждём контакт или текст
        const contactMsg = await conversation.waitFor([
            "message:contact",
            "message:text",
        ]);

        let phone = "";

        if (contactMsg.message.contact) {
            phone = contactMsg.message.contact.phone_number;
        } else {
            phone = contactMsg.message.text;
        }

        const userRes = await userModel.findByTelegramId(contactMsg.from?.id);

        const user = userRes.rows[0];

        console.log('sjvjsjdjvjsvsdvsdv', post.id);

        await db.query(
            'INSERT INTO leads (user_id, post_id, phone) VALUES ($1, $2, $3)',
            [
                user.id,     // ✅ UUID из users
                post.id,     // ✅ UUID поста
                phone,
            ]
        );

        await ctx.reply("Номер передан менеджеру");

    } catch (e) {
        console.error(e);
        await ctx.reply("Ошибка, попробуйте позже");
    }
}