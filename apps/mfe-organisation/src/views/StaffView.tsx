/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Users, Plus, Search, Loader2, MapPin, UserCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { agencyService, staffService } from '@pwa-easy-rental/shared-services';
import { StatCard } from '../components/StatCard';
import { StaffCard } from './staff/StaffCard';
import { StaffFormModal } from './staff/StaffFormModal';
import { StaffDetailsModal } from './staff/StaffDetailsModal';
import { StaffCredentialsModal, parseInviteCredentials } from './staff/StaffCredentialsModal';
import { isOrgGovernanceBlocked } from '../components/GovernanceBanner';

const ITEMS_PER_PAGE = 6;

function formatStaffInviteError(message?: string) {
  if (!message) return 'Impossible de recruter cet agent. Vérifiez les informations saisies.';
  if (message.includes('kernel-core') || message.includes(':443') || message.includes('KERNEL_UNAVAILABLE')) {
    return 'Connexion au serveur kernel impossible. Réessayez dans quelques secondes.';
  }
  const lower = message.toLowerCase();
  if (lower.includes('not verified') || lower.includes('email_not_verified') || lower.includes('email_verification')) {
    return 'Le kernel a exigé une vérif email sur le compte technique — Easy Rental a créé l\'agent en local. '
      + 'Utilisez le mot de passe affiché pour la console agence (aucun verify requis pour le personnel).';
  }
  const withoutCode = message.includes(': ') ? message.split(': ').slice(1).join(': ') : message;
  return withoutCode.trim() || message;
}

