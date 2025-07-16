//
// Service layer and React hooks for Tic Tac Toe backend interaction and live updates.
//
// - Provides REST API calls: start new game, make move, fetch game state, fetch game history
// - WebSocket client manages live updates (moves, game over, etc.)
// - Exposes data hooks for game/board/history state that auto-update with real-time events
//

import { useCallback, useEffect, useRef, useState } from "react";

const API_BASE = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
const WS_BASE = process.env.REACT_APP_WEBSOCKET_URL || API_BASE.replace(/^http/, "ws");

/* =============== Service Functions (REST) =============== */

// PUBLIC_INTERFACE
export async function startNewGame(playerName = "Player") {
  /** Start a new game, optionally specifying a player name. */
  const resp = await fetch(`${API_BASE}/games`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ player_name: playerName }),
  });
  if (!resp.ok) throw new Error("Failed to start new game");
  return await resp.json();
}

// PUBLIC_INTERFACE
export async function makeMove(gameId, row, col) {
  /** Post a move to the backend and return updated game state. */
  const resp = await fetch(`${API_BASE}/games/${gameId}/move`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ row, col }),
  });
  if (!resp.ok) throw new Error("Move failed");
  return await resp.json();
}

// PUBLIC_INTERFACE
export async function fetchGameState(gameId) {
  /** Fetch current game state. */
  const resp = await fetch(`${API_BASE}/games/${gameId}`);
  if (!resp.ok) throw new Error("Loading game failed");
  return await resp.json();
}

// PUBLIC_INTERFACE
export async function fetchGameHistory() {
  /** Fetch list of games/history for overview. */
  const resp = await fetch(`${API_BASE}/games/history`);
  if (!resp.ok) throw new Error("Unable to get game history");
  return await resp.json();
}

/* =============== WebSocket Client & Live Updates =============== */

// Well-organized global WebSocket singleton per game
let socket = null;
let socketListeners = [];
let lastConnectedGameId = "";

// Try to establish a WebSocket for a given gameId (re-init if game changes)
function setupWebSocket(gameId, handleEvent) {
  // If already connected (for same game), no-op
  if (socket && lastConnectedGameId === gameId) return socket;

  if (socket) {
    socket.close();
    socket = null;
  }

  lastConnectedGameId = gameId;
  const wsEndpoint = `${WS_BASE}/ws/games/${gameId}`;
  socket = new window.WebSocket(wsEndpoint);

  socket.onopen = () => {
    // Optionally: handle success connection state
  };

  socket.onclose = () => {
    socket = null;
    // Reconnection logic could go here, if desired.
  };

  socket.onerror = (e) => {
    // Optionally: handle error state
    // socket.close();
  };

  socket.onmessage = (msgEvent) => {
    try {
      const evt = JSON.parse(msgEvent.data);
      // Notify all listeners
      for (const cb of socketListeners) cb(evt);
      if (handleEvent) handleEvent(evt);
    } catch (e) {
      // Ignore malformed messages
    }
  };

  return socket;
}

/** Add a listener for live game events (returns unsubscribe fn) */
export function subscribeGameEvents(listener) {
  socketListeners.push(listener);
  // Return unsubscribe
  return () => {
    socketListeners = socketListeners.filter((fn) => fn !== listener);
  };
}

/* =============== React Data Hooks =============== */

// PUBLIC_INTERFACE
export function useGameState(gameId) {
  /**
   * Provides current game state and auto-updates via WebSocket.
   * @param {string} gameId
   * @returns {object} {game, loading, error}
   */
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(!!gameId);
  const [error, setError] = useState(null);
  const gameIdRef = useRef(gameId);

  useEffect(() => {
    if (!gameId) return;
    let mounted = true;
    setLoading(true);

    fetchGameState(gameId)
      .then((data) => {
        if (mounted) setGame(data);
        setLoading(false);
      })
      .catch((err) => {
        if (mounted) setError(err.message);
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [gameId]);

  useEffect(() => {
    if (!gameId) return;
    // Setup websocket for this game
    function handleEvent(evt) {
      // Message may be { type: "move", ... } or { type: "over", ... }
      if (evt && evt.type && evt.state) setGame(evt.state);
    }
    setupWebSocket(gameId, handleEvent);

    // Listener (for potential multi-listener future)
    const unsubscribe = subscribeGameEvents(handleEvent);

    return () => {
      unsubscribe();
      // Optional: socket cleanup if desired.
    };
  }, [gameId]);

  return { game, loading, error };
}

// PUBLIC_INTERFACE
export function useGameHistory(refreshOnChange = false) {
  /**
   * Provides the game history list (array), with optional auto-refresh.
   * @param {boolean} refreshOnChange - if true, re-pulls from server after each move
   */
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(() => {
    setLoading(true);
    fetchGameHistory()
      .then((hist) => {
        setHistory(hist);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // Optionally: wire up with live updates
  useEffect(() => {
    if (!refreshOnChange) return;
    const unsub = subscribeGameEvents(() => reload());
    return () => unsub();
  }, [reload, refreshOnChange]);

  return { history, loading, reload };
}

/** Manual util: send a message over WebSocket (for bot/ai moves/testing/devtools) */
export function sendWsMessage(messageObj) {
  if (socket && socket.readyState === 1) {
    socket.send(JSON.stringify(messageObj));
  }
}
