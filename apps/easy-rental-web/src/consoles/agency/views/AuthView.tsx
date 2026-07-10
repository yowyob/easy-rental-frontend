/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState } from 'react';
import { Mail, Lock, ShieldCheck, ArrowRight, Loader2, Languages, Sun, Moon } from 'lucide-react';
import { AuthInput } from '../components/AuthInput';
import { HeaderIconButton } from '../components/HeaderIconButton';

export const AuthView = ({ onAuth, lang, setLang, darkMode, toggleTheme, t, initError }: any) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const success = await onAuth(form);
    if (!success) {
      setError(t.auth.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fe] dark:bg-[#080b14] flex flex-col justify-center items-center p-4 md:p-10 transition-colors duration-500 relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed top-[-10%] left-[-10%] size-[500px] bg-[#0528d6]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] size-[500px] bg-[#0528d6]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[1000px] h-full max-h-[650px] min-h-[550px] grid lg:grid-cols-2 bg-white dark:bg-[#1a1d2d] rounded-[2.5rem] shadow-2xl border border-white dark:border-slate-800 overflow-hidden relative z-10 animate-in fade-in zoom-in duration-500">
        
        {/* Left Section: Branding */}
        <div className="hidden lg:flex flex-col justify-between p-16 bg-[#0528d6] relative overflow-hidden text-white h-full">
          <div className="absolute top-0 right-0 p-20 opacity-10 rotate-12 scale-150 pointer-events-none">
             <ShieldCheck size={300} />
          </div>
          
          <div className="relative z-10 text-left">
            <div className="size-14 bg-white rounded-2xl flex items-center justify-center text-[#0528d6] shadow-xl font-bold text-3xl italic">E</div>
            <h2 className="text-4xl font-bold tracking-tighter leading-tight mt-12 uppercase italic">
               {t.auth.title.split(' ')[0]} <br />
               <span className="text-blue-300">{t.auth.title.split(' ')[1] || "Personnel"}</span>
            </h2>
            <p className="mt-6 text-blue-100/70 font-medium text-sm leading-relaxed max-w-xs italic">
              {t.auth.subtitle}
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4 text-blue-200">
             <ShieldCheck size={20} className="text-blue-300" />
             <p className="text-[10px] font-bold uppercase tracking-[0.2em]">{t.auth.rental_operational}</p>
          </div>
        </div>

        {/* Right Section: Form */}
        <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-[#1a1d2d]">
          <div className="flex-1 overflow-y-auto p-8 md:p-16">
            <div className="max-w-md mx-auto h-full flex flex-col justify-center">
              
              <div className="mb-10 text-center lg:text-left shrink-0">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">{t.common.confirm}</h3>
                <p className="text-slate-400 text-sm mt-2 font-medium italic">{t.auth.noAccount}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <AuthInput 
                    label={t.auth.email} 
                    icon={<Mail/>} 
                    type="email" 
                    placeholder={t.auth.placeholderEmail} 
                    value={form.email} 
                    onChange={v => setForm({...form, email: v})} 
                />
                <AuthInput 
                    label={t.auth.password} 
                    icon={<Lock/>} 
                    type="password" 
                    placeholder={t.auth.placeholderPassword} 
                    value={form.password} 
                    onChange={v => setForm({...form, password: v})} 
                />

                {initError && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-black uppercase italic rounded-xl flex items-center gap-3">
                    <div className="size-2 bg-red-600 rounded-full animate-pulse" /> {initError}
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-black uppercase italic rounded-xl flex items-center gap-3">
                    <div className="size-2 bg-red-600 rounded-full animate-pulse" /> {error}
                  </div>
                )}

                <button 
                  disabled={loading}
                  className="w-full py-4 bg-[#0528d6] text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 mt-4 italic tracking-widest"
                >
                  {loading ? <Loader2 className="animate-spin size-5" /> : (
                    <>
                      {t.auth.submit}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-12 flex items-center gap-2 pt-6 border-t border-slate-50 dark:border-slate-800 w-full justify-center shrink-0 px-1 py-1 rounded-xl">
                <HeaderIconButton
                  onClick={() => {
                    const next = lang === 'FR' ? 'EN' : 'FR';
                    setLang(next);
                    localStorage.setItem('lang', next);
                  }}
                  aria-label={t.header.switchLanguage}
                  title={t.header.switchLanguage}
                >
                  <Languages size={18} className="text-[#0528d6] shrink-0" />
                  <span className="text-[10px] font-black italic">{lang}</span>
                </HeaderIconButton>
                <HeaderIconButton
                  onClick={toggleTheme}
                  aria-label={t.header.toggleTheme}
                  title={t.header.toggleTheme}
                >
                  {darkMode ? <Sun size={18} className="text-[#0528d6]" /> : <Moon size={18} className="text-[#0528d6]" />}
                </HeaderIconButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};