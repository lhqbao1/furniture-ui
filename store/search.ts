import { atom } from "jotai";

export const searchHistoryAtom = atom<string[]>([]);

export const removeSearchHistoryAtom = atom(
  null,
  (get, set, keyword: string) => {
    const current = get(searchHistoryAtom);
    set(
      searchHistoryAtom,
      current.filter((item) => item !== keyword),
    );
  },
);

export const addSearchKeywordAtom = atom(null, (get, set, keyword: string) => {
  const trimmed = keyword.trim();
  if (!trimmed) return;

  const prev = get(searchHistoryAtom);

  // remove duplicate + đưa lên đầu
  const next = [
    trimmed,
    ...prev.filter((k) => k.toLowerCase() !== trimmed.toLowerCase()),
  ].slice(0, 10); // giới hạn 10 keyword

  set(searchHistoryAtom, next);
});
