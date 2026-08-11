import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Loader } from "lucide-react";
import api from "../../api/client";
import endpoints from "../../api/endpoints";
import { useToast } from "../../context/ToastContext";

export default function StudentTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(endpoints.allTasks);
        setTasks(data.data || []);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 max-w-2xl"
    >
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <FileText className="w-6 h-6 text-primary-400" />
        Tasks & Notifications
      </h2>

      {tasks.length === 0 ? (
        <div className="text-center py-8 text-dark-400">
          <FileText className="w-10 h-10 mx-auto mb-2 text-dark-600" />
          No tasks yet — check back later
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
              {task.thumbnail && (
                <img src={task.thumbnail} alt={task.title} className="w-full h-32 object-cover rounded-lg mb-3" />
              )}
              <h3 className="font-semibold text-white mb-1">{task.title}</h3>
              <p className="text-sm text-dark-300">{task.description}</p>
              <div className="text-xs text-dark-500 mt-2">
                Posted: {new Date(task.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}