export const StaffView = ({ orgData, t }: { orgData: any, t: any }) => {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [agencies, setAgencies] = useState<any[]>([]);
  const governanceBlocked = isOrgGovernanceBlocked(orgData);
  const [postes, setPostes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeModal, setActiveModal] = useState<'FORM' | 'DETAILS' | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [staffCredentials, setStaffCredentials] = useState<{
    email: string;
    password: string;
    agencyUrl: string;
  } | null>(null);

  const kernelMode = Boolean(orgData?.kernelOrganizationId);

  const loadData = useCallback(async () => {
    if (!orgData?.id) return;
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        staffService.getStaffByOrg(orgData.id),
        agencyService.getAgencies(orgData.id),
        staffService.getPostes(orgData.id),
      ]);
      const staffRes = results[0].status === 'fulfilled' ? results[0].value : null;
      const agRes = results[1].status === 'fulfilled' ? results[1].value : null;
      const postRes = results[2].status === 'fulfilled' ? results[2].value : null;
      if (staffRes?.ok) setStaffList(staffRes.data || []);
      if (agRes?.ok) setAgencies(agRes.data || []);
      if (postRes?.ok) setPostes(postRes.data || []);
    } finally { setLoading(false); }
  }, [orgData?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredStaff = useMemo(() => staffList.filter(s => 
    `${s.firstname} ${s.lastname} ${s.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  ), [staffList, searchTerm]);

  const paginated = filteredStaff.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredStaff.length / ITEMS_PER_PAGE);

  const handleSubmit = async (formData: any) => {
    setModalLoading(true);
    setSuccessMessage(null);
    setFormError('');
    const isNew = !selectedStaff;
    const normalizedForm = {
      ...formData,
      email: formData.email?.trim().toLowerCase(),
    };
    try {
        const res = selectedStaff 
          ? await staffService.updateStaff(selectedStaff.id, normalizedForm)
          : kernelMode
            ? await staffService.inviteStaff(orgData.id, {
                firstname: normalizedForm.firstname,
                lastname: normalizedForm.lastname,
                email: normalizedForm.email,
                agencyId: normalizedForm.agencyId,
                kernelRoleId: normalizedForm.posteId,
              })
            : await staffService.addStaff(orgData.id, normalizedForm);
        
        if (res.ok) { 
          setActiveModal(null); 
          setFormError('');
          loadData(); 
          if (isNew && kernelMode) {
            const credentials = parseInviteCredentials(res.data, formData.email);
            if (credentials) {
              setStaffCredentials(credentials);
            } else {
              setSuccessMessage(`Un email avec les identifiants a été envoyé à ${formData.email}`);
            }
          }
          return;
        }
        const apiMessage = (res.data as { message?: string })?.message;
        setFormError(formatStaffInviteError(apiMessage));
    } catch {
        setFormError('Erreur réseau ou serveur indisponible.');
    } finally {
        setModalLoading(false);
    }
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-[#0528d6] size-10" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-6 py-4 rounded-2xl text-sm font-bold italic">
          {successMessage}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label={t.staff.statTotal} value={staffList.length} icon={<Users />} />
        <StatCard label={t.staff.statRoles} value={postes.length} icon={<MapPin className="text-orange-500" />} />
        <StatCard label={t.staff.statActive} value={staffList.filter(s => s.status === 'ACTIVE').length} icon={<UserCheck className="text-green-500"/>} />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-[#1a1d2d] p-4 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full md:w-96 group text-left">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0528d6]" size={18} />
          <input placeholder={t.staff.searchPlaceholder} className="w-full pl-12 pr-6 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-sm font-black italic outline-none focus:ring-2 focus:ring-[#0528d6]/20 transition-all dark:text-white" 
                 value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} />
        </div>
        <button
          disabled={governanceBlocked}
          title={governanceBlocked ? 'Organisation non approuvée — recrutement bloqué.' : undefined}
          onClick={() => {
            if (governanceBlocked) {
              setFormError('Organisation non approuvée — recrutement bloqué.');
              return;
            }
            setSelectedStaff(null);
            setFormError('');
            setActiveModal('FORM');
          }}
          className="w-full md:w-auto px-6 py-3 bg-[#0528d6] text-white rounded-xl font-black text-xs uppercase shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all italic disabled:opacity-50 disabled:hover:scale-100"
        >
          <Plus size={18} /> {kernelMode ? 'Recruter un agent' : t.staff.recruitBtn}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 text-left">
        {paginated.map(staff => (
          <StaffCard key={staff.id} staff={staff} agencies={agencies}
                     onView={(id: string) => { setSelectedStaff(id); setActiveModal('DETAILS'); }}
                     onEdit={(s: any) => { setSelectedStaff(s); setActiveModal('FORM'); }}
                     onDelete={async (id: string) => { if(confirm(t.staff.deleteConfirm)) { await staffService.deleteStaff(id); loadData(); } }}
                     t={t}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-8">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="size-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"><ChevronLeft/></button>
          <span className="text-[10px] font-black text-slate-500 uppercase italic px-4 tracking-widest">{t.common.page} {currentPage} / {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="size-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"><ChevronRight/></button>
        </div>
      )}

      {staffCredentials && (
        <StaffCredentialsModal
          credentials={staffCredentials}
          onClose={() => setStaffCredentials(null)}
        />
      )}
      {activeModal === 'DETAILS' && <StaffDetailsModal staffId={selectedStaff} onClose={() => setActiveModal(null)} t={t} />}
      {activeModal === 'FORM' && (
        <StaffFormModal 
          key={selectedStaff?.id ?? 'new'}
          t={t}
          kernelMode={kernelMode}
          formError={formError}
          editingStaff={selectedStaff} agencies={agencies} postes={postes}
          initialData={selectedStaff ? { ...selectedStaff, posteId: selectedStaff.poste?.id } : {
            firstname: '', lastname: '', email: '',
            agencyId: agencies.length === 1 ? agencies[0].id : '',
            posteId: postes.length === 1 ? postes[0].id : '',
            status: 'ACTIVE',
          }}
          onClose={() => setActiveModal(null)} onSubmit={handleSubmit} modalLoading={modalLoading}
        />
      )}
    </div>
  );
};
