import { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Code2,
  Trophy,
  Briefcase,
  GraduationCap,
  Users,
  AlertTriangle,
  FileText,
  Presentation,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import Navbar from "../../components/common/Navbar";
import AnimatedBackground from "../../components/common/AnimatedBackground";
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
import { useAuth } from "../../context/AuthContext";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useAuth();

  const isSuperAdmin = user?.role === "SUPERADMIN";

  const tabs = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard, color: "text-indigo-600" },
    { id: "challenge", label: "LeetCode Daily", icon: Code2, color: "text-indigo-600" },
    { id: "hackathons", label: "Hackathons", icon: Trophy, color: "text-amber-600" },
    { id: "internships", label: "Internships", icon: Briefcase, color: "text-emerald-600" },
    { id: "courses", label: "Courses", icon: GraduationCap, color: "text-violet-600" },
    { id: "students", label: "Student Records", icon: Users, color: "text-blue-600" },
    { id: "impositions", label: "Impositions", icon: AlertTriangle, color: "text-red-500" },
    { id: "tasks", label: "Tasks & Notices", icon: FileText, color: "text-teal-600" },
    { id: "ppt", label: "PPT Deck Generator", icon: Presentation, color: "text-orange-600" },
    ...(isSuperAdmin
      ? [{ id: "settings", label: "Admin Access", icon: ShieldAlert, color: "text-rose-600" }]
      : []),
  ];

  return (
    <div className="min-h-screen">
      <AnimatedBackground />
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e0e5ec] shadow-neu-inset-sm text-[11px] font-extrabold text-indigo-600 mb-2 border border-white/60">
              <Sparkles className="w-3 h-3" />
              <span>Department Administrator Portal</span>
            </div>
            <h1 className="text-3xl font-extrabold text-dark-800 tracking-tight">
              Faculty & Admin Console
            </h1>
          </div>
          <div className="px-4 py-2 rounded-xl bg-[#e0e5ec] shadow-neu-flat-sm border border-white/80 text-xs font-bold text-dark-600">
            Role: <span className="text-indigo-600 font-extrabold">{user?.role || "ADMIN"}</span>
          </div>
        </div>

        {/* Neumorphic Tab Bar Navigation */}
        <div className="flex gap-2.5 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all duration-200 shrink-0 ${
                  isActive
                    ? "bg-[#e0e5ec] text-indigo-600 shadow-neu-inset-sm border border-indigo-200/50"
                    : "bg-[#e0e5ec] text-dark-500 shadow-neu-flat-sm hover:shadow-neu-flat hover:text-dark-800 border border-white/80 active:shadow-neu-inset-sm"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600" : tab.color}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Main Content */}
        <main className="w-full min-w-0 pb-12">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
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