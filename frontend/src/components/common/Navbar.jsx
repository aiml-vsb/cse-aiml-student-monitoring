import { useState, useEffect } from "react";
import { Menu, X, Bell, LogOut } from "lucide-react";
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
    <nav className="glass-card m-4 p-3 flex items-center justify-between sticky top-4 z-50">
      <div className="flex items-center gap-4">
        {/* Logo */}
        <Link to={isAdmin ? "/admin" : "/student"} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
            <span className="font-bold text-white text-sm">V</span>
          </div>
          <span className="hidden md:block font-bold text-white text-lg">
            CSE(AIML) Monitor
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                location.pathname === link.to
                  ? "bg-primary-600 text-white"
                  : "text-dark-300 hover:text-white hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications Bell – single instance */}
        <NotificationsDropdown basePath={basePath} />

        {/* User menu */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-sm text-white">{user?.username || user?.email}</span>
          <button onClick={handleLogout} className="btn-secondary py-1 px-3 text-sm">
            <LogOut className="w-4 h-4 mr-1" />
            Logout
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-white hover:bg-white/10"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-card p-4 md:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm ${
                  location.pathname === link.to
                    ? "bg-primary-600 text-white"
                    : "text-dark-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="btn-secondary py-2 text-sm mt-2"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}