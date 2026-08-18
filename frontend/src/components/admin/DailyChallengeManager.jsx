import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Code2, Trash2, Edit2, Plus, Sparkles } from "lucide-react";
import api from "../../api/client";
import endpoints from "../../api/endpoints";
import { useToast } from "../../context/ToastContext";
import Loader from "../common/Loader";

const emptyForm = {
  leetcodeNumber: "",
  startTime: "",
  endTime: "",
};

export default function DailyChallengeManager() {
  const [challenges, setChallenges] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(endpoints.challengeStats);
      setChallenges(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load challenges");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchChallenges(); }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        leetcodeNumber: parseInt(formData.leetcodeNumber),
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
      };

      if (editing) {
        const { data } = await api.put(endpoints.dailyChallengeById(editing), payload);
        toast.success(data.message || "Challenge updated successfully!");
      } else {
        const { data } = await api.post(endpoints.createDailyChallenge, payload);
        toast.success(data.message || "Daily Challenge published!");
      }
      setFormData(emptyForm);
      setEditing(null);
      await fetchChallenges();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save challenge");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (challenge) => {
    setEditing(challenge.id);
    setFormData({
      leetcodeNumber: challenge.leetcodeNumber,
      startTime: new Date(challenge.startTime).toISOString().slice(0, 16),
      endTime: new Date(challenge.endTime).toISOString().slice(0, 16),
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this challenge?")) return;
    try {
      const { data } = await api.delete(endpoints.dailyChallengeById(id));
      toast.success(data.message || "Challenge deleted");
      if (editing === id) {
        setEditing(null);
        setFormData(emptyForm);
      }
      await fetchChallenges();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-8">
      {/* Editor Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="neu-card p-6 md:p-8"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#e0e5ec] shadow-neu-flat-sm flex items-center justify-center border border-white/80 shrink-0">
            <Code2 className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-dark-800 tracking-tight">
              {editing ? "Modify Scheduled Challenge" : "Publish Daily LeetCode Problem"}
            </h2>
            <p className="text-xs text-dark-400 font-semibold">Title and problem metadata will be fetched automatically.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="label-dark">LeetCode Question #</label>
            <input
              type="number"
              name="leetcodeNumber"
              required
              min="1"
              value={formData.leetcodeNumber}
              onChange={handleChange}
              className="neu-input"
              placeholder="e.g. 1"
            />
          </div>
          <div>
            <label className="label-dark">Start Window</label>
            <input
              type="datetime-local"
              name="startTime"
              required
              value={formData.startTime}
              onChange={handleChange}
              className="neu-input"
            />
          </div>
          <div>
            <label className="label-dark">Submission Deadline</label>
            <input
              type="datetime-local"
              name="endTime"
              required
              value={formData.endTime}
              onChange={handleChange}
              className="neu-input"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="btn-primary flex-1 py-3 text-xs font-bold disabled:opacity-50">
              {submitting ? "Saving..." : editing ? "Save Update" : "Deploy Challenge"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => { setEditing(null); setFormData(emptyForm); }}
                className="btn-secondary px-4 py-3 text-xs font-bold"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </motion.div>

      {/* History Table Card */}
      <div className="neu-card p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-extrabold text-dark-800">Challenge Archives & Submissions</h2>
          <span className="text-xs font-bold text-dark-400">{challenges.length} Total Records</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader size="md" text="Loading challenges..." />
          </div>
        ) : challenges.length === 0 ? (
          <div className="text-center py-10 neu-inset-panel p-6 text-dark-400 font-semibold text-xs">
            No daily challenges published yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-dark-300/40 text-dark-400 uppercase tracking-wider font-extrabold text-[11px]">
                  <th className="py-3 px-3 text-left"># Problem</th>
                  <th className="py-3 px-3 text-left">Title</th>
                  <th className="py-3 px-3 text-left">Window Start</th>
                  <th className="py-3 px-3 text-left">Deadline</th>
                  <th className="py-3 px-3 text-center">Submissions</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-200/30">
                {challenges.map((challenge) => (
                  <tr key={challenge.id} className="hover:bg-white/40 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-extrabold text-indigo-700">#{challenge.leetcodeNumber}</td>
                    <td className="py-3.5 px-3 font-bold text-dark-800">{challenge.leetcodeTitle || "—"}</td>
                    <td className="py-3.5 px-3 text-dark-500 font-medium">{new Date(challenge.startTime).toLocaleString()}</td>
                    <td className="py-3.5 px-3 text-dark-500 font-medium">{new Date(challenge.endTime).toLocaleString()}</td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500/15 text-emerald-700 border border-emerald-500/20 shadow-neu-inset-sm">
                        {challenge.totalCompletions || 0} solved
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleEdit(challenge)}
                          className="p-2 rounded-xl text-dark-500 hover:text-indigo-600 hover:shadow-neu-btn active:shadow-neu-inset transition-all"
                          title="Edit Challenge"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(challenge.id)}
                          className="p-2 rounded-xl text-dark-500 hover:text-red-600 hover:shadow-neu-btn active:shadow-neu-inset transition-all"
                          title="Delete Challenge"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}