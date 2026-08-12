import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Trash2, Loader, Edit2, Check, X, Download, Github, ExternalLink } from "lucide-react";
import api from "../../api/client";
import endpoints from "../../api/endpoints";
import { useToast } from "../../context/ToastContext";

export default function StudentDetailsViewer() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    username: "",
    year: "",
    leetcodeUsername: "",
    githubUsername: "",
    profileComplete: false,
  });
  const [repoStudent, setRepoStudent] = useState(null);
  const [repos, setRepos] = useState([]);
  const [repoLoading, setRepoLoading] = useState(false);
  const [repoError, setRepoError] = useState("");
  const [repoModalOpen, setRepoModalOpen] = useState(false);
  const toast = useToast();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(endpoints.allStudents);
      setStudents(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student and all their data?")) return;
    try {
      const { data } = await api.delete(endpoints.studentById(id));
      toast.success(data.message || "Student deleted");
      await fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const handleEdit = (student) => {
    setEditingId(student.id);
    setEditData({
      username: student.username || "",
      year: student.year || "",
      leetcodeUsername: student.leetcodeUsername || "",
      githubUsername: student.githubUsername || "",
      profileComplete: student.profileComplete || false,
    });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveEdit = async (id) => {
    try {
      const { data } = await api.put(endpoints.studentById(id), editData);
      toast.success(data.message || "Student updated");
      setEditingId(null);
      await fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await api.get(endpoints.exportExcel, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `students-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("Excel exported!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Export failed");
    }
  };

  const handleExportPPT = async () => {
    try {
      const response = await api.get(endpoints.exportPPT, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `students-report-${new Date().toISOString().slice(0, 10)}.pptx`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("PPT exported!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Export failed");
    }
  };

  const handleShowRepos = async (student) => {
    if (!student.githubUsername) {
      toast.error("This student does not have a linked GitHub username.");
      return;
    }

    setRepoStudent(student);
    setRepoLoading(true);
    setRepoError("");
    setRepoModalOpen(true);

    try {
      const response = await fetch(
        `https://api.github.com/users/${encodeURIComponent(student.githubUsername)}/repos?per_page=100&sort=updated`
      );
      if (!response.ok) {
        const message = response.status === 404 ? "GitHub user not found." : "Failed to fetch repos.";
        throw new Error(message);
      }
      const data = await response.json();
      setRepos(data || []);
    } catch (err) {
      setRepoError(err.message || "Failed to fetch repos.");
    } finally {
      setRepoLoading(false);
    }
  };

  const handleCloseRepoModal = () => {
    setRepoModalOpen(false);
    setRepos([]);
    setRepoStudent(null);
    setRepoError("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-primary-400" />
          Student Details
        </h2>
        <div className="flex gap-2">
          <button onClick={handleExportExcel} className="btn-primary">
            <Download className="w-4 h-4 mr-1" />
            Export Excel
          </button>
          <button onClick={handleExportPPT} className="btn-secondary">
            <Download className="w-4 h-4 mr-1" />
            Export PPT
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-primary-400" />
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-12 text-dark-400">No students registered yet</div>
      ) : (
        <div className="glass-card p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-2 px-3 text-left text-dark-300">Student</th>
                  <th className="py-2 px-3 text-left text-dark-300">Year</th>
                  <th className="py-2 px-3 text-left text-dark-300">LeetCode</th>
                  <th className="py-2 px-3 text-left text-dark-300">Git</th>
                  <th className="py-2 px-3 text-left text-dark-300">Completed</th>
                  <th className="py-2 px-3 text-left text-dark-300">Regs</th>
                  <th className="py-2 px-3 text-left text-dark-300">Impositions</th>
                  <th className="py-2 px-3 text-left text-dark-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-white/5 hover:bg-white/5">
                    {editingId === student.id ? (
                      <>
                        <td className="py-2 px-3">
                          <input
                            name="username"
                            value={editData.username}
                            onChange={handleEditChange}
                            className="input-dark py-1"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <select name="year" value={editData.year} onChange={handleEditChange} className="input-dark py-1">
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                          </select>
                        </td>
                        <td className="py-2 px-3">
                          <input
                            name="leetcodeUsername"
                            value={editData.leetcodeUsername}
                            onChange={handleEditChange}
                            className="input-dark py-1"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            name="githubUsername"
                            value={editData.githubUsername}
                            onChange={handleEditChange}
                            className="input-dark py-1"
                          />
                        </td>
                        <td className="py-2 px-3 text-dark-300">{student.completedCount || 0}</td>
                        <td className="py-2 px-3 text-dark-300">
                          {(student.hackathonCount || 0) + (student.internshipCount || 0) + (student.courseCount || 0)}
                        </td>
                        <td className="py-2 px-3 text-dark-300">{student.impositionCount || 0}</td>
                        <td className="py-2 px-3">
                          <div className="flex gap-2">
                            <button onClick={() => handleSaveEdit(student.id)} className="p-1 rounded hover:bg-green-500/10 text-green-400">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-1 rounded hover:bg-red-500/10 text-red-400">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 px-3 text-white font-medium">{student.username || "—"}</td>
                        <td className="py-2 px-3 text-dark-300">{student.year || "—"}</td>
                        <td className="py-2 px-3 text-dark-300">{student.leetcodeUsername || "—"}</td>
                        <td className="py-2 px-3 text-dark-300">{student.githubUsername || "—"}</td>
                        <td className="py-2 px-3 text-green-400">{student.completedCount || 0}</td>
                        <td className="py-2 px-3 text-dark-300">
                          {(student.hackathonCount || 0) + (student.internshipCount || 0) + (student.courseCount || 0)}
                        </td>
                        <td className="py-2 px-3 text-red-400">{student.impositionCount || 0}</td>
                        <td className="py-2 px-3">
                          <div className="flex gap-2 items-center">
                            <button onClick={() => handleShowRepos(student)} className="p-1 rounded hover:bg-white/10 text-cyan-300" title="View GitHub repos">
                              <Github className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleEdit(student)} className="p-1 rounded hover:bg-white/10 text-primary-400">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(student.id)} className="p-1 rounded hover:bg-red-500/10 text-red-400">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {repoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="relative w-full max-w-3xl bg-dark-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {repoStudent?.username || repoStudent?.githubUsername}'s GitHub Repos
                </h3>
                <p className="text-sm text-dark-400">Showing public repositories for {repoStudent?.githubUsername}</p>
              </div>
              <button onClick={handleCloseRepoModal} className="p-2 rounded hover:bg-white/10 text-dark-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
              {repoLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="w-8 h-8 animate-spin text-primary-400" />
                </div>
              ) : repoError ? (
                <div className="text-center text-red-400">{repoError}</div>
              ) : repos.length === 0 ? (
                <div className="text-center text-dark-300">No public repositories found.</div>
              ) : (
                <div className="space-y-3">
                  {repos.map((repo) => (
                    <div key={repo.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="text-white font-semibold hover:text-primary-300"
                          >
                            {repo.name}
                          </a>
                          <p className="text-dark-400 text-sm mt-1">{repo.description || "No description"}</p>
                        </div>
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-dark-300 hover:text-white"
                          title="Open repository"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-dark-400">
                        <span>★ {repo.stargazers_count}</span>
                        <span>Forks: {repo.forks_count}</span>
                        <span>{repo.language || "Unknown"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}