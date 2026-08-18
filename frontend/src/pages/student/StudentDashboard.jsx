import { useState, useEffect } from "react";
import { Code2, Trophy, Briefcase, GraduationCap, History, Sparkles } from "lucide-react";
import Navbar from "../../components/common/Navbar";
import AnimatedBackground from "../../components/common/AnimatedBackground";
import DailyChallengeCard from "../../components/student/DailyChallengeCard";
import HackathonCard from "../../components/student/HackathonCard";
import InternshipCard from "../../components/student/InternshipCard";
import CourseCard from "../../components/student/CourseCard";
import ChallengeHistory from "../../components/student/ChallengeHistory";
import ProfileSetupModal from "../../components/student/ProfileSetupModal";
import Loader from "../../components/common/Loader";
import api from "../../api/client";
import endpoints from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function StudentDashboard() {
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [hackathons, setHackathons] = useState([]);
  const [internships, setInternships] = useState([]);
  const [courses, setCourses] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("hackathons");
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (user && !user.profileComplete) {
      setShowProfileSetup(true);
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [challengeRes, historyRes, hackathonRes, internshipRes, courseRes, profileRes] = await Promise.all([
        api.get(endpoints.activeChallenge),
        api.get(endpoints.allChallenges),
        api.get(endpoints.hackathons),
        api.get(endpoints.internships),
        api.get(endpoints.courses),
        api.get(endpoints.getStudentProfile).catch(() => ({ data: { data: {} } })),
      ]);

      setActiveChallenge(challengeRes.data.data);
      setChallenges(historyRes.data.data || []);
      setHackathons(hackathonRes.data.data || []);
      setInternships(internshipRes.data.data || []);
      setCourses(courseRes.data.data || []);
      setRegistrations(profileRes.data?.data?.registrations || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isRegistered = (eventType, eventId) =>
    registrations.some((r) => r.eventType === eventType && r.eventId === eventId);

  const categoryMeta = [
    {
      id: "hackathons",
      label: "Hackathons",
      count: hackathons.length,
      icon: Trophy,
      iconClass: "text-indigo-600",
    },
    {
      id: "internships",
      label: "Internships",
      count: internships.length,
      icon: Briefcase,
      iconClass: "text-emerald-600",
    },
    {
      id: "courses",
      label: "Courses",
      count: courses.length,
      icon: GraduationCap,
      iconClass: "text-violet-600",
    },
  ];

  const renderSelectedCategory = () => {
    if (selectedCategory === "hackathons") {
      return (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-extrabold text-dark-800 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#e0e5ec] shadow-neu-flat-sm flex items-center justify-center border border-white/80">
                <Trophy className="w-4 h-4 text-indigo-600" />
              </div>
              <span>Hackathons & Competitions</span>
            </h2>
            <span className="text-xs font-bold text-dark-400">{hackathons.length} Available</span>
          </div>

          {hackathons.length === 0 ? (
            <div className="neu-card p-8 text-center text-dark-400 text-sm font-semibold">
              No hackathons published yet. Check back soon!
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-7">
              {hackathons.map((hackathon) => (
                <HackathonCard
                  key={hackathon.id}
                  hackathon={hackathon}
                  registered={isRegistered("HACKATHON", hackathon.id)}
                  onRegister={fetchData}
                  onUnregister={fetchData}
                />
              ))}
            </div>
          )}
        </section>
      );
    }

    if (selectedCategory === "internships") {
      return (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-extrabold text-dark-800 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#e0e5ec] shadow-neu-flat-sm flex items-center justify-center border border-white/80">
                <Briefcase className="w-4 h-4 text-emerald-600" />
              </div>
              <span>Verified Internships</span>
            </h2>
            <span className="text-xs font-bold text-dark-400">{internships.length} Available</span>
          </div>

          {internships.length === 0 ? (
            <div className="neu-card p-8 text-center text-dark-400 text-sm font-semibold">
              No internship listings available right now.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-7">
              {internships.map((internship) => (
                <InternshipCard
                  key={internship.id}
                  internship={internship}
                  registered={isRegistered("INTERNSHIP", internship.id)}
                  onRegister={fetchData}
                  onUnregister={fetchData}
                />
              ))}
            </div>
          )}
        </section>
      );
    }

    return (
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-extrabold text-dark-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#e0e5ec] shadow-neu-flat-sm flex items-center justify-center border border-white/80">
              <GraduationCap className="w-4 h-4 text-violet-600" />
            </div>
            <span>Academic & Industry Courses</span>
          </h2>
          <span className="text-xs font-bold text-dark-400">{courses.length} Available</span>
        </div>

        {courses.length === 0 ? (
          <div className="neu-card p-8 text-center text-dark-400 text-sm font-semibold">
            No courses enrolled or open at this moment.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-7">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                registered={isRegistered("COURSE", course.id)}
                onRegister={fetchData}
                onUnregister={fetchData}
              />
            ))}
          </div>
        )}
      </section>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <Loader size="lg" text="Loading student dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AnimatedBackground />
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e0e5ec] shadow-neu-inset-sm text-[11px] font-extrabold text-indigo-600 mb-2 border border-white/60">
              <Sparkles className="w-3 h-3" />
              <span>Student Overview & Milestones</span>
            </div>
            <h1 className="text-3xl font-extrabold text-dark-800 tracking-tight">
              Welcome back, {user?.username || "Student"}! 👋
            </h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-7">
          {/* Left Column: Challenge History & Segmented Nav */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="neu-card p-5 sticky top-24 max-h-80 flex flex-col">
              <h2 className="text-sm font-extrabold text-dark-800 mb-3 flex items-center gap-2 flex-shrink-0">
                <History className="w-4 h-4 text-indigo-600" />
                Challenge History
              </h2>
              <div className="flex-1 overflow-hidden">
                <ChallengeHistory challenges={challenges} />
              </div>
            </div>

            <div className="neu-card p-5 sticky top-[25rem]">
              <h2 className="text-sm font-extrabold text-dark-800 mb-3">Opportunities</h2>
              <div className="space-y-2.5">
                {categoryMeta.map(({ id, label, count, icon: Icon, iconClass }) => {
                  const isSelected = selectedCategory === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSelectedCategory(id)}
                      className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs font-bold transition-all duration-200 ${
                        isSelected
                          ? "bg-[#e0e5ec] text-indigo-600 shadow-neu-flat-sm border border-white/80"
                          : "text-dark-500 hover:text-dark-800 hover:bg-white/30"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isSelected ? "text-indigo-600" : iconClass}`} />
                        {label}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isSelected ? "bg-indigo-600 text-white shadow-sm" : "bg-[#e0e5ec] shadow-neu-inset-sm text-dark-500"
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Right Column: Challenge of the day and selected category */}
          <main className="lg:col-span-3 space-y-8">
            {activeChallenge?.active && activeChallenge?.status !== "COMPLETED" && (
              <section>
                <DailyChallengeCard
                  challenge={activeChallenge.challenge}
                  status={activeChallenge.status}
                  completedAt={activeChallenge.completedAt}
                  language={activeChallenge.language}
                  onComplete={fetchData}
                />
              </section>
            )}

            {renderSelectedCategory()}
          </main>
        </div>
      </div>

      {showProfileSetup && <ProfileSetupModal onClose={() => setShowProfileSetup(false)} />}
    </div>
  );
}