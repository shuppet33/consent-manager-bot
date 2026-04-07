import {Context as GrammyContext} from "grammy";
import {Role} from "./user.types";

export type Context = GrammyContext & {
    role: Role;
};