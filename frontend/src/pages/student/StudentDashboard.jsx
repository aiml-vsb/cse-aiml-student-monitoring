import { useState, useEffect } from "react";
import { Code2, Trophy, Briefcase, GraduationCap, Loader, History } from "lucide-react";
import Navbar from "../../components/common/Navbar";
import AnimatedBackground from "../../components/common/AnimatedBackground";
import DailyChallengeCard from "../../components/student/DailyChallengeCard";
import HackathonCard from "../../components/student/HackathonCard";
import InternshipCard from "../../components/student/InternshipCard";
import CourseCard from "../../components/student/CourseCard";
import ChallengeHistory from "../../components/student/ChallengeHistory";
import ProfileSetupModal from "../../components/student/ProfileSetupModal";
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <Loader className="w-10 h-10 animate-spin text-primary-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AnimatedBackground />
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            Welcome, {user?.username || "Student"}! 👋
          </h1>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar – Challenge History */}
          <aside className="lg:col-span-1">
            <div className="glass-card p-4 sticky top-20">
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <History className="w-4 h-4 text-secondary-400" />
                Challenge History
              </h2>
              <ChallengeHistory challenges={challenges} />
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-8">
            {/* Active Challenge */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-primary-400" />
                LeetCode for the Day
              </h2>
              {activeChallenge?.active ? (
                <DailyChallengeCard
                  challenge={activeChallenge.challenge}
                  status={activeChallenge.status}
                  completedAt={activeChallenge.completedAt}
                  language={activeChallenge.language}
                  onComplete={fetchData}
                />
              ) : (
                <div className="glass-card p-6 text-center text-dark-400">
                  No active challenge right now. Check back later!
                </div>
              )}
            </section>

            {/* Hackathons */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-secondary-400" />
                Hackathons
              </h2>
              {hackathons.length === 0 ? (
                <p className="text-dark-400">No hackathons available.</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
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

            {/* Internships */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-green-400" />
                Internships
              </h2>
              {internships.length === 0 ? (
                <p className="text-dark-400">No internships available.</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
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

            {/* Courses */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary-400" />
                Courses
              </h2>
              {courses.length === 0 ? (
                <p className="text-dark-400">No courses available.</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
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
          </main>
        </div>
      </div>

      {showProfileSetup && <ProfileSetupModal onClose={() => setShowProfileSetup(false)} />}
    </div>
  );
}