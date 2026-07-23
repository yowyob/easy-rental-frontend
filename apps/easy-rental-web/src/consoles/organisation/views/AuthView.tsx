/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState } from 'react';
import { Mail, Lock, User, Building, ShieldCheck, ArrowRight, Loader2, Languages, Sun, Moon } from 'lucide-react';
import { AuthInput } from '../components/AuthInput';
import { HeaderIconButton } from '../components/HeaderIconButton';

export const AuthView = ({ onAuth, lang, setLang, darkMode, toggleTheme, t }: any) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mfaStep, setMfaStep] = useState<{ token: string; channel?: string } | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [form, setForm] = useState({ 
    firstname: '', 
    lastname: '', 
    email: '', 
    password: '', 
    orgName: '' 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = mfaStep
      ? await onAuth(isSignUp, form, { token: mfaStep.token, code: mfaCode })
      : await onAuth(isSignUp, form);

    if (typeof result === 'object' && result && 'mfaRequired' in result && result.mfaRequired) {
      setMfaStep({ token: result.mfaToken, channel: result.mfaChannel });
      setLoading(false);
      return;
    }

    if (typeof result === 'object' && result && 'error' in result) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result === true) {
      setLoading(false);
      return;
    }

    if (!result) {
      setError(mfaStep ? 'Code MFA invalide' : t.auth.errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fe] dark:bg-[#080b14] flex flex-col justify-center items-center p-2 md:p-4 transition-colors duration-500 relative">
      
      <div className="fixed top-[-10%] left-[-10%] size-[500px] bg-[#0528d6]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] size-[500px] bg-[#F76513]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[1100px] h-full max-h-[730px] min-h-[600px] grid lg:grid-cols-2 bg-white dark:bg-[#1a1d2d] rounded-[2.5rem] shadow-2xl border border-white dark:border-slate-800 overflow-hidden relative z-10 animate-in fade-in zoom-in duration-500">
        
        <div className="hidden lg:flex flex-col justify-between p-16 bg-[#0528d6] relative overflow-hidden text-white h-full">
          <div className="absolute top-0 right-0 p-20 opacity-10 rotate-12 scale-150 pointer-events-none">
             <ShieldCheck size={300} />
          </div>
          
          <div className="relative z-10">
            <div className="size-14 bg-white rounded-2xl flex items-center justify-center text-[#0528d6] shadow-xl">
              <span className="font-bold text-3xl italic">E</span>
            </div>
            <h2 className="text-5xl font-bold tracking-tighter leading-[1.1] mt-12">
               {t.auth.heroTitle1} <br />
               <span className="text-blue-300">{t.auth.heroTitle2}</span>
            </h2>
          </div>

          <div className="relative z-10 flex items-center gap-4 text-blue-200">
             <ShieldCheck size={20} className="text-blue-300" />
             <p className="text-[10px] font-bold uppercase tracking-[0.2em]">{t.auth.secureInfra}</p>
          </div>
        </div>

        <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-[#1a1d2d]">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-16">
            <div className="max-w-md mx-auto h-full flex flex-col justify-center">
              
              <div className="mb-10 text-center lg:text-left shrink-0">
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {isSignUp ? t.auth.titleSignUp : t.auth.titleSignIn}
                </h3>
                <p className="text-slate-400 text-sm mt-2 font-medium">
                  {isSignUp ? t.auth.subtitleSignUp : t.auth.subtitleSignIn}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {mfaStep ? (
                  <div className="space-y-5 animate-in fade-in">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Un code de vérification a été envoyé{mfaStep.channel ? ` (${mfaStep.channel})` : ''}.
                    </p>
                    <AuthInput
                      label="Code MFA"
                      icon={<ShieldCheck />}
                      placeholder="123456"
                      value={mfaCode}
                      onChange={v => setMfaCode(v)}
                    />
                    <button
                      type="button"
                      onClick={() => { setMfaStep(null); setMfaCode(''); }}
                      className="text-xs font-bold text-slate-400 hover:text-[#0528d6]"
                    >
                      Retour à la connexion
                    </button>
                  </div>
                ) : (
                  <>
                {isSignUp && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <AuthInput label={t.auth.firstname} icon={<User/>} placeholder="Jean" value={form.firstname} onChange={v => setForm({...form, firstname: v})} />
                      <AuthInput label={t.auth.lastname} icon={<User/>} placeholder="Dupont" value={form.lastname} onChange={v => setForm({...form, lastname: v})} />
                    </div>
                    <AuthInput label={t.auth.orgName} icon={<Building/>} placeholder="Global Rent Ltd" value={form.orgName} onChange={v => setForm({...form, orgName: v})} />
                  </div>
                )}
                
                <AuthInput label={t.auth.email} icon={<Mail/>} type="email" placeholder="manager@rental.com" value={form.email} onChange={v => setForm({...form, email: v})} />
                <AuthInput label={t.auth.password} icon={<Lock/>} type="password" placeholder="••••••••" value={form.password} onChange={v => setForm({...form, password: v})} />
                  </>
                )}

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl flex items-center gap-2">
                    <div className="size-1.5 bg-red-600 rounded-full animate-pulse" /> {error}
                  </div>
                )}

                <button 
                  disabled={loading}
                  className="w-full py-4 bg-[#0528d6] text-white rounded-xl font-bold text-sm shadow-xl shadow-blue-600/20 hover:bg-blue-700 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3 mt-8"
                >
                  {loading ? <Loader2 className="animate-spin size-5" /> : (
                    <>
                      {mfaStep ? 'Valider le code' : (isSignUp ? t.auth.btnSignUp : t.auth.btnSignIn)}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-10 flex flex-col items-center gap-4 shrink-0">
                <button
                  onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                  className="text-xs font-bold text-slate-400 hover:text-[#0528d6] transition-colors tracking-tight italic"
                >
                  {isSignUp ? t.auth.toggleSignIn : t.auth.toggleSignUp}
                </button>

                <a
                  href="/organisation/freelance-signup"
                  className="text-[10px] font-black italic uppercase tracking-widest text-slate-400 hover:text-[#0528d6] transition-colors"
                >
                  Vous êtes un particulier ? Devenir freelance →
                </a>

                <div className="w-full h-px bg-slate-100 dark:bg-slate-800 my-2" />

                <div className="flex items-center justify-center gap-1 w-full">
                  <HeaderIconButton
                    onClick={() => setLang(lang === 'FR' ? 'EN' : 'FR')}
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
    </div>
  );
};