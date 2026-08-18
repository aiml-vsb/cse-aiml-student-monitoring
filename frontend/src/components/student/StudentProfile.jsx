import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Calendar, Code2, Github, Save, Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import AnimatedBackground from "../../components/common/AnimatedBackground";
import Loader from "../common/Loader";
import api from "../../api/client";
import endpoints from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

// Helper to extract LeetCode username from either a plain username or full URL
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

export default function StudentProfile() {
  const [formData, setFormData] = useState({
    username: "",
    year: "",
    leetcodeUsername: "",
    githubUsername: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        year: user.year || "",
        leetcodeUsername: user.leetcodeUsername || "",
        githubUsername: user.githubUsername || "",
      });
    }
    setLoading(false);
  }, [user]);

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
      if (updateUser) updateUser(data.data);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <Loader size="lg" text="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AnimatedBackground />
      <Navbar />

      <div className="container max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/student")}
          className="flex items-center gap-1.5 text-xs font-bold text-dark-500 hover:text-indigo-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="neu-card p-8"
        >
          <h2 className="text-2xl font-extrabold text-dark-800 mb-6 flex items-center gap-2">
            <User className="w-6 h-6 text-indigo-600" />
            My Profile
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-dark">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
                <input
                  type="text"
                  name="username"
                  required
                  minLength="3"
                  value={formData.username}
                  onChange={handleChange}
                  className="neu-input pl-10"
                  placeholder="e.g., John Doe"
                />
              </div>
            </div>

            <div>
              <label className="label-dark">Academic Year</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
                <select
                  name="year"
                  required
                  value={formData.year}
                  onChange={handleChange}
                  className="neu-input pl-10"
                >
                  <option value="">Select Year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label-dark">LeetCode Username or URL</label>
              <div className="relative">
                <Code2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
                <input
                  type="text"
                  name="leetcodeUsername"
                  required
                  value={formData.leetcodeUsername}
                  onChange={handleChange}
                  className="neu-input pl-10"
                  placeholder="johndoe or https://leetcode.com/u/johndoe/"
                />
              </div>
              <p className="text-[11px] text-dark-400 mt-1">
                Enter your username or profile URL – automated LeetCode validation will parse it.
              </p>
            </div>

            <div>
              <label className="label-dark">GitHub Username</label>
              <div className="relative">
                <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
                <input
                  type="text"
                  name="githubUsername"
                  required
                  value={formData.githubUsername}
                  onChange={handleChange}
                  className="neu-input pl-10"
                  placeholder="e.g., johndoe"
                />
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn-primary w-full py-3 mt-4 text-xs font-bold flex items-center justify-center gap-2">
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}