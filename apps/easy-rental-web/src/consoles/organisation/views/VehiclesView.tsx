/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Car, Plus, Search, Loader2, CheckCircle2, Settings2, ChevronLeft, ChevronRight } from 'lucide-react';
import { agencyService, vehicleService, buildVehicleFormInitialData } from '@pwa-easy-rental/shared-services';
import { StatCard } from '../components/StatCard';
import { VehicleCard } from './vehicles/VehicleCard';
import { VehicleFormModal } from './vehicles/VehicleFormModal';
import { VehicleDetailsModal } from './vehicles/VehicleDetailsModal';
import { QuickStatusModal } from './vehicles/QuickStatusModal';
import { isOrgGovernanceBlocked } from '../components/GovernanceBanner';

const ITEMS_PER_PAGE = 6;

function formatVehicleError(message?: string) {
  if (!message) return 'Impossible d\'enregistrer le véhicule.';
  if (message === 'Access Denied') {
    return 'Accès refusé — vérifiez vos permissions ou reconnectez-vous.';
  }
  if (message.includes('HTTP_401') || message.toLowerCase().includes('unauthorized')) {
    return 'Session kernel expirée. Reconnectez-vous à la console organisation, puis réessayez.';
  }
  return message.includes(': ') ? message.split(': ').slice(1).join(': ') : message;
}

