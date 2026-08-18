import { useState } from "react";
import { Menu, X, LogOut, ShieldCheck } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NotificationsDropdown from "./NotificationsDropdown";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.role === "ADMIN";
  const basePath = isAdmin ? "/admin/tasks" : "/student/tasks";

  const navLinks = isAdmin
    ? [
        { to: "/admin", label: "Dashboard" },
        { to: "/admin/tasks", label: "Tasks" },
      ]
    : [
        { to: "/student", label: "Dashboard" },
        { to: "/student/tasks", label: "Tasks" },
        { to: "/student/profile", label: "Profile" },
      ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="neu-card m-4 p-3.5 flex items-center justify-between sticky top-4 z-50">
      <div className="flex items-center gap-5">
        {/* Logo */}
        <Link to={isAdmin ? "/admin" : "/student"} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-primary-600 flex items-center justify-center shadow-neu-flat-sm group-hover:shadow-neu-glow transition-all duration-300">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="hidden md:block font-bold text-dark-700 text-base tracking-tight leading-tight">
              CSE(AIML) Monitor
            </span>
            <span className="hidden md:block text-[10px] text-dark-400 font-medium tracking-wide">
              {isAdmin ? "Admin Portal" : "Student Portal"}
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-2 p-1 bg-[#e0e5ec] rounded-xl shadow-neu-inset-sm">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-[#e0e5ec] text-indigo-600 shadow-neu-flat-sm"
                    : "text-dark-400 hover:text-dark-700 hover:bg-white/40"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications Bell */}
        <NotificationsDropdown basePath={basePath} />

        {/* User menu */}
        <div className="hidden md:flex items-center gap-3 pl-2 border-l border-white/60">
          <span className="text-sm font-medium text-dark-600 truncate max-w-[160px]">
            {user?.username || user?.email}
          </span>
          <button onClick={handleLogout} className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1">
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 rounded-xl text-dark-600 shadow-neu-btn active:shadow-neu-inset"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 mt-3 neu-card p-4 md:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-[#e0e5ec] text-indigo-600 shadow-neu-flat-sm"
                      : "text-dark-500 hover:text-dark-800"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="btn-secondary py-2.5 text-sm mt-2 flex items-center justify-center gap-1.5 text-red-500"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}