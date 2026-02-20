import { useState, useCallback, useEffect, useRef } from "react";
import { Undo2, Bot, Save, Handshake } from "lucide-react";
import { getAIMove } from "@/lib/ai";
import { playPlaceX, playPlaceO, playWin, playDraw } from "@/lib/sounds";

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

  const handleClick = useCallback((row: number, col: number) => {
    if (board[row][col] || winner || aiThinking) return;
    if (isAI && !isXTurn) return;
    placeMove(row, col, board, isXTurn);
  }, [board, isXTurn, winner, aiThinking, isAI, placeMove]);

  useEffect(() => {
    if (!isAI || isXTurn || winner || isDraw || aiThinking) return;
    setAiThinking(true);
    const timeout = setTimeout(() => {
      const boardCopy = board.map((r) => [...r]);
      const [ar, ac] = getAIMove(boardCopy, "O");
      placeMove(ar, ac, board, false);
      setAiThinking(false);
    }, 400);
    return () => clearTimeout(timeout);
  }, [isAI, isXTurn, winner, isDraw, board, aiThinking, placeMove]);

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

  const handleConfirmResult = () => {
    if (!gameEnded && (winner || isDraw)) {
      setGameEnded(true);
      onGameEnd?.({ winner: winnerName, isDraw });
    }
  };

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
      {/* Player labels */}
      <div className="flex justify-between w-full max-w-[540px] text-sm font-bold">
        <span style={{ color: "hsl(var(--primary))", textShadow: "var(--neon-glow)" }}>
          ✕ {displayX}
        </span>
        <span className="flex items-center gap-1" style={{ color: "hsl(var(--secondary))", textShadow: "var(--neon-glow-secondary)" }}>
          ○ {displayO} {isAI && <Bot className="w-4 h-4" />}
        </span>
      </div>

      {/* Status */}
      <div className="text-center">
        {winner ? (
          <h2 className="text-2xl sm:text-3xl font-bold animate-pulse" style={{
            color: winner === "X" ? "hsl(var(--primary))" : "hsl(var(--secondary))",
            textShadow: winner === "X" ? "var(--neon-glow)" : "var(--neon-glow-secondary)",
          }}>
            {winnerName} wygrywa!
          </h2>
        ) : isDraw ? (
          <h2 className="text-2xl sm:text-3xl font-bold text-accent" style={{ textShadow: "var(--neon-glow-accent)" }}>
            Remis!
          </h2>
        ) : aiThinking ? (
          <h2 className="text-xl sm:text-2xl font-bold text-secondary animate-pulse" style={{ textShadow: "var(--neon-glow-secondary)" }}>
            AI myśli...
          </h2>
        ) : (
          <h2 className="text-xl sm:text-2xl font-bold">
            Ruch:{" "}
            <span style={{
              color: isXTurn ? "hsl(var(--primary))" : "hsl(var(--secondary))",
              textShadow: isXTurn ? "var(--neon-glow)" : "var(--neon-glow-secondary)",
            }}>
              {currentPlayerName}
            </span>
          </h2>
        )}
      </div>

      {/* Board */}
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
                disabled={!!winner || !!cell || aiThinking}
                className={`aspect-square w-full bg-card border border-border/50 flex items-center justify-center text-[10px] sm:text-base font-bold transition-all duration-150 hover:bg-muted hover:border-primary/40 disabled:cursor-default relative ${isWin ? "z-10" : ""}`}
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
                {cell}
              </button>
            );
          })
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2 flex-wrap justify-center">
        <button
          onClick={undo}
          disabled={history.length === 0 || !!winner || aiThinking}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-foreground font-bold tracking-wider uppercase text-xs hover:bg-border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Undo2 className="w-4 h-4" />
          Cofnij
        </button>
        <button
          onClick={reset}
          className="px-3 py-2 rounded-lg bg-muted text-foreground font-bold tracking-wider uppercase text-xs hover:bg-border transition-colors"
        >
          Od nowa
        </button>
        {!winner && !isDraw && history.length > 0 && (
          <button
            onClick={declareDraw}
            disabled={aiThinking}
            className="flex items-center gap-2 px-3 py-2 rounded-lg font-bold tracking-wider uppercase text-xs transition-colors"
            style={{
              backgroundColor: "hsl(var(--accent) / 0.15)",
              border: "1px solid hsl(var(--accent) / 0.4)",
              color: "hsl(var(--accent))",
            }}
          >
            <Handshake className="w-4 h-4" />
            Ogłoś remis
          </button>
        )}
        {onSave && !winner && !isDraw && history.length > 0 && (
          <button
            onClick={handleSaveAndExit}
            className="flex items-center gap-2 px-3 py-2 rounded-lg font-bold tracking-wider uppercase text-xs transition-colors"
            style={{
              backgroundColor: "hsl(var(--accent) / 0.15)",
              border: "1px solid hsl(var(--accent) / 0.4)",
              color: "hsl(var(--accent))",
            }}
          >
            <Save className="w-4 h-4" />
            Zapisz i wyjdź
          </button>
        )}
        {onExit && (winner || isDraw || history.length === 0) && (
          <button
            onClick={onExit}
            className="px-3 py-2 rounded-lg bg-muted text-foreground font-bold tracking-wider uppercase text-xs hover:bg-border transition-colors"
          >
            Menu
          </button>
        )}
        {(winner || isDraw) && onGameEnd && !gameEnded && (
          <button
            onClick={handleConfirmResult}
            className="px-3 py-2 rounded-lg font-bold tracking-wider uppercase text-xs transition-colors"
            style={{
              backgroundColor: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
              boxShadow: "var(--neon-glow)",
            }}
          >
            Zatwierdź wynik
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
            Wróć do turnieju
          </button>
        )}
      </div>
    </div>
  );
};

export default GameBoard;
