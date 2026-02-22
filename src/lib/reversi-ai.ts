// Reversi AI using positional heuristic + mobility

import {
  ReversiCell,
  ReversiPlayer,
  getValidMoves,
  applyMove,
} from "./reversi";

// Corner > Edge > Center; avoid X-squares (adjacent to corners)
const POSITION_WEIGHTS = [
  [100, -20, 10,  5,  5, 10, -20, 100],
  [-20, -50, -2, -2, -2, -2, -50, -20],
  [ 10,  -2,  5,  1,  1,  5,  -2,  10],
  [  5,  -2,  1,  0,  0,  1,  -2,   5],
  [  5,  -2,  1,  0,  0,  1,  -2,   5],
  [ 10,  -2,  5,  1,  1,  5,  -2,  10],
  [-20, -50, -2, -2, -2, -2, -50, -20],
  [100, -20, 10,  5,  5, 10, -20, 100],
];

function evaluate(board: ReversiCell[][], player: ReversiPlayer): number {
  const opponent: ReversiPlayer = player === "B" ? "W" : "B";
  let score = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === player) score += POSITION_WEIGHTS[r][c];
      else if (board[r][c] === opponent) score -= POSITION_WEIGHTS[r][c];
    }
  }

  // Mobility bonus
  const myMoves = getValidMoves(board, player).length;
  const oppMoves = getValidMoves(board, opponent).length;
  score += (myMoves - oppMoves) * 5;

  return score;
}

// Simple 1-ply lookahead with minimax extension for critical moves
export function getReversiAIMove(
  board: ReversiCell[][],
  player: ReversiPlayer
): [number, number] {
  const moves = getValidMoves(board, player);
  if (moves.length === 0) throw new Error("No valid moves for AI");

  // If only one move, take it
  if (moves.length === 1) return moves[0];

  let bestScore = -Infinity;
  let bestMoves: [number, number][] = [];

  for (const [r, c] of moves) {
    const { newBoard } = applyMove(board, r, c, player);

    // 2-ply: evaluate opponent's best response
    const opponent: ReversiPlayer = player === "B" ? "W" : "B";
    const oppMoves = getValidMoves(newBoard, opponent);

    let score: number;
    if (oppMoves.length === 0) {
      // Opponent passes - great for us
      score = evaluate(newBoard, player) + 50;
    } else {
      // Find opponent's best move and evaluate after that
      let worstForUs = Infinity;
      for (const [or, oc] of oppMoves) {
        const { newBoard: afterOpp } = applyMove(newBoard, or, oc, opponent);
        const s = evaluate(afterOpp, player);
        if (s < worstForUs) worstForUs = s;
      }
      score = worstForUs;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMoves = [[r, c]];
    } else if (score === bestScore) {
      bestMoves.push([r, c]);
    }
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}
