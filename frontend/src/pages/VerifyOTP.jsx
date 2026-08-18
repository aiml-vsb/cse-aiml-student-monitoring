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
      toast.success("OTP resent successfully!");
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative p-4">
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="neu-card p-8 sm:p-10 w-full max-w-md my-8 relative z-10"
      >
        <button
          onClick={() => navigate("/login")}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-dark-500 hover:text-indigo-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Change Email
        </button>

        <div className="flex items-center justify-center mb-5">
          <div className="w-16 h-16 rounded-2xl bg-[#e0e5ec] shadow-neu-flat flex items-center justify-center border border-white/80">
            <ShieldCheck className="w-8 h-8 text-indigo-600" />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-center text-dark-800 mb-1.5 tracking-tight">Verify Email</h1>
        <p className="text-center text-xs text-dark-500 mb-8 leading-relaxed">
          Enter the 6-digit verification code sent to:<br />
          <span className="text-indigo-600 font-bold">{email}</span>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="flex gap-2 sm:gap-2.5 justify-center mb-8">
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
                className="w-11 h-14 sm:w-12 sm:h-14 text-center text-2xl font-mono font-extrabold bg-[#e0e5ec] text-dark-800 rounded-xl shadow-neu-inset border border-white/60 focus:outline-none focus:shadow-neu-inset-deep focus:border-indigo-400 focus:text-indigo-600 transition-all"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || otp.some((d) => !d)}
            className="btn-primary w-full py-3.5 text-sm font-bold disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>
        </form>

        <button
          onClick={handleResend}
          disabled={resending}
          className="w-full flex items-center justify-center gap-2 text-xs font-bold text-dark-400 hover:text-indigo-600 mt-5 py-2 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin text-indigo-600" : ""}`} />
          {resending ? "Dispatching code..." : "Resend code"}
        </button>
      </motion.div>
    </div>
  );
}
