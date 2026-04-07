import {Context as GrammyContext} from "grammy";
import {Role} from "../features/user/user.types";

export type Context = GrammyContext & {
    state: {
        role: Role
    };
};