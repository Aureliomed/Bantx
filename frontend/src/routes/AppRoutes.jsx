import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import Pagina1 from "../pages/Pagina1";
import NotFoundPage from "../pages/NotFoundPage";

import AdminDashboard from "../pages/AdminDashboard";
import EmailsPage from "../pages/EmailsPage";
import UsersPage from "../pages/UsersPage";
import ReportsPage from "../pages/ReportsPage";
import SettingsPage from "../pages/SettingsPage";

import PaymentsPage from "../pages/PaymentsPage";
import RequestFundsPage from "../pages/RequestFundsPage";
import MakePaymentPage from "../pages/MakePaymentPage";
import PendingPaymentsPage from "../pages/PendingPaymentsPage";

import OnboardingPage from "../pages/OnboardingPage"; // 👈 NUEVO

import ProtectedRoute from "./ProtectedRoute";
import ResetPassword from "../pages/ResetPassword"; // ✅ Ajusta la ruta según tu estructura

import UserProfilePage from "../pages/UserProfilePage"; // Importa la página de perfil de usuario

const AppRoutes = () => {
  return (
    <Routes>
      {/* 🌐 Rutas públicas */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* 👤 Rutas protegidas para usuarios */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute requiredRoles={["user"]}>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pagina1"
        element={
          <ProtectedRoute requiredRoles={["user"]}>
            <Pagina1 />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user-profile" // Ruta de la página de perfil de usuario
        element={
          <ProtectedRoute requiredRoles={["user"]}>
            <UserProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pay"
        element={
          <ProtectedRoute requiredRoles={["user"]}>
            <PaymentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/request-funds"
        element={
          <ProtectedRoute requiredRoles={["user"]}>
            <RequestFundsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/make-payment"
        element={
          <ProtectedRoute requiredRoles={["user"]}>
            <MakePaymentPage />
          </ProtectedRoute>
        }
      />

      {/* 🔒 Rutas protegidas para administradores */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/emails"
        element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <EmailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/pending-payments"
        element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <PendingPaymentsPage />
          </ProtectedRoute>
        }
      />

      {/* ❓ Página no encontrada */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
<Route path="/reset-password/:token" element={<ResetPassword />} />

export default AppRoutes;
