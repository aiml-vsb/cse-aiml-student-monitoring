import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Plus, Trash2, Loader, Edit2, Clock } from "lucide-react";
import api from "../../api/client";
import endpoints from "../../api/endpoints";
import ThumbnailUploader from "../../components/common/ThumbnailUploader";
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
        toast.success(data.message || "Task updated!");
      } else {
        const { data } = await api.post(endpoints.createTask, payload);
        toast.success(data.message || "Task created!");
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
    if (!window.confirm("Are you sure?")) return;
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary-400" />
          Task Manager (with Deadlines)
        </h2>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); setFormData(emptyForm); }} className="btn-primary">
          <Plus className="w-4 h-4 mr-1" />
          {showForm ? "Cancel" : "New Task"}
        </button>
      </div>

      {showForm && (
        <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">{editing ? "Edit Task" : "Create New Task"}</h3>
          <div>
            <label className="label-dark">Title</label>
            <input type="text" name="title" required value={formData.title} onChange={handleChange} className="input-dark" />
          </div>
          <div>
            <label className="label-dark">Description</label>
            <textarea name="description" required rows="3" value={formData.description} onChange={handleChange} className="input-dark" />
          </div>
          <ThumbnailUploader label="Thumbnail" value={formData.thumbnail} onChange={(val) => setFormData({ ...formData, thumbnail: val })} />
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label-dark">Start Time (Optional)</label>
              <input type="datetime-local" name="startTime" value={formData.startTime} onChange={handleChange} className="input-dark" />
            </div>
            <div>
              <label className="label-dark">Deadline (End Time)</label>
              <input type="datetime-local" name="endTime" value={formData.endTime} onChange={handleChange} className="input-dark" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="btn-primary">{submitting ? "Saving..." : editing ? "Update" : "Create"}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); setFormData(emptyForm); }} className="btn-secondary">Cancel</button>
          </div>
        </motion.form>
      )}

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">Active Tasks ({tasks.length})</h2>
        {loading ? (
          <div className="flex justify-center py-8"><Loader className="w-8 h-8 animate-spin text-primary-400" /></div>
        ) : tasks.length === 0 ? (
          <p className="text-center text-dark-400 py-8">No active tasks</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {tasks.map((task) => (
              <div key={task.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                {task.thumbnail && <img src={task.thumbnail} alt={task.title} className="thumbnail-landscape mb-3" />}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">{task.title}</h4>
                    <p className="text-sm text-dark-400 mb-2">{task.description}</p>
                    {task.endTime && (
                      <div className="flex items-center gap-1 text-xs text-dark-400">
                        <Clock className="w-3 h-3" />
                        Deadline: {new Date(task.endTime).toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-2">
                    <button onClick={() => startEdit(task)} className="p-2 rounded hover:bg-white/10 text-primary-400">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(task.id)} className="p-2 rounded hover:bg-red-500/10 text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
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