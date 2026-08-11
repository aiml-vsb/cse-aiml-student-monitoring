import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import VerifyOTP from "./pages/VerifyOTP";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
import NotFound from "./pages/NotFound";
import StudentTasks from "./pages/student/StudentTasks";
import AdminTasks from "./pages/admin/AdminTasks";
import StudentProfile from "./pages/student/StudentProfile";

// Protected route wrapper – checks authentication and role
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login/student" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === "ADMIN" ? "/admin" : "/student"} replace />;
  }

  return children;
}

export default function App() {
  const location = useLocation();

  // Handle Google OAuth callback – token passed via URL in /student?token=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      // Store JWT token
      localStorage.setItem("token", token);

      // Clean the URL (remove ?token=) to avoid exposing token
      window.history.replaceState({}, "", "/student");

      // Reload to let AuthProvider pick up the token (or use state directly)
      window.location.reload();
    }
  }, [location]);

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Navigate to="/login/student" replace />} />
      <Route path="/login/:type" element={<Login />} />
      <Route path="/verify" element={<VerifyOTP />} />
      <Route path="/student/tasks" element={<StudentTasks />} />
      <Route path="/admin/tasks" element={<AdminTasks />} />
      <Route path="/student/profile" element={<StudentProfile />} />
      {/* Protected Admin */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected Student */}
      <Route
        path="/student/*"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}