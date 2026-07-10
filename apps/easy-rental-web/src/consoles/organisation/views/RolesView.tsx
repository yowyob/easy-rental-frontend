/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Search, Loader2, ShieldCheck, Key, Lock } from 'lucide-react';
import { extraService, staffService } from '@pwa-easy-rental/shared-services';
import { RoleCard } from './roles/RoleCard';
import { RoleFormModal } from './roles/RoleFormModal';
import { StatCard } from '../components/StatCard';

export const RolesView = ({ orgData, t }: { orgData: any, t: any }) => {
  const [postes, setPostes] = useState<any[]>([]);
  const [allPermissions, setAllPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPoste, setEditingPoste] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!orgData?.id) return;
    setLoading(true);
    try {
      const [postesRes, permsRes] = await Promise.all([
        staffService.getPostes(orgData.id),
        extraService.getPermissions()
      ]);
      if (postesRes.ok) setPostes(postesRes.data || []);
      if (permsRes.ok) setAllPermissions(permsRes.data || []);
    } finally {
      setLoading(false);
    }
  }, [orgData?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const permissionsByModule = useMemo(() => {
    return allPermissions.reduce((acc: any, perm) => {
      const moduleName = perm.module || 'Autres';
      if (!acc[moduleName]) acc[moduleName] = [];
      acc[moduleName].push(perm);
      return acc;
    }, {});
  }, [allPermissions]);

  const filteredPostes = useMemo(() => postes.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  ), [postes, searchTerm]);

  const handleSubmit = async (formData: any) => {
    setModalLoading(true);
    try {
      const res = editingPoste 
        ? await staffService.updatePoste(editingPoste.id, formData)
        : await staffService.createPoste(orgData.id, formData);
      if (res.ok) { 
        setIsModalOpen(false); 
        loadData(); 
      }
    } finally { 
      setModalLoading(false); 
    }
  };

  const isSystemRole = (poste: any) => poste.isSystem === true;

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="animate-spin text-[#0528d6] size-10" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label={t.roles.statConfigured} 
          value={postes.length} 
          icon={<ShieldCheck />} 
        />
        <StatCard 
          label={t.roles.statPermissions} 
          value={allPermissions.length} 
          icon={<Key />} 
        />
        <StatCard 
          label={t.roles.statCustom} 
          value={postes.filter(p => !isSystemRole(p)).length} 
          icon={<Lock className="text-orange-500" />} 
        />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-[#1a1d2d] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0528d6]" size={18} />
          <input 
            placeholder={t.roles.searchPlaceholder} 
            className="w-full pl-12 pr-6 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0528d6]/20 font-medium dark:text-white transition-all" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <button 
          onClick={() => { setEditingPoste(null); setIsModalOpen(true); }}
          className="w-full md:w-auto px-6 py-3 bg-[#0528d6] text-white rounded-lg font-bold text-sm shadow-lg shadow-blue-600/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
        >
          <Plus size={18} /> {t.roles.addBtn}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPostes.map(role => (
          <RoleCard 
            key={role.id} 
            role={role} 
            isSystem={isSystemRole(role)} 
            onEdit={(r: any) => { setEditingPoste(r); setIsModalOpen(true); }} 
            t={t}
          />
        ))}
      </div>

      {isModalOpen && (
        <RoleFormModal 
          key={editingPoste?.id ?? 'new'}
          t={t}
          editingPoste={editingPoste}
          permissionsByModule={permissionsByModule}
          initialData={editingPoste 
            ? { 
                name: editingPoste.name, 
                description: editingPoste.description, 
                permissionIds: editingPoste.permissions.map((p:any) => p.id) 
              } 
            : { name: '', description: '', permissionIds: [] }
          }
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          modalLoading={modalLoading}
        />
      )}
    </div>
  );
};