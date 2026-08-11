import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Calendar, Code2, Github, Save, Loader, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import AnimatedBackground from "../../components/common/AnimatedBackground";
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put(endpoints.updateStudentProfile, formData);
      updateUser(data.data);
      toast.success("Profile updated!");
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
        <Loader className="w-8 h-8 animate-spin text-primary-400" />
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
          className="flex items-center gap-1 text-dark-300 hover:text-white mb-4 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <User className="w-6 h-6 text-primary-400" />
            My Profile
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-dark">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="input-dark pl-9"
                />
              </div>
            </div>

            <div>
              <label className="label-dark">Year</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <select
                  name="year"
                  required
                  value={formData.year}
                  onChange={handleChange}
                  className="input-dark pl-9"
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
              <label className="label-dark">LeetCode Username</label>
              <div className="relative">
                <Code2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input
                  type="text"
                  name="leetcodeUsername"
                  required
                  value={formData.leetcodeUsername}
                  onChange={handleChange}
                  className="input-dark pl-9"
                />
              </div>
              <p className="text-xs text-dark-400 mt-1">
                Your LeetCode profile must be public for verification.
              </p>
            </div>

            <div>
              <label className="label-dark">GitHub Username</label>
              <div className="relative">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input
                  type="text"
                  name="githubUsername"
                  required
                  value={formData.githubUsername}
                  onChange={handleChange}
                  className="input-dark pl-9"
                />
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn-primary w-full py-3">
              {saving ? <Loader className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}