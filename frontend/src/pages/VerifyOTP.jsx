import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react";
import AnimatedBackground from "../components/common/AnimatedBackground";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function VerifyOTP() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputsRef = useRef([]);
  const { verifyOtp, sendOtp } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const email = sessionStorage.getItem("pendingEmail") || "";

  useEffect(() => {
    if (!email) {
      navigate("/login");
    }
  }, [email, navigate]);

  const handleChange = (index, value) => {
    const newOtp = [...otp];
    newOtp[index] = value.replace(/[^0-9]/g, "").slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (pasted.length > 0) {
      const newOtp = ["", "", "", "", "", ""];
      [...pasted].forEach((char, i) => {
        newOtp[i] = char;
      });
      setOtp(newOtp);
      inputsRef.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const otpString = otp.join("");
    const result = await verifyOtp(email, otpString);
    setLoading(false);

    if (result.success) {
      sessionStorage.removeItem("pendingEmail");
      toast.success("Login successful!");
      navigate(result.user.role === "ADMIN" ? "/admin" : "/student");
    } else {
      toast.error(result.message);
      setOtp(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    setResending(true);
    const result = await sendOtp(email);
    setResending(false);
    if (result.success) {
      toast.success("OTP resent!");
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 w-full max-w-md mx-4"
      >
        <button
          onClick={() => navigate("/login")}
          className="inline-flex items-center gap-2 text-dark-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Change Email
        </button>

        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-glow">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-white mb-2">Verify Email</h1>
        <p className="text-center text-dark-400 mb-8">
          Enter the 6-digit code sent to:<br />
          <span className="text-primary-400 font-semibold">{email}</span>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="flex gap-2 justify-center mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-14 text-center text-2xl font-bold bg-dark-800 border border-dark-600 rounded-lg focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || otp.some((d) => !d)}
            className="btn-primary w-full py-3 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify & Login"}
          </button>
        </form>

        <button
          onClick={handleResend}
          disabled={resending}
          className="w-full flex items-center justify-center gap-2 text-dark-400 hover:text-primary-400 mt-4 py-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${resending ? "animate-spin" : ""}`} />
          {resending ? "Resending..." : "Resend OTP"}
        </button>
      </motion.div>
    </div>
  );
}
