import { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import Navbar from "../../components/common/Navbar";
import AnimatedBackground from "../../components/common/AnimatedBackground";
import Loader from "../../components/common/Loader";
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
        <Loader size="lg" text="Loading task catalog..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AnimatedBackground />
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-dark-800 tracking-tight">Active Department Tasks</h1>
          <p className="text-xs text-dark-400 font-semibold mt-1">Catalog of departmental notices and tasks assigned to students.</p>
        </div>

        {tasks.length === 0 ? (
          <div className="neu-card p-10 text-center text-dark-400 font-semibold text-sm">
            No departmental tasks or notices have been created yet.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <div key={task.id} className="neu-card p-6 hover:-translate-y-1 transition-all duration-300">
                {task.thumbnail && (
                  <div className="card-image-wrapper mb-3">
                    <img src={task.thumbnail} alt={task.title} className="thumbnail-landscape" />
                  </div>
                )}
                <h2 className="text-base font-bold text-dark-800 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="truncate">{task.title}</span>
                </h2>
                <p className="text-xs text-dark-500 line-clamp-3 leading-relaxed">{task.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}