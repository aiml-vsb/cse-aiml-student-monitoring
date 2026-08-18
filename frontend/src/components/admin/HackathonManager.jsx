import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Trash2, Edit2, Plus, DollarSign } from "lucide-react";
import api from "../../api/client";
import endpoints from "../../api/endpoints";
import ThumbnailUploader from "../common/ThumbnailUploader";
import Loader from "../common/Loader";
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
        toast.success(data.message || "Hackathon updated successfully!");
      } else {
        const { data } = await api.post(endpoints.hackathons, payload);
        toast.success(data.message || "Hackathon published successfully!");
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
    if (!window.confirm("Are you sure you want to remove this hackathon listing?")) return;
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
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="neu-card p-6 md:p-8"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#e0e5ec] shadow-neu-flat-sm flex items-center justify-center border border-white/80 shrink-0">
            <Trophy className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-dark-800 tracking-tight">
              {editing ? "Edit Hackathon Details" : "Publish New Hackathon"}
            </h2>
            <p className="text-xs text-dark-400 font-semibold">Post competitions, hackathons, and challenges for students.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label-dark">Hackathon Title</label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange} className="neu-input" placeholder="e.g. Smart India Hackathon" />
            </div>
            <div>
              <label className="label-dark">Registration Link / Official URL</label>
              <input type="url" name="link" required value={formData.link} onChange={handleChange} className="neu-input" placeholder="https://..." />
            </div>
          </div>
          <div>
            <label className="label-dark">Description & Eligibility</label>
            <textarea name="description" required rows="3" value={formData.description} onChange={handleChange} className="neu-input resize-none" placeholder="Provide problem statement themes, rules, and team requirements..." />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label-dark">Registration Start</label>
              <input type="datetime-local" name="registrationStart" required value={formData.registrationStart} onChange={handleChange} className="neu-input" />
            </div>
            <div>
              <label className="label-dark">Registration Deadline</label>
              <input type="datetime-local" name="registrationEnd" required value={formData.registrationEnd} onChange={handleChange} className="neu-input" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 items-center">
            <ThumbnailUploader
              label="Preview Banner Image"
              value={formData.previewImage}
              onChange={(val) => setFormData({ ...formData, previewImage: val })}
            />
            <div>
              <label className="label-dark">Registration Fee (₹)</label>
              <input
                type="number"
                name="price"
                min="0"
                disabled={formData.isFree}
                value={formData.price}
                onChange={handleChange}
                className="neu-input disabled:opacity-50"
                placeholder="0"
              />
              <label className="flex items-center gap-2 text-dark-600 text-xs font-bold mt-2 cursor-pointer">
                <input type="checkbox" name="isFree" checked={formData.isFree} onChange={handleChange} className="rounded" />
                Free Participation (No entry fee)
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={submitting} className="btn-primary py-3 px-8 text-xs font-bold disabled:opacity-50">
              {submitting ? "Saving..." : editing ? "Save Changes" : "Create Hackathon"}
            </button>
            {editing && (
              <button type="button" onClick={() => { setEditing(null); setFormData(emptyForm); }} className="btn-secondary py-3 px-6 text-xs font-bold">
                Cancel
              </button>
            )}
          </div>
        </form>
      </motion.div>

      <div className="neu-card p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-extrabold text-dark-800">Active Hackathon Listings</h2>
          <span className="text-xs font-bold text-dark-400">{hackathons.length} Active</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader size="md" text="Loading hackathons..." />
          </div>
        ) : hackathons.length === 0 ? (
          <div className="text-center py-10 neu-inset-panel p-6 text-dark-400 font-semibold text-xs">
            No hackathons currently active.
          </div>
        ) : (
          <div className="space-y-3">
            {hackathons.map((h) => (
              <div key={h.id} className="flex items-center justify-between p-3.5 rounded-xl bg-[#e0e5ec] shadow-neu-flat-sm border border-white/70">
                <div className="flex items-center gap-3.5">
                  {h.previewImage && <img src={h.previewImage} alt="" className="w-16 h-12 object-cover rounded-xl shadow-neu-inset-sm shrink-0" />}
                  <div>
                    <div className="font-bold text-dark-800 text-sm">{h.title}</div>
                    <div className="text-xs font-semibold text-dark-400 mt-0.5">
                      <span className="text-emerald-700">{h.isFree ? "Free Entry" : `₹${h.price}`}</span> · Deadline: {new Date(h.registrationEnd).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => startEdit(h)} className="p-2 rounded-xl text-dark-500 hover:text-indigo-600 hover:shadow-neu-btn active:shadow-neu-inset transition-all" title="Edit">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(h.id)} className="p-2 rounded-xl text-dark-500 hover:text-red-600 hover:shadow-neu-btn active:shadow-neu-inset transition-all" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
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