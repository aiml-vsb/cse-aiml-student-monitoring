import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-900 border-t border-white/10 py-6">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
            <span className="font-bold text-white text-sm">CSE</span>
          </div>
          <span className="font-semibold text-white">CSE(AIML) Student Monitoring</span>
        </div>

        <p className="text-dark-400 text-sm">
          © {currentYear} CSE(AIML) Department. All rights reserved.
        </p>

        <div className="mt-4 flex items-center justify-center gap-6 text-sm text-dark-400">
          <Link to="/" className="hover:text-primary-400 transition-colors">Home</Link>
          <Link to="/login" className="hover:text-primary-400 transition-colors">Login</Link>
        </div>
      </div>
    </footer>
  );
}