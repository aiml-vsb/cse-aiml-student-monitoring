import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Plus, Trash2, UserPlus, Mail, Lock, User } from "lucide-react";
import api from "../../api/client";
import endpoints from "../../api/endpoints";
import Loader from "../common/Loader";
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
      toast.success(data.message || "Admin account provisioned successfully!");
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
    if (!window.confirm("Are you sure you want to revoke this admin's access?")) return;
    try {
      const { data } = await api.delete(endpoints.deleteAdmin(id));
      toast.success(data.message || "Admin access revoked");
      await fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#e0e5ec] shadow-neu-flat-sm flex items-center justify-center border border-white/80 shrink-0">
            <Shield className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-dark-800 tracking-tight">Faculty & Admin User Management</h2>
            <p className="text-xs text-dark-400 font-semibold">Provision faculty access tokens and assign departmental roles.</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={showForm ? "btn-secondary text-xs font-bold py-2.5 px-4" : "btn-primary text-xs font-bold py-2.5 px-4"}
        >
          <UserPlus className="w-4 h-4 mr-1" />
          {showForm ? "Close Form" : "Create Admin Account"}
        </button>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="neu-card p-6 md:p-8 space-y-4 max-w-2xl"
        >
          <h3 className="text-base font-extrabold text-dark-800">New Administrator Credentials</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label-dark">Official Faculty Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
                <input type="email" name="email" required value={formData.email} onChange={handleChange} className="neu-input pl-10" placeholder="faculty@vsb.edu" />
              </div>
            </div>
            <div>
              <label className="label-dark">Temporary Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
                <input type="password" name="password" required minLength="6" value={formData.password} onChange={handleChange} className="neu-input pl-10" placeholder="min 6 chars" />
              </div>
            </div>
          </div>
          <div>
            <label className="label-dark">Full Name / Designation (Optional)</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
              <input type="text" name="username" value={formData.username} onChange={handleChange} className="neu-input pl-10" placeholder="e.g. Dr. John Smith (HOD)" />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={submitting} className="btn-primary py-3 px-8 text-xs font-bold disabled:opacity-50">
              {submitting ? "Provisioning..." : "Create Account"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary py-3 px-6 text-xs font-bold">
              Cancel
            </button>
          </div>
        </motion.form>
      )}

      <div className="neu-card p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-extrabold text-dark-800">Authorized Faculty & Admins</h2>
          <span className="text-xs font-bold text-dark-400">{admins.length} Accounts</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader size="md" text="Loading admin accounts..." />
          </div>
        ) : (
          <div className="space-y-3">
            {admins.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between p-3.5 rounded-xl bg-[#e0e5ec] shadow-neu-flat-sm border border-white/70">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#e0e5ec] shadow-neu-inset-sm flex items-center justify-center border border-white/60">
                    <Shield className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <div className="font-bold text-dark-800 text-sm">{admin.username || admin.email}</div>
                    <div className="text-xs font-semibold text-dark-400">{admin.email} · Role: {admin.role || "ADMIN"}</div>
                  </div>
                </div>
                {admin.email !== user?.email ? (
                  <button
                    onClick={() => handleDelete(admin.id)}
                    className="p-2 rounded-xl text-dark-500 hover:text-red-600 hover:shadow-neu-btn active:shadow-neu-inset transition-all"
                    title="Revoke Admin Access"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 text-xs font-extrabold shadow-neu-inset-sm">
                    Current Session
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}