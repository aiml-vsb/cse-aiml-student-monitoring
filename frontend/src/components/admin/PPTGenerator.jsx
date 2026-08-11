import { useState } from "react";
import { Sparkles, Loader, FileDown } from "lucide-react";
import api from "../../api/client";
import endpoints from "../../api/endpoints";
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
      link.download = `student-report-${new Date().toISOString().slice(0, 10)}.pptx`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("PPT downloaded successfully!");
    } catch (err) {
      console.error("PPT generation failed:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to generate PPT");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-secondary-400" />
          Full PPT Report Generator
        </h2>

        <p className="text-dark-300 mb-4">Download a professional PowerPoint file with:</p>
        <ul className="list-disc pl-6 text-sm text-dark-300 mb-6 space-y-1">
          <li>Cover page with VSB logo & accreditation</li>
          <li>Overview statistics cards</li>
          <li>Bar chart – student LeetCode completions</li>
          <li>Table – hackathon / internship / registrations</li>
          <li>Task completion report</li>
          <li>Top performers leaderboard</li>
        </ul>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="btn-primary px-8 py-3 text-lg disabled:opacity-50 w-full"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin mr-2" />
              Generating PPT...
            </>
          ) : (
            <>
              <FileDown className="w-5 h-5 mr-2" />
              Download PPT
            </>
          )}
        </button>
      </div>
    </div>
  );
}