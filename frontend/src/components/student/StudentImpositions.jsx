import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Mail, CheckCircle2 } from "lucide-react";
import Loader from "../common/Loader";
import api from "../../api/client";
import endpoints from "../../api/endpoints";
import { useToast } from "../../context/ToastContext";

export default function StudentImpositions() {
  const [impositions, setImpositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(endpoints.myImpositions);
        setImpositions(data.data || []);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load impositions");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader size="md" text="Loading impositions..." />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="neu-card p-6 md:p-8 max-w-2xl"
    >
      <h2 className="text-xl font-extrabold text-dark-800 mb-6 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-[#e0e5ec] shadow-neu-flat-sm flex items-center justify-center border border-white/80">
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
        <span>My Academic Impositions</span>
      </h2>

      {impositions.length === 0 ? (
        <div className="text-center py-10 neu-inset-panel p-6">
          <CheckCircle2 className="w-10 h-10 mx-auto mb-2.5 text-emerald-500" />
          <p className="font-bold text-dark-800 text-sm">No impositions on record</p>
          <p className="text-xs text-dark-400 mt-1">You are all clear and in good academic standing!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {impositions.map((imp) => (
            <div key={imp.id} className="p-4 rounded-xl bg-[#e0e5ec] shadow-neu-flat-sm border-l-4 border-l-red-500 border border-white/70">
              <div className="flex items-center gap-2.5 mb-1.5">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <h3 className="font-bold text-dark-800 text-sm">{imp.reason}</h3>
              </div>
              {imp.description && <p className="text-xs text-dark-500 mb-2 leading-relaxed">{imp.description}</p>}
              <div className="text-[11px] font-semibold text-dark-400 flex items-center justify-between mt-2 pt-2 border-t border-white/60">
                <span>Imposed on: {new Date(imp.imposedAt).toLocaleDateString()}</span>
                {imp.isSent && (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    Notification dispatched
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}   