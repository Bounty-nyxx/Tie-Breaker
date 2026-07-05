import { useAuth } from "../lib/AuthContext";
import { Scale } from "lucide-react";
import { motion } from "motion/react";

export default function Login() {
  const { login, loading } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-gray-50 dark:bg-brand-navy">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-gold rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-navy-light rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-brand-navy-light rounded-[32px] p-8 md:p-12 shadow-2xl shadow-brand-navy/10 dark:shadow-black/50 border border-gray-100 dark:border-brand-navy-lighter text-center relative z-10"
      >
        <div className="w-20 h-20 bg-brand-navy dark:bg-brand-navy-lighter rounded-3xl shadow-xl shadow-brand-navy/20 mx-auto flex items-center justify-center mb-8 border border-gray-100 dark:border-brand-navy-lighter">
          <Scale className="text-brand-gold" size={40} />
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight mb-3 font-display">Tie - Breaker</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-10 text-sm">
          Decisive intelligence for your toughest dilemmas, guided by AI.
        </p>

        <button
          onClick={login}
          disabled={loading}
          className="w-full p-4 bg-brand-navy dark:bg-brand-gold text-white dark:text-brand-navy rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-brand-navy-light dark:hover:bg-brand-gold-light transition-all transform active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "Loading..." : "Continue with Google"}
        </button>
      </motion.div>
    </div>
  );
}
