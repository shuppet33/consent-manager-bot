import {Context} from "../shared/context.types";
import {NextFunction} from "grammy";
import {userService} from "../features/user/user.service";

export const getRole = async (ctx: Context, next: NextFunction) => {
    try {
        const telegramId = ctx.from?.id;

        ctx.state = {role: 'user'};

        // console.log(ctx.state)

        if (!telegramId) {
            return next();
        }

        ctx.state.role = await userService.getOrCreateUserRole(
            telegramId,
            ctx.from?.first_name,
            ctx.from?.username
        );
        console.log(ctx.state.role);

        return next();
    } catch (e) {
        console.error("DB ERROR", e);

        ctx.state.role = 'user';

        return next();
    }
}