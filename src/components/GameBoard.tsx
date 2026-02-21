import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Undo2, Bot, Handshake } from "lucide-react";
import { getAIMove } from "@/lib/ai";
import { playPlaceX, playPlaceO, playWin, playDraw } from "@/lib/sounds";
import { t, useLang } from "@/lib/i18n";
import winTrophy from "@/assets/win-trophy.png";

const BOARD_SIZE = 12;
const WIN_LENGTH = 5;

type Cell = "X" | "O" | null;
type Move = { row: number; col: number; player: Cell };

export type GameResult = { winner: string | null; isDraw: boolean };

export interface BoardState {
  board: Cell[][];
  isXTurn: boolean;
  history: Move[];
}

interface GameBoardProps {
  playerX: string;
  playerO: string;
  isAI?: boolean;
  initialState?: BoardState;
  onGameEnd?: (result: GameResult) => void;
  onBack?: () => void;
  onSave?: (state: BoardState) => void;
  onExit?: () => void;
}

const getWinLine = (board: Cell[][], row: number, col: number, player: Cell): [number, number][] | null => {
  if (!player) return null;
  const directions: [number, number][] = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (const [dr, dc] of directions) {
    const cells: [number, number][] = [[row, col]];
    for (let i = 1; i < WIN_LENGTH; i++) {
      const r = row + dr * i, c = col + dc * i;
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE || board[r][c] !== player) break;
      cells.push([r, c]);
    }
    for (let i = 1; i < WIN_LENGTH; i++) {
      const r = row - dr * i, c = col - dc * i;
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE || board[r][c] !== player) break;
      cells.unshift([r, c]);
    }
    if (cells.length >= WIN_LENGTH) return cells;
  }
  return null;
};

