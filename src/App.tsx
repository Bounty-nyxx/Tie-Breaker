import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Scale, BrainCircuit, Compass, Table as TableIcon, ArrowRight, CheckCircle2,
  Moon, Sun, LogOut, Download, FileText, Plus, Menu, X
} from "lucide-react";
import { useAuth } from "./lib/AuthContext";
import { useTheme } from "./lib/ThemeContext";
import { saveHistory } from "./lib/firebase";
import Login from "./components/Login";
import History from "./components/History";
import { RenderResult } from "./components/RenderResult";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type AnalysisMode = "pros-cons" | "swot" | "comparison" | "brainstorm";

export default function App() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [decision, setDecision] = useState("");
  const [mode, setMode] = useState<AnalysisMode>("pros-cons");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const resultRef = useRef<HTMLDivElement>(null);

  if (!user) {
    return <Login />;
  }

  const handleAnalyze = async () => {
    if (!decision.trim()) return;
    setLoading(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, mode }),
      });
      if (!response.ok) throw new Error("Failed to analyze");
      const data = await response.json();
      setResult(data);
      try {
        await saveHistory(user.uid, decision, mode, data);
      } catch (historyErr) {
        console.error("Failed to save history silently:", historyErr);
      }
    } catch (err: any) {
      console.error("Analysis failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!resultRef.current) return;
    try {
      const canvas = await html2canvas(resultRef.current, {
        scale: 2,
        backgroundColor: theme === 'dark' ? '#0A192F' : '#ffffff',
        onclone: (clonedDoc) => {
          const header = clonedDoc.querySelector('.print-header') as HTMLElement;
          if (header) {
            header.style.display = 'block';
          }
        }
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save("tie-breaker-analysis.pdf");
    } catch (err) {
      console.error("PDF Export failed", err);
    }
  };

  const loadHistoryItem = (savedDecision: string, savedMode: any, savedResult: any) => {
    setDecision(savedDecision);
    setMode(savedMode);
    setResult(savedResult);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex selection:bg-brand-gold/20 font-sans">
      {/* Sidebar for History */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed inset-y-0 left-0 w-80 bg-white dark:bg-brand-navy-light border-r border-gray-200 dark:border-brand-navy-lighter shadow-2xl z-50 flex flex-col"
          >
            <div className="p-6 border-b border-gray-200 dark:border-brand-navy-lighter flex items-center justify-between">
              <h2 className="font-bold text-lg font-display flex items-center gap-2">
                <FileText size={20} className="text-brand-gold" />
                History
              </h2>
              <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-brand-navy-lighter rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <History onSelect={loadHistoryItem} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden h-screen">
        <header className="flex-none flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-brand-navy/80 backdrop-blur-md border-b border-gray-200 dark:border-brand-navy-lighter z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-brand-navy-lighter rounded-full transition-colors text-brand-navy dark:text-gray-200">
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2 text-brand-navy dark:text-white font-display font-bold text-xl">
              <div className="w-8 h-8 bg-brand-navy dark:bg-brand-navy-lighter rounded-lg flex items-center justify-center">
                <Scale className="text-brand-gold" size={16} />
              </div>
              Tie - Breaker
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 hover:bg-gray-100 dark:hover:bg-brand-navy-lighter rounded-full transition-colors text-brand-navy dark:text-gray-200">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <div className="h-6 w-px bg-gray-200 dark:bg-brand-navy-lighter mx-1" />
            <div className="text-sm font-medium text-gray-600 dark:text-gray-300 hidden md:block">
              {user.email}
            </div>
            <button onClick={logout} className="p-2 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-full transition-colors text-brand-navy dark:text-gray-200" title="Logout">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-12 relative">
          <div className="max-w-4xl mx-auto space-y-12">
            
            {/* Input Section */}
            <section className="bg-white dark:bg-brand-navy-light rounded-[32px] p-8 md:p-10 shadow-xl shadow-brand-navy/5 dark:shadow-black/20 border border-gray-100 dark:border-brand-navy-lighter">
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-brand-gold ml-1">The Decision</label>
                  <textarea 
                    value={decision}
                    onChange={(e) => setDecision(e.target.value)}
                    placeholder="E.g., Should I launch my startup now or wait 6 months?"
                    className="w-full min-h-[120px] p-6 text-xl bg-gray-50 dark:bg-brand-navy-lighter rounded-2xl border border-gray-200 dark:border-brand-navy-lighter focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-all resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500 text-brand-navy dark:text-white"
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
                          ? "bg-brand-navy dark:bg-brand-gold text-white dark:text-brand-navy border-brand-navy dark:border-brand-gold shadow-lg shadow-brand-navy/20 dark:shadow-brand-gold/20 scale-[1.02]" 
                          : "bg-white dark:bg-brand-navy-light text-gray-600 dark:text-gray-400 border-gray-200 dark:border-brand-navy-lighter hover:border-brand-gold/50 hover:text-brand-gold"
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
                  className="w-full p-5 bg-brand-gold text-brand-navy rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-brand-gold-light disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-brand-navy/30 border-t-brand-navy rounded-full animate-spin" />
                      Analyzing with Gemini...
                    </span>
                  ) : (
                    <>
                      Break the Tie
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </div>
            </section>

            <AnimatePresence mode="wait">
              {result && (
                <motion.div 
                  key={`${mode}-${decision}`}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold font-display flex items-center gap-3 text-brand-navy dark:text-white">
                      <div className="w-8 h-8 rounded-lg bg-brand-navy dark:bg-brand-gold text-brand-gold dark:text-brand-navy flex items-center justify-center">
                        <CheckCircle2 size={16} />
                      </div>
                      Analysis Result
                    </h2>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handleExportPDF}
                        className="px-4 py-2 text-sm font-semibold text-brand-navy dark:text-white bg-white dark:bg-brand-navy-light border border-gray-200 dark:border-brand-navy-lighter rounded-xl hover:bg-gray-50 dark:hover:bg-brand-navy-lighter flex items-center gap-2 transition-colors"
                      >
                        <Download size={16} />
                        Export PDF
                      </button>
                      <button 
                        onClick={() => {setResult(null); setDecision("");}}
                        className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-brand-navy dark:hover:text-white flex items-center gap-2 transition-colors"
                      >
                        <Plus size={16} className="rotate-45" />
                        Reset
                      </button>
                    </div>
                  </div>
                  
                  {/* Wrap result in a ref for PDF export */}
                  <div ref={resultRef} className="p-4 -m-4 bg-transparent">
                    {/* Add a hidden header for PDF output only */}
                    <div className="hidden print-header mb-6">
                      <h1 className="text-3xl font-bold text-brand-navy dark:text-white mb-2">Tie - Breaker Analysis</h1>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">Decision: {decision}</p>
                    </div>
                    <style>{`
                      @media print {
                        .print-header { display: block !important; }
                      }
                    `}</style>
                    <RenderResult result={result} mode={mode} />
                  </div>
                  
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

