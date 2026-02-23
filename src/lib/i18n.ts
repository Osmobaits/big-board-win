import { useState, useEffect, useCallback } from "react";

export type Lang = "pl" | "en" | "de" | "es";

const LANG_KEY = "fiveStrike_lang";

const translations = {
  // Main menu
  "menu.subtitle": {
    pl: "Plansza 12×12 · Wygrywa 5 w linii",
    en: "12×12 Board · 5 in a row wins",
    de: "12×12 Brett · 5 in einer Reihe gewinnt",
    es: "Tablero 12×12 · Gana 5 en línea",
  },
  "menu.continueGame": {
    pl: "Kontynuuj grę", en: "Continue game", de: "Spiel fortsetzen", es: "Continuar juego",
  },
  "menu.continueTournament": {
    pl: "Kontynuuj turniej", en: "Continue tournament", de: "Turnier fortsetzen", es: "Continuar torneo",
  },
  "menu.singleGame": {
    pl: "Pojedyncza gra", en: "Single game", de: "Einzelspiel", es: "Juego individual",
  },
  "menu.duel": {
    pl: "Turniej 1 vs 1", en: "1 vs 1 Duel", de: "1-gegen-1-Duell", es: "Duelo 1 vs 1",
  },
  "menu.tournament": {
    pl: "Turniej wieloosobowy", en: "Multiplayer tournament", de: "Mehrspieler-Turnier", es: "Torneo multijugador",
  },
  "menu.scoreboard": {
    pl: "Tablica wyników", en: "Scoreboard", de: "Bestenliste", es: "Tabla de resultados",
  },
  "menu.rules": {
    pl: "Zasady gry", en: "Game rules", de: "Spielregeln", es: "Reglas del juego",
  },
  "menu.deleteSavedGame": {
    pl: "Usuń zapisaną grę", en: "Delete saved game", de: "Gespeichertes Spiel löschen", es: "Eliminar juego guardado",
  },
  "menu.deleteSavedTournament": {
    pl: "Usuń zapisany turniej", en: "Delete saved tournament", de: "Gespeichertes Turnier löschen", es: "Eliminar torneo guardado",
  },

  // Confirm dialogs
  "confirm.deleteGame": {
    pl: "Czy na pewno chcesz usunąć zapisaną grę?",
    en: "Are you sure you want to delete the saved game?",
    de: "Möchtest du das gespeicherte Spiel wirklich löschen?",
    es: "¿Seguro que quieres eliminar el juego guardado?",
  },
  "confirm.deleteTournament": {
    pl: "Czy na pewno chcesz usunąć zapisany turniej?",
    en: "Are you sure you want to delete the saved tournament?",
    de: "Möchtest du das gespeicherte Turnier wirklich löschen?",
    es: "¿Seguro que quieres eliminar el torneo guardado?",
  },
  "confirm.clearHistory": {
    pl: "Czy na pewno chcesz wyczyścić całą historię gier?",
    en: "Are you sure you want to clear all game history?",
    de: "Möchtest du die gesamte Spielhistorie wirklich löschen?",
    es: "¿Seguro que quieres borrar todo el historial de juegos?",
  },
  "btn.cancel": { pl: "Anuluj", en: "Cancel", de: "Abbrechen", es: "Cancelar" },
  "btn.delete": { pl: "Usuń", en: "Delete", de: "Löschen", es: "Eliminar" },
  "btn.clear": { pl: "Wyczyść", en: "Clear", de: "Löschen", es: "Borrar" },

  // GameBoard
  "game.wins": { pl: "wygrywa!", en: "wins!", de: "gewinnt!", es: "¡gana!" },
  "game.draw": { pl: "Remis!", en: "Draw!", de: "Unentschieden!", es: "¡Empate!" },
  "game.aiThinking": { pl: "AI myśli...", en: "AI thinking...", de: "KI denkt...", es: "IA pensando..." },
  "game.turn": { pl: "Ruch:", en: "Turn:", de: "Zug:", es: "Turno:" },
  "game.undo": { pl: "Cofnij", en: "Undo", de: "Rückgängig", es: "Deshacer" },
  "game.restart": { pl: "Od nowa", en: "Restart", de: "Neustart", es: "Reiniciar" },
  "game.declareDraw": { pl: "Ogłoś remis", en: "Declare draw", de: "Remis erklären", es: "Declarar empate" },
  "game.menu": { pl: "Menu", en: "Menu", de: "Menü", es: "Menú" },
  "game.confirmResult": { pl: "Zatwierdź wynik", en: "Confirm result", de: "Ergebnis bestätigen", es: "Confirmar resultado" },
  "game.backToTournament": { pl: "Wróć do turnieju", en: "Back to tournament", de: "Zurück zum Turnier", es: "Volver al torneo" },

  // SingleGame
  "single.title": { pl: "Pojedyncza gra", en: "Single game", de: "Einzelspiel", es: "Juego individual" },
  "single.2players": { pl: "2 graczy", en: "2 players", de: "2 Spieler", es: "2 jugadores" },
  "single.vsAI": { pl: "vs AI", en: "vs AI", de: "vs KI", es: "vs IA" },
  "single.yourName": { pl: "Twoje imię", en: "Your name", de: "Dein Name", es: "Tu nombre" },
  "single.playerX": { pl: "Gracz X", en: "Player X", de: "Spieler X", es: "Jugador X" },
  "single.playerXPlaceholder": { pl: "Imię gracza X", en: "Player X name", de: "Name Spieler X", es: "Nombre jugador X" },
  "single.playerO": { pl: "Gracz O", en: "Player O", de: "Spieler O", es: "Jugador O" },
  "single.playerOPlaceholder": { pl: "Imię gracza O", en: "Player O name", de: "Name Spieler O", es: "Nombre jugador O" },
  "single.playAI": { pl: "Graj z AI", en: "Play vs AI", de: "Gegen KI spielen", es: "Jugar vs IA" },
  "single.startGame": { pl: "Rozpocznij grę", en: "Start game", de: "Spiel starten", es: "Iniciar juego" },

  // Tournament
  "tournament.duelTitle": { pl: "Turniej 1 vs 1", en: "1 vs 1 Duel", de: "1-gegen-1-Duell", es: "Duelo 1 vs 1" },
  "tournament.title": { pl: "Turniej", en: "Tournament", de: "Turnier", es: "Torneo" },
  "tournament.duelDesc": {
    pl: "Podaj imiona dwóch graczy",
    en: "Enter names of two players",
    de: "Gib die Namen der zwei Spieler ein",
    es: "Introduce los nombres de los dos jugadores",
  },
  "tournament.desc": {
    pl: "Dodaj graczy (min. {min}), każdy zagra z każdym",
    en: "Add players (min. {min}), everyone plays everyone",
    de: "Spieler hinzufügen (min. {min}), jeder spielt gegen jeden",
    es: "Agrega jugadores (mín. {min}), todos juegan contra todos",
  },
  "tournament.playerName": { pl: "Imię gracza", en: "Player name", de: "Spielername", es: "Nombre del jugador" },
  "tournament.rounds": { pl: "Liczba rund", en: "Number of rounds", de: "Rundenanzahl", es: "Número de rondas" },
  "tournament.start": {
    pl: "Rozpocznij turniej ({count} meczy)",
    en: "Start tournament ({count} matches)",
    de: "Turnier starten ({count} Spiele)",
    es: "Iniciar torneo ({count} partidos)",
  },
  "tournament.saveExit": { pl: "Zapisz i wyjdź", en: "Save & exit", de: "Speichern & beenden", es: "Guardar y salir" },
  "tournament.matches": { pl: "meczy", en: "matches", de: "Spiele", es: "partidos" },
  "tournament.matchTree": { pl: "Drzewko meczy", en: "Match bracket", de: "Spielbaum", es: "Cuadro de partidos" },
  "tournament.round": { pl: "Runda", en: "Round", de: "Runde", es: "Ronda" },
  "tournament.play": { pl: "Graj", en: "Play", de: "Spielen", es: "Jugar" },
  "tournament.winsTournament": {
    pl: "🏆 {name} wygrywa turniej!",
    en: "🏆 {name} wins the tournament!",
    de: "🏆 {name} gewinnt das Turnier!",
    es: "🏆 ¡{name} gana el torneo!",
  },
  "tournament.end": { pl: "Zakończ turniej", en: "End tournament", de: "Turnier beenden", es: "Finalizar torneo" },
  "tournament.draw": { pl: "remis", en: "draw", de: "unentschieden", es: "empate" },

  // Table headers
  "table.player": { pl: "Gracz", en: "Player", de: "Spieler", es: "Jugador" },
  "table.wins": { pl: "W", en: "W", de: "S", es: "V" },
  "table.draws": { pl: "R", en: "D", de: "U", es: "E" },
  "table.losses": { pl: "P", en: "L", de: "N", es: "D" },
  "table.points": { pl: "Pkt", en: "Pts", de: "Pkt", es: "Pts" },
  "table.total": { pl: "Σ", en: "Σ", de: "Σ", es: "Σ" },

  // Game history
  "history.title": { pl: "Tablica wyników", en: "Scoreboard", de: "Bestenliste", es: "Tabla de resultados" },
  "history.games": { pl: "Gry", en: "Games", de: "Spiele", es: "Juegos" },
  "history.winsCount": { pl: "Wygrane", en: "Wins", de: "Siege", es: "Victorias" },
  "history.drawsCount": { pl: "Remisy", en: "Draws", de: "Unentschieden", es: "Empates" },
  "history.topPlayers": { pl: "Najlepsi gracze", en: "Top players", de: "Beste Spieler", es: "Mejores jugadores" },
  "history.gameHistory": { pl: "Historia gier", en: "Game history", de: "Spielverlauf", es: "Historial de juegos" },
  "history.import": { pl: "Import", en: "Import", de: "Import", es: "Importar" },
  "history.export": { pl: "Eksport", en: "Export", de: "Export", es: "Exportar" },
  "history.clear": { pl: "Wyczyść", en: "Clear", de: "Löschen", es: "Borrar" },
  "history.noGames": { pl: "Brak rozegranych partii", en: "No games played", de: "Keine Spiele gespielt", es: "No hay partidas jugadas" },
  "history.modeSingle": { pl: "Pojedyncza", en: "Single", de: "Einzelspiel", es: "Individual" },
  "history.modeDuel": { pl: "1 vs 1", en: "1 vs 1", de: "1 vs 1", es: "1 vs 1" },
  "history.modeTournament": { pl: "Turniej", en: "Tournament", de: "Turnier", es: "Torneo" },

  // Game rules
  "rules.title": { pl: "Zasady gry", en: "Game rules", de: "Spielregeln", es: "Reglas del juego" },
  "rules.board": { pl: "Plansza", en: "Board", de: "Spielfeld", es: "Tablero" },
  "rules.boardDesc": {
    pl: "Gra toczy się na planszy 12×12 pól.",
    en: "The game is played on a 12×12 board.",
    de: "Das Spiel wird auf einem 12×12-Feld gespielt.",
    es: "El juego se juega en un tablero de 12×12.",
  },
  "rules.firstMove": { pl: "Pierwszy ruch", en: "First move", de: "Erster Zug", es: "Primer movimiento" },
  "rules.firstMoveDesc": {
    pl: "Pierwszy ruch musi być wykonany na jednym z 4 środkowych pól planszy (podświetlone na starcie).",
    en: "The first move must be made on one of the 4 center squares (highlighted at start).",
    de: "Der erste Zug muss auf einem der 4 mittleren Felder gemacht werden (beim Start hervorgehoben).",
    es: "El primer movimiento debe hacerse en una de las 4 casillas centrales (resaltadas al inicio).",
  },
  "rules.goal": { pl: "Cel gry", en: "Goal", de: "Spielziel", es: "Objetivo" },
  "rules.goalDesc": {
    pl: "Wygrywa gracz, który jako pierwszy ułoży 5 swoich znaków w linii — poziomo, pionowo lub po skosie.",
    en: "The first player to align 5 marks in a row — horizontally, vertically, or diagonally — wins.",
    de: "Der erste Spieler, der 5 Zeichen in einer Reihe — horizontal, vertikal oder diagonal — bildet, gewinnt.",
    es: "Gana el primer jugador que alinee 5 marcas — horizontal, vertical o diagonalmente.",
  },
  "rules.undo": { pl: "Cofanie ruchu", en: "Undo move", de: "Zug rückgängig", es: "Deshacer movimiento" },
  "rules.undoDesc": {
    pl: "Można cofnąć ostatni ruch (w grze z AI cofane są 2 ruchy).",
    en: "You can undo the last move (in AI games, 2 moves are undone).",
    de: "Der letzte Zug kann rückgängig gemacht werden (bei KI-Spielen werden 2 Züge rückgängig gemacht).",
    es: "Puedes deshacer el último movimiento (en juegos con IA, se deshacen 2 movimientos).",
  },
  "rules.drawRule": { pl: "Remis", en: "Draw", de: "Remis", es: "Empate" },
  "rules.drawRuleDesc": {
    pl: "Gracze mogą w dowolnym momencie ogłosić remis za obopólną zgodą.",
    en: "Players can declare a draw by mutual agreement at any time.",
    de: "Die Spieler können jederzeit einvernehmlich ein Remis erklären.",
    es: "Los jugadores pueden declarar empate por acuerdo mutuo en cualquier momento.",
  },
  "rules.swap": { pl: "Zmiana stron", en: "Side swap", de: "Seitenwechsel", es: "Cambio de lados" },
  "rules.swapDesc": {
    pl: "Po zakończeniu partii i resecie planszy gracze automatycznie zamieniają się znakami (X ↔ O).",
    en: "After the game ends and the board resets, players automatically swap marks (X ↔ O).",
    de: "Nach Spielende und Brett-Reset tauschen die Spieler automatisch ihre Zeichen (X ↔ O).",
    es: "Al finalizar la partida y reiniciar el tablero, los jugadores intercambian marcas automáticamente (X ↔ O).",
  },
  "rules.back": { pl: "Powrót", en: "Back", de: "Zurück", es: "Volver" },

  // Reversi rules
  "rules.reversiTitle": { pl: "Zasady Reversi", en: "Reversi rules", de: "Reversi-Regeln", es: "Reglas de Reversi" },
  "rules.fiveStrikeTitle": { pl: "Zasady Five Strike", en: "Five Strike rules", de: "Five Strike-Regeln", es: "Reglas de Five Strike" },
  "rules.reversiBoard": { pl: "Plansza", en: "Board", de: "Spielfeld", es: "Tablero" },
  "rules.reversiBoardDesc": {
    pl: "Gra toczy się na planszy 8×8. Na starcie 4 pionki (2 czarne, 2 białe) stoją na środku planszy.",
    en: "The game is played on an 8×8 board. At the start, 4 discs (2 black, 2 white) are placed in the center.",
    de: "Das Spiel wird auf einem 8×8-Brett gespielt. Zu Beginn stehen 4 Steine (2 schwarze, 2 weiße) in der Mitte.",
    es: "El juego se juega en un tablero 8×8. Al inicio, 4 fichas (2 negras, 2 blancas) están en el centro.",
  },
  "rules.reversiMoves": { pl: "Wykonywanie ruchu", en: "Making a move", de: "Zug ausführen", es: "Hacer un movimiento" },
  "rules.reversiMovesDesc": {
    pl: "Stawiasz pionek tak, aby zamknąć w linii (poziomo, pionowo lub po skosie) co najmniej jeden pionek przeciwnika między swoim nowym a istniejącym pionkiem. Otoczone pionki zostają odwrócone na Twój kolor.",
    en: "Place a disc so that at least one opponent disc is flanked in a line (horizontally, vertically, or diagonally) between your new disc and an existing one. Flanked discs are flipped to your color.",
    de: "Setze einen Stein so, dass mindestens ein gegnerischer Stein in einer Linie (horizontal, vertikal oder diagonal) eingeschlossen wird. Eingeschlossene Steine werden umgedreht.",
    es: "Coloca una ficha de modo que al menos una ficha rival quede flanqueada en línea (horizontal, vertical o diagonal). Las fichas flanqueadas se voltean a tu color.",
  },
  "rules.reversiPass": { pl: "Pas", en: "Pass", de: "Passen", es: "Pasar" },
  "rules.reversiPassDesc": {
    pl: "Jeśli nie masz żadnego legalnego ruchu, Twoja tura jest automatycznie pomijana.",
    en: "If you have no legal moves, your turn is automatically skipped.",
    de: "Wenn du keinen gültigen Zug hast, wird dein Zug automatisch übersprungen.",
    es: "Si no tienes movimientos legales, tu turno se salta automáticamente.",
  },
  "rules.reversiGoal": { pl: "Cel gry", en: "Goal", de: "Spielziel", es: "Objetivo" },
  "rules.reversiGoalDesc": {
    pl: "Gra kończy się, gdy żaden gracz nie może wykonać ruchu. Wygrywa ten, kto ma więcej pionków na planszy.",
    en: "The game ends when neither player can move. The player with more discs on the board wins.",
    de: "Das Spiel endet, wenn kein Spieler mehr ziehen kann. Der Spieler mit mehr Steinen gewinnt.",
    es: "El juego termina cuando ningún jugador puede mover. Gana quien tenga más fichas en el tablero.",
  },
  "rules.reversiStrategy": { pl: "Strategia", en: "Strategy", de: "Strategie", es: "Estrategia" },
  "rules.reversiStrategyDesc": {
    pl: "Narożniki są najcenniejsze — nie da się ich odwrócić. Unikaj pól obok narożników, bo ułatwiasz przeciwnikowi ich zajęcie.",
    en: "Corners are the most valuable — they can never be flipped. Avoid squares next to corners, as they help your opponent capture them.",
    de: "Ecken sind am wertvollsten — sie können nie umgedreht werden. Vermeide Felder neben Ecken, da sie dem Gegner helfen, sie zu besetzen.",
    es: "Las esquinas son las más valiosas — no se pueden voltear. Evita las casillas junto a las esquinas, ya que ayudan al rival a capturarlas.",
  },

  // Navigation
  "nav.menu": { pl: "Menu", en: "Menu", de: "Menü", es: "Menú" },
  "nav.back": { pl: "Powrót", en: "Back", de: "Zurück", es: "Volver" },

  // Reversi
  "reversi.subtitle": {
    pl: "Plansza 8×8 · Odwracaj pionki",
    en: "8×8 Board · Flip the discs",
    de: "8×8 Brett · Steine umdrehen",
    es: "Tablero 8×8 · Voltea las fichas",
  },
  "reversi.playerBlack": {
    pl: "Gracz Czarny", en: "Black player", de: "Spieler Schwarz", es: "Jugador Negro",
  },
  "reversi.playerWhite": {
    pl: "Gracz Biały", en: "White player", de: "Spieler Weiß", es: "Jugador Blanco",
  },
  "reversi.noMoves": {
    pl: "{name} nie ma ruchów — pas!",
    en: "{name} has no moves — pass!",
    de: "{name} hat keine Züge — passen!",
    es: "¡{name} no tiene movimientos — pasa!",
  },
  "game.selectGame": {
    pl: "Wybierz grę", en: "Select game", de: "Spiel wählen", es: "Seleccionar juego",
  },

  // Galaga
  "galaga.score": { pl: "Wynik", en: "Score", de: "Punkte", es: "Puntos" },
  "galaga.controls": {
    pl: "Dotknij ekranu lub użyj strzałek + spacji",
    en: "Touch the screen or use arrow keys + space",
    de: "Bildschirm berühren oder Pfeiltasten + Leertaste",
    es: "Toca la pantalla o usa las flechas + espacio",
  },
  "galaga.start": { pl: "Start", en: "Start", de: "Start", es: "Inicio" },
  "galaga.retry": { pl: "Jeszcze raz", en: "Retry", de: "Nochmal", es: "Reintentar" },
  "galaga.levelComplete": { pl: "Poziom ukończony!", en: "Level complete!", de: "Level geschafft!", es: "¡Nivel completado!" },
  "galaga.nextLevel": { pl: "Następny poziom", en: "Next level", de: "Nächstes Level", es: "Siguiente nivel" },
  "galaga.moveKeys": { pl: "ruch", en: "move", de: "bewegen", es: "mover" },
  "galaga.shootKey": { pl: "strzał", en: "shoot", de: "schießen", es: "disparar" },
  "menu.galaga": { pl: "Galaga", en: "Galaga", de: "Galaga", es: "Galaga" },
} as const;

