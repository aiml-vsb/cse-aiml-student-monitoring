import { useState, useEffect } from "react";
import { FileText, Loader, CheckCircle, Clock } from "lucide-react";
import Navbar from "../../components/common/Navbar";
import AnimatedBackground from "../../components/common/AnimatedBackground";
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

  return <span className={`text-sm font-mono ${timeLeft === "Deadline passed" ? "text-red-400" : "text-green-400"}`}>{timeLeft}</span>;
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
        <Loader className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AnimatedBackground />
      <Navbar />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <h1 className="text-3xl font-bold text-white">Tasks</h1>

        <section>
          <h2 className="text-xl font-bold text-white mb-4">Active Tasks</h2>
          {activeTasks.length === 0 ? (
            <p className="text-dark-400">No active tasks right now.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeTasks.map((task) => (
                <div key={task.id} className="glass-card p-6">
                  {task.thumbnail && <img src={task.thumbnail} alt={task.title} className="thumbnail-landscape mb-3" />}
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary-400" />
                    {task.title}
                  </h3>
                  <p className="text-sm text-dark-300 mb-4">{task.description}</p>
                  {task.endTime && (
                    <div className="flex items-center gap-2 text-dark-400 mb-4">
                      <Clock className="w-4 h-4" />
                      <Countdown endTime={task.endTime} />
                    </div>
                  )}
                  {task.status === "COMPLETED" ? (
                    <div className="text-green-400 font-medium flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" /> Completed
                    </div>
                  ) : (
                    <button onClick={() => handleComplete(task.id)} disabled={completing === task.id} className="btn-primary w-full disabled:opacity-50">
                      {completing === task.id ? "Marking..." : "Mark as Completed"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-4">History</h2>
          {history.length === 0 ? (
            <p className="text-dark-400">No task history yet.</p>
          ) : (
            <div className="glass-card p-6 space-y-2">
              {history.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                  <div>
                    <div className="font-semibold text-white">{task.title}</div>
                    {task.endTime && (
                      <div className="text-xs text-dark-400">
                        Deadline: {new Date(task.endTime).toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div>
                    {task.status === "COMPLETED" ? (
                      <span className="text-green-400 text-sm">✓ Completed</span>
                    ) : task.status === "NOT_COMPLETED" ? (
                      <span className="text-red-400 text-sm">✗ Missed</span>
                    ) : (
                      <span className="text-yellow-400 text-sm">Pending</span>
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