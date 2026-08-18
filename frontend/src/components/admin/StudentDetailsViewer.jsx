import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Users, Trash2, Edit2, Check, X, Download, Github, Code2, ExternalLink } from "lucide-react";
import api from "../../api/client";
import endpoints from "../../api/endpoints";
import Loader from "../common/Loader";
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
    if (!window.confirm("Are you sure you want to delete this student and all their records?")) return;
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
      toast.success(data.message || "Student updated successfully");
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
      toast.success("Excel exported successfully!");
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
      toast.success("PPT exported successfully!");
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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#e0e5ec] shadow-neu-flat-sm flex items-center justify-center border border-white/80 shrink-0">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-dark-800 tracking-tight">Student Academic Directory</h2>
            <p className="text-xs text-dark-400 font-semibold">Monitor GitHub, LeetCode submissions, event enrollments, and penalties.</p>
          </div>
        </div>
        <div className="flex gap-2.5">
          <button onClick={handleExportExcel} className="btn-secondary text-xs font-bold py-2.5 px-4 flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            Export Excel
          </button>
          <button onClick={handleExportPPT} className="btn-secondary text-xs font-bold py-2.5 px-4 flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            Export PPT
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader size="lg" text="Loading student directory..." />
        </div>
      ) : students.length === 0 ? (
        <div className="neu-card p-12 text-center text-dark-400 font-semibold text-sm">No students registered yet.</div>
      ) : (
        <div className="neu-card p-6 md:p-8">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-dark-300/40 text-dark-400 uppercase tracking-wider font-extrabold text-[11px]">
                  <th className="py-3 px-3 text-left">Student</th>
                  <th className="py-3 px-3 text-left">Year</th>
                  <th className="py-3 px-3 text-left">LeetCode</th>
                  <th className="py-3 px-3 text-left">GitHub</th>
                  <th className="py-3 px-3 text-center">LC Solved</th>
                  <th className="py-3 px-3 text-center">Hackathons</th>
                  <th className="py-3 px-3 text-center">Internships</th>
                  <th className="py-3 px-3 text-center">Courses</th>
                  <th className="py-3 px-3 text-center">Impositions</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-200/30">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-white/40 transition-colors">
                    {editingId === student.id ? (
                      <>
                        <td className="py-3 px-2">
                          <input
                            name="username"
                            value={editData.username}
                            onChange={handleEditChange}
                            className="neu-input py-1.5 text-xs"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <select name="year" value={editData.year} onChange={handleEditChange} className="neu-input py-1.5 text-xs">
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                          </select>
                        </td>
                        <td className="py-3 px-2">
                          <input
                            name="leetcodeUsername"
                            value={editData.leetcodeUsername}
                            onChange={handleEditChange}
                            className="neu-input py-1.5 text-xs"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <input
                            name="githubUsername"
                            value={editData.githubUsername}
                            onChange={handleEditChange}
                            className="neu-input py-1.5 text-xs"
                          />
                        </td>
                        <td className="py-3 px-3 text-center text-dark-500 font-bold">{student.completedCount || 0}</td>
                        <td className="py-3 px-3 text-center text-dark-500 font-bold">{student.hackathonCount || 0}</td>
                        <td className="py-3 px-3 text-center text-dark-500 font-bold">{student.internshipCount || 0}</td>
                        <td className="py-3 px-3 text-center text-dark-500 font-bold">{student.courseCount || 0}</td>
                        <td className="py-3 px-3 text-center text-dark-500 font-bold">{student.impositionCount || 0}</td>
                        <td className="py-3 px-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button onClick={() => handleSaveEdit(student.id)} className="p-1.5 rounded-lg text-emerald-700 hover:shadow-neu-btn" title="Save">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg text-red-500 hover:shadow-neu-btn" title="Cancel">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3.5 px-3 font-bold text-dark-800">{student.username || "—"}</td>
                        <td className="py-3.5 px-3 text-dark-500 font-medium">{student.year || "—"}</td>
                        <td className="py-3.5 px-3">
                          {student.leetcodeUsername ? (
                            <a
                              href={getLeetcodeProfileUrl(student.leetcodeUsername)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-1"
                            >
                              <Code2 className="w-3 h-3 text-dark-400" />
                              {normalizeLeetcodeUsername(student.leetcodeUsername)}
                            </a>
                          ) : (
                            <span className="text-dark-400">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          {student.githubUsername ? (
                            <a
                              href={getGithubProfileUrl(student.githubUsername)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-1"
                            >
                              <Github className="w-3 h-3 text-dark-400" />
                              {normalizeGithubUsername(student.githubUsername)}
                            </a>
                          ) : (
                            <span className="text-dark-400">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500/15 text-emerald-700 shadow-neu-inset-sm">
                            {student.completedCount || 0}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center font-bold text-dark-700">{student.hackathonCount || 0}</td>
                        <td className="py-3.5 px-3 text-center font-bold text-dark-700">{student.internshipCount || 0}</td>
                        <td className="py-3.5 px-3 text-center font-bold text-dark-700">{student.courseCount || 0}</td>
                        <td className="py-3.5 px-3 text-center">
                          {student.impositionCount > 0 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-red-500/15 text-red-600 shadow-neu-inset-sm">
                              {student.impositionCount}
                            </span>
                          ) : (
                            <span className="text-dark-400 font-medium">0</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() =>
                                student.githubUsername
                                  ? handleShowRepos(student)
                                  : handleAuthorizeStudent(student.id)
                              }
                              disabled={!!authLoadingByStudent[student.id]}
                              className="btn-secondary text-[11px] font-bold py-1.5 px-2.5 flex items-center gap-1"
                            >
                              {authLoadingByStudent[student.id]
                                ? "Processing..."
                                : student.githubUsername
                                ? "Repos"
                                : "Auth"}
                            </button>
                            <button onClick={() => handleEdit(student)} className="p-1.5 rounded-xl text-dark-500 hover:text-indigo-600 hover:shadow-neu-btn active:shadow-neu-inset transition-all" title="Edit">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDelete(student.id)} className="p-1.5 rounded-xl text-dark-500 hover:text-red-600 hover:shadow-neu-btn active:shadow-neu-inset transition-all" title="Delete">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {authErrorByStudent[student.id] && (
                            <div className="text-[10px] text-red-500 font-bold mt-1">{authErrorByStudent[student.id]}</div>
                          )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-md p-4">
          <div className="neu-card w-full max-w-xl max-h-[75vh] flex flex-col shadow-neu-flat-lg border border-white/80 p-6">
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/60 flex-shrink-0">
              <div className="min-w-0">
                <h3 className="text-base font-extrabold text-dark-800 truncate flex items-center gap-2">
                  <Github className="w-4 h-4 text-indigo-600" />
                  <span>{normalizeGithubUsername(repoStudent?.githubUsername)}'s Repositories</span>
                </h3>
              </div>
              <button
                onClick={handleCloseRepoModal}
                className="w-8 h-8 rounded-xl bg-[#e0e5ec] shadow-neu-btn active:shadow-neu-inset flex items-center justify-center text-dark-500 hover:text-dark-800 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pt-4 space-y-2.5 pr-1">
              {repoLoading ? (
                <div className="flex justify-center py-10">
                  <Loader size="md" text="Fetching GitHub repos..." />
                </div>
              ) : repoError ? (
                <div className="rounded-xl bg-red-500/10 p-3.5 text-red-600 text-xs font-bold border border-red-500/20">{repoError}</div>
              ) : repos.length === 0 ? (
                <div className="text-center py-8 text-dark-400 text-xs font-semibold">No public repositories found for this account.</div>
              ) : (
                repos.map((repo) => (
                  <a
                    key={repo.id}
                    href={repo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block p-3.5 rounded-xl bg-[#e0e5ec] shadow-neu-flat-sm hover:shadow-neu-flat border border-white/70 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-dark-800 truncate flex-1 flex items-center gap-1.5">
                        <ExternalLink className="w-3 h-3 text-indigo-600" />
                        {repo.name}
                      </h4>
                      {repo.language && (
                        <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-500/10 px-2 py-0.5 rounded-md shadow-neu-inset-sm">
                          {repo.language}
                        </span>
                      )}
                    </div>
                    {repo.description && <p className="mt-1 text-[11px] text-dark-500 line-clamp-2 leading-relaxed">{repo.description}</p>}
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}