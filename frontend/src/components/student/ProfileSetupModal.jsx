import { useState } from "react";
import { motion } from "framer-motion";
import { User, Calendar, Code2, Github, Save, Loader } from "lucide-react";
import api from "../../api/client";
import endpoints from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

// Extract LeetCode username from either plain username or full URL
const extractLeetCodeUsername = (input) => {
  const str = (input || "").trim();
  if (!str) return "";

  if (str.includes("leetcode.com")) {
    try {
      const url = new URL(str.startsWith("http") ? str : `https://${str}`);
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts[0] === "u" && parts[1]) return parts[1];
      if (parts.length >= 1) return parts[parts.length - 1];
    } catch {
      return str;
    }
  }

  return str.replace(/^@/, "");
};

export default function ProfileSetupModal({ onClose }) {
  const [formData, setFormData] = useState({
    username: "",
    year: "",
    leetcodeUsername: "",
    githubUsername: "",
  });
  const [saving, setSaving] = useState(false);
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "leetcodeUsername") {
      setFormData((prev) => ({
        ...prev,
        leetcodeUsername: extractLeetCodeUsername(value),
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put(endpoints.updateStudentProfile, {
        username: formData.username,
        year: formData.year,
        leetcodeUsername: formData.leetcodeUsername,
        githubUsername: formData.githubUsername,
      });
      updateUser(data.data);
      toast.success("Profile completed!");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Solid overlay – no click-to-close */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative glass-card p-6 md:p-8 w-full max-w-lg"
      >
        {/* No close button! Mandatory setup */}
        <h2 className="text-2xl font-bold text-white mb-1">
          Complete Your Profile
        </h2>
        <p className="text-dark-400 text-sm mb-6">
          Please fill in all the details below – you must do this before using the dashboard.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-dark">Username</label>
            <input
              type="text"
              name="username"
              required
              minLength="3"
              value={formData.username}
              onChange={handleChange}
              className="input-dark"
              placeholder="e.g., John Doe"
              autoFocus
            />
          </div>

          <div>
            <label className="label-dark">Year</label>
            <select
              name="year"
              required
              value={formData.year}
              onChange={handleChange}
              className="input-dark"
            >
              <option value="">Select</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>

          <div>
            <label className="label-dark">LeetCode Username or URL</label>
            <input
              type="text"
              name="leetcodeUsername"
              required
              value={formData.leetcodeUsername}
              onChange={handleChange}
              className="input-dark"
              placeholder="johndoe or https://leetcode.com/u/johndoe/"
            />
            <p className="text-xs text-dark-400 mt-1">
              We'll extract the username automatically if you paste a link.
            </p>
          </div>

          <div>
            <label className="label-dark">GitHub Username</label>
            <input
              type="text"
              name="githubUsername"
              required
              value={formData.githubUsername}
              onChange={handleChange}
              className="input-dark"
              placeholder="e.g., johndoe"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full py-3 disabled:opacity-50"
          >
            {saving ? (
              <Loader className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saving ? "Saving..." : "Save & Continue"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}