import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import Loader from "../common/Loader";
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
        <Loader size="md" text="Loading tasks..." />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="neu-card p-6 md:p-8 max-w-2xl"
    >
      <h2 className="text-xl font-extrabold text-dark-800 mb-6 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-[#e0e5ec] shadow-neu-flat-sm flex items-center justify-center border border-white/80">
          <FileText className="w-5 h-5 text-indigo-600" />
        </div>
        <span>Department Tasks & Announcements</span>
      </h2>

      {tasks.length === 0 ? (
        <div className="text-center py-10 neu-inset-panel p-6 text-dark-400 font-semibold text-xs">
          <FileText className="w-8 h-8 mx-auto mb-2 text-dark-300" />
          No tasks or notifications published at this moment.
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="p-4 rounded-xl bg-[#e0e5ec] shadow-neu-flat-sm border border-white/70">
              {task.thumbnail && (
                <div className="card-image-wrapper mb-3">
                  <img src={task.thumbnail} alt={task.title} className="thumbnail-landscape" />
                </div>
              )}
              <h3 className="font-bold text-dark-800 text-sm mb-1">{task.title}</h3>
              <p className="text-xs text-dark-500 leading-relaxed">{task.description}</p>
              <div className="text-[10px] font-semibold text-dark-400 mt-2.5 pt-2 border-t border-white/60">
                Posted on: {new Date(task.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}