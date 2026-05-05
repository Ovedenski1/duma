import { StoredGame } from "./types";

export function getGameKey(date: string) {
  return `purple-wordle-${date}`;
}

export function saveGame(game: StoredGame) {
  localStorage.setItem(getGameKey(game.date), JSON.stringify(game));
}

export function loadGame(date: string): StoredGame | null {
  const raw = localStorage.getItem(getGameKey(date));
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function loadAllGames(): StoredGame[] {
  const games: StoredGame[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    if (key?.startsWith("purple-wordle-")) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      try {
        games.push(JSON.parse(raw));
      } catch {}
    }
  }

  return games;
}