import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Trash2, Loader, Edit2 } from "lucide-react";
import api from "../../api/client";
import endpoints from "../../api/endpoints";
import ThumbnailUploader from "../common/ThumbnailUploader";
import { useToast } from "../../context/ToastContext";

const emptyForm = {
  title: "",
  description: "",
  link: "",
  previewImage: "",
  registrationStart: "",
  registrationEnd: "",
  price: "0",
  isFree: true,
};

export default function HackathonManager() {
  const [hackathons, setHackathons] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const fetchHackathons = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(endpoints.hackathons);
      setHackathons(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load hackathons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
    const interval = setInterval(fetchHackathons, 60_000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);
  try {
    const payload = {
      title: formData.title,
      description: formData.description,
      link: formData.link,
      previewImage: formData.previewImage || null,
      registrationStart: new Date(formData.registrationStart).toISOString(),
      registrationEnd: new Date(formData.registrationEnd).toISOString(),
      price: formData.isFree ? 0 : parseFloat(formData.price) || 0,
      isFree: formData.isFree,
    };

    if (editing) {
      const { data } = await api.put(endpoints.hackathonById(editing), payload);
      toast.success(data.message || "Hackathon updated!");
    } else {
      const { data } = await api.post(endpoints.hackathons, payload);
      toast.success(data.message || "Hackathon created!");
    }
    setFormData(emptyForm);
    setEditing(null);
    await fetchHackathons();
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to save hackathon");
  } finally {
    setSubmitting(false);
  }
};
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(endpoints.hackathonById(id));
      toast.success("Hackathon deleted");
      await fetchHackathons();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const startEdit = (hackathon) => {
    setEditing(hackathon.id);
    setFormData({
      title: hackathon.title,
      description: hackathon.description,
      link: hackathon.link,
      previewImage: hackathon.previewImage || "",
      registrationStart: new Date(hackathon.registrationStart).toISOString().slice(0, 16),
      registrationEnd: new Date(hackathon.registrationEnd).toISOString().slice(0, 16),
      price: String(hackathon.price || 0),
      isFree: hackathon.isFree,
    });
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-secondary-400" />
          {editing ? "Edit Hackathon" : "Add Hackathon"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label-dark">Title</label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange} className="input-dark" />
            </div>
            <div>
              <label className="label-dark">Link</label>
              <input type="url" name="link" required value={formData.link} onChange={handleChange} className="input-dark" />
            </div>
          </div>
          <div>
            <label className="label-dark">Description</label>
            <textarea name="description" required rows="3" value={formData.description} onChange={handleChange} className="input-dark resize-none" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label-dark">Registration Start</label>
              <input type="datetime-local" name="registrationStart" required value={formData.registrationStart} onChange={handleChange} className="input-dark" />
            </div>
            <div>
              <label className="label-dark">Registration End</label>
              <input type="datetime-local" name="registrationEnd" required value={formData.registrationEnd} onChange={handleChange} className="input-dark" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <ThumbnailUploader
              label="Preview Image"
              value={formData.previewImage}
              onChange={(val) => setFormData({ ...formData, previewImage: val })}
            />
            <div>
              <label className="label-dark">Price (₹)</label>
              <input
                type="number"
                name="price"
                min="0"
                disabled={formData.isFree}
                value={formData.price}
                onChange={handleChange}
                className="input-dark"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-dark-300">
            <input type="checkbox" name="isFree" checked={formData.isFree} onChange={handleChange} className="w-4 h-4" />
            Free Entry
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? (editing ? "Updating..." : "Creating...") : editing ? "Update" : "Create"}
            </button>
            {editing && (
              <button type="button" onClick={() => { setEditing(null); setFormData(emptyForm); }} className="btn-secondary">
                Cancel
              </button>
            )}
          </div>
        </form>
      </motion.div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">Active Hackathons</h2>
        {loading ? (
          <Loader className="w-6 h-6 animate-spin text-primary-400 mx-auto my-8" />
        ) : hackathons.length === 0 ? (
          <p className="text-center text-dark-400 py-8">No hackathons found</p>
        ) : (
          <div className="space-y-3">
            {hackathons.map((h) => (
              <div key={h.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  {h.previewImage && <img src={h.previewImage} alt="" className="w-16 h-12 object-cover rounded" />}
                  <div>
                    <div className="font-semibold text-white">{h.title}</div>
                    <div className="text-xs text-dark-400">{h.isFree ? "Free" : `₹${h.price}`} · Ends {new Date(h.registrationEnd).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(h)} className="p-2 rounded hover:bg-white/10 text-primary-400">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(h.id)} className="p-2 rounded hover:bg-red-500/10 text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}