/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState } from 'react';
import { Mail, ShieldCheck, Globe2, Briefcase, Calendar, Lock, CheckCircle2, Edit3, X, Loader2 } from 'lucide-react';
import { authService } from '@pwa-easy-rental/shared-services';

function formatAssignedDate(value: unknown, fallback = '—'): string {
  if (value == null || value === '') return fallback;
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString();
}

export const ProfileView = ({ userData, agencyData, parentOrg, onUpdate, t }: any) => {
  const [editProfileMode, setEditProfileMode] = useState(false);
  const [editPasswordMode, setEditPasswordMode] = useState(false);

  const [profileForm, setProfileForm] = useState({ firstname: userData?.firstname || '', lastname: userData?.lastname || '' });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setMessage(null);
    try {
      const res = await authService.updateProfile(profileForm);
      if (res.ok) { 
        setMessage({ type: 'success', text: t.profile.msgUpdateSuccess }); 
        setEditProfileMode(false); 
        onUpdate(); 
      }
    } finally { setLoading(false); }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setMessage(null);
    try {
      const res = await authService.updatePassword(passwordForm);
      if (res.ok) { 
        setMessage({ type: 'success', text: t.profile.msgPasswordSuccess }); 
        setEditPasswordMode(false); 
        setPasswordForm({ oldPassword: '', newPassword: '' }); 
      }
      else setMessage({ type: 'error', text: t.auth.error });
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20 text-left">
      
      {message && (
        <div className={`p-4 rounded-2xl text-xs font-black uppercase italic tracking-widest flex items-center justify-between shadow-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16}/> {message.text}
          </div>
          <button onClick={() => setMessage(null)}><X size={16}/></button>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white dark:bg-[#1a1d2d] rounded-[3rem] p-8 border-b-4 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="size-32 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800 border-4 border-white dark:border-slate-700 flex items-center justify-center text-4xl font-black text-[#0528d6] shadow-inner italic">
          {userData?.firstname?.charAt(0)}{userData?.lastname?.charAt(0)}
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">{userData?.fullname}</h3>
            <span className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 text-[9px] font-black uppercase rounded-full border border-green-100 dark:border-green-800 italic">{userData?.status}</span>
          </div>
          <p className="text-slate-400 font-black uppercase text-[11px] tracking-widest mb-4 italic">
             {userData?.poste?.name || t.header.adminRole} — <span className="text-[#0528d6] dark:text-blue-400">{agencyData?.name}</span>
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm font-bold text-slate-400 italic">
             <span className="flex items-center gap-2"><Mail size={16} className="text-[#0528d6]"/> {userData?.email}</span>
             <span className="flex items-center gap-2"><Calendar size={16} className="text-[#0528d6]"/> {t.profile.assignedAt} {formatAssignedDate(userData?.hiredAt ?? userData?.hired_at ?? userData?.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          <section className="bg-white dark:bg-[#1a1d2d] rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-center border-b dark:border-slate-800 pb-4 mb-8">
              <h4 className="text-sm font-black uppercase italic tracking-tighter text-[#0528d6] flex items-center gap-2"><Lock size={18}/> {t.sidebar.profile}</h4>
              {!editProfileMode && <button onClick={() => setEditProfileMode(true)} className="p-2 text-slate-400 hover:text-[#0528d6] transition-all"><Edit3 size={18}/></button>}
            </div>

            {editProfileMode ? (
              <form onSubmit={handleProfileSubmit} className="grid md:grid-cols-2 gap-6 animate-in slide-in-from-top-2">
                <Input label={t.auth.firstname} value={profileForm.firstname} onChange={(v:any) => setProfileForm({...profileForm, firstname: v})} />
                <Input label={t.auth.lastname} value={profileForm.lastname} onChange={(v:any) => setProfileForm({...profileForm, lastname: v})} />
                <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t dark:border-slate-800">
                  <button type="button" onClick={() => setEditProfileMode(false)} className="px-6 py-2 text-xs font-black uppercase text-slate-400 italic">{t.common.cancel}</button>
                  <button type="submit" disabled={loading} className="px-8 py-3 bg-[#0528d6] text-white rounded-xl font-black text-xs uppercase italic tracking-widest shadow-xl shadow-blue-500/20">
                    {loading ? <Loader2 size={16} className="animate-spin"/> : t.common.save}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                <DataField label={t.auth.firstname} value={userData?.firstname} />
                <DataField label={t.auth.lastname} value={userData?.lastname} />
              </div>
            )}
          </section>

          <section className="bg-white dark:bg-[#1a1d2d] rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm text-left">
            <div className="flex justify-between items-center border-b dark:border-slate-800 pb-4 mb-8">
              <h4 className="text-sm font-black uppercase italic tracking-tighter text-[#0528d6] flex items-center gap-2"><ShieldCheck size={18}/> {t.profile.security}</h4>
              {!editPasswordMode && <button onClick={() => setEditPasswordMode(true)} className="text-[10px] font-black uppercase text-[#0528d6] italic underline tracking-widest hover:text-blue-700">{t.common.edit}</button>}
            </div>
            {editPasswordMode && (
              <form onSubmit={handlePasswordSubmit} className="grid md:grid-cols-2 gap-6 animate-in slide-in-from-top-2">
                <Input label={t.profile.oldPassword} type="password" value={passwordForm.oldPassword} onChange={(v:any) => setPasswordForm({...passwordForm, oldPassword: v})} />
                <Input label={t.profile.newPassword} type="password" value={passwordForm.newPassword} onChange={(v:any) => setPasswordForm({...passwordForm, newPassword: v})} />
                <div className="md:col-span-2 flex justify-end gap-3">
                  <button type="button" onClick={() => setEditPasswordMode(false)} className="px-6 py-2 text-xs font-black uppercase text-slate-400 italic">{t.common.cancel}</button>
                  <button type="submit" className="px-8 py-3 bg-[#0528d6] text-white rounded-xl font-black text-xs uppercase italic shadow-xl">{t.common.apply}</button>
                </div>
              </form>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-[#0528d6] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
             <Briefcase className="absolute -bottom-8 -right-8 opacity-10 rotate-12" size={180} />
             <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-8 relative z-10">
               <ShieldCheck className="text-white/50" size={20} />
               <h4 className="text-sm font-black uppercase italic tracking-tighter">{t.staff.profile.editContract}</h4>
             </div>
             <div className="space-y-4 relative z-10">
                <div className="bg-white/10 rounded-2xl p-5 border border-white/5 backdrop-blur-md">
                   <p className="text-[9px] font-black uppercase opacity-60 mb-1 italic">{t.profile.agencyRole}</p>
                   <p className="text-lg font-black italic tracking-tighter uppercase">{userData?.poste?.name || t.header.adminRole}</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-5 border border-white/5 backdrop-blur-md">
                   <p className="text-[9px] font-black uppercase opacity-60 mb-1 italic">{t.profile.staffId}</p>
                   <p className="text-lg font-black italic tracking-tighter uppercase truncate">#{userData?.id?.substring(0,12)}</p>
                </div>
             </div>
          </section>

          <section className="bg-white dark:bg-[#1a1d2d] rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm text-left">
             <div className="flex items-center gap-3 border-b dark:border-slate-800 pb-4 mb-6">
               <Globe2 className="text-[#0528d6] dark:text-blue-400" size={20} />
               <h4 className="text-sm font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">{t.profile.networkSupport}</h4>
             </div>
             <div className="space-y-4">
                <p className="text-xs text-slate-500 font-bold italic leading-relaxed uppercase">{t.profile.orgHq}</p>
                <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-800 shadow-inner">
                    <p className="text-sm font-black text-[#0528d6] dark:text-blue-400 uppercase italic truncate">{parentOrg?.name}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase mt-2 italic truncate">{parentOrg?.email}</p>
                </div>
             </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const DataField = ({ label, value }: any) => (
  <div className="space-y-1.5">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{label}</p>
    <p className="text-base font-black text-slate-800 dark:text-slate-100 uppercase italic tracking-tighter">{value || '---'}</p>
  </div>
);

const Input = ({ label, value, onChange, type = "text" }: any) => (
  <div className="space-y-1.5 w-full text-left">
    <label className="text-[10px] font-black text-slate-400 uppercase italic ml-1 tracking-widest">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} 
           className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-black text-sm outline-none focus:border-[#0528d6] dark:text-white transition-all shadow-inner uppercase italic" />
  </div>
);