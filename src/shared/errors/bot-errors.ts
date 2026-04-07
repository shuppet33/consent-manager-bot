import {BotError, GrammyError, HttpError} from "grammy";

export const handleBotError = (botError: BotError) => {
    const ctx = botError.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);

    const error = botError.error;

    if (error instanceof GrammyError) {
        return console.error("Error in request:", error.description);
    }

    if (error instanceof HttpError) {
        return console.error("Could not contact Telegram:", error);
    }

    return console.error("Unknown error:", error);

}