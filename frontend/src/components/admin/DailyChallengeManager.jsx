import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Code2, Trash2, Loader, Edit2 } from "lucide-react";
import api from "../../api/client";
import endpoints from "../../api/endpoints";
import { useToast } from "../../context/ToastContext";

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
        toast.success(data.message || "Challenge updated!");
      } else {
        const { data } = await api.post(endpoints.createDailyChallenge, payload);
        toast.success(data.message || "Challenge created!");
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
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Code2 className="w-5 h-5 text-primary-400" />
          {editing ? "Edit Daily Challenge" : "Create Daily LeetCode Challenge"}
        </h2>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="label-dark">Question #</label>
            <input
              type="number"
              name="leetcodeNumber"
              required
              min="1"
              value={formData.leetcodeNumber}
              onChange={handleChange}
              className="input-dark"
              placeholder="e.g., 123"
            />
          </div>
          <div>
            <label className="label-dark">Start Time</label>
            <input
              type="datetime-local"
              name="startTime"
              required
              value={formData.startTime}
              onChange={handleChange}
              className="input-dark"
            />
          </div>
          <div>
            <label className="label-dark">End Time</label>
            <input
              type="datetime-local"
              name="endTime"
              required
              value={formData.endTime}
              onChange={handleChange}
              className="input-dark"
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary py-2.5">
            {submitting ? "Saving..." : editing ? "Update" : "Create"}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => { setEditing(null); setFormData(emptyForm); }}
              className="btn-secondary py-2.5"
            >
              Cancel
            </button>
          )}
        </form>
      </motion.div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">Challenge History</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader className="w-8 h-8 animate-spin text-primary-400" />
          </div>
        ) : challenges.length === 0 ? (
          <p className="text-center text-dark-400 py-8">No challenges created yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-2 px-3 text-left text-dark-300"></th>
                  <th className="py-2 px-3 text-left text-dark-300">Title</th>
                  <th className="py-2 px-3 text-left text-dark-300">Start</th>
                  <th className="py-2 px-3 text-left text-dark-300">End</th>
                  <th className="py-2 px-3 text-left text-dark-300">Completed</th>
                  <th className="py-2 px-3 text-left text-dark-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {challenges.map((challenge) => (
                  <tr key={challenge.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-2 px-3 text-white">{challenge.leetcodeNumber}</td>
                    <td className="py-2 px-3 text-dark-200">{challenge.leetcodeTitle}</td>
                    <td className="py-2 px-3 text-dark-300">{new Date(challenge.startTime).toLocaleString()}</td>
                    <td className="py-2 px-3 text-dark-300">{new Date(challenge.endTime).toLocaleString()}</td>
                    <td className="py-2 px-3 text-green-400">{challenge.totalCompletions}</td>
                    <td className="py-2 px-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(challenge)} className="p-1 rounded hover:bg-white/10 text-primary-400">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(challenge.id)} className="p-1 rounded hover:bg-red-500/10 text-red-400">
                          <Trash2 className="w-4 h-4" />
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