const GameBoard = ({ playerX, playerO, isAI = false, initialState, onGameEnd, onBack, onSave, onExit }: GameBoardProps) => {
  const [lang] = useLang();
  const [board, setBoard] = useState<Cell[][]>(() =>
    initialState?.board ?? Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null))
  );
  const [isXTurn, setIsXTurn] = useState(initialState?.isXTurn ?? true);
  const [winner, setWinner] = useState<Cell>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [history, setHistory] = useState<Move[]>(initialState?.history ?? []);
  const [winLine, setWinLine] = useState<Set<string>>(new Set());
  const [gameEnded, setGameEnded] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [swapped, setSwapped] = useState(false);

  const displayX = swapped ? playerO : playerX;
  const displayO = swapped ? playerX : playerO;
  const currentPlayerName = isXTurn ? displayX : displayO;
  const winnerName = winner === "X" ? displayX : winner === "O" ? displayO : null;

  const placeMove = useCallback((row: number, col: number, currentBoard: Cell[][], xTurn: boolean) => {
    const newBoard = currentBoard.map((r) => [...r]);
    const player: Cell = xTurn ? "X" : "O";
    newBoard[row][col] = player;
    if (player === "X") playPlaceX(); else playPlaceO();
    setBoard(newBoard);
    setHistory((prev) => [...prev, { row, col, player }]);
    const line = getWinLine(newBoard, row, col, player);
    if (line) {
      setWinner(player);
      setWinLine(new Set(line.map(([r, c]) => `${r}-${c}`)));
      setTimeout(playWin, 150);
    } else if (newBoard.every((r) => r.every((c) => c !== null))) {
      setIsDraw(true);
      setTimeout(playDraw, 150);
    } else {
      setIsXTurn(!xTurn);
    }
    return newBoard;
  }, []);

  const centerCells = useMemo(() => {
    const mid = Math.floor(BOARD_SIZE / 2);
    return new Set([`${mid-1}-${mid-1}`, `${mid-1}-${mid}`, `${mid}-${mid-1}`, `${mid}-${mid}`]);
  }, []);

  const isFirstMove = history.length === 0;

  const handleClick = useCallback((row: number, col: number) => {
    if (board[row][col] || winner || aiThinking) return;
    if (isAI && !isXTurn) return;
    if (isFirstMove && !centerCells.has(`${row}-${col}`)) return;
    placeMove(row, col, board, isXTurn);
  }, [board, isXTurn, winner, aiThinking, isAI, placeMove, isFirstMove, centerCells]);

  const aiThinkingRef = useRef(false);

  useEffect(() => {
    if (!isAI || isXTurn || winner || isDraw || aiThinkingRef.current) return;
    aiThinkingRef.current = true;
    setAiThinking(true);
    const timeout = setTimeout(() => {
      const boardCopy = board.map((r) => [...r]);
      const [ar, ac] = getAIMove(boardCopy, "O");
      placeMove(ar, ac, board, false);
      aiThinkingRef.current = false;
      setAiThinking(false);
    }, 400);
    return () => { clearTimeout(timeout); aiThinkingRef.current = false; };
  }, [isAI, isXTurn, winner, isDraw, board, placeMove]);

  const undo = useCallback(() => {
    if (history.length === 0 || winner) return;
    let stepsBack = isAI && history.length >= 2 ? 2 : 1;
    if (isAI && history.length < 2) stepsBack = 1;
    const newHistory = [...history];
    const newBoard = board.map((r) => [...r]);
    for (let i = 0; i < stepsBack && newHistory.length > 0; i++) {
      const lastMove = newHistory.pop()!;
      newBoard[lastMove.row][lastMove.col] = null;
    }
    setBoard(newBoard);
    setHistory(newHistory);
    setIsXTurn(true);
    if (!isAI && newHistory.length > 0) {
      const last = newHistory[newHistory.length - 1];
      setIsXTurn(last.player === "O");
    } else if (!isAI && newHistory.length === 0) {
      setIsXTurn(true);
    }
    setIsDraw(false);
  }, [history, board, winner, isAI]);

  const reset = () => {
    setBoard(Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null)));
    setIsXTurn(true);
    setWinner(null);
    setIsDraw(false);
    setHistory([]);
    setWinLine(new Set());
    setGameEnded(false);
    setAiThinking(false);
    if (!isAI) setSwapped((s) => !s);
  };

  const autoConfirm = !onBack && !!onGameEnd;

  const handleConfirmResult = useCallback(() => {
    if (!gameEnded && (winner || isDraw)) {
      setGameEnded(true);
      onGameEnd?.({ winner: winnerName, isDraw });
    }
  }, [gameEnded, winner, isDraw, winnerName, onGameEnd]);

  useEffect(() => {
    if (autoConfirm && (winner || isDraw) && !gameEnded) {
      handleConfirmResult();
    }
  }, [autoConfirm, winner, isDraw, gameEnded, handleConfirmResult]);

  const declareDraw = () => {
    if (!winner && !isDraw && history.length > 0) {
      setIsDraw(true);
      setTimeout(playDraw, 150);
    }
  };

  const handleSaveAndExit = () => {
    if (!winner && !isDraw && history.length > 0) {
      onSave?.({ board, isXTurn, history });
    }
    onExit?.();
  };

  const isWinCell = (ri: number, ci: number) => winLine.has(`${ri}-${ci}`);

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6 w-full px-2 sm:px-0">
      <div className="flex justify-between w-full max-w-[540px] text-sm font-bold">
        <span style={{ color: "hsl(var(--primary))", textShadow: "var(--neon-glow)" }}>
          ✕ {displayX}
        </span>
        <span className="flex items-center gap-1" style={{ color: "hsl(var(--secondary))", textShadow: "var(--neon-glow-secondary)" }}>
          ○ {displayO} {isAI && <Bot className="w-4 h-4" />}
        </span>
      </div>

      <div className="text-center">
        {winner ? (
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }} className="flex flex-col items-center gap-2">
            <motion.img src={winTrophy} alt="Winner!" className="w-16 h-16 sm:w-20 sm:h-20" animate={{ rotate: [0, -5, 5, -5, 0] }} transition={{ duration: 0.5, delay: 0.3 }} />
            <h2 className="text-lg sm:text-2xl font-bold" style={{ color: winner === "X" ? "hsl(var(--primary))" : "hsl(var(--secondary))", textShadow: winner === "X" ? "var(--neon-glow)" : "var(--neon-glow-secondary)" }}>
              {winnerName} {t("game.wins")}
            </h2>
          </motion.div>
        ) : isDraw ? (
          <motion.h2 initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }} className="text-2xl sm:text-3xl font-bold text-accent" style={{ textShadow: "var(--neon-glow-accent)" }}>
            {t("game.draw")}
          </motion.h2>
        ) : aiThinking ? (
          <h2 className="text-xl sm:text-2xl font-bold text-secondary animate-pulse" style={{ textShadow: "var(--neon-glow-secondary)" }}>
            {t("game.aiThinking")}
          </h2>
        ) : (
          <h2 className="text-xl sm:text-2xl font-bold">
            {t("game.turn")}{" "}
            <span style={{ color: isXTurn ? "hsl(var(--primary))" : "hsl(var(--secondary))", textShadow: isXTurn ? "var(--neon-glow)" : "var(--neon-glow-secondary)" }}>
              {currentPlayerName}
            </span>
          </h2>
        )}
      </div>

      <div
        className="grid gap-[1px] bg-primary/30 p-[1px] rounded-lg border border-primary/20 w-full max-w-[540px]"
        style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`, boxShadow: "var(--neon-glow)" }}
      >
        {board.map((row, ri) =>
          row.map((cell, ci) => {
            const isWin = isWinCell(ri, ci);
            return (
              <button
                key={`${ri}-${ci}`}
                onClick={() => handleClick(ri, ci)}
                disabled={!!winner || !!cell || aiThinking || (isFirstMove && !centerCells.has(`${ri}-${ci}`))}
                className={`aspect-square w-full bg-card border border-border/50 flex items-center justify-center text-[10px] sm:text-base font-bold transition-all duration-150 hover:bg-muted hover:border-primary/40 disabled:cursor-default relative ${isWin ? "z-10" : ""} ${isFirstMove && !cell && centerCells.has(`${ri}-${ci}`) ? "bg-primary/10 border-primary/40" : ""}`}
                style={cell ? {
                  color: cell === "X" ? "hsl(var(--primary))" : "hsl(var(--secondary))",
                  textShadow: cell === "X" ? "var(--neon-glow)" : "var(--neon-glow-secondary)",
                  ...(isWin ? {
                    backgroundColor: cell === "X" ? "hsl(180 100% 50% / 0.15)" : "hsl(320 100% 60% / 0.15)",
                    boxShadow: cell === "X" ? "inset 0 0 12px hsl(180 100% 50% / 0.4)" : "inset 0 0 12px hsl(320 100% 60% / 0.4)",
                    borderColor: cell === "X" ? "hsl(180 100% 50% / 0.6)" : "hsl(320 100% 60% / 0.6)",
                  } : {}),
                } : {}}
              >
                <AnimatePresence>
                  {cell && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={isWin ? { scale: [0, 1.3, 1], opacity: 1 } : { scale: [0, 1.2, 1], opacity: 1 }}
                      transition={{ duration: isWin ? 0.4 : 0.2, ease: "easeOut" }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      {cell}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })
        )}
      </div>

      <div className="flex gap-2 flex-wrap justify-center">
        <button onClick={undo} disabled={history.length === 0 || !!winner || aiThinking}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-foreground font-bold tracking-wider uppercase text-xs hover:bg-border transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
          <Undo2 className="w-4 h-4" /> {t("game.undo")}
        </button>
        <button onClick={reset} className="px-3 py-2 rounded-lg bg-muted text-foreground font-bold tracking-wider uppercase text-xs hover:bg-border transition-colors">
          {t("game.restart")}
        </button>
        {!winner && !isDraw && history.length > 0 && (
          <button onClick={declareDraw} disabled={aiThinking}
            className="flex items-center gap-2 px-3 py-2 rounded-lg font-bold tracking-wider uppercase text-xs transition-colors"
            style={{ backgroundColor: "hsl(var(--accent) / 0.15)", border: "1px solid hsl(var(--accent) / 0.4)", color: "hsl(var(--accent))" }}>
            <Handshake className="w-4 h-4" /> {t("game.declareDraw")}
          </button>
        )}
        {onExit && (
          <button onClick={() => { if (onSave && history.length > 0 && !winner && !isDraw) { onSave({ board, isXTurn, history }); } onExit(); }}
            className="px-3 py-2 rounded-lg bg-muted text-foreground font-bold tracking-wider uppercase text-xs hover:bg-border transition-colors">
            {t("game.menu")}
          </button>
        )}
        {(winner || isDraw) && onGameEnd && !gameEnded && (
          <button onClick={handleConfirmResult}
            className="px-3 py-2 rounded-lg font-bold tracking-wider uppercase text-xs transition-colors"
            style={{ backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", boxShadow: "var(--neon-glow)" }}>
            {t("game.confirmResult")}
          </button>
        )}
        {onBack && gameEnded && (
          <button onClick={onBack}
            className="px-3 py-2 rounded-lg font-bold tracking-wider uppercase text-xs transition-colors"
            style={{ backgroundColor: "hsl(var(--accent))", color: "hsl(var(--accent-foreground))", boxShadow: "var(--neon-glow-accent)" }}>
            {t("game.backToTournament")}
          </button>
        )}
      </div>
    </div>
  );
};

export default GameBoard;
