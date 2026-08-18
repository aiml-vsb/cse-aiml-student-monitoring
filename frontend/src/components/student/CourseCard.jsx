import { useState } from "react";
import { GraduationCap, ExternalLink, Clock, Award, XCircle, CheckCircle } from "lucide-react";
import api from "../../api/client";
import endpoints from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function CourseCard({ course, registered = false, onRegister, onUnregister }) {
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
      await api.post(endpoints.registerCourse(course.id));
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
      await api.delete(endpoints.unregisterCourse(course.id));
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
        <img src={course.previewImage || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60"} alt={course.title} className="card-image" />
      </div>

      <h3 className="text-lg font-bold text-dark-800 mb-1.5 flex items-center gap-2">
        <GraduationCap className="w-4 h-4 text-violet-600 shrink-0" />
        <span className="truncate">{course.title}</span>
      </h3>

      <p className="text-xs text-dark-500 flex-1 mb-4 line-clamp-3 leading-relaxed">{course.description}</p>

      <div className="space-y-1.5 mb-4 text-xs font-semibold text-dark-600">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-dark-400" />
          <span>Starts: {new Date(course.courseStart).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-dark-400" />
          <span>Ends: {new Date(course.courseEnd).toLocaleDateString()}</span>
        </div>
        {course.benefit && (
          <div className="flex items-center gap-2 text-amber-700 font-bold">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>{course.benefit}</span>
          </div>
        )}
      </div>

      <a
        href={course.link}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-xs font-bold mb-4 transition-colors"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        Explore Syllabus & Platform
      </a>

      {registered ? (
        <div className="flex items-center gap-2">
          <span className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-emerald-700 bg-emerald-500/10 border border-emerald-500/30 rounded-xl shadow-neu-inset-sm">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Enrolled
          </span>
          <button
            onClick={handleUnregister}
            disabled={loading}
            className="p-2.5 rounded-xl text-red-500 hover:text-red-700 shadow-neu-btn active:shadow-neu-inset disabled:opacity-50 transition-all"
            title="Remove registration"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button onClick={handleRegister} disabled={loading} className="btn-primary w-full py-2.5 text-xs font-bold disabled:opacity-50">
          {loading ? "Processing..." : "Enroll in Course"}
        </button>
      )}
    </div>
  );
}