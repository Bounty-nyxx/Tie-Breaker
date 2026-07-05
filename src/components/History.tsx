import { useEffect, useState } from "react";
import { useAuth } from "../lib/AuthContext";
import { getHistory } from "../lib/firebase";
import { Clock, Trash2, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface HistoryProps {
  onSelect: (decision: string, mode: any, result: any) => void;
}

export default function History({ onSelect }: HistoryProps) {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getHistory(user.uid).then(data => {
        setHistory(data);
        setLoading(false);
      });
    }
  }, [user]);

  if (loading) {
    return <div className="text-center p-8 text-gray-500">Loading history...</div>;
  }

  if (history.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-brand-navy-lighter rounded-2xl border border-gray-100 dark:border-brand-navy-lighter">
        No history yet. Start analyzing some decisions!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white dark:bg-brand-navy-light p-4 rounded-xl border border-gray-200 dark:border-brand-navy-lighter flex items-center justify-between hover:border-brand-gold dark:hover:border-brand-gold transition-colors cursor-pointer group"
          onClick={() => onSelect(item.decision, item.mode, item.result)}
        >
          <div className="flex-1 overflow-hidden pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded-full">
                {item.mode}
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock size={12} />
                {item.createdAt?.toDate().toLocaleDateString() || "Just now"}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {item.decision}
            </p>
          </div>
          <ArrowRight className="text-gray-300 group-hover:text-brand-gold transition-colors" size={20} />
        </motion.div>
      ))}
    </div>
  );
}
