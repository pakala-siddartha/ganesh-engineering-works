import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

const SESSION_KEY = "ganeshEngineeringWorksSession";
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours

function getStoredSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY));
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function isSessionValid(session) {
  return session && Number(session.expiresAt) > Date.now();
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return isSessionValid(getStoredSession());
  });

  const login = useCallback((password) => {
    // Demo password — will be replaced with Supabase Auth
    if (password !== "1234") return false;

    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        loggedInAt: Date.now(),
        expiresAt: Date.now() + SESSION_DURATION_MS,
      })
    );
    setIsAuthenticated(true);
    return true;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
