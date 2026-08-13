import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Users, Trash2, Loader, Edit2, Check, X, Download } from "lucide-react";
import api from "../../api/client";
import endpoints from "../../api/endpoints";
import { useToast } from "../../context/ToastContext";

const normalizeGithubUsername = (value) => {
  const raw = (value || "").trim();
  if (!raw) return "";

  if (raw.includes("github.com")) {
    try {
      const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
      const parts = url.pathname.split("/").filter(Boolean);
      return parts[0] || "";
    } catch {
      return raw
        .replace(/^@/, "")
        .replace(/^https?:\/\/github\.com\//i, "")
        .replace(/\/+$/, "")
        .split("/")[0]
        .trim();
    }
  }

  return raw
    .replace(/^@/, "")
    .replace(/^https?:\/\/github\.com\//i, "")
    .replace(/\/+$/, "")
    .split("/")[0]
    .trim();
};

const normalizeLeetcodeUsername = (value) => {
  const raw = (value || "").trim();
  if (!raw) return "";

  if (raw.includes("leetcode.com")) {
    try {
      const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts[0] === "u" && parts[1]) return parts[1];
      if (parts.length >= 1) return parts[parts.length - 1];
      return "";
    } catch {
      return raw
        .replace(/^@/, "")
        .replace(/^https?:\/\/leetcode\.com\//i, "")
        .replace(/^u\//i, "")
        .replace(/\/+$/, "")
        .split("/")[0]
        .trim();
    }
  }

  return raw
    .replace(/^@/, "")
    .replace(/^https?:\/\/leetcode\.com\//i, "")
    .replace(/^u\//i, "")
    .replace(/\/+$/, "")
    .split("/")[0]
    .trim();
};

const getGithubProfileUrl = (value) => {
  const username = normalizeGithubUsername(value);
  return username ? `https://github.com/${username}` : null;
};

const getLeetcodeProfileUrl = (value) => {
  const username = normalizeLeetcodeUsername(value);
  return username ? `https://leetcode.com/u/${username}` : null;
};

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
    const githubUsername = normalizeGithubUsername(student.githubUsername);

    if (!githubUsername) {
      toast.error("This student does not have a linked GitHub username.");
      return;
    }

    setRepoStudent({ ...student, githubUsername });
    setRepoLoading(true);
    setRepoError("");
    setRepoModalOpen(true);

    try {
      const response = await fetch(
        `https://api.github.com/users/${encodeURIComponent(githubUsername)}/repos?per_page=100&sort=updated`
      );
      if (!response.ok) {
        const message = response.status === 404 ? "GitHub user not found." : "Failed to fetch repos.";
        throw new Error(message);
      }
      const data = await response.json();
      setRepos(Array.isArray(data) ? data : []);
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
                  <th className="py-2 px-3 text-left text-dark-300">Hackathons</th>
                  <th className="py-2 px-3 text-left text-dark-300">Internships</th>
                  <th className="py-2 px-3 text-left text-dark-300">Courses</th>
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
                        <td className="py-2 px-3 text-dark-300">{student.hackathonCount || 0}</td>
                        <td className="py-2 px-3 text-dark-300">{student.internshipCount || 0}</td>
                        <td className="py-2 px-3 text-dark-300">{student.courseCount || 0}</td>
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
                        <td className="py-2 px-3 text-dark-300">
                          {student.leetcodeUsername ? (
                            <a
                              href={getLeetcodeProfileUrl(student.leetcodeUsername)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary-300 hover:text-primary-200 underline underline-offset-2"
                            >
                              {normalizeLeetcodeUsername(student.leetcodeUsername)}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-2 px-3 text-dark-300">
                          {student.githubUsername ? (
                            <a
                              href={getGithubProfileUrl(student.githubUsername)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary-300 hover:text-primary-200 underline underline-offset-2"
                            >
                              {normalizeGithubUsername(student.githubUsername)}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-2 px-3 text-green-400">{student.completedCount || 0}</td>
                        <td className="py-2 px-3 text-dark-300">{student.hackathonCount || 0}</td>
                        <td className="py-2 px-3 text-dark-300">{student.internshipCount || 0}</td>
                        <td className="py-2 px-3 text-dark-300">{student.courseCount || 0}</td>
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
                                className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition ${
                                  student.githubUsername
                                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                                    : authErrorByStudent[student.id]
                                    ? "border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                                    : "border-white/10 bg-black text-white hover:bg-neutral-800"
                                } ${authLoadingByStudent[student.id] ? "opacity-70 cursor-not-allowed" : ""}`}
                              >
                                {authLoadingByStudent[student.id]
                                  ? "Processing..."
                                  : student.githubUsername
                                  ? "Show Repos"
                                  : authErrorByStudent[student.id]
                                  ? "Retry"
                                  : "GitHub"}
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
          <div className="w-full max-w-xl max-h-[70vh] rounded-xl bg-slate-950 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10 flex-shrink-0">
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-white truncate">{normalizeGithubUsername(repoStudent?.githubUsername)}'s repos</h3>
              </div>
              <button
                onClick={handleCloseRepoModal}
                className="rounded-lg bg-white/10 px-2 py-1.5 text-xs font-medium text-white hover:bg-white/20 flex-shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3">
              {repoLoading ? (
                <div className="flex justify-center py-8">
                  <Loader className="w-6 h-6 animate-spin text-primary-400" />
                </div>
              ) : repoError ? (
                <div className="rounded-lg bg-red-500/10 p-3 text-red-200 text-sm">{repoError}</div>
              ) : repos.length === 0 ? (
                <div className="rounded-lg bg-white/5 p-3 text-dark-300 text-sm">No repositories found.</div>
              ) : (
                <div className="space-y-2">
                  {repos.map((repo) => (
                    <a
                      key={repo.id}
                      href={repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-lg border border-white/10 bg-slate-900/50 p-2.5 transition hover:border-primary-400 hover:bg-slate-900/80"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold text-white truncate flex-1">{repo.name}</h4>
                        {repo.language && <span className="text-xs text-dark-400 flex-shrink-0">{repo.language}</span>}
                      </div>
                      {repo.description && <p className="mt-1 text-xs text-dark-300 line-clamp-2">{repo.description}</p>}
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