import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Calendar, Code2, Github, Save, Loader2, ShieldCheck } from "lucide-react";
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

// Extract GitHub username from either plain username or full profile URL
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

export default function ProfileSetupModal({ onClose }) {
  const STORAGE_KEY = "profileSetupFormData";
  const [formData, setFormData] = useState({
    username: "",
    year: "",
    leetcodeUsername: "",
    githubUsername: "",
  });
  const [saving, setSaving] = useState(false);
  const { user, updateUser } = useAuth();
  const toast = useToast();

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object") {
          setFormData((prev) => ({
            username: parsed.username || prev.username || user?.username || "",
            year: parsed.year || prev.year || user?.year || "",
            leetcodeUsername: parsed.leetcodeUsername || prev.leetcodeUsername || user?.leetcodeUsername || "",
            githubUsername: parsed.githubUsername || prev.githubUsername || user?.githubUsername || "",
          }));
          return;
        }
      } catch (err) {
        console.warn("Failed to restore profile setup state", err);
      }
    }

    if (user) {
      setFormData((prev) => ({
        username: prev.username || user.username || "",
        year: prev.year || user.year || "",
        leetcodeUsername: prev.leetcodeUsername || user.leetcodeUsername || "",
        githubUsername: prev.githubUsername || user.githubUsername || "",
      }));
    }
  }, [user]);

  const persistFormData = (data) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn("Unable to persist profile setup state", err);
    }
  };

  const clearSavedFormData = () => {
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const nextData = {
        ...prev,
        [name]:
          name === "leetcodeUsername"
            ? extractLeetCodeUsername(value)
            : name === "githubUsername"
            ? extractGithubUsername(value)
            : value,
      };
      persistFormData(nextData);
      return nextData;
    });
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
      clearSavedFormData();
      toast.success("Profile completed successfully!");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleGithubLink = async () => {
    setSaving(true);
    persistFormData(formData);
    try {
      const { data } = await api.get(endpoints.githubUrl);
      window.location.href = data.data.url;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to initiate GitHub linking");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Soft backdrop overlay */}
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-md" />

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative neu-card p-6 md:p-8 w-full max-w-lg shadow-neu-flat-lg border border-white/80"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#e0e5ec] shadow-neu-flat-sm flex items-center justify-center border border-white/80 shrink-0">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-dark-800 tracking-tight">
              Complete Your Profile
            </h2>
            <p className="text-dark-400 text-xs font-semibold">
              Mandatory initial setup before accessing the monitor dashboard.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label className="label-dark">Full Name / Username</label>
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
                placeholder="e.g., Jane Doe"
                autoFocus
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
                placeholder="johndoe or https://leetcode.com/u/johndoe/"
              />
            </div>
            <p className="text-[11px] text-dark-400 font-medium mt-1">
              Username will be extracted automatically if you paste a link.
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
            <p className="text-[11px] text-dark-400 font-medium mt-1">
              We'll extract your GitHub username automatically if you paste a profile URL.
            </p>
          </div>

          {formData.githubUsername || user?.githubUsername ? (
            <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs text-emerald-800 font-bold shadow-neu-inset-sm">
              <span className="flex items-center gap-2">
                <Github className="w-4 h-4 text-emerald-600" />
                GitHub Account Linked
              </span>
              <span className="text-emerald-700">{formData.githubUsername || user?.githubUsername}</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleGithubLink}
              disabled={saving}
              className="btn-secondary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
            >
              <Github className="w-4 h-4" />
              Connect via GitHub OAuth
            </button>
          )}

          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full py-3 text-sm font-bold mt-2 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saving ? "Saving Profile..." : "Save & Access Dashboard"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}