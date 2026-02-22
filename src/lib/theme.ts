import { useState, useCallback, useSyncExternalStore } from "react";
import bgArcade from "@/assets/bg-arcade.png";
import bgAnime from "@/assets/bg-anime.png";
import bgClassic from "@/assets/bg-classic.png";
import winTrophy from "@/assets/win-trophy.png";
import winStar from "@/assets/win-star.png";
import winClassic from "@/assets/win-classic.png";

export type ThemeId = "arcade" | "anime" | "classic";

export interface ThemeConfig {
  id: ThemeId;
  label: string;
  emoji: string;
  bg: string;
  winImage: string;
  headingFont: string;
}

export const THEMES: ThemeConfig[] = [
  {
    id: "arcade",
    label: "Arcade 8-bit",
    emoji: "🕹️",
    bg: bgArcade,
    winImage: winTrophy,
    headingFont: "'Press Start 2P', cursive",
  },
  {
    id: "anime",
    label: "Anime",
    emoji: "🌸",
    bg: bgAnime,
    winImage: winStar,
    headingFont: "'Press Start 2P', cursive",
  },
  {
    id: "classic",
    label: "Classic",
    emoji: "♟️",
    bg: bgClassic,
    winImage: winClassic,
    headingFont: "'Cinzel', serif",
  },
];

const STORAGE_KEY = "fiveinarow_theme";

let currentTheme: ThemeId = (localStorage.getItem(STORAGE_KEY) as ThemeId) || "arcade";
const listeners = new Set<() => void>();

function applyTheme(id: ThemeId) {
  document.documentElement.setAttribute("data-theme", id);
}

// Apply on load
applyTheme(currentTheme);

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return currentTheme;
}

export function setTheme(id: ThemeId) {
  currentTheme = id;
  localStorage.setItem(STORAGE_KEY, id);
  applyTheme(id);
  listeners.forEach((cb) => cb());
}

export function useTheme(): [ThemeId, (id: ThemeId) => void] {
  const theme = useSyncExternalStore(subscribe, getSnapshot);
  return [theme, setTheme];
}

export function getThemeConfig(id?: ThemeId): ThemeConfig {
  const tid = id ?? currentTheme;
  return THEMES.find((t) => t.id === tid) ?? THEMES[0];
}
