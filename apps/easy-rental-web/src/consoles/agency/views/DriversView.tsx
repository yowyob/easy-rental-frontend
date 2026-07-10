/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Users, Plus, Search, Loader2, UserCheck, ShieldAlert } from 'lucide-react';
import { driverService } from '@pwa-easy-rental/shared-services';
import { StatCard } from '../components/StatCard';
import { DriverCard } from './drivers/DriverCard';
import { DriverFormModal } from './drivers/DriverFormModal';
import { DriverStatusPricingModal } from './drivers/DriverStatusPricingModal';
import { ResourceDetailsModal } from './vehicles/ResourceDetailsModal';
import { hasPermission } from '../utils/permissions';

export const DriversView = ({ userData, t, staffPermissions }: any) => {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // États pour la création
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // États pour l'édition (Prix / Statut / Planning)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [viewingDriverId, setViewingDriverId] = useState<string | null>(null);
  const [detailsRefreshKey, setDetailsRefreshKey] = useState(0);
  
  const [modalLoading, setModalLoading] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!userData?.agencyId) return;
    setLoading(true);
    try {
      const res = await driverService.getDriversByAgency(userData.agencyId);
      if (res.ok) setDrivers(res.data || []);
    } finally { setLoading(false); }
  }, [userData?.agencyId]);

  useEffect(() => { loadData(); }, [loadData]);

  // Handler pour la création (Multipart)
  const handleCreateSubmit = async (formData: FormData) => {
    setModalLoading(true);
    setBackendError(null);
    try {
      formData.append('agencyId', userData.agencyId);
      const res = await driverService.createDriver(userData.organizationId, formData);
      if (res.ok) { 
        setIsCreateModalOpen(false); 
        loadData(); 
      } else {
        setBackendError(res.data?.message || t.staff.errorSave);
      }
    } catch {
      setBackendError(t.staff.errorSave);
    } finally { setModalLoading(false); }
  };

  // Handler pour l'édition (Prix, Statut, Planning optionnel)
  const handleStatusPricingSubmit = async (driverId: string, pricing: any, formData: any) => {
    setModalLoading(true);
    setBackendError(null);
    try {
      const pricingRes = await driverService.updateDriverPricing(driverId, pricing);
      if (!pricingRes.ok) {
        setBackendError(pricingRes.data?.message || t.staff.errorSave);
        return;
      }

      if (formData.globalStatus && formData.globalStatus !== selectedDriver?.status) {
        const statusRes = await driverService.updateDriverStatus(driverId, formData.globalStatus);
        if (!statusRes.ok) {
          setBackendError(statusRes.data?.message || t.staff.errorSave);
          return;
        }
      }

      if (formData.addUnavailability && formData.schedule?.reason?.trim()) {
        const scheduleRes = await driverService.updateDriverSchedule(driverId, {
          schedules: [
            {
              startDate: new Date(formData.schedule.startDate).toISOString(),
              endDate: new Date(formData.schedule.endDate).toISOString(),
              status: 'UNAVAILABLE',
              reason: formData.schedule.reason.trim(),
            },
          ],
        });
        if (!scheduleRes.ok) {
          setBackendError(scheduleRes.data?.message || t.staff.errorSave);
          return;
        }
      }

      setIsStatusModalOpen(false);
      setSelectedDriver(null);
      setDetailsRefreshKey((k) => k + 1);
      loadData();
    } finally {
      setModalLoading(false);
    }
  };

  const filteredDrivers = useMemo(() => drivers.filter(d => 
    `${d.firstname} ${d.lastname}`.toLowerCase().includes(searchTerm.toLowerCase())
  ), [drivers, searchTerm]);

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#0528d6] size-12" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10 text-left">
      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label={t.staff.stats.total} value={drivers.length} icon={<Users />} />
        <StatCard label={t.staff.stats.activeRoles} value={drivers.filter(d => d.status === 'ACTIVE').length} icon={<UserCheck className="text-green-500"/>} />
        <StatCard label={t.kpi.verificationRequired} value={drivers.filter(d => d.status !== 'ACTIVE').length} icon={<ShieldAlert className="text-red-500"/>} />
      </div>

      {/* SEARCH & ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-[#1a1d2d] p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0528d6]" size={18} />
          <input 
            placeholder={t.staff.searchPlaceholder} 
            className="w-full pl-12 pr-6 py-3.5 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-bold italic outline-none focus:ring-2 focus:ring-[#0528d6]/20 transition-all dark:text-white"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {hasPermission(userData, staffPermissions, 'driver:create') && (
            <button 
                onClick={() => { setBackendError(null); setIsCreateModalOpen(true); }}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#0528d6] text-white rounded-2xl font-black text-[11px] uppercase shadow-xl shadow-blue-600/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 italic tracking-widest"
            >
                <Plus size={18} /> {t.staff.addBtn}
            </button>
        )}
      </div>

      {/* DRIVERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
        {filteredDrivers.map(d => (
          <DriverCard 
            key={d.id} 
            driver={d} 
            staffPermissions={staffPermissions}
            t={t}
            userData={userData}
            onEdit={(driver: any) => { 
                setSelectedDriver(driver); 
                setBackendError(null); 
                setIsStatusModalOpen(true); 
            }}
            onViewDetails={(driver: any) => setViewingDriverId(driver.id)}
            onDelete={async (id: string) => { 
                if(confirm(t.staff.deleteConfirm)) { 
                    await driverService.deleteDriver(id); 
                    loadData(); 
                } 
            }}
          />
        ))}
      </div>

      {/* MODAL : CREATION (DOCUMENTS) */}
      {isCreateModalOpen && (
        <DriverFormModal 
            t={t} 
            onClose={() => setIsCreateModalOpen(false)} 
            onSubmit={handleCreateSubmit} 
            modalLoading={modalLoading} 
            error={backendError} 
        />
      )}

      {/* MODAL : EDITION (PRIX / STATUT) */}
      {isStatusModalOpen && selectedDriver && (
          <DriverStatusPricingModal
            t={t}
            driver={selectedDriver}
            onClose={() => {
                setIsStatusModalOpen(false);
                setSelectedDriver(null);
            }}
            onSubmit={handleStatusPricingSubmit}
            modalLoading={modalLoading}
            error={backendError}
          />
      )}

      {viewingDriverId && (
        <ResourceDetailsModal
          key={`${viewingDriverId}-${detailsRefreshKey}`}
          t={t}
          resourceId={viewingDriverId}
          type="DRIVER"
          onClose={() => setViewingDriverId(null)}
        />
      )}
    </div>
  );
};