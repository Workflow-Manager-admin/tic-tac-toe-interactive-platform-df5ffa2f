import React, { useState, useCallback } from "react";
import "./App.css";
import GameBoard from "./GameBoard";
import "./GameBoard.css";
import GameControls from "./GameControls";
import "./GameControls.css";
import StatusPanel from "./StatusPanel";
import "./StatusPanel.css";
import GameHistoryPanel from "./GameHistoryPanel";
import "./GameHistoryPanel.css";
import {
  useGameState,
  useGameHistory,
  startNewGame,
  makeMove,
} from "./gameService";

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState("light");
  const [gameId, setGameId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [actionLock, setActionLock] = useState(false);

  // Hook to current game state
  const { game, loading: gameLoading, error } = useGameState(gameId);
  // History hook for sidebar
  const { history, loading: historyLoading, reload: reloadHistory } =
    useGameHistory(true);

  // Effect: set theme
  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // NEW GAME
  const handleStart = useCallback(async () => {
    setActionLock(true);
    try {
      const data = await startNewGame(playerName.trim() || "Player");
      setGameId(data.id); // Store current game id in frontend
      reloadHistory();
    } catch (e) {
      alert(`Failed to start: ${e.message}`);
    }
    setActionLock(false);
  }, [playerName, reloadHistory]);

  // RESTART current game (just starts a new game)
  const handleRestart = useCallback(async () => {
    setGameId(""); // Leave current game first
    setTimeout(() => handleStart(), 220); // Start new game after small delay
  }, [handleStart]);

  // Click on game grid cell
  const handleCellClick = async (row, col) => {
    if (!gameId || actionLock) return;
    // Only allow move if cell empty && game not over && correct turn
    if (
      !game ||
      game.state === "over" ||
      game.board[row][col] ||
      actionLock
    )
      return;
    setActionLock(true);
    try {
      await makeMove(gameId, row, col);
      // board will update via socket & gameService
      reloadHistory();
    } catch (e) {
      alert(`Invalid move: ${e.message}`);
    }
    setActionLock(false);
  };

  // Highlight winner line if present (assuming backend sends winner_line)
  const winnerLine = game && game.winner_line ? game.winner_line : [];

  // Select historical game for replay (loads that game in view-only mode)
  const handleSelectHistory = gid => {
    setGameId(gid);
  };

  // Show gameActive if game loaded and not over
  const gameActive = !!game && game.state !== "over";
  const canRestart = !!gameId && !!playerName;

  // Basic layout
  return (
    <div className="App ttt-app-main">
      <header className="App-header">
        <button
          className="theme-toggle"
          onClick={() => setTheme(t => (t === "light" ? "dark" : "light"))}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
        <h1 style={{ margin: 0, color: "var(--primary,#1976d2)" }}>
          Tic Tac Toe
        </h1>
      </header>
      <main className="ttt-container-layout">
        <section className="ttt-main-panel">
          <StatusPanel game={game} loading={gameLoading} />
          <GameBoard
            board={game?.board || [
              ["", "", ""],
              ["", "", ""],
              ["", "", ""],
            ]}
            onCellClick={handleCellClick}
            winnerLine={winnerLine}
            disabled={actionLock || !gameActive}
          />
          <GameControls
            gameActive={gameActive}
            disabled={actionLock}
            playerName={playerName}
            onPlayerNameChange={setPlayerName}
            onStart={handleStart}
            onRestart={handleRestart}
            canRestart={canRestart}
          />
          {error && (<div style={{ color: "red" }}>Error: {error}</div>)}
        </section>
        <GameHistoryPanel
          history={history}
          loading={historyLoading}
          onSelectGame={handleSelectHistory}
        />
      </main>
      <footer
        style={{
          margin: "2em auto 0 auto",
          textAlign: "center",
          color: "var(--text-secondary,#61dafb)",
        }}
      >
        <small>
          &copy; {new Date().getFullYear()} Kavia — Interactive Tic Tac Toe App
        </small>
      </footer>
    </div>
  );
}

export default App;
