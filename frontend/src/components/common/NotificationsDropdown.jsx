import { useState, useEffect, useRef } from "react";
import { Bell, FileText, CheckCircle, X, Loader } from "lucide-react";
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

  const handleTaskClick = (task) => {
    setOpen(false);
    navigate(basePath);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
      >
        <Bell className="w-5 h-5" />
        {tasks && tasks.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold">
            {tasks.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 glass-card p-4 z-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white font-semibold">Notifications</h3>
            <button onClick={() => setOpen(false)}>
              <X className="w-4 h-4 text-dark-300" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-4">
              <Loader className="w-6 h-6 animate-spin text-primary-400" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="py-4 text-center text-dark-400">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              No notifications yet
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => handleTaskClick(task)}
                  className="w-full text-left p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white text-sm">{task.title}</div>
                      <p className="text-xs text-dark-400 mt-1 line-clamp-2">{task.description}</p>
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