import {atom, createStore} from "jotai/vanilla";
import type {Role} from "../entities/user.types";

export const store = createStore();

export const counterAtom = atom(0)


export const userRoleAtom = atom<Role>('user')