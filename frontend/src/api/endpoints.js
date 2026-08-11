const endpoints = {
  // Auth
  register: "/auth/register",
  studentLogin: "/auth/student-login",
  sendOtp: "/auth/send-otp",
  verifyOtp: "/auth/verify-otp",
  adminLogin: "/auth/admin-login",
  me: "/auth/me",
  githubUrl: "/auth/github/url",
  githubCallback: "/auth/github/callback",
  logout: "/auth/logout",

  // Student
  studentProfile: "/students/me",
  getStudentProfile: "/students/me",
  updateStudentProfile: "/students/me",
  allStudents: "/students",
  studentById: (id) => `/students/${id}`,
  studentAnalytics: "/students/analytics",

  // Daily Challenge
  createDailyChallenge: "/daily-challenge",
  activeChallenge: "/daily-challenge/active",
  allChallenges: "/daily-challenge/all",
  completeChallenge: "/daily-challenge/complete",
  challengeStats: "/daily-challenge/stats",
  dailyChallengeById: (id) => `/daily-challenge/${id}`,

  // Hackathons
  hackathons: "/hackathons",
  hackathonById: (id) => `/hackathons/${id}`,
  registerHackathon: (id) => `/hackathons/${id}/register`,
  unregisterHackathon: (id) => `/hackathons/${id}/register`,

  // Internships
  internships: "/internships",
  internshipById: (id) => `/internships/${id}`,
  registerInternship: (id) => `/internships/${id}/register`,
  unregisterInternship: (id) => `/internships/${id}/register`,

  // Courses
  courses: "/courses",
  courseById: (id) => `/courses/${id}`,
  registerCourse: (id) => `/courses/${id}/register`,
  unregisterCourse: (id) => `/courses/${id}/register`,

  // Registrations
  myRegistrations: "/registrations/me",
  allRegistrations: "/registrations",
  registrationById: (id) => `/registrations/${id}`,
  cancelRegistration: (id) => `/registrations/${id}`,

  // Impositions
  createImposition: "/impositions",
  myImpositions: "/impositions/me",
  allImpositions: "/impositions",
  sendImpositionEmail: (id) => `/impositions/${id}/send-email`,

  // Tasks
  createTask: "/tasks",
  allTasks: "/tasks",
  taskById: (id) => `/tasks/${id}`,
  updateTask: (id) => `/tasks/${id}`,
  deleteTask: (id) => `/tasks/${id}`,
  activeTasks: "/tasks/active",
  completeTask: (id) => `/tasks/${id}/complete`,
  taskHistory: "/tasks/history",

  // Admin
  createAdmin: "/admin/create-admin",
  allAdmins: "/admin",
  deleteAdmin: (id) => `/admin/${id}`,
  adminStats: "/admin/stats",

  // Export
  exportExcel: "/export/excel",
  exportPPT: "/export/ppt",
};

export default endpoints;