import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Plus, Mail, CheckCircle2 } from "lucide-react";
import api from "../../api/client";
import endpoints from "../../api/endpoints";
import Loader from "../common/Loader";
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
      toast.success(data.message || "Imposition created successfully!");
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
      toast.success(data.message || "Notification email sent!");
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send email");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#e0e5ec] shadow-neu-flat-sm flex items-center justify-center border border-white/80 shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-dark-800 tracking-tight">Academic Impositions & Penalties</h2>
            <p className="text-xs text-dark-400 font-semibold">Track missed assignments, lack of participation, and dispatch alerts.</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={showForm ? "btn-secondary text-xs font-bold py-2.5 px-4" : "btn-primary text-xs font-bold py-2.5 px-4"}
        >
          <Plus className="w-4 h-4 mr-1" />
          {showForm ? "Close Form" : "Record Imposition"}
        </button>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="neu-card p-6 md:p-8 space-y-4"
        >
          <h3 className="text-base font-extrabold text-dark-800">Add Penalty Record</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label-dark">Select Student</label>
              <select
                name="studentId"
                required
                value={formData.studentId}
                onChange={handleChange}
                className="neu-input"
              >
                <option value="">Choose a student...</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.username || s.email} ({s.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-dark">Violation / Imposition Reason</label>
              <input type="text" name="reason" required value={formData.reason} onChange={handleChange} className="neu-input" placeholder="e.g., Incomplete LeetCode streak" />
            </div>
          </div>
          <div>
            <label className="label-dark">Additional Notes (Optional)</label>
            <textarea name="description" rows="3" value={formData.description} onChange={handleChange} className="neu-input resize-none" placeholder="Details about remediation or penalty task..." />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={submitting} className="btn-primary py-3 px-8 text-xs font-bold disabled:opacity-50">
              {submitting ? "Saving..." : "Record & Save"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary py-3 px-6 text-xs font-bold">
              Cancel
            </button>
          </div>
        </motion.form>
      )}

      <div className="neu-card p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-extrabold text-dark-800">Imposition Log Records</h2>
          <span className="text-xs font-bold text-dark-400">{impositions.length} Total</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader size="md" text="Loading impositions..." />
          </div>
        ) : impositions.length === 0 ? (
          <div className="text-center py-10 neu-inset-panel p-6">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
            <p className="font-bold text-dark-800 text-sm">Clean Record Sheet</p>
            <p className="text-xs text-dark-400 mt-0.5">No student impositions on file.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {impositions.map((imp) => (
              <div key={imp.id} className="flex items-center justify-between p-4 rounded-xl bg-[#e0e5ec] shadow-neu-flat-sm border-l-4 border-l-red-500 border border-white/70">
                <div className="flex-1">
                  <div className="font-bold text-dark-800 text-sm">
                    {imp.student?.username || "Student"} <span className="text-dark-400 font-normal">→</span> <span className="text-red-600">{imp.reason}</span>
                  </div>
                  {imp.description && <div className="text-xs text-dark-500 mt-1 leading-relaxed">{imp.description}</div>}
                  <div className="text-[11px] font-semibold text-dark-400 mt-2 flex items-center gap-3">
                    <span>Imposed: {new Date(imp.imposedAt).toLocaleDateString()}</span>
                    {imp.isSent && <span className="text-emerald-600 font-bold">✓ Email notification sent</span>}
                  </div>
                </div>
                <button
                  onClick={() => handleSendEmail(imp.id)}
                  disabled={imp.isSent}
                  className="btn-secondary py-2 px-3 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 ml-3 shrink-0"
                  title="Send or resend email notification"
                >
                  <Mail className="w-3.5 h-3.5 text-indigo-600" />
                  {imp.isSent ? "Sent" : "Notify Student"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}