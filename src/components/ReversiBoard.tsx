import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Undo2, Bot } from "lucide-react";
import {
  createInitialBoard,
  getValidMoves,
  applyMove,
  countDiscs,
  isGameOver,
  ReversiCell,
  ReversiPlayer,
  ReversiMove,
  ReversiBoardState,
  REVERSI_SIZE,
} from "@/lib/reversi";
import { getReversiAIMove } from "@/lib/reversi-ai";
import { playPlaceX, playPlaceO, playWin, playDraw } from "@/lib/sounds";
import { t, useLang } from "@/lib/i18n";
import { useTheme, getThemeConfig } from "@/lib/theme";

export type { ReversiBoardState };
export type GameResult = { winner: string | null; isDraw: boolean };

interface ReversiBoardProps {
  playerX: string; // Black
  playerO: string; // White
  isAI?: boolean;
  initialState?: ReversiBoardState;
  onGameEnd?: (result: GameResult) => void;
  onBack?: () => void;
  onSave?: (state: ReversiBoardState) => void;
  onExit?: () => void;
}

const ReversiBoard = ({
  playerX,
  playerO,
  isAI = false,
  initialState,
  onGameEnd,
  onBack,
  onSave,
  onExit,
}: ReversiBoardProps) => {
  const [lang] = useLang();
  const [themeId] = useTheme();
  const theme = getThemeConfig(themeId);

  const [board, setBoard] = useState<ReversiCell[][]>(
    () => initialState?.board ?? createInitialBoard()
  );
  const [currentPlayer, setCurrentPlayer] = useState<ReversiPlayer>(
    initialState?.currentPlayer ?? "B"
  );
  const [history, setHistory] = useState<ReversiMove[]>(
    initialState?.history ?? []
  );
  const [gameOver, setGameOver] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [passMessage, setPassMessage] = useState<string | null>(null);
  const [lastPlaced, setLastPlaced] = useState<string | null>(null);
  const [lastFlipped, setLastFlipped] = useState<Set<string>>(new Set());

  const validMoves = useMemo(
    () => (gameOver ? [] : getValidMoves(board, currentPlayer)),
    [board, currentPlayer, gameOver]
  );
  const validMoveSet = useMemo(
    () => new Set(validMoves.map(([r, c]) => `${r}-${c}`)),
    [validMoves]
  );

  const counts = useMemo(() => countDiscs(board), [board]);

  const displayBlack = playerX;
  const displayWhite = playerO;

  const getWinnerName = useCallback(() => {
    if (counts.B > counts.W) return displayBlack;
    if (counts.W > counts.B) return displayWhite;
    return null;
  }, [counts, displayBlack, displayWhite]);

  // Handle pass: if current player has no moves but opponent does
  useEffect(() => {
    if (gameOver || aiThinking) return;
    if (validMoves.length === 0) {
      const opponent: ReversiPlayer = currentPlayer === "B" ? "W" : "B";
      const oppMoves = getValidMoves(board, opponent);
      if (oppMoves.length > 0) {
        const passPlayerName = currentPlayer === "B" ? displayBlack : displayWhite;
        setPassMessage(t("reversi.noMoves", { name: passPlayerName }));
        const timeout = setTimeout(() => {
          setPassMessage(null);
          setCurrentPlayer(opponent);
        }, 1500);
        return () => clearTimeout(timeout);
      } else {
        // Neither player can move - game over
        setGameOver(true);
        if (counts.B !== counts.W) setTimeout(playWin, 150);
        else setTimeout(playDraw, 150);
      }
    }
  }, [validMoves, board, currentPlayer, gameOver, aiThinking, counts, displayBlack, displayWhite]);

  const placeDisc = useCallback(
    (row: number, col: number, player: ReversiPlayer, currentBoard: ReversiCell[][]) => {
      const { newBoard, flipped } = applyMove(currentBoard, row, col, player);
      if (player === "B") playPlaceX();
      else playPlaceO();

      setBoard(newBoard);
      setLastPlaced(`${row}-${col}`);
      setLastFlipped(new Set(flipped.map(([r, c]) => `${r}-${c}`)));
      setHistory((prev) => [...prev, { row, col, player, flipped }]);

      // Check if game is over
      const opponent: ReversiPlayer = player === "B" ? "W" : "B";
      if (isGameOver(newBoard)) {
        setGameOver(true);
        const disc = countDiscs(newBoard);
        if (disc.B !== disc.W) setTimeout(playWin, 150);
        else setTimeout(playDraw, 150);
      } else {
        setCurrentPlayer(opponent);
      }

      return newBoard;
    },
    []
  );

  const handleClick = useCallback(
    (row: number, col: number) => {
      if (gameOver || aiThinking || passMessage) return;
      if (isAI && currentPlayer === "W") return;
      if (!validMoveSet.has(`${row}-${col}`)) return;
      placeDisc(row, col, currentPlayer, board);
    },
    [board, currentPlayer, gameOver, aiThinking, isAI, validMoveSet, placeDisc, passMessage]
  );

  // AI move
  const aiThinkingRef = useRef(false);
  useEffect(() => {
    if (!isAI || currentPlayer !== "W" || gameOver || aiThinkingRef.current || passMessage) return;
    const moves = getValidMoves(board, "W");
    if (moves.length === 0) return;

    aiThinkingRef.current = true;
    setAiThinking(true);
    const timeout = setTimeout(() => {
      const [ar, ac] = getReversiAIMove(board, "W");
      placeDisc(ar, ac, "W", board);
      aiThinkingRef.current = false;
      setAiThinking(false);
    }, 400);
    return () => {
      clearTimeout(timeout);
      aiThinkingRef.current = false;
    };
  }, [isAI, currentPlayer, gameOver, board, placeDisc, passMessage]);

  const undo = useCallback(() => {
    if (history.length === 0 || gameOver) return;
    const stepsBack = isAI && history.length >= 2 ? 2 : 1;
    const newHistory = [...history];
    let newBoard = board.map((r) => [...r]);

    for (let i = 0; i < stepsBack && newHistory.length > 0; i++) {
      const last = newHistory.pop()!;
      newBoard[last.row][last.col] = null;
      const opponent: ReversiPlayer = last.player === "B" ? "W" : "B";
      for (const [fr, fc] of last.flipped) {
        newBoard[fr][fc] = opponent;
      }
    }

    setBoard(newBoard);
    setHistory(newHistory);
    setLastPlaced(null);
    setLastFlipped(new Set());
    if (newHistory.length > 0) {
      const lastMove = newHistory[newHistory.length - 1];
      setCurrentPlayer(lastMove.player === "B" ? "W" : "B");
    } else {
      setCurrentPlayer("B");
    }
  }, [history, board, gameOver, isAI]);

  const reset = () => {
    setBoard(createInitialBoard());
    setCurrentPlayer("B");
    setHistory([]);
    setGameOver(false);
    setGameEnded(false);
    setAiThinking(false);
    setPassMessage(null);
    setLastPlaced(null);
    setLastFlipped(new Set());
  };

  const autoConfirm = !onBack && !!onGameEnd;

  const handleConfirmResult = useCallback(() => {
    if (!gameEnded && gameOver) {
      setGameEnded(true);
      const winnerName = getWinnerName();
      onGameEnd?.({ winner: winnerName, isDraw: winnerName === null });
    }
  }, [gameEnded, gameOver, getWinnerName, onGameEnd]);

  useEffect(() => {
    if (autoConfirm && gameOver && !gameEnded) {
      handleConfirmResult();
    }
  }, [autoConfirm, gameOver, gameEnded, handleConfirmResult]);

  const handleSaveAndExit = () => {
    if (!gameOver && history.length > 0) {
      onSave?.({ board, currentPlayer, history });
    }
    onExit?.();
  };

  const currentPlayerName = currentPlayer === "B" ? displayBlack : displayWhite;
  const winnerName = getWinnerName();

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6 w-full px-2 sm:px-0">
      {/* Player labels */}
      <div className="flex justify-between w-full max-w-[400px] text-sm font-bold">
        <span className="flex items-center gap-2" style={{ color: "hsl(var(--primary))", textShadow: "var(--neon-glow)" }}>
          <span className="w-4 h-4 rounded-full inline-block" style={{ backgroundColor: "hsl(var(--primary))" }} />
          {displayBlack}: {counts.B}
        </span>
        <span className="flex items-center gap-2" style={{ color: "hsl(var(--secondary))", textShadow: "var(--neon-glow-secondary)" }}>
          {displayWhite}: {counts.W} {isAI && <Bot className="w-4 h-4" />}
          <span className="w-4 h-4 rounded-full inline-block" style={{ backgroundColor: "hsl(var(--secondary))" }} />
        </span>
      </div>

      {/* Status */}
      <div className="text-center min-h-[3rem]">
        {gameOver ? (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="flex flex-col items-center gap-2"
          >
            <motion.img
              src={theme.winImage}
              alt="Victory!"
              className="w-16 h-16 sm:w-20 sm:h-20"
              animate={{ rotate: [0, -5, 5, -5, 0] }}
              transition={{ duration: 0.5, delay: 0.3 }}
            />
            <h2
              className="text-lg sm:text-2xl font-bold"
              style={{
                color: winnerName
                  ? winnerName === displayBlack
                    ? "hsl(var(--primary))"
                    : "hsl(var(--secondary))"
                  : "hsl(var(--accent))",
                textShadow: winnerName
                  ? winnerName === displayBlack
                    ? "var(--neon-glow)"
                    : "var(--neon-glow-secondary)"
                  : "var(--neon-glow-accent)",
              }}
            >
              {winnerName ? `${winnerName} ${t("game.wins")}` : t("game.draw")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {counts.B} – {counts.W}
            </p>
          </motion.div>
        ) : passMessage ? (
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-base sm:text-lg font-bold text-accent"
            style={{ textShadow: "var(--neon-glow-accent)" }}
          >
            {passMessage}
          </motion.h2>
        ) : aiThinking ? (
          <h2
            className="text-xl sm:text-2xl font-bold text-secondary animate-pulse"
            style={{ textShadow: "var(--neon-glow-secondary)" }}
          >
            {t("game.aiThinking")}
          </h2>
        ) : (
          <h2 className="text-xl sm:text-2xl font-bold">
            {t("game.turn")}{" "}
            <span
              style={{
                color: currentPlayer === "B" ? "hsl(var(--primary))" : "hsl(var(--secondary))",
                textShadow: currentPlayer === "B" ? "var(--neon-glow)" : "var(--neon-glow-secondary)",
              }}
            >
              {currentPlayerName}
            </span>
          </h2>
        )}
      </div>

      {/* Board */}
      <div
        className="grid gap-[2px] bg-primary/30 p-[2px] rounded-lg border border-primary/20 w-full max-w-[400px]"
        style={{
          gridTemplateColumns: `repeat(${REVERSI_SIZE}, 1fr)`,
          boxShadow: "var(--neon-glow)",
        }}
      >
        {board.map((row, ri) =>
          row.map((cell, ci) => {
            const key = `${ri}-${ci}`;
            const isValid = validMoveSet.has(key);
            const isLast = lastPlaced === key;
            const wasFlipped = lastFlipped.has(key);

            return (
              <button
                key={key}
                onClick={() => handleClick(ri, ci)}
                disabled={gameOver || aiThinking || !!passMessage}
                className={`aspect-square w-full bg-card border border-border/30 flex items-center justify-center transition-all duration-150 relative ${
                  isValid && !gameOver
                    ? "hover:bg-muted cursor-pointer"
                    : "cursor-default"
                }`}
                style={{
                  ...(isLast
                    ? {
                        boxShadow:
                          cell === "B"
                            ? "inset 0 0 10px hsl(var(--primary) / 0.4)"
                            : "inset 0 0 10px hsl(var(--secondary) / 0.4)",
                      }
                    : {}),
                }}
              >
                <AnimatePresence>
                  {cell && (
                    <motion.div
                      initial={isLast || wasFlipped ? { scale: 0, rotateY: 180 } : false}
                      animate={{ scale: 1, rotateY: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="w-[70%] h-[70%] rounded-full"
                      style={{
                        backgroundColor:
                          cell === "B"
                            ? "hsl(var(--primary))"
                            : "hsl(var(--secondary))",
                        boxShadow:
                          cell === "B"
                            ? "0 2px 8px hsl(var(--primary) / 0.5), inset 0 -2px 4px hsl(0 0% 0% / 0.3)"
                            : "0 2px 8px hsl(var(--secondary) / 0.5), inset 0 -2px 4px hsl(0 0% 0% / 0.2)",
                      }}
                    />
                  )}
                </AnimatePresence>
                {/* Valid move indicator */}
                {isValid && !cell && !gameOver && !passMessage && (
                  <div
                    className="w-[30%] h-[30%] rounded-full opacity-40"
                    style={{
                      backgroundColor:
                        currentPlayer === "B"
                          ? "hsl(var(--primary))"
                          : "hsl(var(--secondary))",
                    }}
                  />
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2 flex-wrap justify-center">
        <button
          onClick={undo}
          disabled={history.length === 0 || gameOver || aiThinking}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-foreground font-bold tracking-wider uppercase text-xs hover:bg-border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Undo2 className="w-4 h-4" /> {t("game.undo")}
        </button>
        <button
          onClick={reset}
          className="px-3 py-2 rounded-lg bg-muted text-foreground font-bold tracking-wider uppercase text-xs hover:bg-border transition-colors"
        >
          {t("game.restart")}
        </button>
        {onExit && (
          <button
            onClick={handleSaveAndExit}
            className="px-3 py-2 rounded-lg bg-muted text-foreground font-bold tracking-wider uppercase text-xs hover:bg-border transition-colors"
          >
            {t("game.menu")}
          </button>
        )}
        {gameOver && onGameEnd && !gameEnded && (
          <button
            onClick={handleConfirmResult}
            className="px-3 py-2 rounded-lg font-bold tracking-wider uppercase text-xs transition-colors"
            style={{
              backgroundColor: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
              boxShadow: "var(--neon-glow)",
            }}
          >
            {t("game.confirmResult")}
          </button>
        )}
        {onBack && gameEnded && (
          <button
            onClick={onBack}
            className="px-3 py-2 rounded-lg font-bold tracking-wider uppercase text-xs transition-colors"
            style={{
              backgroundColor: "hsl(var(--accent))",
              color: "hsl(var(--accent-foreground))",
              boxShadow: "var(--neon-glow-accent)",
            }}
          >
            {t("game.backToTournament")}
          </button>
        )}
      </div>
    </div>
  );
};

export default ReversiBoard;
