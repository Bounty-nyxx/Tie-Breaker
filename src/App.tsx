import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Scale, 
  BrainCircuit, 
  Compass, 
  Table as TableIcon, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Info,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Plus
} from "lucide-react";

type AnalysisMode = "pros-cons" | "swot" | "comparison" | "brainstorm";

interface AnalysisResult {
  pros?: string[];
  cons?: string[];
  verdict?: string;
  strengths?: string[];
  weaknesses?: string[];
  opportunities?: string[];
  threats?: string[];
  columns?: string[];
  rows?: string[][];
  ideas?: { title: string; description: string }[];
}

export default function App() {
  const [decision, setDecision] = useState("");
  const [mode, setMode] = useState<AnalysisMode>("pros-cons");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!decision.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, mode }),
      });
      if (!response.ok) throw new Error("Failed to analyze");
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;

    switch (mode) {
      case "pros-cons":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-green-50/50 p-6 rounded-2xl border border-green-100"
            >
              <div className="flex items-center gap-2 text-green-700 font-semibold mb-4">
                <CheckCircle2 size={20} />
                <h3>Pros</h3>
              </div>
              <ul className="space-y-3">
                {result.pros?.map((pro, i) => (
                  <li key={i} className="flex gap-2 text-green-900 text-sm">
                    <span className="text-green-400 mt-1">•</span>
                    {pro}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50/50 p-6 rounded-2xl border border-red-100"
            >
              <div className="flex items-center gap-2 text-red-700 font-semibold mb-4">
                <XCircle size={20} />
                <h3>Cons</h3>
              </div>
              <ul className="space-y-3">
                {result.cons?.map((con, i) => (
                  <li key={i} className="flex gap-2 text-red-900 text-sm">
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
                className="col-span-1 md:col-span-2 bg-blue-50 p-6 rounded-2xl border border-blue-100"
              >
                <div className="flex items-center gap-2 text-blue-700 font-semibold mb-2">
                  <Info size={20} />
                  <h3>Verdict</h3>
                </div>
                <p className="text-blue-900 text-sm italic">{result.verdict}</p>
              </motion.div>
            )}
          </div>
        );

      case "swot":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "Strengths", items: result.strengths, icon: <CheckCircle2 className="text-green-600" />, bg: "bg-green-50" },
              { title: "Weaknesses", items: result.weaknesses, icon: <AlertTriangle className="text-orange-600" />, bg: "bg-orange-50" },
              { title: "Opportunities", items: result.opportunities, icon: <TrendingUp className="text-blue-600" />, bg: "bg-blue-50" },
              { title: "Threats", items: result.threats, icon: <XCircle className="text-red-600" />, bg: "bg-red-50" }
            ].map((section, i) => (
              <motion.div 
                key={section.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`${section.bg} p-6 rounded-2xl border border-black/5 flex flex-col`}
              >
                <div className="flex items-center gap-2 font-bold mb-3">
                  {section.icon}
                  {section.title}
                </div>
                <ul className="space-y-2">
                  {section.items?.map((item, idx) => (
                    <li key={idx} className="text-sm opacity-80 flex gap-2">
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
          <div className="overflow-x-auto bg-white rounded-2xl border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-bottom border-gray-200">
                  {result.columns?.map((col, i) => (
                    <th key={i} className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-500 border-r last:border-r-0">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows?.map((row, i) => (
                  <tr key={i} className="border-b last:border-b-0 hover:bg-gray-50/50 transition-colors">
                    {row.map((cell, j) => (
                      <td key={j} className="p-4 text-sm text-gray-700 border-r last:border-r-0">
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
            {result.ideas?.map((idea, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Lightbulb size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{idea.title}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">{idea.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-gray-900 font-sans selection:bg-indigo-100">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 py-12">
        <header className="mb-12 flex flex-col items-center text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-white rounded-3xl shadow-xl shadow-indigo-100 flex items-center justify-center mb-6 border border-gray-100"
          >
            <Scale className="text-indigo-600" size={32} />
          </motion.div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
          >
            The Tiebreaker
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-500 max-w-xl"
          >
            Decisive intelligence for your toughest dilemmas. 
            Choose a framework and let AI illuminate the path.
          </motion.p>
        </header>

        <section className="bg-white rounded-[32px] p-8 md:p-12 shadow-2xl shadow-gray-200/50 border border-gray-100 mb-12">
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-indigo-600 ml-1">The Decision</label>
              <textarea 
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                placeholder="Should I leave my corporate job to start a bakery? Should we move to a new city? Which laptop should I buy?"
                className="w-full min-h-[120px] p-6 text-xl bg-gray-50/50 rounded-2xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none placeholder:text-gray-300"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: "pros-cons", label: "Pros & Cons", icon: <Scale size={18} /> },
                { id: "swot", label: "SWOT", icon: <Compass size={18} /> },
                { id: "comparison", label: "Comparison", icon: <TableIcon size={18} /> },
                { id: "brainstorm", label: "Brainstorm", icon: <BrainCircuit size={18} /> },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setMode(item.id as AnalysisMode)}
                  className={`flex items-center justify-center gap-2 p-4 rounded-xl text-sm font-semibold transition-all border ${
                    mode === item.id 
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100 scale-105" 
                      : "bg-white text-gray-500 border-gray-200 hover:border-indigo-200 hover:text-indigo-400"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading || !decision.trim()}
              className="w-full p-5 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing with Gemini...
                </span>
              ) : (
                <>
                  Crunching the Numbers
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        </section>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-6 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-center mb-12"
            >
              Error: {error}
            </motion.div>
          )}

          {result && (
            <motion.div 
              key={`${mode}-${decision}`}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
                    <CheckCircle2 size={16} />
                  </div>
                  Analysis Result
                </h2>
                <button 
                  onClick={() => {setResult(null); setDecision("");}}
                  className="text-xs font-bold text-gray-400 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                >
                  <Plus size={14} className="rotate-45" />
                  RESET
                </button>
              </div>
              {renderResult()}
              
              <footer className="mt-12 text-center text-gray-400 text-xs italic">
                AI can provide helpful perspectives but should not replace human judgment. 
                Always consider personal values and ethical implications.
              </footer>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

