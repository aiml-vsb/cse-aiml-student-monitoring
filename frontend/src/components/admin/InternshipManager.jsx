import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Briefcase, Trash2, Loader, Edit2 } from "lucide-react";
import api from "../../api/client";
import endpoints from "../../api/endpoints";
import ThumbnailUploader from "../common/ThumbnailUploader";
import { useToast } from "../../context/ToastContext";

const emptyForm = {
  title: "",
  description: "",
  link: "",
  previewImage: "",
  applicationStart: "",
  applicationEnd: "",
  duration: "",
  hasStipend: false,
  stipendAmount: "",
};

export default function InternshipManager() {
  const [internships, setInternships] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(endpoints.internships);
      setInternships(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load internships");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
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
      applicationStart: new Date(formData.applicationStart).toISOString(),
      applicationEnd: new Date(formData.applicationEnd).toISOString(),
      duration: formData.duration || null,
      hasStipend: formData.hasStipend,
      // Only send stipendAmount when hasStipend is true
      ...(formData.hasStipend && { stipendAmount: formData.stipendAmount }),
    };

    if (editing) {
      const { data } = await api.put(endpoints.internshipById(editing), payload);
      toast.success(data.message || "Internship updated!");
    } else {
      const { data } = await api.post(endpoints.internships, payload);
      toast.success(data.message || "Internship created!");
    }
    setFormData(emptyForm);
    setEditing(null);
    await fetchInternships();
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to save internship");
  } finally {
    setSubmitting(false);
  }
};

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(endpoints.internshipById(id));
      toast.success("Internship deleted");
      await fetchInternships();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const startEdit = (internship) => {
    setEditing(internship.id);
    setFormData({
      title: internship.title,
      description: internship.description,
      link: internship.link,
      previewImage: internship.previewImage || "",
      applicationStart: new Date(internship.applicationStart).toISOString().slice(0, 16),
      applicationEnd: new Date(internship.applicationEnd).toISOString().slice(0, 16),
      duration: internship.duration || "",
      hasStipend: internship.hasStipend,
      stipendAmount: internship.stipendAmount || "",
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
          <Briefcase className="w-5 h-5 text-green-400" />
          {editing ? "Edit Internship" : "Add Internship"}
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
              <label className="label-dark">Application Start</label>
              <input type="datetime-local" name="applicationStart" required value={formData.applicationStart} onChange={handleChange} className="input-dark" />
            </div>
            <div>
              <label className="label-dark">Application End</label>
              <input type="datetime-local" name="applicationEnd" required value={formData.applicationEnd} onChange={handleChange} className="input-dark" />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="label-dark">Duration</label>
              <input type="text" name="duration" value={formData.duration} onChange={handleChange} className="input-dark" placeholder="e.g., 3 months" />
            </div>
            <ThumbnailUploader
              label="Preview Image"
              value={formData.previewImage}
              onChange={(val) => setFormData({ ...formData, previewImage: val })}
            />
            <div>
              <label className="label-dark">Stipend Amount</label>
              <input
                type="text"
                name="stipendAmount"
                disabled={!formData.hasStipend}
                value={formData.stipendAmount}
                onChange={handleChange}
                className="input-dark"
                placeholder="e.g., ₹15,000/mo"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-dark-300">
            <input type="checkbox" name="hasStipend" checked={formData.hasStipend} onChange={handleChange} className="w-4 h-4" />
            Provides Stipend
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
        <h2 className="text-xl font-bold text-white mb-4">Active Internships</h2>
        {loading ? (
          <Loader className="w-6 h-6 animate-spin text-primary-400 mx-auto my-8" />
        ) : internships.length === 0 ? (
          <p className="text-center text-dark-400 py-8">No internships found</p>
        ) : (
          <div className="space-y-3">
            {internships.map((internship) => (
              <div key={internship.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  {internship.previewImage && <img src={internship.previewImage} alt="" className="w-16 h-12 object-cover rounded" />}
                  <div>
                    <div className="font-semibold text-white">{internship.title}</div>
                    <div className="text-xs text-dark-400">
                      {internship.duration || "Duration TBD"} · {internship.hasStipend ? `Stipend: ${internship.stipendAmount}` : "Unpaid"}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(internship)} className="p-2 rounded hover:bg-white/10 text-primary-400">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(internship.id)} className="p-2 rounded hover:bg-red-500/10 text-red-400">
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