import { useState, useEffect, useRef } from "react";
import { Bell, FileText, CheckCircle, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";
import endpoints from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";

export default function NotificationsDropdown({ basePath = "/student/tasks" }) {
  const [open, setOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (open && user) fetchTasks();
  }, [open, user]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(endpoints.allTasks);
      setTasks(data.data || []);
    } catch (err) {
      console.error("Failed to load tasks:", err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTaskClick = () => {
    setOpen(false);
    navigate(basePath);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`relative p-2.5 rounded-xl text-dark-600 transition-all ${
          open ? "shadow-neu-inset text-indigo-600" : "shadow-neu-btn active:shadow-neu-inset hover:text-dark-800"
        }`}
      >
        <Bell className="w-4 h-4" />
        {tasks && tasks.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold shadow-sm">
            {tasks.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 neu-card p-4 z-50 animate-fade-in border border-white/70">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/60">
            <h3 className="text-dark-800 font-bold text-sm">Notifications</h3>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg text-dark-400 hover:text-dark-700 shadow-neu-btn active:shadow-neu-inset"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-5">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="py-6 text-center text-dark-400 text-sm">
              <FileText className="w-7 h-7 mx-auto mb-2 text-dark-300" />
              No notifications yet
            </div>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => handleTaskClick(task)}
                  className="w-full text-left p-3 rounded-xl bg-[#e0e5ec] shadow-neu-flat-sm hover:shadow-neu-btn transition-all duration-200"
                >
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-dark-800 text-xs">{task.title}</div>
                      <p className="text-[11px] text-dark-500 mt-0.5 line-clamp-2">{task.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}