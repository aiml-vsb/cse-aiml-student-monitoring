import { useState, useEffect } from "react";
import { FileText, Loader } from "lucide-react";
import Navbar from "../../components/common/Navbar";
import AnimatedBackground from "../../components/common/AnimatedBackground";
import api from "../../api/client";
import endpoints from "../../api/endpoints";

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await api.get(endpoints.allTasks);
        setTasks(data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

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
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">All Tasks</h1>
        {tasks.length === 0 ? (
          <p className="text-dark-400">No tasks created.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <div key={task.id} className="glass-card p-6">
                {task.thumbnail && (
                  <img src={task.thumbnail} alt={task.title} className="thumbnail-landscape mb-3" />
                )}
                <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-400" />
                  {task.title}
                </h2>
                <p className="text-sm text-dark-300">{task.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}