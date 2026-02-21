// AI engine for 5-in-a-row on 12x12 board
// Uses heuristic scoring to evaluate positions

type Cell = "X" | "O" | null;

const BOARD_SIZE = 12;
const WIN_LENGTH = 5;
const DIRECTIONS: [number, number][] = [[0, 1], [1, 0], [1, 1], [1, -1]];

// Score a line segment for a given player
const scoreLine = (count: number, openEnds: number, isOpponent: boolean): number => {
  if (count >= WIN_LENGTH) return isOpponent ? 100000 : 200000;
  if (openEnds === 0) return 0;

  const multiplier = isOpponent ? 1.1 : 1; // slightly prioritize blocking
  if (count === 4) return openEnds === 2 ? 50000 * multiplier : 5000 * multiplier;
  if (count === 3) return openEnds === 2 ? 2000 * multiplier : 200 * multiplier;
  if (count === 2) return openEnds === 2 ? 100 * multiplier : 10 * multiplier;
  if (count === 1) return openEnds === 2 ? 5 : 1;
  return 0;
};

// Evaluate how good a position is for a player in one direction
const evaluateDirection = (
  board: Cell[][],
  row: number,
  col: number,
  dr: number,
  dc: number,
  player: Cell,
  isOpponent: boolean
): number => {
  let count = 1;
  let openEnds = 0;

  // Forward
  let r = row + dr, c = col + dc;
  while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
    count++;
    r += dr;
    c += dc;
  }
  if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === null) openEnds++;

  // Backward
  r = row - dr;
  c = col - dc;
  while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
    count++;
    r -= dr;
    c -= dc;
  }
  if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === null) openEnds++;

  return scoreLine(count, openEnds, isOpponent);
};

const evaluateCell = (board: Cell[][], row: number, col: number, aiPlayer: Cell): number => {
  const opponent: Cell = aiPlayer === "O" ? "X" : "O";
  let score = 0;

  // Temporarily place AI
  board[row][col] = aiPlayer;
  for (const [dr, dc] of DIRECTIONS) {
    score += evaluateDirection(board, row, col, dr, dc, aiPlayer, false);
  }
  board[row][col] = null;

  // Temporarily place opponent (to evaluate blocking value)
  board[row][col] = opponent;
  for (const [dr, dc] of DIRECTIONS) {
    score += evaluateDirection(board, row, col, dr, dc, opponent, true);
  }
  board[row][col] = null;

  return score;
};

export const getAIMove = (board: Cell[][], aiPlayer: Cell): [number, number] => {
  let bestScore = -1;
  let bestMoves: [number, number][] = [];

  // Only consider cells near existing pieces for performance
  const candidates = new Set<string>();
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== null) {
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === null) {
              candidates.add(`${nr},${nc}`);
            }
          }
        }
      }
    }
  }

  // If board is empty, play one of the 4 center cells
  if (candidates.size === 0) {
    const mid = Math.floor(BOARD_SIZE / 2);
    const centerCells: [number, number][] = [[mid-1, mid-1], [mid-1, mid], [mid, mid-1], [mid, mid]];
    return centerCells[Math.floor(Math.random() * centerCells.length)];
  }

  for (const key of candidates) {
    const [r, c] = key.split(",").map(Number);
    const score = evaluateCell(board, r, c, aiPlayer);
    if (score > bestScore) {
      bestScore = score;
      bestMoves = [[r, c]];
    } else if (score === bestScore) {
      bestMoves.push([r, c]);
    }
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
};
