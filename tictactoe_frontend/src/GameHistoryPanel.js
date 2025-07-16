import React from "react";

/**
 * PUBLIC_INTERFACE
 * Shows a panel with history of games, latest first
 * @param {{
 *   history: array of {id, winner, moves, dt, player_name},
 *   loading: boolean,
 *   onSelectGame: function(gameId)
 * }}
 */
export default function GameHistoryPanel({ history, loading, onSelectGame }) {
  return (
    <aside className="ttt-history-panel">
      <h3 className="ttt-history-title">History</h3>
      {loading ? (
        <div className="ttt-history-loading">Loading history…</div>
      ) : (
        <ul className="ttt-history-list">
          {history && history.length ? (
            history.slice(0, 12).map(g => (
              <li
                key={g.id}
                className={`ttt-history-item${g.winner ? " winner" : g.state === "draw" ? " draw" : ""}`}
                onClick={() => onSelectGame(g.id)}
                tabIndex={0}
                aria-label={`Replay game ${g.id}`}
                title={new Date(g.dt).toLocaleString()}
              >
                <span className="ttt-hist-id">#{g.id}</span>
                <span className="ttt-hist-player">{g.player_name || "Player"}</span>
                <span className="ttt-hist-outcome">
                  {g.state === "over"
                    ? g.winner
                      ? `🏆 ${g.winner}`
                      : "🤝 Draw"
                    : "…"}
                </span>
                <span className="ttt-hist-date">{new Date(g.dt).toLocaleDateString()}</span>
              </li>
            ))
          ) : (
            <li>No games yet</li>
          )}
        </ul>
      )}
    </aside>
  );
}
