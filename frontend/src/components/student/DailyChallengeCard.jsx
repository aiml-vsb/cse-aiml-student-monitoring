import { useState, useEffect } from "react";
import { CheckCircle, Code2, Loader2, BookOpen, Timer } from "lucide-react";
import api from "../../api/client";
import endpoints from "../../api/endpoints";
import { useToast } from "../../context/ToastContext";

function Countdown({ endTime }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const update = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("00:00:00");
        setExpired(true);
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      );
      setExpired(false);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <div className="countdown-box">
      <span className="time-label flex items-center gap-1.5">
        <Timer className="w-3.5 h-3.5 text-indigo-600" />
        Time Remaining
      </span>
      <span className={`time-value ${expired ? "text-red-500" : "text-indigo-600"}`}>{timeLeft}</span>
      {expired && (
        <span className="text-xs text-red-500 font-bold mt-1 tracking-wide">Deadline passed</span>
      )}
    </div>
  );
}

export default function DailyChallengeCard({ challenge, status, completedAt, language, onComplete }) {
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const handleComplete = async () => {
    setSubmitting(true);
    try {
      const { data } = await api.post(endpoints.completeChallenge);
      toast.success(data.message || "Challenge completed!");
      onComplete();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to complete challenge");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="neu-card challenge-card p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6 items-center w-full">
        {/* Left: Problem details */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-[#e0e5ec] shadow-neu-flat flex items-center justify-center border border-white/80 shrink-0">
              <Code2 className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-dark-400 text-xs font-semibold uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                Daily LeetCode Challenge
              </div>
              <h3 className="text-xl font-extrabold text-dark-800 tracking-tight">#{challenge.leetcodeNumber}</h3>
            </div>
          </div>

          <p className="text-sm font-semibold text-dark-600 mb-4 leading-snug">{challenge.leetcodeTitle}</p>

          {status === "COMPLETED" ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 font-bold text-xs">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Completed{language ? ` in ${language}` : ""}
              {completedAt ? ` · ${new Date(completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ""}
            </div>
          ) : status === "NOT_COMPLETED" ? (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 font-bold text-xs">
              ✗ Not Completed
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 font-bold text-xs">
              ● Pending Submission
            </div>
          )}  
        </div>

        {/* Right: Big Countdown */}
        <div className="flex justify-center w-full">
          <Countdown endTime={challenge.endTime} />
        </div>
      </div>

      {/* Action bar */}
      {status !== "COMPLETED" && status !== "NOT_COMPLETED" && (
        <div className="mt-6 pt-5 border-t border-white/60 flex justify-end">
          <button onClick={handleComplete} disabled={submitting} className="btn-primary px-8 py-3 text-sm font-bold disabled:opacity-50 flex items-center">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {submitting ? "Verifying On LeetCode..." : "Mark as Completed"}
          </button>
        </div>
      )}
    </div>
  );
}

