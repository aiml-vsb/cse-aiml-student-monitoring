import { useState, useEffect } from "react";
import { FileText, CheckCircle, Clock } from "lucide-react";
import Navbar from "../../components/common/Navbar";
import AnimatedBackground from "../../components/common/AnimatedBackground";
import Loader from "../../components/common/Loader";
import api from "../../api/client";
import endpoints from "../../api/endpoints";
import { useToast } from "../../context/ToastContext";

function Countdown({ endTime }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Deadline passed"); return; }
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  return <span className={`text-xs font-mono font-bold ${timeLeft === "Deadline passed" ? "text-red-500" : "text-emerald-600"}`}>{timeLeft}</span>;
}

export default function StudentTasks() {
  const [activeTasks, setActiveTasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(null);
  const toast = useToast();

  const fetchTasks = async () => {
    try {
      const [activeRes, historyRes] = await Promise.all([
        api.get(endpoints.activeTasks),
        api.get(endpoints.taskHistory),
      ]);
      setActiveTasks(activeRes.data.data || []);
      setHistory(historyRes.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleComplete = async (taskId) => {
    setCompleting(taskId);
    try {
      const { data } = await api.post(endpoints.completeTask(taskId));
      toast.success(data.message || "Task completed!");
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to complete task");
    } finally {
      setCompleting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <Loader size="lg" text="Loading your tasks..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AnimatedBackground />
      <Navbar />
      <div className="container mx-auto px-4 py-8 space-y-8 max-w-5xl">
        <div>
          <h1 className="text-3xl font-extrabold text-dark-800 tracking-tight">Student Tasks & Assignments</h1>
          <p className="text-xs text-dark-400 font-semibold mt-1">Complete assigned departmental tasks and track submission history.</p>
        </div>

        <section>
          <h2 className="text-xl font-extrabold text-dark-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Active Tasks ({activeTasks.length})
          </h2>
          {activeTasks.length === 0 ? (
            <div className="neu-card p-8 text-center text-dark-400 font-semibold text-sm">
              No pending active tasks right now. Great job!
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTasks.map((task) => (
                <div key={task.id} className="neu-card p-6 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
                  <div>
                    {task.thumbnail && (
                      <div className="card-image-wrapper mb-3">
                        <img src={task.thumbnail} alt={task.title} className="thumbnail-landscape" />
                      </div>
                    )}
                    <h3 className="text-base font-bold text-dark-800 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="truncate">{task.title}</span>
                    </h3>
                    <p className="text-xs text-dark-500 mb-4 line-clamp-3 leading-relaxed">{task.description}</p>
                  </div>

                  <div>
                    {task.endTime && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#e0e5ec] shadow-neu-inset-sm text-xs text-dark-600 mb-4 border border-white/60">
                        <span className="flex items-center gap-1 text-[11px] font-bold text-dark-400">
                          <Clock className="w-3.5 h-3.5" />
                          Deadline
                        </span>
                        <Countdown endTime={task.endTime} />
                      </div>
                    )}
                    {task.status === "COMPLETED" ? (
                      <div className="text-emerald-700 font-bold flex items-center justify-center gap-1.5 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
                        <CheckCircle className="w-4 h-4 text-emerald-600" /> Completed
                      </div>
                    ) : (
                      <button onClick={() => handleComplete(task.id)} disabled={completing === task.id} className="btn-primary w-full py-2.5 text-xs font-bold disabled:opacity-50">
                        {completing === task.id ? "Marking..." : "Mark as Completed"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-dark-800 mb-4">Submission History</h2>
          {history.length === 0 ? (
            <div className="neu-card p-6 text-center text-dark-400 font-semibold text-xs">
              No task history yet.
            </div>
          ) : (
            <div className="neu-card p-6 space-y-3">
              {history.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3.5 rounded-xl bg-[#e0e5ec] shadow-neu-flat-sm border border-white/70">
                  <div>
                    <div className="font-bold text-dark-800 text-xs">{task.title}</div>
                    {task.endTime && (
                      <div className="text-[10px] font-semibold text-dark-400 mt-0.5">
                        Deadline: {new Date(task.endTime).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div>
                    {task.status === "COMPLETED" ? (
                      <span className="text-emerald-700 bg-emerald-500/10 px-2.5 py-1 rounded-lg text-xs font-bold">✓ Completed</span>
                    ) : task.status === "NOT_COMPLETED" ? (
                      <span className="text-red-600 bg-red-500/10 px-2.5 py-1 rounded-lg text-xs font-bold">✗ Missed</span>
                    ) : (
                      <span className="text-amber-700 bg-amber-500/10 px-2.5 py-1 rounded-lg text-xs font-bold">Pending</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}