import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Trash2, Loader, Edit2 } from "lucide-react";
import api from "../../api/client";
import endpoints from "../../api/endpoints";
import ThumbnailUploader from "../common/ThumbnailUploader";
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
        toast.success(data.message || "Course updated!");
      } else {
        const { data } = await api.post(endpoints.courses, payload);
        toast.success(data.message || "Course created!");
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
    if (!window.confirm("Are you sure?")) return;
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
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary-400" />
          {editing ? "Edit Course" : "Add Course"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label-dark">Title</label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange} className="input-dark" />
            </div>
            <div>
              <label className="label-dark">Link</label>
              <input type="url" name="link" required value={formData.link} onChange={handleChange} className="input-dark" />
            </div>
          </div>
          <div>
            <label className="label-dark">Description</label>
            <textarea name="description" required rows="3" value={formData.description} onChange={handleChange} className="input-dark resize-none" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label-dark">Course Start</label>
              <input type="datetime-local" name="courseStart" required value={formData.courseStart} onChange={handleChange} className="input-dark" />
            </div>
            <div>
              <label className="label-dark">Course End</label>
              <input type="datetime-local" name="courseEnd" required value={formData.courseEnd} onChange={handleChange} className="input-dark" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <ThumbnailUploader
              label="Preview Image"
              value={formData.previewImage}
              onChange={(val) => setFormData({ ...formData, previewImage: val })}
            />
            <div>
              <label className="label-dark">What you get</label>
              <input type="text" name="benefit" value={formData.benefit} onChange={handleChange} className="input-dark" placeholder="e.g., & Placement Support" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? (editing ? "Updating..." : "Creating...") : editing ? "Update" : "Create"}
            </button>
            {editing && (
              <button type="button" onClick={() => { setEditing(null); setFormData(emptyForm); }} className="btn-secondary">
                Cancel
              </button>
            )}
          </div>
        </form>
      </motion.div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">Active Courses</h2>
        {loading ? (
          <Loader className="w-6 h-6 animate-spin text-primary-400 mx-auto my-8" />
        ) : courses.length === 0 ? (
          <p className="text-center text-dark-400 py-8">No courses found</p>
        ) : (
          <div className="space-y-3">
            {courses.map((course) => (
              <div key={course.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  {course.previewImage && <img src={course.previewImage} alt="" className="w-16 h-12 object-cover rounded" />}
                  <div>
                    <div className="font-semibold text-white">{course.title}</div>
                    <div className="text-xs text-dark-400">
                      {course.benefit || "No benefit specified"} · Ends {new Date(course.courseEnd).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(course)} className="p-2 rounded hover:bg-white/10 text-primary-400">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(course.id)} className="p-2 rounded hover:bg-red-500/10 text-red-400">
                    <Trash2 className="w-4 h-4" />
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
