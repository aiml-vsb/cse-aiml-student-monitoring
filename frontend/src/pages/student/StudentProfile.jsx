import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Calendar, Code2, Github, Save, Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import AnimatedBackground from "../../components/common/AnimatedBackground";
import Loader from "../../components/common/Loader";
import api from "../../api/client";
import endpoints from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function StudentProfile() {
  const [formData, setFormData] = useState({
    username: "",
    year: "",
    leetcodeUsername: "",
    githubUsername: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [linking, setLinking] = useState(false);
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
        return str
          .replace(/^@/, "")
          .replace(/^https?:\/\/leetcode\.com\//i, "")
          .replace(/^u\//i, "")
          .replace(/\/+$/, "")
          .split("/")[0]
          .trim();
      }
    }

    return str
      .replace(/^@/, "")
      .replace(/^https?:\/\/leetcode\.com\//i, "")
      .replace(/^u\//i, "")
      .replace(/\/+$/, "")
      .split("/")[0]
      .trim();
  };

  const extractGithubUsername = (input) => {
    const str = (input || "").trim();
    if (!str) return "";

    if (str.includes("github.com")) {
      try {
        const url = new URL(str.startsWith("http") ? str : `https://${str}`);
        const parts = url.pathname.split("/").filter(Boolean);
        return parts.length > 0 ? parts[0] : str;
      } catch {
        return str
          .replace(/^@/, "")
          .replace(/^https?:\/\/github\.com\//i, "")
          .replace(/\/+$/, "")
          .split("/")[0]
          .trim();
      }
    }

    return str
      .replace(/^@/, "")
      .replace(/^https?:\/\/github\.com\//i, "")
      .replace(/\/+$/, "")
      .split("/")[0]
      .trim();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "leetcodeUsername") {
      setFormData((prev) => ({
        ...prev,
        leetcodeUsername: extractLeetCodeUsername(value),
      }));
    } else if (name === "githubUsername") {
      setFormData((prev) => ({
        ...prev,
        githubUsername: extractGithubUsername(value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put(endpoints.updateStudentProfile, formData);
      updateUser(data.data);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleGithubLink = async () => {
    setLinking(true);
    try {
      const { data } = await api.get(endpoints.githubUrl);
      window.location.href = data.data.url;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start GitHub linking");
      setLinking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <Loader size="lg" text="Loading profile details..." />
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
          className="neu-card p-8 md:p-10 shadow-neu-flat-lg border border-white/80"
        >
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/60">
            <div className="w-12 h-12 rounded-2xl bg-[#e0e5ec] shadow-neu-flat flex items-center justify-center border border-white/80 shrink-0">
              <User className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-dark-800 tracking-tight">
                My Student Profile
              </h2>
              <p className="text-xs text-dark-400 font-semibold">Manage your LeetCode and GitHub verified handles.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-dark">Full Name / Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="neu-input pl-10"
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
                  <option value="">Select Academic Year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label-dark">LeetCode Username or Profile URL</label>
              <div className="relative">
                <Code2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
                <input
                  type="text"
                  name="leetcodeUsername"
                  required
                  value={formData.leetcodeUsername}
                  onChange={handleChange}
                  className="neu-input pl-10"
                  placeholder="e.g., johndoe or https://leetcode.com/u/johndoe/"
                />
              </div>
              <p className="text-[11px] text-dark-400 font-medium mt-1">
                Your profile must be publicly accessible for automated LeetCode verification.
              </p>
            </div>

            <div>
              <label className="label-dark">GitHub Username or Profile URL</label>
              <div className="relative">
                <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
                <input
                  type="text"
                  name="githubUsername"
                  required
                  value={formData.githubUsername}
                  onChange={handleChange}
                  className="neu-input pl-10"
                  placeholder="e.g., johndoe or https://github.com/johndoe"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleGithubLink}
                disabled={saving || linking}
                className="btn-secondary w-full py-3 text-xs font-bold flex items-center justify-center gap-2"
              >
                {linking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Github className="w-4 h-4 text-dark-700" />
                )}
                {linking ? "Connecting..." : "Re-authorize GitHub via OAuth"}
              </button>

              <button type="submit" disabled={saving} className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving Updates..." : "Save Changes"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}