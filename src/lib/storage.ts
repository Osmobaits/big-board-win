// LocalStorage persistence for game state

import { Player, TournamentMatch } from "./tournament";
import { ReversiCell, ReversiPlayer, ReversiMove } from "./reversi";

const KEYS = {
  SINGLE_GAME: "fiveinarow_single_game",
  TOURNAMENT: "fiveinarow_tournament",
  HISTORY: "fiveinarow_history",
  REVERSI_SINGLE: "reversi_single_game",
  REVERSI_TOURNAMENT: "reversi_tournament",
};

// Single game save (Five Strike)
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

// Reversi single game save
export interface SavedReversiSingleGame {
  playerBlack: string;
  playerWhite: string;
  isAI: boolean;
  board: (ReversiCell)[][];
  currentPlayer: ReversiPlayer;
  history: ReversiMove[];
  savedAt: number;
}

export const saveReversiSingleGame = (data: SavedReversiSingleGame) => {
  localStorage.setItem(KEYS.REVERSI_SINGLE, JSON.stringify(data));
};

export const loadReversiSingleGame = (): SavedReversiSingleGame | null => {
  try {
    const raw = localStorage.getItem(KEYS.REVERSI_SINGLE);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

export const clearReversiSingleGame = () => {
  localStorage.removeItem(KEYS.REVERSI_SINGLE);
};

// Tournament save
export interface SavedTournament {
  players: Player[];
  matches: TournamentMatch[];
  savedAt: number;
  game?: "fiveStrike" | "reversi";
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

// Reversi tournament save
export const saveReversiTournament = (data: SavedTournament) => {
  localStorage.setItem(KEYS.REVERSI_TOURNAMENT, JSON.stringify({ ...data, game: "reversi" }));
};

export const loadReversiTournament = (): SavedTournament | null => {
  try {
    const raw = localStorage.getItem(KEYS.REVERSI_TOURNAMENT);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

export const clearReversiTournament = () => {
  localStorage.removeItem(KEYS.REVERSI_TOURNAMENT);
};

export const hasSavedSingleGame = (): boolean => !!localStorage.getItem(KEYS.SINGLE_GAME);
export const hasSavedTournament = (): boolean => !!localStorage.getItem(KEYS.TOURNAMENT);
export const hasSavedReversiSingle = (): boolean => !!localStorage.getItem(KEYS.REVERSI_SINGLE);
export const hasSavedReversiTournament = (): boolean => !!localStorage.getItem(KEYS.REVERSI_TOURNAMENT);

// Game history
export interface GameHistoryEntry {
  id: string;
  playerX: string;
  playerO: string;
  winner: string | null;
  isDraw: boolean;
  mode: "single" | "duel" | "tournament";
  game?: "fiveStrike" | "reversi";
  date: number;
}

export const addGameToHistory = (entry: Omit<GameHistoryEntry, "id" | "date">) => {
  const history = getGameHistory();
  history.unshift({ ...entry, id: crypto.randomUUID(), date: Date.now() });
  localStorage.setItem(KEYS.HISTORY, JSON.stringify(history.slice(0, 100)));
};

export const getGameHistory = (): GameHistoryEntry[] => {
  try {
    const raw = localStorage.getItem(KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

export const clearGameHistory = () => {
  localStorage.removeItem(KEYS.HISTORY);
};
