// LocalStorage persistence for game state

import { Player, TournamentMatch } from "./tournament";

const KEYS = {
  SINGLE_GAME: "fiveinarow_single_game",
  TOURNAMENT: "fiveinarow_tournament",
};

// Single game save
export interface SavedSingleGame {
  playerX: string;
  playerO: string;
  isAI: boolean;
  board: (string | null)[][];
  isXTurn: boolean;
  history: { row: number; col: number; player: string | null }[];
  savedAt: number;
}

export const saveSingleGame = (data: SavedSingleGame) => {
  localStorage.setItem(KEYS.SINGLE_GAME, JSON.stringify(data));
};

export const loadSingleGame = (): SavedSingleGame | null => {
  try {
    const raw = localStorage.getItem(KEYS.SINGLE_GAME);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

export const clearSingleGame = () => {
  localStorage.removeItem(KEYS.SINGLE_GAME);
};

// Tournament save
export interface SavedTournament {
  players: Player[];
  matches: TournamentMatch[];
  savedAt: number;
}

export const saveTournament = (data: SavedTournament) => {
  localStorage.setItem(KEYS.TOURNAMENT, JSON.stringify(data));
};

export const loadTournament = (): SavedTournament | null => {
  try {
    const raw = localStorage.getItem(KEYS.TOURNAMENT);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

export const clearTournament = () => {
  localStorage.removeItem(KEYS.TOURNAMENT);
};

export const hasSavedSingleGame = (): boolean => !!localStorage.getItem(KEYS.SINGLE_GAME);
export const hasSavedTournament = (): boolean => !!localStorage.getItem(KEYS.TOURNAMENT);
