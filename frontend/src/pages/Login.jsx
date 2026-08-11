import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Mail, ShieldCheck, ArrowLeft, Lock, Chrome } from "lucide-react";
import AnimatedBackground from "../components/common/AnimatedBackground";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const { type } = useParams();
  const [loginType, setLoginType] = useState(type === "admin" ? "admin" : "student");
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { studentLogin, studentRegister, adminLogin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setLoginType(type === "admin" ? "admin" : "student");
    setAuthMode("login");
    setPassword("");
    setConfirmPassword("");
    setEmail("");
  }, [type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let result;

    if (loginType === "admin") {
      result = await adminLogin(email, password);
      if (result.success) navigate("/admin");
    } else if (authMode === "login") {
      result = await studentLogin(email, password);
      if (result.success) navigate("/student");
    } else {
      // Registration
      if (password !== confirmPassword) {
        setLoading(false);
        toast.error("Passwords do not match");
        return;
      }
      result = await studentRegister(email, password);
      if (result.success) {
        sessionStorage.setItem("pendingEmail", email);
        navigate("/verify");
      }
    }

    setLoading(false);

    if (result?.success) {
      toast.success(
        loginType === "admin"
          ? "Admin login successful!"
          : authMode === "login"
            ? "Student login successful!"
            : "Registration successful! Check your email for OTP."
      );
    } else {
      toast.error(result?.message || "Something went wrong");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 w-full max-w-md mx-4"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-dark-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-glow">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-white mb-8">
          {loginType === "admin" ? "Admin Login" : "Student Login / Register"}
        </h1>

        {/* Student / Admin Switch */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-dark-800 rounded-lg mb-6">
          <Link
            to="/login/student"
            className={`py-2 rounded-lg font-semibold transition-all text-center ${
              loginType === "student"
                ? "bg-primary-600 text-white shadow-glow"
                : "text-dark-300 hover:text-white"
            }`}
          >
            Student
          </Link>
          <Link
            to="/login/admin"
            className={`py-2 rounded-lg font-semibold transition-all text-center ${
              loginType === "admin"
                ? "bg-secondary-600 text-white shadow-glow-blue"
                : "text-dark-300 hover:text-white"
            }`}
          >
            Admin
          </Link>
        </div>

        {/* Student Login/Register Tabs */}
        {loginType === "student" && (
          <div className="grid grid-cols-2 gap-2 mb-6">
            <button
              type="button"
              onClick={() => { setAuthMode("login"); setPassword(""); setConfirmPassword(""); }}
              className={`py-2 rounded-lg font-semibold transition-all ${
                authMode === "login"
                  ? "bg-white/10 text-white border border-primary-500"
                  : "text-dark-400 hover:text-white"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode("register"); setPassword(""); setConfirmPassword(""); }}
              className={`py-2 rounded-lg font-semibold transition-all ${
                authMode === "register"
                  ? "bg-white/10 text-white border border-primary-500"
                  : "text-dark-400 hover:text-white"
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* Google Sign-In – only for Student Login */}
        {loginType === "student" && authMode === "login" && (
          <>
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2 bg-white text-dark-900 py-3 rounded-lg font-semibold hover:bg-dark-100 transition-all mb-4"
            >
              <Chrome className="w-5 h-5 text-primary-500" />
              Sign in with Google
            </button>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-dark-500 text-sm">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
          </>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="label-dark">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-dark pl-10"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="label-dark">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-dark pl-10"
                placeholder={
                  authMode === "register" ? "Create a password (min 6 chars)" : "Enter your password"
                }
              />
            </div>
          </div>

          {loginType === "student" && authMode === "register" && (
            <div className="mb-4">
              <label className="label-dark">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-dark pl-10"
                  placeholder="Confirm your password"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 mt-4 rounded-lg font-semibold transition-all disabled:opacity-50 ${
              loginType === "admin" ? "btn-secondary" : "btn-primary"
            }`}
          >
            {loading
              ? "Please wait..."
              : loginType === "admin"
                ? "Admin Login"
                : authMode === "login"
                  ? "Student Login"
                  : "Register & Send OTP"}
          </button>
        </form>

        <p className="text-center text-xs text-dark-500 mt-6">
          {loginType === "student" && authMode === "login"
            ? "New here? Switch to Register to create an account."
            : loginType === "student" && authMode === "register"
              ? "An OTP will be sent to your email for verification."
              : "Only department admins can access this panel."}
        </p>
      </motion.div>
    </div>
  );
}