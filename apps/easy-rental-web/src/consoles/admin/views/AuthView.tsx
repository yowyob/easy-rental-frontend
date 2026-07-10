'use client';
import React, { useState } from 'react';
import { Lock, Mail, Loader2, Shield, Eye, EyeOff, Moon, Sun } from 'lucide-react';

type AuthViewProps = {
  onAuth: (form: { email: string; password: string }) => Promise<{ ok: boolean; message?: string }>;
  error?: string;
  darkMode?: boolean;
  toggleTheme?: () => void;
};

export const AuthView = ({ onAuth, error: initError, darkMode, toggleTheme }: AuthViewProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await onAuth(form);
      if (!result.ok) {
        setError(result.message || 'Accès refusé. Connectez-vous avec un compte ADMIN.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f4f7fe] dark:bg-[#080b14] relative">
      {toggleTheme && (
        <button
          type="button"
          onClick={toggleTheme}
          className="absolute top-6 right-6 p-3 rounded-xl bg-white dark:bg-[#1a1d2d] border border-slate-200 dark:border-slate-800 text-[#0528d6] shadow-sm"
          aria-label="Changer le thème"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      )}
      <div className="w-full max-w-md bg-white dark:bg-[#1a1d2d] rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 bg-[#0528d6] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
            <Shield size={24} />
          </div>
          <div className="text-left">
            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Console Admin</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Plateforme Easy Rental</p>
          </div>
        </div>

        {(initError || error) && (
          <p className="mb-4 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/30 p-3 rounded-xl">
            {initError || error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</span>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:border-[#0528d6]"
              />
            </div>
          </label>

          <label className="block space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mot de passe</span>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:border-[#0528d6]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0528d6] transition-colors"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#0528d6] text-white rounded-2xl font-black text-xs tracking-widest uppercase italic hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20"
          >
            {loading ? <Loader2 className="animate-spin size-4" /> : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
};
