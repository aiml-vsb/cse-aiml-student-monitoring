import { useState, useEffect, useCallback } from "react";
import { Users, Trophy, Briefcase, GraduationCap, Code2, AlertTriangle, FileText } from "lucide-react";
import api from "../../api/client";
import endpoints from "../../api/endpoints";
import GlowCard from "../common/GlowCard";
import Loader from "../common/Loader";

const STATS_REFRESH_MS = 60_000;

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get(endpoints.adminStats);
      setStats(data.data);
    } catch (err) {
      console.error("Failed to load stats", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, STATS_REFRESH_MS);
    return () => clearInterval(interval);
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader size="lg" text="Loading real-time overview..." />
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    { label: "Total Students", value: stats.totalStudents, icon: Users, iconColor: "text-blue-600", bgLight: "bg-blue-500/10" },
    { label: "Active Hackathons", value: stats.totalHackathons, icon: Trophy, iconColor: "text-amber-600", bgLight: "bg-amber-500/10" },
    { label: "Active Internships", value: stats.totalInternships, icon: Briefcase, iconColor: "text-emerald-600", bgLight: "bg-emerald-500/10" },
    { label: "Active Courses", value: stats.totalCourses, icon: GraduationCap, iconColor: "text-violet-600", bgLight: "bg-violet-500/10" },
    { label: "Active Department Tasks", value: stats.totalTasks, icon: FileText, iconColor: "text-teal-600", bgLight: "bg-teal-500/10" },
    { label: "Challenges Completed", value: stats.totalCompletions, icon: Code2, iconColor: "text-indigo-600", bgLight: "bg-indigo-500/10" },
    { label: "Total Impositions", value: stats.totalImpositions, icon: AlertTriangle, iconColor: "text-red-500", bgLight: "bg-red-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-dark-800 tracking-tight">Performance Summary</h2>
          <p className="text-xs text-dark-400 font-semibold mt-0.5">Live aggregated academic metrics across CSE(AIML).</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-1">
        {cards.map((card, i) => (
          <GlowCard key={card.label} delay={i * 0.03}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-3xl font-black text-dark-800 tracking-tight leading-none mb-1.5">{card.value ?? 0}</div>
                <div className="text-xs font-bold text-dark-500 truncate">{card.label}</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#e0e5ec] shadow-neu-inset-sm flex items-center justify-center shrink-0">
                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </div>
          </GlowCard>
        ))}
      </div>
    </div>
  );
}