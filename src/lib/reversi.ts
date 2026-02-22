// Reversi (Othello) game logic

export type ReversiCell = "B" | "W" | null;
export type ReversiPlayer = "B" | "W";

export const REVERSI_SIZE = 8;

const DIRECTIONS: [number, number][] = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
];

export function createInitialBoard(): ReversiCell[][] {
  const board: ReversiCell[][] = Array.from({ length: REVERSI_SIZE }, () =>
    Array(REVERSI_SIZE).fill(null)
  );
  board[3][3] = "W";
  board[3][4] = "B";
  board[4][3] = "B";
  board[4][4] = "W";
  return board;
}

export function getFlips(
  board: ReversiCell[][],
  row: number,
  col: number,
  player: ReversiPlayer
): [number, number][] {
  if (board[row][col] !== null) return [];
  const opponent: ReversiPlayer = player === "B" ? "W" : "B";
  const allFlips: [number, number][] = [];

  for (const [dr, dc] of DIRECTIONS) {
    const flips: [number, number][] = [];
    let r = row + dr,
      c = col + dc;
    while (
      r >= 0 && r < REVERSI_SIZE &&
      c >= 0 && c < REVERSI_SIZE &&
      board[r][c] === opponent
    ) {
      flips.push([r, c]);
      r += dr;
      c += dc;
    }
    if (
      flips.length > 0 &&
      r >= 0 && r < REVERSI_SIZE &&
      c >= 0 && c < REVERSI_SIZE &&
      board[r][c] === player
    ) {
      allFlips.push(...flips);
    }
  }
  return allFlips;
}

export function getValidMoves(
  board: ReversiCell[][],
  player: ReversiPlayer
): [number, number][] {
  const moves: [number, number][] = [];
  for (let r = 0; r < REVERSI_SIZE; r++) {
    for (let c = 0; c < REVERSI_SIZE; c++) {
      if (getFlips(board, r, c, player).length > 0) {
        moves.push([r, c]);
      }
    }
  }
  return moves;
}

export function applyMove(
  board: ReversiCell[][],
  row: number,
  col: number,
  player: ReversiPlayer
): { newBoard: ReversiCell[][]; flipped: [number, number][] } {
  const flipped = getFlips(board, row, col, player);
  const newBoard = board.map((r) => [...r]);
  newBoard[row][col] = player;
  for (const [fr, fc] of flipped) {
    newBoard[fr][fc] = player;
  }
  return { newBoard, flipped };
}

export function countDiscs(board: ReversiCell[][]): { B: number; W: number } {
  let B = 0,
    W = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell === "B") B++;
      else if (cell === "W") W++;
    }
  }
  return { B, W };
}

export function isGameOver(board: ReversiCell[][]): boolean {
  return (
    getValidMoves(board, "B").length === 0 &&
    getValidMoves(board, "W").length === 0
  );
}

export interface ReversiMove {
  row: number;
  col: number;
  player: ReversiPlayer;
  flipped: [number, number][];
}

export interface ReversiBoardState {
  board: ReversiCell[][];
  currentPlayer: ReversiPlayer;
  history: ReversiMove[];
}
