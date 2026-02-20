import { useState, useCallback } from "react";

const BOARD_SIZE = 15;
const WIN_LENGTH = 5;

type Cell = "X" | "O" | null;

const checkWin = (board: Cell[][], row: number, col: number, player: Cell): boolean => {
  if (!player) return false;
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

  for (const [dr, dc] of directions) {
    let count = 1;
    for (let i = 1; i < WIN_LENGTH; i++) {
      const r = row + dr * i, c = col + dc * i;
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE || board[r][c] !== player) break;
      count++;
    }
    for (let i = 1; i < WIN_LENGTH; i++) {
      const r = row - dr * i, c = col - dc * i;
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE || board[r][c] !== player) break;
      count++;
    }
    if (count >= WIN_LENGTH) return true;
  }
  return false;
};

const GameBoard = () => {
  const [board, setBoard] = useState<Cell[][]>(() =>
    Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null))
  );
  const [isXTurn, setIsXTurn] = useState(true);
  const [winner, setWinner] = useState<Cell>(null);
  const [isDraw, setIsDraw] = useState(false);

  const handleClick = useCallback((row: number, col: number) => {
    if (board[row][col] || winner) return;
    const newBoard = board.map((r) => [...r]);
    const player = isXTurn ? "X" : "O";
    newBoard[row][col] = player;
    setBoard(newBoard);

    if (checkWin(newBoard, row, col, player)) {
      setWinner(player);
    } else if (newBoard.every((r) => r.every((c) => c !== null))) {
      setIsDraw(true);
    } else {
      setIsXTurn(!isXTurn);
    }
  }, [board, isXTurn, winner]);

  const reset = () => {
    setBoard(Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null)));
    setIsXTurn(true);
    setWinner(null);
    setIsDraw(false);
  };

  return (
    <div className="flex flex-col items-center gap-6">
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
        className="grid gap-[1px] bg-primary/30 p-[1px] rounded-lg border border-primary/20"
        style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`, boxShadow: "var(--neon-glow)" }}
      >
        {board.map((row, ri) =>
          row.map((cell, ci) => (
            <button
              key={`${ri}-${ci}`}
              onClick={() => handleClick(ri, ci)}
              disabled={!!winner || !!cell}
              className="w-8 h-8 sm:w-9 sm:h-9 bg-card border border-border/50 flex items-center justify-center text-sm sm:text-base font-bold transition-all duration-150 hover:bg-muted hover:border-primary/40 disabled:cursor-default"
              style={cell ? {
                color: cell === "X" ? "hsl(var(--primary))" : "hsl(var(--secondary))",
                textShadow: cell === "X" ? "var(--neon-glow)" : "var(--neon-glow-secondary)",
              } : {}}
            >
              {cell}
            </button>
          ))
        )}
      </div>

      {/* Reset */}
      <button
        onClick={reset}
        className="px-6 py-2 rounded-lg bg-muted text-foreground font-bold tracking-wider uppercase text-sm hover:bg-border transition-colors"
      >
        Nowa gra
      </button>
    </div>
  );
};

export default GameBoard;
