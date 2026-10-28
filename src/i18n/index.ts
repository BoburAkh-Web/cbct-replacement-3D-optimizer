import { createContext, useContext } from "react";
import { uz } from "./uz";
import { ru } from "./ru";

export type Dict = typeof uz;
export type Lang = Dict["lang"];

export const DICTS: Record<Lang, Dict> = { uz, ru };
export const LANGS: { id: Lang; label: string }[] = [
  { id: "uz", label: "UZ" },
  { id: "ru", label: "RU" },
];

const I18n = createContext<Dict>(uz);
export const I18nProvider = I18n.Provider;
/** Joriy til lug'ati: t.kMin, t.years(5) va h.k. */
export const useT = () => useContext(I18n);
