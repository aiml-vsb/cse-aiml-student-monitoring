import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Users, Trash2, Loader, Edit2, Check, X, Download } from "lucide-react";
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
  const [authErrorByStudent, setAuthErrorByStudent] = useState({});
  const [authLoadingByStudent, setAuthLoadingByStudent] = useState({});
  const toast = useToast();
  const location = useLocation();

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

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const githubLinked = query.get("github");
    const githubError = query.get("error");
    const studentId = query.get("studentId");

    if (studentId && githubLinked === "linked") {
      toast.success("GitHub authorized successfully for student.");
      setAuthErrorByStudent((prev) => {
        const next = { ...prev };
        delete next[studentId];
        return next;
      });
      fetchStudents();
      window.history.replaceState({}, "", location.pathname);
      return;
    }

    if (studentId && githubError === "github_failed") {
      setAuthErrorByStudent((prev) => ({
        ...prev,
        [studentId]: "GitHub authorization failed. Retry.",
      }));
      toast.error("GitHub authorization failed for student.");
      window.history.replaceState({}, "", location.pathname);
    }
  }, [location, toast]);

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

  const handleAuthorizeStudent = async (studentId) => {
    setAuthLoadingByStudent((prev) => ({ ...prev, [studentId]: true }));
    setAuthErrorByStudent((prev) => {
      const next = { ...prev };
      delete next[studentId];
      return next;
    });

    try {
      const { data } = await api.get(`${endpoints.githubUrl}?studentId=${studentId}`);
      window.location.href = data.data.url;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to initiate GitHub authorization.";
      setAuthErrorByStudent((prev) => ({ ...prev, [studentId]: message }));
      setAuthLoadingByStudent((prev) => ({ ...prev, [studentId]: false }));
      toast.error(message);
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
                          <div className="flex flex-col gap-1">
                            <div className="flex gap-2 items-center">
                              <button
                                onClick={() =>
                                  student.githubUsername
                                    ? handleShowRepos(student)
                                    : handleAuthorizeStudent(student.id)
                                }
                                disabled={!!authLoadingByStudent[student.id]}
                                className={`rounded px-3 py-1 text-sm font-semibold transition ${
                                  student.githubUsername
                                    ? "bg-emerald-500 text-white"
                                    : authErrorByStudent[student.id]
                                    ? "bg-red-500 text-white"
                                    : "bg-blue-500 text-white hover:bg-blue-400"
                                } ${authLoadingByStudent[student.id] ? "opacity-70 cursor-not-allowed" : ""}`}
                              >
                                {authLoadingByStudent[student.id]
                                  ? "Processing..."
                                  : student.githubUsername
                                  ? "Authorized"
                                  : authErrorByStudent[student.id]
                                  ? "Retry"
                                  : "Authorize"}
                              </button>
                              <button onClick={() => handleEdit(student)} className="p-1 rounded hover:bg-white/10 text-primary-400">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDelete(student.id)} className="p-1 rounded hover:bg-red-500/10 text-red-400">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            {authErrorByStudent[student.id] && (
                              <div className="text-xs text-red-400">{authErrorByStudent[student.id]}</div>
                            )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <h3 className="text-xl font-semibold text-white">{repoStudent?.githubUsername}'s GitHub repos</h3>
                <p className="text-sm text-dark-300">Showing public repos from GitHub.</p>
              </div>
              <button
                onClick={handleCloseRepoModal}
                className="rounded-lg bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20"
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {repoLoading ? (
                <div className="flex justify-center py-10">
                  <Loader className="w-8 h-8 animate-spin text-primary-400" />
                </div>
              ) : repoError ? (
                <div className="rounded-xl bg-red-500/10 p-4 text-red-200">{repoError}</div>
              ) : repos.length === 0 ? (
                <div className="rounded-xl bg-white/5 p-4 text-dark-300">No repositories found.</div>
              ) : (
                <div className="grid gap-3">
                  {repos.map((repo) => (
                    <a
                      key={repo.id}
                      href={repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl border border-white/10 bg-slate-900 p-4 transition hover:border-primary-400"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <h4 className="text-base font-semibold text-white">{repo.name}</h4>
                        <span className="text-sm text-dark-300">{repo.language || "—"}</span>
                      </div>
                      <p className="mt-2 text-sm text-dark-300">{repo.description || "No description provided."}</p>
                    </a>
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