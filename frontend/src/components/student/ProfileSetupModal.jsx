import { useState, useEffect } from "react";
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
      toast.success("Profile completed!");
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
            <label className="label-dark">GitHub Username or URL</label>
            <input
              type="text"
              name="githubUsername"
              required
              value={formData.githubUsername}
              onChange={handleChange}
              className="input-dark"
              placeholder="e.g., johndoe or https://github.com/johndoe"
            />
            <p className="text-xs text-dark-400 mt-1">
              We'll extract your GitHub username automatically if you paste a profile link.
            </p>
          </div>

          {formData.githubUsername || user?.githubUsername ? (
            <div className="flex items-center justify-between rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
              <span className="flex items-center gap-2 font-medium">
                <Github className="w-4 h-4" />
                GitHub Authorized
              </span>
              <span className="text-xs text-emerald-200">{formData.githubUsername || user?.githubUsername}</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleGithubLink}
              disabled={saving}
              className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-black px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
            >
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </button>
          )}

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