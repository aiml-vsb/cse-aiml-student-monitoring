import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Plus, Mail, Loader, X } from "lucide-react";
import api from "../../api/client";
import endpoints from "../../api/endpoints";
import { useToast } from "../../context/ToastContext";

export default function ImpositionManager() {
  const [students, setStudents] = useState([]);
  const [impositions, setImpositions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    studentId: "",
    reason: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentRes, impRes] = await Promise.all([
        api.get(endpoints.allStudents),
        api.get(endpoints.allImpositions),
      ]);
      setStudents(studentRes.data.data || []);
      setImpositions(impRes.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post(endpoints.createImposition, formData);
      toast.success(data.message || "Imposition created!");
      setFormData({ studentId: "", reason: "", description: "" });
      setShowForm(false);
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create imposition");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendEmail = async (id) => {
    try {
      const { data } = await api.post(endpoints.sendImpositionEmail(id));
      toast.success(data.message || "Email sent!");
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send email");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          Imposition Manager
        </h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4 mr-1" />
          New Imposition
        </button>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="glass-card p-6 space-y-4"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label-dark">Student</label>
              <select
                name="studentId"
                required
                value={formData.studentId}
                onChange={handleChange}
                className="input-dark"
              >
                <option value="">Select a student</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.username || s.email} ({s.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-dark">Reason</label>
              <input type="text" name="reason" required value={formData.reason} onChange={handleChange} className="input-dark" placeholder="e.g., Didn't complete daily challenge" />
            </div>
          </div>
          <div>
            <label className="label-dark">Description (optional)</label>
            <textarea name="description" rows="3" value={formData.description} onChange={handleChange} className="input-dark" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? "Creating..." : "Create"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </motion.form>
      )}

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">All Impositions</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader className="w-8 h-8 animate-spin text-primary-400" />
          </div>
        ) : impositions.length === 0 ? (
          <p className="text-center text-dark-400 py-8">No impositions yet</p>
        ) : (
          <div className="space-y-3">
            {impositions.map((imp) => (
              <div key={imp.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex-1">
                  <div className="font-semibold text-white">
                    {imp.student?.username || "Unknown"} → {imp.reason}
                  </div>
                  {imp.description && <div className="text-xs text-dark-400 mt-1">{imp.description}</div>}
                  <div className="text-xs text-dark-500 mt-1">
                    {new Date(imp.imposedAt).toLocaleString()} {imp.isSent && <span className="text-green-400 ml-2">✓ Email sent</span>}
                  </div>
                </div>
                <button
                  onClick={() => handleSendEmail(imp.id)}
                  disabled={imp.isSent}
                  className={`p-2 rounded ${imp.isSent ? "text-green-400" : "text-dark-300 hover:bg-white/10"} disabled:opacity-50`}
                >
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}