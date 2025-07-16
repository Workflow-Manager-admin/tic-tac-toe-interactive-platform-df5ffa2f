import React from "react";

/**
 * PUBLIC_INTERFACE
 * StatusPanel displays turn info and game status.
 * @param {{ game: object, loading: boolean }}
 */
export default function StatusPanel({ game, loading }) {
  if (loading) return <div className="ttt-status">Loading game…</div>;

  if (!game)
    return <div className="ttt-status ttt-status-inactive">No game running.</div>;

  let status = "";
  if (game.state === "over") {
    status = game.winner
      ? `🏆 Winner: ${game.winner === "X" ? "X" : "O"}`
      : "🤝 Draw game!";
  } else {
    status = `🔄 Turn: ${game.next_player === "X" ? "X" : "O"}`;
  }

  return (
    <div className={`ttt-status ${game.state === "over" ? "ttt-status-over" : ""}`}>
      <strong>{status}</strong>
      {game.state === "over" && game.winner && (
        <span style={{ marginLeft: 12, fontWeight: 500, color: "var(--primary,#1976d2)" }}>
          Game Over!
        </span>
      )}
    </div>
  );
}
