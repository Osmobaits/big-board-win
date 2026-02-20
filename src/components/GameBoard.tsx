import { useState, useCallback } from "react";
import { Undo2 } from "lucide-react";

const BOARD_SIZE = 12;
const WIN_LENGTH = 5;

type Cell = "X" | "O" | null;
type Move = { row: number; col: number; player: Cell };

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

const GameBoard = () => {
  const [board, setBoard] = useState<Cell[][]>(() =>
    Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null))
  );
  const [isXTurn, setIsXTurn] = useState(true);
  const [winner, setWinner] = useState<Cell>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [history, setHistory] = useState<Move[]>([]);
  const [winLine, setWinLine] = useState<Set<string>>(new Set());

  const handleClick = useCallback((row: number, col: number) => {
    if (board[row][col] || winner) return;
    const newBoard = board.map((r) => [...r]);
    const player = isXTurn ? "X" : "O";
    newBoard[row][col] = player;
    setBoard(newBoard);
    setHistory((prev) => [...prev, { row, col, player }]);

    const line = getWinLine(newBoard, row, col, player);
    if (line) {
      setWinner(player);
      setWinLine(new Set(line.map(([r, c]) => `${r}-${c}`)));
    } else if (newBoard.every((r) => r.every((c) => c !== null))) {
      setIsDraw(true);
    } else {
      setIsXTurn(!isXTurn);
    }
  }, [board, isXTurn, winner]);

  const undo = useCallback(() => {
    if (history.length === 0 || winner) return;
    const newHistory = [...history];
    const lastMove = newHistory.pop()!;
    const newBoard = board.map((r) => [...r]);
    newBoard[lastMove.row][lastMove.col] = null;
    setBoard(newBoard);
    setHistory(newHistory);
    setIsXTurn(lastMove.player === "X");
    setIsDraw(false);
  }, [history, board, winner]);

  const reset = () => {
    setBoard(Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null)));
    setIsXTurn(true);
    setWinner(null);
    setIsDraw(false);
    setHistory([]);
    setWinLine(new Set());
  };

  const isWinCell = (ri: number, ci: number) => winLine.has(`${ri}-${ci}`);

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6 w-full px-2 sm:px-0">
      {/* Status */}
      <div className="text-center">
        {winner ? (
          <h2 className="text-3xl font-bold animate-pulse" style={{
            color: winner === "X" ? "hsl(var(--primary))" : "hsl(var(--secondary))",
            textShadow: winner === "X" ? "var(--neon-glow)" : "var(--neon-glow-secondary)",
          }}>
            {winner} wygrywa!
          </h2>
        ) : isDraw ? (
          <h2 className="text-3xl font-bold text-accent" style={{ textShadow: "var(--neon-glow-accent)" }}>
            Remis!
          </h2>
        ) : (
          <h2 className="text-2xl font-bold">
            Ruch:{" "}
            <span style={{
              color: isXTurn ? "hsl(var(--primary))" : "hsl(var(--secondary))",
              textShadow: isXTurn ? "var(--neon-glow)" : "var(--neon-glow-secondary)",
            }}>
              {isXTurn ? "X" : "O"}
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
                disabled={!!winner || !!cell}
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
      <div className="flex gap-3">
        <button
          onClick={undo}
          disabled={history.length === 0 || !!winner}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-foreground font-bold tracking-wider uppercase text-sm hover:bg-border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Undo2 className="w-4 h-4" />
          Cofnij
        </button>
        <button
          onClick={reset}
          className="px-6 py-2 rounded-lg bg-muted text-foreground font-bold tracking-wider uppercase text-sm hover:bg-border transition-colors"
        >
          Nowa gra
        </button>
      </div>
    </div>
  );
};

export default GameBoard;
