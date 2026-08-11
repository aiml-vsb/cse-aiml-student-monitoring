import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Plus, Trash2, UserPlus, Loader } from "lucide-react";
import api from "../../api/client";
import endpoints from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function AdminManager() {
  const [admins, setAdmins] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const toast = useToast();

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(endpoints.allAdmins);
      setAdmins(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post(endpoints.createAdmin, formData);
      toast.success(data.message || "Admin created!");
      setFormData({ email: "", password: "", username: "" });
      setShowForm(false);
      await fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create admin");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    try {
      const { data } = await api.delete(endpoints.deleteAdmin(id));
      toast.success(data.message || "Admin deleted");
      await fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary-400" />
          Admin Console
        </h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <UserPlus className="w-4 h-4 mr-1" />
          New Admin
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
              <label className="label-dark">Email</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} className="input-dark" />
            </div>
            <div>
              <label className="label-dark">Password</label>
              <input type="password" name="password" required minLength="6" value={formData.password} onChange={handleChange} className="input-dark" />
            </div>
          </div>
          <div>
            <label className="label-dark">Username (optional)</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} className="input-dark" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? "Creating..." : "Create Admin"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </motion.form>
      )}

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">All Admins</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader className="w-8 h-8 animate-spin text-primary-400" />
          </div>
        ) : (
          <div className="space-y-2">
            {admins.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">{admin.username || admin.email}</div>
                    <div className="text-xs text-dark-400">{admin.email}</div>
                  </div>
                </div>
                {admin.email !== user?.email ? (
                  <button onClick={() => handleDelete(admin.id)} className="p-2 rounded hover:bg-red-500/10 text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="text-xs text-green-400">You</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}