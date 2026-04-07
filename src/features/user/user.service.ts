import {userModel} from "./user.model";

export const userService = {
    async getOrCreateUserRole(telegramId: number, firstName?: string, username?: string) {
        const result = await userModel.findByTelegramId(telegramId);

        if (!result.rows.length) {
            await userModel.createUser(telegramId, firstName, username);
            return 'user';
        }

        return result.rows[0].role;
    }
}