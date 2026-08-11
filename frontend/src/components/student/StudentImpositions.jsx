import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Loader, Mail } from "lucide-react";
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
        <Loader className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 max-w-2xl"
    >
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <AlertTriangle className="w-6 h-6 text-red-400" />
        My Impositions
      </h2>

      {impositions.length === 0 ? (
        <div className="text-center py-8 text-dark-400">
          <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-dark-600" />
          No impositions – you're all clear!
        </div>
      ) : (
        <div className="space-y-4">
          {impositions.map((imp) => (
            <div key={imp.id} className="p-4 rounded-lg bg-white/5 border border-red-500/20">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h3 className="font-semibold text-white">{imp.reason}</h3>
              </div>
              {imp.description && <p className="text-sm text-dark-300 mb-2">{imp.description}</p>}
              <div className="text-xs text-dark-500">
                Imposed on: {new Date(imp.imposedAt).toLocaleString()}
              </div>
              {imp.isSent && (
                <div className="text-xs text-green-400 mt-1 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  Email notification sent
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}   