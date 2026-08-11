import { useState } from "react";
import { motion } from "framer-motion";
import {
  Code2,
  Trophy,
  Briefcase,
  GraduationCap,
  Users,
  AlertTriangle,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  Sparkles,
} from "lucide-react";
import Navbar from "../../components/common/Navbar";
import AnimatedBackground from "../../components/common/AnimatedBackground";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";

// Admin Components
import AdminOverview from "../../components/admin/AdminOverview";
import DailyChallengeManager from "../../components/admin/DailyChallengeManager";
import HackathonManager from "../../components/admin/HackathonManager";
import InternshipManager from "../../components/admin/InternshipManager";
import CourseManager from "../../components/admin/CourseManager";
import StudentDetailsViewer from "../../components/admin/StudentDetailsViewer";
import ImpositionManager from "../../components/admin/ImpositionManager";
import TaskManager from "../../components/admin/TaskManager";
import PPTGenerator from "../../components/admin/PPTGenerator";
import AdminManager from "../../components/admin/AdminManager";

const tabs = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "challenge", label: "LeetCode for the Day", icon: Code2 },
  { id: "hackathons", label: "Hackathons", icon: Trophy },
  { id: "internships", label: "Internships", icon: Briefcase },
  { id: "courses", label: "Courses", icon: GraduationCap },
  { id: "students", label: "Student Details", icon: Users },
  { id: "impositions", label: "Impositions", icon: AlertTriangle },
  { id: "tasks", label: "Tasks", icon: FileText },
  { id: "ppt", label: "PPT Report", icon: Sparkles },
  { id: "settings", label: "Admin Console", icon: Settings },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <div className="min-h-screen">
      <AnimatedBackground />
      <Navbar />

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 glass-card m-4 p-4 h-[calc(100vh-6rem)] sticky top-20 overflow-y-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-semibold">{user?.username || "Admin"}</div>
              <div className="text-xs text-dark-400">{user?.email}</div>
            </div>
          </div>

          <nav className="flex flex-col space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? "bg-primary-600 text-white shadow-glow"
                    : "text-dark-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-all mt-6"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-x-hidden">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "overview" && <AdminOverview />}
            {activeTab === "challenge" && <DailyChallengeManager />}
            {activeTab === "hackathons" && <HackathonManager />}
            {activeTab === "internships" && <InternshipManager />}
            {activeTab === "courses" && <CourseManager />}
            {activeTab === "students" && <StudentDetailsViewer />}
            {activeTab === "impositions" && <ImpositionManager />}
            {activeTab === "tasks" && <TaskManager />}
            {activeTab === "ppt" && <PPTGenerator />}
            {activeTab === "settings" && <AdminManager />}
          </motion.div>
        </main>
      </div>
    </div>
  );
}