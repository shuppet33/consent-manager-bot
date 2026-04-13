import {db} from "../../db/connect";

export const managerModel = {
    async findByTelegramId(telegramId: number) {
        return db.query(
            `SELECT *
             FROM users
             WHERE telegram_id = $1`,
            [telegramId]
        );
    },

    async createManager(telegramId: number, name: string) {
        return db.query(
            `INSERT INTO users (telegram_id, first_name, role)
             VALUES ($1, $2, $3)`,
            [telegramId, name, "manager"]
        );
    },

    async getAllManagers() {
        return db.query(
            `SELECT telegram_id, first_name
             FROM users
             WHERE role = 'manager'`
        );
    }
};