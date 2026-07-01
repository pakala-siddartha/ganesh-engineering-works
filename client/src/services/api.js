import axios from "axios";

let baseURL = import.meta.env.VITE_API_URL || "/api";
if (baseURL.startsWith("http") && !baseURL.endsWith("/api")) {
  baseURL = baseURL.replace(/\/$/, "") + "/api";
}

// Axios instance pointing to Express backend
// Falls back to mock data when server is not running
const api = axios.create({
  baseURL,
  timeout: 60000, // 60s — covers Render free-tier cold starts (~50s wake-up time)
  headers: {
    "Content-Type": "application/json",
  },
});

// Track in-flight requests to detect slow cold starts
let pendingRequests = 0;
const SLOW_THRESHOLD_MS = 3000;

// Attach session token to every request + track pending count
api.interceptors.request.use((config) => {
  pendingRequests++;
  config.metadata = { startTime: Date.now() };

  // After 3s of any pending request, fire a "server waking up" event
  config._slowTimer = setTimeout(() => {
    if (pendingRequests > 0) {
      window.dispatchEvent(new CustomEvent("api:slow"));
    }
  }, SLOW_THRESHOLD_MS);

  const session = sessionStorage.getItem("ganeshEngineeringWorksSession");
  if (session) {
    config.headers["x-session"] = session;
  }
  return config;
});

// Global error handling + clear slow timer
api.interceptors.response.use(
  (response) => {
    pendingRequests = Math.max(0, pendingRequests - 1);
    clearTimeout(response.config?._slowTimer);
    if (pendingRequests === 0) window.dispatchEvent(new CustomEvent("api:ready"));
    return response.data;
  },
  (error) => {
    pendingRequests = Math.max(0, pendingRequests - 1);
    clearTimeout(error.config?._slowTimer);
    if (pendingRequests === 0) window.dispatchEvent(new CustomEvent("api:ready"));
    const message =
      error.response?.data?.message || error.message || "An error occurred";
    return Promise.reject(new Error(message));
  }
);

// ── Proactive warm-up ping ───────────────────────────────────────────────────
// Fires immediately when the app loads. Wakes the Render server ASAP so that
// by the time the user logs in and navigates, the server is already running.
// Uses native fetch directly (bypasses the axios interceptors) so it doesn't
// trigger the slow-request banner itself.
const RENDER_URL = "https://ganesh-engineering-works.onrender.com";
if (import.meta.env.PROD) {
  fetch(`${RENDER_URL}/api/health`, { method: "GET", mode: "cors" })
    .then(() => console.log("[warm-up] Server is awake ✅"))
    .catch(() => console.log("[warm-up] Server waking up… ⏳"));
}

export default api;