type TranslationKey = keyof typeof translations;

function detectLanguage(): Lang {
  const saved = localStorage.getItem(LANG_KEY);
  if (saved && ["pl", "en", "de", "es"].includes(saved)) return saved as Lang;

  const browserLang = navigator.language.split("-")[0].toLowerCase();
  if (browserLang === "pl") return "pl";
  if (browserLang === "de") return "de";
  if (browserLang === "es") return "es";
  return "en";
}

let currentLang: Lang = detectLanguage();
const listeners = new Set<() => void>();

export function getLang(): Lang {
  return currentLang;
}

export function setLang(lang: Lang) {
  currentLang = lang;
  localStorage.setItem(LANG_KEY, lang);
  listeners.forEach((fn) => fn());
}

export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  const entry = translations[key];
  let text: string = (entry as any)?.[currentLang] ?? (entry as any)?.["en"] ?? key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v));
    });
  }
  return text;
}

export function useLang(): [Lang, (lang: Lang) => void] {
  const [, setTick] = useState(0);
  useEffect(() => {
    const update = () => setTick((t) => t + 1);
    listeners.add(update);
    return () => { listeners.delete(update); };
  }, []);
  return [currentLang, setLang];
}

export const LANG_OPTIONS: { code: Lang; label: string; flag: string }[] = [
  { code: "pl", label: "Polski", flag: "🇵🇱" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];
