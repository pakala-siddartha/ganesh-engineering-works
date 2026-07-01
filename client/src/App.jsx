import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { WakeUpBanner } from "./components/ui/WakeUpBanner";
import { ROUTES } from "./constants/routes";

// Pages
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProductionPage from "./pages/ProductionPage";
import SalesPage from "./pages/SalesPage";
import StockPage from "./pages/StockPage";
import CementPage from "./pages/CementPage";
import StatisticsPage from "./pages/StatisticsPage";
import GhmcDashboardPage from "./pages/GhmcDashboardPage";
import {
  GhmcProductionPage,
  GhmcSalesPage,
  GhmcStockPage,
  GhmcCementPage,
  GhmcStatisticsPage,
} from "./pages/GhmcPages";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 2,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />

            {/* Protected */}
            <Route
              path={ROUTES.DASHBOARD}
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.PRODUCTION}
              element={
                <ProtectedRoute>
                  <ProductionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.SALES}
              element={
                <ProtectedRoute>
                  <SalesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.STOCK}
              element={
                <ProtectedRoute>
                  <StockPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.CEMENT}
              element={
                <ProtectedRoute>
                  <CementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.STATISTICS}
              element={
                <ProtectedRoute>
                  <StatisticsPage />
                </ProtectedRoute>
              }
            />
            {/* GHMC */}
            <Route
              path={ROUTES.GHMC}
              element={
                <ProtectedRoute>
                  <GhmcDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.GHMC_PRODUCTION}
              element={
                <ProtectedRoute>
                  <GhmcProductionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.GHMC_SALES}
              element={
                <ProtectedRoute>
                  <GhmcSalesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.GHMC_STOCK}
              element={
                <ProtectedRoute>
                  <GhmcStockPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.GHMC_CEMENT}
              element={
                <ProtectedRoute>
                  <GhmcCementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.GHMC_STATISTICS}
              element={
                <ProtectedRoute>
                  <GhmcStatisticsPage />
                </ProtectedRoute>
              }
            />
            {/* Fallback */}
            <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          </Routes>

          {/* Cold-start wake-up banner */}
          <WakeUpBanner />

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#1a1a24",
                color: "#e5e7eb",
                border: "1px solid #2d2d3d",
                borderRadius: "12px",
                fontSize: "14px",
              },
              success: {
                iconTheme: { primary: "#10b981", secondary: "#1a1a24" },
              },
              error: {
                iconTheme: { primary: "#ef4444", secondary: "#1a1a24" },
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
