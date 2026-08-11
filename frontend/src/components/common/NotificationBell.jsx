import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import api from "../../api/client";
import endpoints from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import NotificationsDropdown from "./NotificationsDropdown";

export default function NotificationBell() {
  const [tasks, setTasks] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const dropdownRef = useRef(null);

  const fetchTasks = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await api.get(endpoints.allTasks);
      setTasks(data.data || []);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // Refresh every 30s
    const interval = setInterval(fetchTasks, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
      >
        <Bell className="w-5 h-5 text-dark-300" />
        {tasks.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
            {tasks.length}
          </span>
        )}
      </button>
      {isOpen && (
        <NotificationsDropdown
          tasks={tasks}
          loading={loading}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}