import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Trash2, Edit2, Plus, Award } from "lucide-react";
import api from "../../api/client";
import endpoints from "../../api/endpoints";
import ThumbnailUploader from "../common/ThumbnailUploader";
import Loader from "../common/Loader";
import { useToast } from "../../context/ToastContext";

const emptyForm = {
  title: "",
  description: "",
  link: "",
  previewImage: "",
  courseStart: "",
  courseEnd: "",
  benefit: "",
};

export default function CourseManager() {
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(endpoints.courses);
      setCourses(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    const interval = setInterval(fetchCourses, 60_000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        courseStart: new Date(formData.courseStart).toISOString(),
        courseEnd: new Date(formData.courseEnd).toISOString(),
      };
      if (editing) {
        const { data } = await api.put(endpoints.courseById(editing), payload);
        toast.success(data.message || "Course updated successfully!");
      } else {
        const { data } = await api.post(endpoints.courses, payload);
        toast.success(data.message || "Course enrolled successfully!");
      }
      setFormData(emptyForm);
      setEditing(null);
      await fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save course");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this course?")) return;
    try {
      await api.delete(endpoints.courseById(id));
      toast.success("Course deleted");
      await fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const startEdit = (course) => {
    setEditing(course.id);
    setFormData({
      title: course.title,
      description: course.description,
      link: course.link,
      previewImage: course.previewImage || "",
      courseStart: new Date(course.courseStart).toISOString().slice(0, 16),
      courseEnd: new Date(course.courseEnd).toISOString().slice(0, 16),
      benefit: course.benefit || "",
    });
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="neu-card p-6 md:p-8"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#e0e5ec] shadow-neu-flat-sm flex items-center justify-center border border-white/80 shrink-0">
            <GraduationCap className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-dark-800 tracking-tight">
              {editing ? "Edit Course Syllabus & Metadata" : "Publish Course / Certification"}
            </h2>
            <p className="text-xs text-dark-400 font-semibold">Post skill certification tracks, industry webinars, and academic courses.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label-dark">Course Title</label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange} className="neu-input" placeholder="e.g. Deep Learning Specialization" />
            </div>
            <div>
              <label className="label-dark">Course Portal URL</label>
              <input type="url" name="link" required value={formData.link} onChange={handleChange} className="neu-input" placeholder="https://..." />
            </div>
          </div>
          <div>
            <label className="label-dark">Course Description & Overview</label>
            <textarea name="description" required rows="3" value={formData.description} onChange={handleChange} className="neu-input resize-none" placeholder="Provide syllabus, prerequisites, and learning outcomes..." />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label-dark">Course Start Date</label>
              <input type="datetime-local" name="courseStart" required value={formData.courseStart} onChange={handleChange} className="neu-input" />
            </div>
            <div>
              <label className="label-dark">Course End / Exam Date</label>
              <input type="datetime-local" name="courseEnd" required value={formData.courseEnd} onChange={handleChange} className="neu-input" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 items-center">
            <ThumbnailUploader
              label="Course Banner Image"
              value={formData.previewImage}
              onChange={(val) => setFormData({ ...formData, previewImage: val })}
            />
            <div>
              <label className="label-dark">Perks / Certificate Benefit</label>
              <input type="text" name="benefit" value={formData.benefit} onChange={handleChange} className="neu-input" placeholder="e.g. Verified Certificate & Placement Support" />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={submitting} className="btn-primary py-3 px-8 text-xs font-bold disabled:opacity-50">
              {submitting ? "Saving..." : editing ? "Save Changes" : "Create Course"}
            </button>
            {editing && (
              <button type="button" onClick={() => { setEditing(null); setFormData(emptyForm); }} className="btn-secondary py-3 px-6 text-xs font-bold">
                Cancel
              </button>
            )}
          </div>
        </form>
      </motion.div>

      <div className="neu-card p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-extrabold text-dark-800">Active Course Listings</h2>
          <span className="text-xs font-bold text-dark-400">{courses.length} Active</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader size="md" text="Loading courses..." />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-10 neu-inset-panel p-6 text-dark-400 font-semibold text-xs">
            No courses open at this time.
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map((course) => (
              <div key={course.id} className="flex items-center justify-between p-3.5 rounded-xl bg-[#e0e5ec] shadow-neu-flat-sm border border-white/70">
                <div className="flex items-center gap-3.5">
                  {course.previewImage && <img src={course.previewImage} alt="" className="w-16 h-12 object-cover rounded-xl shadow-neu-inset-sm shrink-0" />}
                  <div>
                    <div className="font-bold text-dark-800 text-sm">{course.title}</div>
                    <div className="text-xs font-semibold text-dark-400 mt-0.5">
                      <span className="text-amber-700">{course.benefit || "Certificate included"}</span> · Ends: {new Date(course.courseEnd).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => startEdit(course)} className="p-2 rounded-xl text-dark-500 hover:text-indigo-600 hover:shadow-neu-btn active:shadow-neu-inset transition-all" title="Edit">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(course.id)} className="p-2 rounded-xl text-dark-500 hover:text-red-600 hover:shadow-neu-btn active:shadow-neu-inset transition-all" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
