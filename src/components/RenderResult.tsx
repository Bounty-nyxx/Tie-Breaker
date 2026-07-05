import { motion } from "motion/react";
import { CheckCircle2, XCircle, Info, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";

export function RenderResult({ result, mode }: { result: any, mode: string }) {
  if (!result) return null;

  switch (mode) {
    case "pros-cons":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-green-50 dark:bg-green-900 p-6 rounded-2xl border border-green-100 dark:border-green-800"
          >
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold mb-4">
              <CheckCircle2 size={20} />
              <h3>Pros</h3>
            </div>
            <ul className="space-y-3">
              {result.pros?.map((pro: string, i: number) => (
                <li key={i} className="flex gap-2 text-green-900 dark:text-green-100 text-sm">
                  <span className="text-green-400 mt-1">•</span>
                  {pro}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-50 dark:bg-red-900 p-6 rounded-2xl border border-red-100 dark:border-red-800"
          >
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-semibold mb-4">
              <XCircle size={20} />
              <h3>Cons</h3>
            </div>
            <ul className="space-y-3">
              {result.cons?.map((con: string, i: number) => (
                <li key={i} className="flex gap-2 text-red-900 dark:text-red-100 text-sm">
                  <span className="text-red-400 mt-1">•</span>
                  {con}
                </li>
              ))}
            </ul>
          </motion.div>
          {result.verdict && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="col-span-1 md:col-span-2 bg-yellow-50 dark:bg-brand-navy-lighter p-6 rounded-2xl border border-yellow-100 dark:border-brand-navy-light"
            >
              <div className="flex items-center gap-2 text-brand-gold-dark dark:text-brand-gold font-semibold mb-2">
                <Info size={20} />
                <h3>Verdict</h3>
              </div>
              <p className="text-brand-navy dark:text-gray-200 text-sm italic">{result.verdict}</p>
            </motion.div>
          )}
        </div>
      );

    case "swot":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: "Strengths", items: result.strengths, icon: <CheckCircle2 className="text-green-600 dark:text-green-400" />, bg: "bg-green-50 dark:bg-green-900", border: "border-green-100 dark:border-green-800" },
            { title: "Weaknesses", items: result.weaknesses, icon: <AlertTriangle className="text-orange-600 dark:text-orange-400" />, bg: "bg-orange-50 dark:bg-orange-900", border: "border-orange-100 dark:border-orange-800" },
            { title: "Opportunities", items: result.opportunities, icon: <TrendingUp className="text-blue-600 dark:text-blue-400" />, bg: "bg-blue-50 dark:bg-blue-900", border: "border-blue-100 dark:border-blue-800" },
            { title: "Threats", items: result.threats, icon: <XCircle className="text-red-600 dark:text-red-400" />, bg: "bg-red-50 dark:bg-red-900", border: "border-red-100 dark:border-red-800" }
          ].map((section, i) => (
            <motion.div 
              key={section.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`${section.bg} p-6 rounded-2xl border ${section.border} flex flex-col`}
            >
              <div className="flex items-center gap-2 font-bold mb-3 dark:text-white">
                {section.icon}
                {section.title}
              </div>
              <ul className="space-y-2">
                {section.items?.map((item: string, idx: number) => (
                  <li key={idx} className="text-sm opacity-80 flex gap-2 dark:text-gray-300">
                    <span className="opacity-50">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      );

    case "comparison":
      return (
        <div className="overflow-x-auto bg-white dark:bg-brand-navy-light rounded-2xl border border-gray-200 dark:border-brand-navy-lighter">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-brand-navy-lighter border-b border-gray-200 dark:border-brand-navy-lighter">
                {result.columns?.map((col: string, i: number) => (
                  <th key={i} className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-r dark:border-brand-navy-light last:border-r-0">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.rows?.map((row: string[], i: number) => (
                <tr key={i} className="border-b dark:border-brand-navy-lighter last:border-b-0 hover:bg-gray-50 dark:hover:bg-brand-navy-lighter transition-colors">
                  {row.map((cell, j) => (
                    <td key={j} className="p-4 text-sm text-gray-700 dark:text-gray-300 border-r dark:border-brand-navy-lighter last:border-r-0">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "brainstorm":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {result.ideas?.map((idea: any, i: number) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-brand-navy-light p-6 rounded-2xl border border-gray-200 dark:border-brand-navy-lighter shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-50 dark:bg-brand-navy-lighter flex items-center justify-center text-brand-gold-dark dark:text-brand-gold group-hover:bg-brand-gold group-hover:text-white transition-colors">
                  <Lightbulb size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{idea.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{idea.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      );
  }
  return null;
}
