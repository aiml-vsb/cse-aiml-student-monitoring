import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Plus, Trash2, Edit2, Clock } from "lucide-react";
import api from "../../api/client";
import endpoints from "../../api/endpoints";
import ThumbnailUploader from "../../components/common/ThumbnailUploader";
import Loader from "../common/Loader";
import { useToast } from "../../context/ToastContext";

const emptyForm = {
  title: "",
  description: "",
  thumbnail: "",
  startTime: "",
  endTime: "",
};

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const fetchTasks = async () => {
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

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 60_000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        thumbnail: formData.thumbnail || null,
        startTime: formData.startTime ? new Date(formData.startTime).toISOString() : null,
        endTime: formData.endTime ? new Date(formData.endTime).toISOString() : null,
      };

      if (editing) {
        const { data } = await api.put(endpoints.updateTask(editing), payload);
        toast.success(data.message || "Task updated successfully!");
      } else {
        const { data } = await api.post(endpoints.createTask, payload);
        toast.success(data.message || "Task published successfully!");
      }
      setFormData(emptyForm);
      setShowForm(false);
      setEditing(null);
      await fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(endpoints.deleteTask(id));
      toast.success("Task deleted");
      await fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const startEdit = (task) => {
    setEditing(task.id);
    setFormData({
      title: task.title,
      description: task.description,
      thumbnail: task.thumbnail || "",
      startTime: task.startTime ? new Date(task.startTime).toISOString().slice(0, 16) : "",
      endTime: task.endTime ? new Date(task.endTime).toISOString().slice(0, 16) : "",
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#e0e5ec] shadow-neu-flat-sm flex items-center justify-center border border-white/80 shrink-0">
            <FileText className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-dark-800 tracking-tight">Department Task Assignment</h2>
            <p className="text-xs text-dark-400 font-semibold">Assign tasks, announcements, and lab deadlines to students.</p>
          </div>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditing(null); setFormData(emptyForm); }}
          className={showForm ? "btn-secondary text-xs font-bold py-2.5 px-4" : "btn-primary text-xs font-bold py-2.5 px-4"}
        >
          <Plus className="w-4 h-4 mr-1" />
          {showForm ? "Close Form" : "Create New Task"}
        </button>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="neu-card p-6 md:p-8 space-y-4"
        >
          <h3 className="text-base font-extrabold text-dark-800">{editing ? "Edit Task" : "Assign New Task"}</h3>
          <div>
            <label className="label-dark">Task Title</label>
            <input type="text" name="title" required value={formData.title} onChange={handleChange} className="neu-input" placeholder="e.g. Lab Submission 3" />
          </div>
          <div>
            <label className="label-dark">Instructions & Details</label>
            <textarea name="description" required rows="3" value={formData.description} onChange={handleChange} className="neu-input resize-none" placeholder="Provide step-by-step instructions..." />
          </div>
          <ThumbnailUploader label="Banner / Reference Thumbnail" value={formData.thumbnail} onChange={(val) => setFormData({ ...formData, thumbnail: val })} />
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label-dark">Start Window (Optional)</label>
              <input type="datetime-local" name="startTime" value={formData.startTime} onChange={handleChange} className="neu-input" />
            </div>
            <div>
              <label className="label-dark">Submission Deadline</label>
              <input type="datetime-local" name="endTime" value={formData.endTime} onChange={handleChange} className="neu-input" />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={submitting} className="btn-primary py-3 px-8 text-xs font-bold disabled:opacity-50">
              {submitting ? "Saving..." : editing ? "Save Changes" : "Publish Task"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); setFormData(emptyForm); }} className="btn-secondary py-3 px-6 text-xs font-bold">
              Cancel
            </button>
          </div>
        </motion.form>
      )}

      <div className="neu-card p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-extrabold text-dark-800">Active Assigned Tasks</h2>
          <span className="text-xs font-bold text-dark-400">{tasks.length} Total</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader size="md" text="Loading tasks..." />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-10 neu-inset-panel p-6 text-dark-400 font-semibold text-xs">
            No departmental tasks created yet.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {tasks.map((task) => (
              <div key={task.id} className="p-5 rounded-xl bg-[#e0e5ec] shadow-neu-flat-sm border border-white/70 flex flex-col justify-between">
                <div>
                  {task.thumbnail && (
                    <div className="card-image-wrapper mb-3">
                      <img src={task.thumbnail} alt={task.title} className="thumbnail-landscape" />
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-bold text-dark-800 text-sm mb-1">{task.title}</h4>
                      <p className="text-xs text-dark-500 mb-3 leading-relaxed line-clamp-3">{task.description}</p>
                      {task.endTime && (
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-dark-400">
                          <Clock className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Deadline: {new Date(task.endTime).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1.5 ml-2 shrink-0">
                      <button onClick={() => startEdit(task)} className="p-2 rounded-xl text-dark-500 hover:text-indigo-600 hover:shadow-neu-btn active:shadow-neu-inset transition-all" title="Edit">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(task.id)} className="p-2 rounded-xl text-dark-500 hover:text-red-600 hover:shadow-neu-btn active:shadow-neu-inset transition-all" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}