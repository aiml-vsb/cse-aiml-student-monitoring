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
} from "lucide-react";
import AnimatedBackground from "../components/common/AnimatedBackground";

export default function Landing() {
  const features = [
    {
      icon: Code2,
      title: "Daily LeetCode Challenges",
      desc: "Track daily LeetCode questions with automatic verification",
    },
    {
      icon: Award,
      title: "Hackathons",
      desc: "Discover & register for hackathons with live countdowns",
    },
    {
      icon: Briefcase,
      title: "Internships",
      desc: "Find internship opportunities with stipend details",
    },
    {
      icon: GraduationCap,
      title: "Courses",
      desc: "Enroll in courses and track your progress",
    },
    {
      icon: TrendingUp,
      title: "AI Analytics",
      desc: "Get AI-generated insights & progress reports",
    },
    {
      icon: Users,
      title: "Student Monitoring",
      desc: "Track registrations, completions, and impositions",
    },
  ];

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-dark-900/80 border-b border-white/10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-glow">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-white leading-tight">CSE(AIML) Monitor</div>
              <div className="text-[10px] text-dark-400">Student Monitoring System</div>
            </div>
          </div>
          <Link to="/login/student" className="btn-primary">
            Login
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="container mx-auto px-4 py-20 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-primary-400 via-secondary-400 to-primary-400 bg-clip-text text-transparent"
        >
          CSE(AIML) Student
          <br />
          Monitoring System
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-dark-400 mb-12 max-w-2xl mx-auto"
        >
          Track daily LeetCode challenges, hackathons, internships, and courses — all in one place.
          With AI-powered analytics and real-time monitoring.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex gap-4 justify-center mb-20"
        >
          <Link to="/login/student" className="btn-primary px-8 py-3 text-lg">
            Student Login / Register
          </Link>
          <Link to="/login/admin" className="btn-secondary px-8 py-3 text-lg">
            Admin Login
          </Link>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="glass-card p-6 hover:shadow-glow transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-dark-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}