import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RetroButton } from './VintageUI';

type Player = 'X' | 'O' | null;

export const TicTacToe: React.FC = () => {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<Player | 'Draw'>(null);

  const calculateWinner = (squares: Player[]): Player | 'Draw' => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    if (squares.every((square) => square !== null)) {
      return 'Draw';
    }
    return null;
  };

  const minimax = (squares: Player[], depth: number, isMaximizing: boolean): number => {
    const result = calculateWinner(squares);
    if (result === 'O') return 10 - depth;
    if (result === 'X') return depth - 10;
    if (result === 'Draw') return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          squares[i] = 'O';
          const score = minimax(squares, depth + 1, false);
          squares[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          squares[i] = 'X';
          const score = minimax(squares, depth + 1, true);
          squares[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const getBestMove = (boardState: Player[]): number => {
    const squares = [...boardState];
    let bestScore = -Infinity;
    let move = -1;
    for (let i = 0; i < 9; i++) {
      if (squares[i] === null) {
        squares[i] = 'O';
        const score = minimax(squares, 0, false);
        squares[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  };

  useEffect(() => {
    if (!isXNext && !gameOver && winner === null) {
      const timer = setTimeout(() => {
        const bestMove = getBestMove(board);
        if (bestMove !== -1) {
          handleClick(bestMove);
        }
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isXNext, gameOver, board, winner]);

  const handleClick = (i: number) => {
    if (board[i] || gameOver) return;

    const newBoard = [...board];
    newBoard[i] = isXNext ? 'X' : 'O';
    setBoard(newBoard);

    const gameWinner = calculateWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      setGameOver(true);
    } else {
      setIsXNext(!isXNext);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setGameOver(false);
    setWinner(null);
  };

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <div className="text-[10px] uppercase font-bold text-blue-900 border-b border-blue-900 mb-2 w-full text-center">
        {gameOver ? (
          winner === 'Draw' ? '¡EMPATE!' : `¡GANADOR: ${winner}!`
        ) : (
          `TURNO: ${isXNext ? 'USUARIO (X)' : 'SISTEMA (O)'}`
        )}
      </div>

      <div className="grid grid-cols-3 gap-1 bg-gray-400 p-1 border-2 border-inset border-gray-800" style={{ borderStyle: 'inset' }}>
        {board.map((cell, i) => (
          <button
            key={i}
            disabled={!isXNext || gameOver}
            onClick={() => handleClick(i)}
            className={`w-16 h-16 bg-gray-200 border-2 border-white border-r-gray-700 border-b-gray-700 font-bold text-2xl flex items-center justify-center active:translate-y-px transition-all hover:bg-gray-100 disabled:cursor-not-allowed ${
              cell === 'X' ? 'text-blue-700' : 'text-red-700'
            }`}
          >
            {cell}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <RetroButton onClick={resetGame}>REINICIAR_PARTIDA.EXE</RetroButton>
      </div>

      <div className="bg-slate-800 text-green-500 p-2 font-mono text-[8px] w-full border-2 border-inset border-slate-600" style={{ borderStyle: 'inset' }}>
        <div>ALGORITHM: MINIMAX_v1.2</div>
        <div>OPPONENT: CPU_MECATRONIC</div>
        <div>DIFFICULTY: IMPOSSIBLE</div>
      </div>
    </div>
  );
};
