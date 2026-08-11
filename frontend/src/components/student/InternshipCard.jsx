import { useState } from "react";
import { Briefcase, ExternalLink, Clock, IndianRupee, XCircle, CheckCircle } from "lucide-react";
import api from "../../api/client";
import endpoints from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function InternshipCard({ internship, registered = false, onRegister, onUnregister }) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const toast = useToast();

  const handleRegister = async () => {
    if (!user) {
      toast.error("Please login first");
      return;
    }
    setLoading(true);
    try {
      await api.post(endpoints.registerInternship(internship.id));
      toast.success("Registered successfully!");
      if (onRegister) onRegister();
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUnregister = async () => {
    setLoading(true);
    try {
      await api.delete(endpoints.unregisterInternship(internship.id));
      toast.success("Registration removed");
      if (onUnregister) onUnregister();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="event-card">
      <div className="card-image-wrapper">
        <img src={internship.previewImage || "https://via.placeholder.com/640x360?text=Internship"} alt={internship.title} className="card-image" />
      </div>

      <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
        <Briefcase className="w-5 h-5 text-green-400" />
        {internship.title}
      </h3>

      <p className="text-sm text-dark-300 flex-1 mb-4 line-clamp-3">{internship.description}</p>

      <div className="space-y-2 mb-4 text-sm text-dark-300">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Apply by: {new Date(internship.applicationEnd).toLocaleString()}
        </div>
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4" />
          Duration: {internship.duration || "Not specified"}
        </div>
        {internship.hasStipend && (
          <div className="flex items-center gap-2 text-green-400">
            <IndianRupee className="w-4 h-4" />
            Stipend: {internship.stipendAmount || "Provided"}
          </div>
        )}
      </div>

      <a href={internship.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary-400 hover:text-primary-300 text-sm mb-3">
        <ExternalLink className="w-4 h-4" />
        View Internship
      </a>

      {registered ? (
        <div className="flex items-center gap-2">
          <span className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-green-200 bg-green-500/20 border border-green-500/30 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-400" />
            Registered
          </span>
          <button
            onClick={handleUnregister}
            disabled={loading}
            className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 disabled:opacity-50"
            title="Remove registration"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <button onClick={handleRegister} disabled={loading} className="btn-primary w-full disabled:opacity-50">
          {loading ? "Processing..." : "Mark as Registered"}
        </button>
      )}
    </div>
  );
}