import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider }          from "./context/CartContext";
import { AppProvider, useApp }   from "./context/AppContext";

import Navbar  from "./components/layout/Navbar";
import Toast   from "./components/common/Toast";

import HomePage         from "./pages/HomePage";
import ExplorePage      from "./pages/ExplorePage";
import HotelsPage       from "./pages/HotelsPage";
import RestaurantsPage  from "./pages/RestaurantsPage";
import TripsPage        from "./pages/TripsPage";
import CartPage         from "./pages/CartPage";
import AuthPage         from "./pages/AuthPage";
import ProfilePage      from "./pages/ProfilePage";
import AdminPage        from "./pages/AdminPage";
import TransportPage    from "./pages/TransportPage";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function Layout() {
  const { pathname } = useLocation();
  const { setScrolled } = useApp();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [setScrolled]);

  const isAuthPage = pathname === "/login";
  return (
    <div style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      {!isAuthPage && <Navbar />}
      <Toast />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/hotels" element={<HotelsPage />} />
        <Route path="/restaurants" element={<RestaurantsPage />} />
        <Route path="/trips" element={
          <ProtectedRoute><TripsPage /></ProtectedRoute>
        } />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/profile" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute><AdminPage /></ProtectedRoute>
        } />
        <Route path="/transport" element={<TransportPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppProvider>
          <Layout />
        </AppProvider>
      </CartProvider>
    </AuthProvider>
  );
}