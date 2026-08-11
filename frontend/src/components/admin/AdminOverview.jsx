import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Users, Trophy, Briefcase, GraduationCap, Code2, AlertTriangle, Loader, FileText } from "lucide-react";
import api from "../../api/client";
import endpoints from "../../api/endpoints";
import GlowCard from "../common/GlowCard";

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
    return <Loader className="w-8 h-8 animate-spin text-primary-400 mx-auto my-12" />;
  }

  if (!stats) return null;

  const cards = [
    { label: "Total Students", value: stats.totalStudents, icon: Users, glow: "blue" },
    { label: "Active Hackathons", value: stats.totalHackathons, icon: Trophy, glow: "blue" },
    { label: "Active Internships", value: stats.totalInternships, icon: Briefcase, glow: "green" },
    { label: "Active Courses", value: stats.totalCourses, icon: GraduationCap, glow: "primary" },
    { label: "Active Tasks", value: stats.totalTasks, icon: FileText, glow: "blue" },
    { label: "Challenges Completed", value: stats.totalCompletions, icon: Code2, glow: "green" },
    { label: "Impositions", value: stats.totalImpositions, icon: AlertTriangle, glow: "red" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Dashboard Overview</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <GlowCard key={card.label} delay={i * 0.05} glowColor={card.glow}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white">{card.value}</div>
                <div className="text-sm text-dark-400">{card.label}</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <card.icon className="w-6 h-6 text-primary-400" />
              </div>
            </div>
          </GlowCard>
        ))}
      </div>
    </div>
  );
}