import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Briefcase, Trash2, Edit2, Plus, Clock, IndianRupee } from "lucide-react";
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
    const interval = setInterval(fetchInternships, 60_000);
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
        applicationStart: new Date(formData.applicationStart).toISOString(),
        applicationEnd: new Date(formData.applicationEnd).toISOString(),
        duration: formData.duration || null,
        hasStipend: formData.hasStipend,
        ...(formData.hasStipend && { stipendAmount: formData.stipendAmount }),
      };

      if (editing) {
        const { data } = await api.put(endpoints.internshipById(editing), payload);
        toast.success(data.message || "Internship updated successfully!");
      } else {
        const { data } = await api.post(endpoints.internships, payload);
        toast.success(data.message || "Internship published successfully!");
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
    if (!window.confirm("Are you sure you want to delete this internship posting?")) return;
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
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="neu-card p-6 md:p-8"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#e0e5ec] shadow-neu-flat-sm flex items-center justify-center border border-white/80 shrink-0">
            <Briefcase className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-dark-800 tracking-tight">
              {editing ? "Edit Internship Posting" : "Publish Internship Opportunity"}
            </h2>
            <p className="text-xs text-dark-400 font-semibold">Post industry and research internships for enrolled students.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label-dark">Role / Position Title</label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange} className="neu-input" placeholder="e.g. AI/ML Engineering Intern" />
            </div>
            <div>
              <label className="label-dark">Application URL</label>
              <input type="url" name="link" required value={formData.link} onChange={handleChange} className="neu-input" placeholder="https://..." />
            </div>
          </div>
          <div>
            <label className="label-dark">Role Description & Responsibilities</label>
            <textarea name="description" required rows="3" value={formData.description} onChange={handleChange} className="neu-input resize-none" placeholder="Provide requirements, skill-sets, and stipend terms..." />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label-dark">Application Opening</label>
              <input type="datetime-local" name="applicationStart" required value={formData.applicationStart} onChange={handleChange} className="neu-input" />
            </div>
            <div>
              <label className="label-dark">Application Deadline</label>
              <input type="datetime-local" name="applicationEnd" required value={formData.applicationEnd} onChange={handleChange} className="neu-input" />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4 items-center">
            <div>
              <label className="label-dark">Duration</label>
              <input type="text" name="duration" value={formData.duration} onChange={handleChange} className="neu-input" placeholder="e.g. 6 Months" />
            </div>
            <ThumbnailUploader
              label="Preview Banner Image"
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
                className="neu-input disabled:opacity-50"
                placeholder="e.g. ₹25,000 / month"
              />
              <label className="flex items-center gap-2 text-dark-600 text-xs font-bold mt-2 cursor-pointer">
                <input type="checkbox" name="hasStipend" checked={formData.hasStipend} onChange={handleChange} className="rounded" />
                Paid Internship (Provides Stipend)
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={submitting} className="btn-primary py-3 px-8 text-xs font-bold disabled:opacity-50">
              {submitting ? "Saving..." : editing ? "Save Changes" : "Create Internship"}
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
          <h2 className="text-lg font-extrabold text-dark-800">Active Internship Openings</h2>
          <span className="text-xs font-bold text-dark-400">{internships.length} Active</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader size="md" text="Loading internships..." />
          </div>
        ) : internships.length === 0 ? (
          <div className="text-center py-10 neu-inset-panel p-6 text-dark-400 font-semibold text-xs">
            No active internships found.
          </div>
        ) : (
          <div className="space-y-3">
            {internships.map((internship) => (
              <div key={internship.id} className="flex items-center justify-between p-3.5 rounded-xl bg-[#e0e5ec] shadow-neu-flat-sm border border-white/70">
                <div className="flex items-center gap-3.5">
                  {internship.previewImage && <img src={internship.previewImage} alt="" className="w-16 h-12 object-cover rounded-xl shadow-neu-inset-sm shrink-0" />}
                  <div>
                    <div className="font-bold text-dark-800 text-sm">{internship.title}</div>
                    <div className="text-xs font-semibold text-dark-400 mt-0.5">
                      {internship.duration || "Flexible"} · {internship.hasStipend ? <span className="text-emerald-700 font-bold">{internship.stipendAmount}</span> : "Unpaid"} · Deadline: {new Date(internship.applicationEnd).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => startEdit(internship)} className="p-2 rounded-xl text-dark-500 hover:text-indigo-600 hover:shadow-neu-btn active:shadow-neu-inset transition-all" title="Edit">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(internship.id)} className="p-2 rounded-xl text-dark-500 hover:text-red-600 hover:shadow-neu-btn active:shadow-neu-inset transition-all" title="Delete">
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