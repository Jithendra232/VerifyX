import { Navigate, Route, Routes } from "react-router-dom";

import AuthGuard from "../components/auth/AuthGuard";
import ProtectedRoute from "../components/common/ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import PublicLayout from "../layouts/PublicLayout";
import LoginPage from "../pages/auth/LoginPage";
import AdminDashboard from "../pages/dashboard/AdminDashboard";
import AuditLogsPage from "../pages/dashboard/AuditLogsPage";
import CustomerDashboard from "../pages/dashboard/CustomerDashboard";
import DistributorDashboard from "../pages/dashboard/DistributorDashboard";
import ManufacturerDashboard from "../pages/dashboard/ManufacturerDashboard";
import ProductHistoryPage from "../pages/dashboard/ProductHistoryPage";
import RetailerDashboard from "../pages/dashboard/RetailerDashboard";
import VerificationHistoryPage from "../pages/dashboard/VerificationHistoryPage";
import AddProductPage from "../pages/manufacturer/AddProductPage";
import AboutPage from "../pages/public/AboutPage";
import HomePage from "../pages/public/HomePage";
import UnauthorizedPage from "../pages/public/UnauthorizedPage";
import VerifyPage from "../pages/public/VerifyPage";
import SignupPage from "../pages/auth/SignupPage";
import AuthCallbackPage from "../pages/auth/AuthCallbackPage";

function AppRoutes() {
  return (
    <Routes>
        <Route path="/login/sso-callback" element={<AuthCallbackPage />} />
        <Route path="/sign-up/sso-callback" element={<AuthCallbackPage />} />

        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/login/*" element={<LoginPage />} />
          <Route path="/sign-up/*" element={<SignupPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          <Route
            path="/admin"
            element={<Navigate to="/dashboard/admin" replace />}
          />
          <Route
            path="/manufacturer"
            element={<Navigate to="/dashboard/manufacturer" replace />}
          />
          <Route
            path="/distributor"
            element={<Navigate to="/dashboard/distributor" replace />}
          />
          <Route
            path="/retailer"
            element={<Navigate to="/dashboard/retailer" replace />}
          />
        </Route>

        <Route
          element={
            <AuthGuard>
              <DashboardLayout />
            </AuthGuard>
          }
        >
          <Route
            path="/dashboard/manufacturer"
            element={
              <ProtectedRoute allowedRoles={["manufacturer"]}>
                <ManufacturerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/distributor"
            element={
              <ProtectedRoute allowedRoles={["distributor"]}>
                <DistributorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/retailer"
            element={
              <ProtectedRoute allowedRoles={["retailer"]}>
                <RetailerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/customer"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/history"
            element={
              <ProtectedRoute allowedRoles={["admin", "manufacturer", "distributor", "retailer", "customer"]}>
                <ProductHistoryPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/verification-history"
            element={
              <ProtectedRoute allowedRoles={["admin", "manufacturer", "distributor", "retailer", "customer"]}>
                <VerificationHistoryPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/audit-logs"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AuditLogsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manufacturer/add-product"
            element={
              <ProtectedRoute allowedRoles={["manufacturer"]}>
                <AddProductPage />
              </ProtectedRoute>
            }
          />
        </Route>
    </Routes>
  );
}

export default AppRoutes;
