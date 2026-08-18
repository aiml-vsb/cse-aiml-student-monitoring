import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Code2,
  Award,
  Briefcase,
  GraduationCap,
  TrendingUp,
  Users,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import AnimatedBackground from "../components/common/AnimatedBackground";

export default function Landing() {
  const features = [
    {
      icon: Code2,
      title: "Daily LeetCode Challenges",
      desc: "Track daily LeetCode questions with automatic verification and streak records.",
      accent: "text-indigo-600",
    },
    {
      icon: Award,
      title: "Hackathons & Contests",
      desc: "Discover & register for upcoming hackathons with live real-time countdowns.",
      accent: "text-blue-600",
    },
    {
      icon: Briefcase,
      title: "Internships Hub",
      desc: "Find verified internship opportunities with stipend insights and one-click tracking.",
      accent: "text-emerald-600",
    },
    {
      icon: GraduationCap,
      title: "Skill & Course Tracks",
      desc: "Enroll in curated certifications and monitor your academic progress seamlessly.",
      accent: "text-violet-600",
    },
    {
      icon: TrendingUp,
      title: "AI Progress Analytics",
      desc: "Get intelligent AI-generated student reports and PowerPoint summaries.",
      accent: "text-amber-600",
    },
    {
      icon: Users,
      title: "Real-time Monitoring",
      desc: "Comprehensive department oversight on completions, registrations, and milestones.",
      accent: "text-rose-600",
    },
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <AnimatedBackground />

      {/* Floating Neumorphic Navbar */}
      <header className="container mx-auto px-4 pt-4">
        <nav className="neu-card p-3.5 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-primary-600 flex items-center justify-center shadow-neu-flat-sm">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-dark-800 leading-tight text-base tracking-tight">CSE(AIML) Monitor</div>
              <div className="text-[11px] font-semibold text-dark-400">Department of Computer Science & AIML</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login/admin" className="hidden sm:inline-flex btn-secondary py-2 px-4 text-xs font-semibold">
              Admin Portal
            </Link>
            <Link to="/login/student" className="btn-primary py-2 px-5 text-xs font-semibold">
              Login / Sign Up
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-16 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#e0e5ec] shadow-neu-inset-sm text-xs font-bold text-indigo-600 mb-8 border border-white/70"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Gen Student Performance & Monitoring System</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-dark-800 mb-6 tracking-tight max-w-4xl mx-auto"
        >
          Elevate Your Academic & Coding Journey in{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-primary-500 to-indigo-700">
            CSE(AIML)
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-base sm:text-lg text-dark-500 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          An integrated platform for tracking daily LeetCode challenges, hackathons, internships, and skill courses with real-time analytics and faculty oversight.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-4 justify-center mb-20"
        >
          <Link to="/login/student" className="btn-primary px-8 py-3.5 text-base shadow-neu-glow flex items-center gap-2">
            <span>Student Login / Register</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/login/admin" className="btn-secondary px-8 py-3.5 text-base">
            Faculty / Admin Login
          </Link>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i }}
              className="neu-card p-7 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#e0e5ec] shadow-neu-flat-sm flex items-center justify-center mb-5 border border-white/80">
                  <feature.icon className={`w-6 h-6 ${feature.accent}`} />
                </div>
                <h3 className="text-lg font-bold text-dark-800 mb-2.5">{feature.title}</h3>
                <p className="text-sm text-dark-500 leading-relaxed">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center border-t border-white/60">
        <p className="text-xs text-dark-400 font-medium">
          © {new Date().getFullYear()} CSE(AIML) Student Monitoring System. Designed with Soft UI.
        </p>
      </footer>
    </div>
  );
}