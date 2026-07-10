/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState } from 'react';
import { 
  Mail, Building2, MapPin, 
  ShieldCheck, FileText,
  Zap, BarChart3, Clock, Globe2,
  Download, Edit3, Save, X, Lock, Loader2
} from 'lucide-react';
import { authService } from '@pwa-easy-rental/shared-services';

interface ProfileViewProps {
  userData: any;
  orgData: any;
  onUpdate: () => void;
  t: any;
}

export const ProfileView = ({ userData, orgData, onUpdate, t }: ProfileViewProps) => {
  const [editProfileMode, setEditProfileMode] = useState(false);
  const [editPasswordMode, setEditPasswordMode] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    firstname: userData?.firstname || '',
    lastname: userData?.lastname || ''
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: ''
  });

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  if (!userData || !orgData) return null;

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);
    setMessage(null);
    try {
      const res = await authService.updateProfile(profileForm);
      if (res.ok) {
        setMessage({ type: 'success', text: t.profile.msgUpdateSuccess });
        setEditProfileMode(false);
        onUpdate();
      } else {
        setMessage({ type: 'error', text: res.data?.message || t.profile.msgUpdateError });
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPassword(true);
    setMessage(null);
    try {
      const res = await authService.updatePassword(passwordForm);
      if (res.ok) {
        setMessage({ type: 'success', text: t.profile.msgPasswordSuccess });
        setEditPasswordMode(false);
        setPasswordForm({ oldPassword: '', newPassword: '' });
      } else {
        setMessage({ type: 'error', text: res.data?.message || t.profile.msgPasswordError });
      }
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      
      {message && (
        <div className={`p-4 rounded-xl text-sm font-bold  tracking-widest italic flex items-center justify-between ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
          <button onClick={() => setMessage(null)}><X size={16}/></button>
        </div>
      )}

      {/* 1. ENTÊTE PROFIL */}
      <div className="bg-white dark:bg-[#1a1d2d] rounded-[2.5rem] p-8 border-b-4 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="size-32 rounded-3xl overflow-hidden border-4 border-slate-50 dark:border-slate-700 shadow-inner shrink-0 bg-slate-100 relative group">
          <img 
            src={orgData.logoUrl || `https://ui-avatars.com/api/?name=${orgData.name}&background=0528d6&color=fff`} 
            alt="Logo" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{userData.fullname}</h3>
            {orgData.isVerified && <ShieldCheck className="text-blue-500" size={24} />}
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium  text-xs tracking-widest mb-4">
            {userData.role} — <span className="font-black">{orgData.name}</span>
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm font-bold text-slate-400">
             <span className="flex items-center gap-2 italic"><Mail size={16} className="text-[#0528d6]"/> {userData.email}</span>
             <span className="flex items-center gap-2 italic"><Clock size={16} className="text-[#0528d6]"/> {t.profile.hiredAt} {new Date(userData.hiredAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLONNE GAUCHE : INFOS USER & ORGANISATION */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* SECTION USER PROFILE EDIT */}
          <section className="bg-white dark:bg-[#1a1d2d] rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative">
            <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-800 pb-4 mb-6">
              <SectionTitle icon={<Lock />} title={t.profile.personalInfo} />
              {!editProfileMode && (
                <button onClick={() => setEditProfileMode(true)} className="p-2 text-slate-400 hover:text-[#0528d6] transition-colors"><Edit3 size={18}/></button>
              )}
            </div>

            {editProfileMode ? (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{t.profile.firstname}</label>
                    <input required value={profileForm.firstname} onChange={e => setProfileForm({...profileForm, firstname: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-[#0528d6] dark:text-white transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{t.profile.lastname}</label>
                    <input required value={profileForm.lastname} onChange={e => setProfileForm({...profileForm, lastname: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-[#0528d6] dark:text-white transition-all" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setEditProfileMode(false)} className="px-6 py-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">{t.common.cancel}</button>
                  <button type="submit" disabled={loadingProfile} className="px-6 py-2 bg-[#0528d6] text-white rounded-xl font-bold text-sm shadow-md hover:bg-blue-700 transition-all flex items-center gap-2">
                    {loadingProfile ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} {t.profile.btnSave}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DataField label={t.profile.firstname} value={userData.firstname} />
                <DataField label={t.profile.lastname} value={userData.lastname} />
                <DataField label={t.profile.emailLabel} value={userData.email} />
                <DataField label={t.profile.status} value={userData.status} />
              </div>
            )}
          </section>

          {/* SECTION PASSWORD EDIT */}
          <section className="bg-white dark:bg-[#1a1d2d] rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative">
            <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-800 pb-4 mb-6">
              <SectionTitle icon={<ShieldCheck />} title={t.profile.security} />
              {!editPasswordMode && (
                <button onClick={() => setEditPasswordMode(true)} className="text-xs font-bold uppercase text-[#0528d6] hover:underline italic tracking-widest">{t.profile.btnUpdatePassword}</button>
              )}
            </div>

            {editPasswordMode ? (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{t.profile.oldPassword}</label>
                    <input required type="password" value={passwordForm.oldPassword} onChange={e => setPasswordForm({...passwordForm, oldPassword: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-[#0528d6] dark:text-white transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{t.profile.newPassword}</label>
                    <input required type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-[#0528d6] dark:text-white transition-all" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setEditPasswordMode(false)} className="px-6 py-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">{t.common.cancel}</button>
                  <button type="submit" disabled={loadingPassword} className="px-6 py-2 bg-[#0528d6] text-white rounded-xl font-bold text-sm shadow-md hover:bg-blue-700 transition-all flex items-center gap-2">
                    {loadingPassword ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} {t.profile.btnUpdate}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-50 text-green-600 rounded-xl"><Lock size={20}/></div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{t.profile.securePassword}</p>
                </div>
              </div>
            )}
          </section>

          {/* IDENTITÉ & DESCRIPTION */}
          <section className="bg-white dark:bg-[#1a1d2d] rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <SectionTitle icon={<Building2 />} title={t.profile.orgIdentity} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <DataField label={t.profile.orgName} value={orgData.name} />
              <DataField label={t.profile.website} value={orgData.website} isLink />
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{t.profile.description}</label>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  {orgData.description || t.profile.noDescription}
                </p>
              </div>
            </div>
          </section>

          {/* LOCALISATION GÉOGRAPHIQUE */}
          <section className="bg-white dark:bg-[#1a1d2d] rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <SectionTitle icon={<MapPin />} title={t.profile.location} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <DataField label={t.profile.address} value={orgData.address} />
              <DataField label={t.profile.city} value={orgData.city} />
              <DataField label={t.profile.region} value={orgData.region} />
              <DataField label={t.profile.country} value={orgData.country} />
              <DataField label={t.profile.postalCode} value={orgData.postalCode} />
              <DataField label={t.profile.timezone} value={orgData.timezone} />
            </div>
          </section>

          {/* DONNÉES LÉGALES */}
          <section className="bg-white dark:bg-[#1a1d2d] rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <SectionTitle icon={<FileText />} title={t.profile.compliance} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <DataField label={t.profile.registrationNumber} value={orgData.registrationNumber} />
              <DataField label={t.profile.taxNumber} value={orgData.taxNumber} />
              {orgData.businessLicense && (
                <div className="md:col-span-2">
                    <a href={orgData.businessLicense} target="_blank" className="text-xs font-bold text-[#0528d6] hover:underline flex items-center gap-2">
                        <Download size={14}/> {t.profile.btnConsultLicense}
                    </a>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* COLONNE DROITE : STATS & ABONNEMENT */}
        <div className="space-y-6">
          
          <section className="bg-white dark:bg-[#1a1d2d] rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <SectionTitle icon={<BarChart3 />} title={t.profile.performance} />
            <div className="space-y-6 mt-6">
              <StatItem label={t.profile.statTotalRentals} value={orgData.totalRentals} icon={<Zap />} />
              <StatItem label={t.profile.statMonthlyRevenue} value={`${orgData.monthlyRevenue?.toLocaleString()} XAF`} icon={<BarChart3 />} />
              <StatItem label={t.profile.statYearlyRevenue} value={`${orgData.yearlyRevenue?.toLocaleString()} XAF`} icon={<BarChart3 />} />
            </div>
          </section>

          <section className="bg-[#0528d6] rounded-[2.5rem] p-8 text-white shadow-xl">
             <SectionTitle icon={<ShieldCheck className="text-white/50" />} title={t.profile.planQuotas} light />
             <div className="grid grid-cols-2 gap-4 mt-6">
                <QuotaBox label={t.profile.quotaAgencies} current={orgData.currentAgencies} />
                <QuotaBox label={t.profile.quotaVehicles} current={orgData.currentVehicles} />
                <QuotaBox label={t.profile.quotaDrivers} current={orgData.currentDrivers} />
             </div>
             <div className="mt-6 pt-6 border-t border-white/10 text-[10px] font-medium opacity-70 italic">
                {t.profile.expiresOn} : {new Date(orgData.subscriptionExpiresAt).toLocaleDateString()}
             </div>
          </section>

          <section className="bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800">
             <SectionTitle icon={<Globe2 />} title={t.profile.publicContact} />
             <div className="mt-4 space-y-3">
                <p className="text-sm font-bold dark:text-white">{orgData.phone}</p>
                <p className="text-sm font-bold text-[#0528d6]">{orgData.email}</p>
             </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const SectionTitle = ({ icon, title, light }: any) => (
  <div className="flex items-center gap-3">
    <span className={light ? "text-white" : "text-[#0528d6]"}>{icon}</span>
    <h4 className={`text-sm font-bold  italic tracking-tighter ${light ? "text-white" : "text-slate-800 dark:text-white"}`}>
      {title}
    </h4>
  </div>
);

const DataField = ({ label, value, isLink }: any) => (
  <div className="space-y-1">
    <p className="text-[10px] font-bold text-slate-400  tracking-widest italic">{label}</p>
    {isLink ? (
      <a href={value} target="_blank" className="text-sm font-bold text-[#0528d6] hover:underline block truncate">{value || '---'}</a>
    ) : (
      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{value || '---'}</p>
    )}
  </div>
);

const StatItem = ({ label, value, icon }: any) => (
  <div className="flex items-center justify-between group">
    <div className="flex items-center gap-3">
      <div className="size-8 bg-slate-50 dark:bg-slate-900 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-[#0528d6] transition-colors">
        {React.cloneElement(icon as React.ReactElement, { size: 14 })}
      </div>
      <span className="text-xs font-bold text-slate-500">{label}</span>
    </div>
    <span className="text-sm font-black dark:text-white">{value}</span>
  </div>
);

const QuotaBox = ({ label, current }: any) => (
  <div className="bg-white/10 rounded-2xl p-4 border border-white/5">
    <p className="text-[9px] font-bold  opacity-60 mb-1">{label}</p>
    <p className="text-xl font-black">{current}</p>
  </div>
);