export const VehiclesView = ({ orgData, t }: any) => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const[agencies, setAgencies] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const[activeModal, setActiveModal] = useState<'FORM' | 'DETAILS' | 'QUICK_STATUS' | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const[editingVehicle, setEditingVehicle] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [quickStatusError, setQuickStatusError] = useState('');
  const governanceBlocked = isOrgGovernanceBlocked(orgData);

  const loadData = useCallback(async () => {
    if (!orgData?.id) return;
    setLoading(true);
    try {
      const [vehRes, agRes, catRes] = await Promise.all([
        vehicleService.getVehiclesByOrg(orgData.id),
        agencyService.getAgencies(orgData.id),
        vehicleService.getVehicleCategories(orgData.id)
      ]);
      if (vehRes.ok) setVehicles(vehRes.data ||[]);
      if (agRes.ok) setAgencies(agRes.data ||[]);
      if (catRes.ok) setCategories(catRes.data || []);
    } finally { setLoading(false); }
  },[orgData?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleFormSubmit = async (formData: any) => {
    setModalLoading(true);
    setFormError('');
    try {
      if (!formData.agencyId) {
        setFormError('Sélectionnez une agence.');
        return;
      }
      if (!formData.categoryId) {
        setFormError('Sélectionnez une catégorie.');
        return;
      }

      const payload = {
        ...formData,
        kilometrage: Number(formData.kilometrage || 0),
        places: Number(formData.places || 5),
        engineDetails: {
          ...formData.engineDetails,
          horsepower: Number(formData.engineDetails?.horsepower || 0),
          capacity: Number(formData.engineDetails?.capacity || 0)
        },
        yearProduction: formData.yearProduction ? new Date(formData.yearProduction).toISOString() : new Date().toISOString(),
        insuranceDetails: {
          ...formData.insuranceDetails,
          expiry: formData.insuranceDetails?.expiry ? new Date(formData.insuranceDetails.expiry).toISOString() : new Date().toISOString()
        }
      };

      const res = editingVehicle 
        ? await vehicleService.updateVehicle(editingVehicle.id, payload)
        : await vehicleService.createVehicle(orgData.id, payload);
      
      if (res.ok) {
        setActiveModal(null);
        setFormError('');
        loadData();
        return;
      }
      setFormError(formatVehicleError((res.data as { message?: string })?.message));
    } catch {
      setFormError('Erreur réseau ou serveur indisponible.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleQuickStatusSubmit = async (id: string, payload: any) => {
    setModalLoading(true);
    setQuickStatusError('');
    try {
      if (!payload.skipPricing) {
        const pricingRes = await vehicleService.updateVehiclePricing(id, {
          pricePerHour: payload.pricePerHour,
          pricePerDay: payload.pricePerDay,
          pricePerMonth: payload.pricePerMonth,
        });
        if (!pricingRes.ok) {
          setQuickStatusError(formatVehicleError((pricingRes.data as { message?: string })?.message));
          return;
        }
      }

      const statusRes = await vehicleService.updateVehicleStatus(id, payload.globalStatus);
      if (!statusRes.ok) {
        setQuickStatusError(formatVehicleError((statusRes.data as { message?: string })?.message));
        return;
      }

      if (payload.globalStatus === 'MAINTENANCE' || payload.addSchedule) {
        if (!payload.schedule?.reason?.trim()) {
          setQuickStatusError('Indiquez la durée et le motif de maintenance.');
          return;
        }
        const scheduleRes = await vehicleService.updateVehicleSchedule(id, {
          schedules: [
            {
              startDate: new Date(payload.schedule.startDate).toISOString(),
              endDate: new Date(payload.schedule.endDate).toISOString(),
              status: payload.schedule.status || 'MAINTENANCE',
              reason: payload.schedule.reason,
            },
          ],
        });
        if (!scheduleRes.ok) {
          setQuickStatusError(formatVehicleError((scheduleRes.data as { message?: string })?.message));
          return;
        }
      }

      setActiveModal(null);
      loadData();
    } catch {
      setQuickStatusError('Erreur réseau ou serveur indisponible.');
    } finally {
      setModalLoading(false);
    }
  };

  const filteredVehicles = useMemo(() => vehicles.filter(v => 
    `${v.brand} ${v.model} ${v.licencePlate}`.toLowerCase().includes(searchTerm.toLowerCase())
  ), [vehicles, searchTerm]);

  const totalPages = Math.ceil(filteredVehicles.length / ITEMS_PER_PAGE);
  const paginatedVehicles = filteredVehicles.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-[#0528d6] size-10" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label={t.vehicles.statTotal} value={vehicles.length} icon={<Car />} />
        <StatCard label={t.vehicles.statAvailable} value={vehicles.filter(v => v.statut === 'AVAILABLE').length} icon={<CheckCircle2 className="text-green-500"/>} />
        <StatCard label={t.vehicles.statMaintenance} value={vehicles.filter(v => v.statut === 'MAINTENANCE').length} icon={<Settings2 className="text-orange-500"/>} />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-[#1a1d2d] p-4 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full md:w-96 group text-left">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0528d6]" size={18} />
          <input placeholder={t.vehicles.searchPlaceholder} className="w-full pl-12 pr-6 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-sm font-black italic outline-none focus:ring-2 focus:ring-[#0528d6]/20 transition-all dark:text-white" 
                 value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} />
        </div>
        <button
          disabled={governanceBlocked}
          title={governanceBlocked ? 'Organisation non approuvée — création véhicule bloquée.' : undefined}
          onClick={() => {
            if (governanceBlocked) {
              setFormError('Organisation non approuvée — création véhicule bloquée.');
              return;
            }
            setEditingVehicle(null);
            setFormError('');
            setActiveModal('FORM');
          }}
          className="w-full md:w-auto px-6 py-3 bg-[#0528d6] text-white rounded-xl font-black text-xs uppercase shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all italic disabled:opacity-50 disabled:hover:scale-100"
        >
          <Plus size={18} /> {t.vehicles.addBtn}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {paginatedVehicles.map(v => (
          <VehicleCard key={v.id} vehicle={v} 
                       agencyName={agencies.find(a => a.id === v.agencyId)?.name}
                       categoryName={categories.find(c => c.id === v.categoryId)?.name}
                       onViewDetails={(id: string) => { setTargetId(id); setActiveModal('DETAILS'); }}
                       onQuickStatus={(veh: any) => { setEditingVehicle(veh); setQuickStatusError(''); setActiveModal('QUICK_STATUS'); }}
                       onEdit={(veh: any) => { 
                         setEditingVehicle(veh); 
                         setActiveModal('FORM'); 
                       }}
                       onDelete={async (id: string) => { if(confirm(t.vehicles.deleteConfirm)) { await vehicleService.deleteVehicle(id); loadData(); } }} 
                       t={t}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-8">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="size-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center disabled:opacity-30 hover:bg-slate-50 transition-all"><ChevronLeft/></button>
          <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase italic tracking-widest px-4">{t.common.page} {currentPage} / {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="size-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center disabled:opacity-30 hover:bg-slate-50 transition-all"><ChevronRight/></button>
        </div>
      )}

      {activeModal === 'DETAILS' && targetId && <VehicleDetailsModal vehicleId={targetId} onClose={() => setActiveModal(null)} t={t} />}
      {activeModal === 'QUICK_STATUS' && editingVehicle && (
        <QuickStatusModal
          key={editingVehicle.id}
          vehicle={editingVehicle}
          onSubmit={handleQuickStatusSubmit}
          modalLoading={modalLoading}
          error={quickStatusError}
          onClose={() => { setActiveModal(null); setQuickStatusError(''); }}
        />
      )}
      {activeModal === 'FORM' && (
        <VehicleFormModal 
          key={editingVehicle?.id ?? 'new'}
          t={t}
          editingVehicle={editingVehicle}
          agencies={agencies}
          categories={categories}
          initialData={buildVehicleFormInitialData(editingVehicle)}
          onClose={() => { setActiveModal(null); setFormError(''); }}
          onSubmit={handleFormSubmit}
          modalLoading={modalLoading}
          formError={formError}
        />
      )}
    </div>
  );
};