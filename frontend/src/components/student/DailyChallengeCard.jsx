import { useState, useEffect } from "react";
import { CheckCircle, Code2, Loader, BookOpen, Timer } from "lucide-react";
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
      <span className="time-label flex items-center gap-1">
        <Timer className="w-4 h-4" />
        Time Remaining
      </span>
      <span className={`time-value ${expired ? "text-red-400" : ""}`}>{timeLeft}</span>
      {expired && (
        <span className="text-xs text-red-400 font-medium mt-1">Deadline passed</span>
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
    <div className="glass-card challenge-card">
      <div className="grid md:grid-cols-2 gap-8 items-center w-full">
        {/* Left: Problem details */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-glow">
              <Code2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-dark-300 text-sm">
                <BookOpen className="w-4 h-4" />
                LeetCode Challenge
              </div>
              <h3 className="text-3xl font-bold text-white">#{challenge.leetcodeNumber}</h3>
            </div>
          </div>

          <p className="text-lg text-dark-200 mb-2">{challenge.leetcodeTitle}</p>

          {status === "COMPLETED" ? (
            <div className="text-green-400 font-medium flex items-center gap-2 mt-3">
              <CheckCircle className="w-5 h-5" />
              Completed{language ? ` in ${language}` : ""}
              {completedAt ? ` · ${new Date(completedAt).toLocaleString()}` : ""}
            </div>
          ) : status === "NOT_COMPLETED" ? (
            <div className="text-red-400 font-medium mt-3">✗ Not Completed</div>
          ) : (
            <div className="text-yellow-400 font-medium mt-3">● Pending</div>
          )}
        </div>

        {/* Right: Big Countdown */}
        <div className="flex justify-center w-full">
          <Countdown endTime={challenge.endTime} />
        </div>
      </div>

      {/* Action bar */}
      {status !== "COMPLETED" && status !== "NOT_COMPLETED" && (
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button onClick={handleComplete} disabled={submitting} className="btn-primary px-8 py-3 text-lg disabled:opacity-50">
            {submitting ? <Loader className="w-5 h-5 animate-spin mr-2" /> : null}
            {submitting ? "Verifying..." : "Mark as Completed"}
          </button>
        </div>
      )}
    </div>
  );
}