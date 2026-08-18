import { useState } from "react";
import { Sparkles, FileDown, CheckCircle2 } from "lucide-react";
import api from "../../api/client";
import endpoints from "../../api/endpoints";
import Loader from "../common/Loader";
import { useToast } from "../../context/ToastContext";

export default function PPTGenerator() {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await api.get(endpoints.exportPPT, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `student-monitoring-report-${new Date().toISOString().slice(0, 10)}.pptx`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("Presentation generated and downloaded successfully!");
    } catch (err) {
      console.error("PPT generation failed:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to generate PPT");
    } finally {
      setLoading(false);
    }
  };

  const featurePoints = [
    "Departmental Cover with College branding & accreditation badges",
    "Real-time student participation and LeetCode completion metrics",
    "Visual bar charts comparing progress across academic years",
    "Complete breakdown of Hackathon and Internship event enrollments",
    "Detailed Task and Lab assignment submission records",
    "Top performing student leaderboard and honor roll",
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="neu-card p-8 md:p-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#e0e5ec] shadow-neu-flat flex items-center justify-center border border-white/80 shrink-0">
            <Sparkles className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-dark-800 tracking-tight">
              Executive Department PPT Deck Generator
            </h2>
            <p className="text-xs text-dark-400 font-semibold">Generate automated HOD & Management review slide presentations.</p>
          </div>
        </div>

        <div className="neu-inset-panel p-6 mb-8 space-y-3">
          <p className="text-xs font-bold text-dark-700 uppercase tracking-wider mb-2">Automated Slide Modules Included:</p>
          {featurePoints.map((point, index) => (
            <div key={index} className="flex items-start gap-2.5 text-xs text-dark-600 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{point}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="btn-primary w-full py-4 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              Compiling PowerPoint Presentation...
            </>
          ) : (
            <>
              <FileDown className="w-5 h-5" />
              Download Full PPTX Presentation Deck
            </>
          )}
        </button>
      </div>
    </div>
  );
}