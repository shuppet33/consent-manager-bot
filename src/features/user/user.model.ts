import {db} from "../../db/connect";

export const userModel = {
    async findByTelegramId(telegramId: number) {
        return db.query(
            'SELECT * FROM users WHERE telegram_id = $1',
            [telegramId]
        );
    },

    async createUser(telegramId: number, firstName?: string, username?: string) {
        return db.query(
            `
            INSERT INTO users (telegram_id, first_name, username, role)
            VALUES ($1, $2, $3, 'user')
            ON CONFLICT (telegram_id) DO NOTHING
            `,
            [telegramId, firstName, username]
        );
    },


}