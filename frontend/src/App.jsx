import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useToast } from "./context/ToastContext";
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
      <div className="flex flex-col items-center justify-center h-screen bg-[#e0e5ec] text-dark-500 font-bold">
        <div className="w-12 h-12 rounded-2xl bg-[#e0e5ec] shadow-neu-flat flex items-center justify-center mb-3">
          <div className="w-5 h-5 rounded-full border-2 border-indigo-600/30 border-t-indigo-600 animate-spin" />
        </div>
        <span className="text-xs uppercase tracking-widest text-dark-400">Authenticating...</span>
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
  const toast = useToast();
  const { refreshUser } = useAuth();

  // Handle OAuth callback query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const githubLinked = params.get("github");
    const githubError = params.get("error");

    if (token) {
      localStorage.setItem("token", token);
      window.history.replaceState({}, "", "/student");
      refreshUser().catch(() => {});
      return;
    }

    if (githubLinked === "linked") {
      toast.success("GitHub linked successfully!");
      window.history.replaceState({}, "", "/student");
      refreshUser().catch(() => {});
      return;
    }

    if (githubError === "github_failed") {
      toast.error("GitHub linking failed. Please try again.");
      window.history.replaceState({}, "", "/student");
    }
  }, [location, toast]);

  return (
    <>
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

      <Analytics />
    </>
  );
}