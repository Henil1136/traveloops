import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../services/api";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Decode JWT expiry without a library ───────────────────
  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true; // malformed → treat as expired
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem("traveloops_token");
    setUser(null);
  }, []);

  // ── Initial auth check ────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("traveloops_token");
    if (!token) { setLoading(false); return; }

    // Demo / offline mode
    if (token === "demo_token") {
      setUser({ id: 1, name: "Traveler", email: "traveler@traveloops.app" });
      setLoading(false);
      return;
    }

    // Expired? Log out immediately instead of letting the API call fail silently
    if (isTokenExpired(token)) {
      logout();
      setLoading(false);
      return;
    }

    authAPI.me()
      .then(u => setUser(u))
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [logout]);

  // ── Cross-tab sync — mirrors localStorage changes made in other tabs ──
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== "traveloops_token") return;
      if (!e.newValue) {
        // Another tab logged out
        setUser(null);
      } else if (e.newValue !== e.oldValue) {
        // Another tab logged in with a new token
        authAPI.me().then(setUser).catch(() => setUser(null));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = async (email, password) => {
    const { token, user: u } = await authAPI.login({ email, password });
    localStorage.setItem("traveloops_token", token);
    setUser(u);
    return u;
  };

  const register = async (name, email, password) => {
    const { token, user: u } = await authAPI.register({ name, email, password });
    localStorage.setItem("traveloops_token", token);
    setUser(u);
    return u;
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}
