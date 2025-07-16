import React, { useState } from "react";

/**
 * PUBLIC_INTERFACE
 * Controls for starting a game and making moves
 * @param {{
 *   gameActive: boolean,
 *   disabled: boolean,
 *   playerName: string,
 *   onPlayerNameChange: function(name),
 *   onStart: function(),
 *   onRestart: function(),
 *   canRestart: boolean,
 * }}
 */
export default function GameControls({
  gameActive,
  disabled,
  playerName,
  onPlayerNameChange,
  onStart,
  onRestart,
  canRestart
}) {
  // Allow entering player name only before game start
  return (
    <div className="ttt-controls">
      {!gameActive && (
        <>
          <label>
            <input
              type="text"
              value={playerName}
              maxLength={20}
              onChange={e => onPlayerNameChange(e.target.value)}
              placeholder="Your Name"
              className="ttt-player-input"
              disabled={disabled}
              aria-label="Player Name"
            />
          </label>
          <button onClick={onStart} className="ttt-btn ttt-btn-primary" disabled={disabled || !playerName.trim()}>
            🎲 Start New Game
          </button>
        </>
      )}
      {gameActive && (
        <button onClick={onRestart} className="ttt-btn ttt-btn-secondary" disabled={disabled || !canRestart}>
          🗘 Restart Game
        </button>
      )}
    </div>
  );
}
