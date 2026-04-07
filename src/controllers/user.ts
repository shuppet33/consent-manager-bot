import {db} from "../db/connect";
import {NextFunction} from "grammy"
import {Context} from "../entities/context.types";

export const getRole = async (ctx: Context, next: NextFunction) => {
    const telegramId = ctx.from?.id;
    const firstName = ctx.from?.first_name;
    const username = ctx.from?.username;

    if (!telegramId) return;

    const result = await db.query('SELECT * FROM users WHERE telegram_id = $1', [telegramId]);

    if (!result.rows.length) {
        await db.query(
            `
                INSERT INTO users (telegram_id, first_name, username, role)
                VALUES ($1, $2, $3, 'user') ON CONFLICT (telegram_id) DO NOTHING
            `,
            [telegramId, firstName, username]
        );

        ctx.role = 'user';

        return next()
    }

    ctx.role = result.rows[0]?.role;

    return next()
}