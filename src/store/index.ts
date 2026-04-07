import {atom, createStore} from "jotai/vanilla";

export const store = createStore();

export const counterAtom = atom(0)