import React from "react";
import "./GameBoard.css";

/**
 * PUBLIC_INTERFACE
 * GameBoard renders a 3x3 tic-tac-toe grid.
 * @param {{
 *   board: array[3][3], // The board contents
 *   onCellClick: function(row, col), // Handler for cell click
 *   disabled: boolean, // disables click during waiting
 *   winnerLine?: array of [row,col] pairs - highlight
 * }}
 */
export default function GameBoard({ board, onCellClick, disabled, winnerLine }) {
  // Compute highlight cells set for easy lookup
  const highlight = new Set(
    (winnerLine || []).map(([r, c]) => `R${r}C${c}`)
  );

  return (
    <div className="ttt-board" role="grid" aria-label="Tic Tac Toe Board">
      {board?.map((row, rowIdx) => (
        <div className="ttt-row" key={rowIdx}>
          {row.map((cell, colIdx) => {
            const key = `cell-${rowIdx}-${colIdx}`;
            const isHighlight = highlight.has(`R${rowIdx}C${colIdx}`);
            return (
              <button
                key={key}
                className={`ttt-cell ${cell ? "filled" : ""} ${isHighlight ? "highlight" : ""}`}
                disabled={disabled || cell}
                aria-label={`Cell ${rowIdx+1},${colIdx+1}${cell ? ' - ' + cell : ''}`}
                onClick={() => onCellClick(rowIdx, colIdx)}
                data-row={rowIdx}
                data-col={colIdx}
              >
                {cell || ""}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
