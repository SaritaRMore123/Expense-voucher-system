import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import CreateVoucher from "./pages/CreateVoucher";
import EditVoucher from "./pages/EditVoucher";
import MyVouchers from "./pages/MyVouchers";
import VoucherDetails from "./pages/VoucherDetails";
import DirectorDashboard from "./pages/DirectorDashboard";
import PendingApprovals from "./pages/PendingApprovals";
import AllVouchers from "./pages/AllVouchers";
import AccountsDashboard from "./pages/AccountsDashboard";

const roleHome = { employee: "/employee", director: "/director", accounts: "/accounts" };

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={roleHome[user.role]} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<HomeRedirect />} />

      {/* Employee */}
      <Route path="/employee" element={<ProtectedRoute roles={["employee"]}><EmployeeDashboard /></ProtectedRoute>} />
      <Route path="/employee/vouchers" element={<ProtectedRoute roles={["employee"]}><MyVouchers /></ProtectedRoute>} />
      <Route path="/employee/vouchers/new" element={<ProtectedRoute roles={["employee"]}><CreateVoucher /></ProtectedRoute>} />
      <Route path="/employee/vouchers/:id" element={<ProtectedRoute roles={["employee"]}><VoucherDetails /></ProtectedRoute>} />
      <Route path="/employee/vouchers/:id/edit" element={<ProtectedRoute roles={["employee"]}><EditVoucher /></ProtectedRoute>} />

      {/* Director */}
      <Route path="/director" element={<ProtectedRoute roles={["director"]}><DirectorDashboard /></ProtectedRoute>} />
      <Route path="/director/pending" element={<ProtectedRoute roles={["director"]}><PendingApprovals /></ProtectedRoute>} />
      <Route path="/director/vouchers" element={<ProtectedRoute roles={["director"]}><AllVouchers /></ProtectedRoute>} />
      <Route path="/director/vouchers/:id" element={<ProtectedRoute roles={["director"]}><VoucherDetails /></ProtectedRoute>} />

      {/* Accounts */}
      <Route path="/accounts" element={<ProtectedRoute roles={["accounts"]}><AccountsDashboard /></ProtectedRoute>} />
      <Route path="/accounts/vouchers" element={<ProtectedRoute roles={["accounts"]}><AllVouchers /></ProtectedRoute>} />
      <Route path="/accounts/vouchers/:id" element={<ProtectedRoute roles={["accounts"]}><VoucherDetails /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
