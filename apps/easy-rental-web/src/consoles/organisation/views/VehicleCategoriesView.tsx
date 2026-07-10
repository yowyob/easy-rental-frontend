/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LayoutGrid, Plus, Search, Loader2, ShieldCheck, Box } from 'lucide-react';
import { vehicleService } from '@pwa-easy-rental/shared-services';
import { StatCard } from '../components/StatCard';
import { CategoryCard } from './categories/CategoryCard';
import { CategoryFormModal } from './categories/CategoryFormModal';

export const VehicleCategoriesView = ({ orgData, t }: { orgData: any, t: any }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'SYSTEM' | 'CUSTOM'>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [pageError, setPageError] = useState('');

  const loadData = useCallback(async () => {
    if (!orgData?.id) return;
    setLoading(true);
    setPageError('');
    try {
      const res = await vehicleService.getVehicleCategories(orgData.id);
      if (res.ok) {
        setCategories(res.data || []);
      } else {
        setPageError('Impossible de charger les catégories.');
      }
    } catch {
      setPageError('Erreur réseau ou serveur indisponible.');
    } finally {
      setLoading(false);
    }
  }, [orgData?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredCategories = useMemo(() => {
    return categories.filter(cat => {
      const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           cat.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const isSystem = cat.organizationId === null;
      if (filterTab === 'SYSTEM') return matchesSearch && isSystem;
      if (filterTab === 'CUSTOM') return matchesSearch && !isSystem;
      return matchesSearch;
    });
  }, [categories, searchTerm, filterTab]);

  const openCreateModal = () => {
    setEditingCat(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCat(cat);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData: any) => {
    setModalLoading(true);
    setFormError('');
    try {
      const res = editingCat 
        ? await vehicleService.updateCategory(editingCat.id, formData)
        : await vehicleService.createCategory(orgData.id, formData);
      
      if (res.ok) {
        setIsModalOpen(false);
        setFormError('');
        loadData();
        return;
      }
      setFormError((res.data as { message?: string })?.message || 'Impossible d\'enregistrer la catégorie.');
    } catch {
      setFormError('Erreur réseau ou serveur indisponible.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t.vehicleCategories.deleteConfirm)) return;
    setPageError('');
    try {
      const res = await vehicleService.deleteCategory(id);
      if (res.ok) {
        loadData();
        return;
      }
      setPageError((res.data as { message?: string })?.message || 'Impossible de supprimer la catégorie.');
    } catch {
      setPageError('Erreur réseau ou serveur indisponible.');
    }
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-[#0528d6] size-10" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {pageError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-6 py-4 rounded-2xl text-sm font-bold italic">
          {pageError}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label={t.vehicleCategories.statTotal} value={categories.length} icon={<LayoutGrid />} />
        <StatCard label={t.vehicleCategories.statSystem} value={categories.filter(c => c.organizationId === null).length} icon={<ShieldCheck />} />
        <StatCard label={t.vehicleCategories.statCustom} value={categories.filter(c => c.organizationId !== null).length} icon={<Box />} />
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-white dark:bg-[#1a1d2d] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg w-full lg:w-auto">
          {[
            { id: 'ALL', label: t.vehicleCategories.tabAll },
            { id: 'SYSTEM', label: t.vehicleCategories.tabSystem },
            { id: 'CUSTOM', label: t.vehicleCategories.tabCustom }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className={`px-6 py-2 rounded-md text-[11px] font-bold  italic transition-all ${
                filterTab === tab.id 
                  ? 'bg-white dark:bg-slate-800 text-[#0528d6] shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0528d6]" size={18} />
          <input 
            placeholder={t.vehicleCategories.searchPlaceholder}
            className="w-full pl-12 pr-6 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0528d6]/20 font-medium dark:text-white transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button 
          onClick={openCreateModal}
          className="w-full lg:w-auto px-6 py-3 bg-[#0528d6] text-white rounded-lg font-bold text-sm shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <Plus size={18} /> {t.vehicleCategories.addBtn}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCategories.map((cat) => (
          <CategoryCard 
            key={cat.id} 
            category={cat} 
            onEdit={openEditModal}
            onDelete={handleDelete}
            t={t}
          />
        ))}
      </div>

      {isModalOpen && (
        <CategoryFormModal 
          t={t}
          editingCat={editingCat}
          initialData={editingCat ? { name: editingCat.name, description: editingCat.description } : { name: '', description: '' }}
          onClose={() => { setIsModalOpen(false); setFormError(''); }}
          onSubmit={handleSubmit}
          modalLoading={modalLoading}
          formError={formError}
        />
      )}
    </div>
  );
};
