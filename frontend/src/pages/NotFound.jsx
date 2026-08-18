import { Link } from "react-router-dom";
import AnimatedBackground from "../components/common/AnimatedBackground";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center relative p-4">
      <AnimatedBackground />
      <div className="text-center neu-card p-10 sm:p-12 max-w-md mx-auto">
        <div className="text-7xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-indigo-700 mb-3 tracking-tighter">
          404
        </div>
        <h1 className="text-2xl font-extrabold text-dark-800 mb-2">Page Not Found</h1>
        <p className="text-dark-500 text-sm mb-8 leading-relaxed">
          The page you requested could not be found or has been moved.
        </p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2 px-6 py-3">
          <Home className="w-4 h-4" />
          Back to Safety
        </Link>
      </div>
    </div>
  );
}