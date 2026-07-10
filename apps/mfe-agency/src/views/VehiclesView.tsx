/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Car, Plus, Search, Loader2, CheckCircle2, Settings2 } from 'lucide-react';
import { vehicleService, buildVehicleFormInitialData } from '@pwa-easy-rental/shared-services';
import { StatCard } from '../components/StatCard';
import { VehicleCard } from './vehicles/VehicleCard';
import { VehicleFormModal } from './vehicles/VehicleFormModal';
import { QuickStatusModal } from './vehicles/QuickStatusModal';
import { ResourceDetailsModal } from './vehicles/ResourceDetailsModal';
import { hasPermission } from '@/utils/permissions';

export const VehiclesView = ({ userData, t, staffPermissions }: { userData: any, t: any, staffPermissions: any }) => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const[categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeModal, setActiveModal] = useState<'FORM' | 'QUICK_STATUS' | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [quickStatusError, setQuickStatusError] = useState<string | null>(null);
  const[viewingVehicleId, setViewingVehicleId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!userData?.agencyId) return;
    setLoading(true);
    try {
      const [vehRes, catRes] = await Promise.all([
        vehicleService.getVehiclesByAgency(userData.agencyId),
        vehicleService.getVehicleCategories(userData.organizationId)
      ]);
      if (vehRes.ok) setVehicles(vehRes.data ||[]);
      if (catRes.ok) setCategories(catRes.data ||[]);
    } finally {
      setLoading(false);
    }
  }, [userData?.agencyId, userData?.organizationId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSubmit = async (formData: any) => {
    setModalLoading(true);
    setBackendError(null);
    try {
      const payload = {
        ...formData,
        agencyId: userData.agencyId,
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
        : await vehicleService.createVehicle(userData.organizationId, payload);
      
      if (res.ok) {
        setActiveModal(null);
        loadData();
      } else {
        setBackendError(res.data?.message || t.vehicles.errorSave);
      }
    } finally {
      setModalLoading(false);
    }
  };

  const handleQuickStatusSubmit = async (id: string, payload: any) => {
    setModalLoading(true);
    setQuickStatusError(null);
    try {
      if (!payload.skipPricing) {
        const pricingRes = await vehicleService.updateVehiclePricing(id, {
          pricePerHour: payload.pricePerHour,
          pricePerDay: payload.pricePerDay,
          pricePerMonth: payload.pricePerMonth,
        });
        if (!pricingRes.ok) {
          const msg = (pricingRes.data as { message?: string })?.message;
          setQuickStatusError(msg === 'Access Denied' ? 'Accès refusé — vérifiez vos permissions.' : (msg || t.vehicles.errorSave));
          return;
        }
      }

      const statusRes = await vehicleService.updateVehicleStatus(id, payload.globalStatus);
      if (!statusRes.ok) {
        const msg = (statusRes.data as { message?: string })?.message;
        setQuickStatusError(msg === 'Access Denied' ? 'Accès refusé — vérifiez vos permissions.' : (msg || t.vehicles.errorSave));
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
          setQuickStatusError((scheduleRes.data as { message?: string })?.message || t.vehicles.errorSave);
          return;
        }
      }

      setActiveModal(null);
      loadData();
    } catch {
      setQuickStatusError(t.vehicles.errorSave);
    } finally {
      setModalLoading(false);
    }
  };

  const handleQuickStatus = async (id: string, status: string) => {
    const res = await vehicleService.updateVehicleStatus(id, status);
    if (res.ok) loadData();
  };

  const filteredVehicles = useMemo(() => vehicles.filter(v => 
    `${v.brand} ${v.model} ${v.licencePlate}`.toLowerCase().includes(searchTerm.toLowerCase())
  ), [vehicles, searchTerm]);

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-[#0528d6] size-10" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10 text-left">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label={t.vehicles.statAgency} value={vehicles.length} icon={<Car />} />
        <StatCard label={t.vehicles.statOperational} value={vehicles.filter(v => v.statut === 'AVAILABLE').length} icon={<CheckCircle2 className="text-green-500"/>} />
        <StatCard label={t.vehicles.statMaintenance} value={vehicles.filter(v => v.statut === 'MAINTENANCE').length} icon={<Settings2 className="text-orange-500"/>} />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-[#1a1d2d] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0528d6]" size={18} />
          <input 
            placeholder={t.vehicles.searchPlaceholder} 
            className="w-full pl-12 pr-6 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0528d6]/20 font-medium dark:text-white transition-all"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {hasPermission(userData, staffPermissions, 'vehicle:create') && <button 
          onClick={() => { setEditingVehicle(null); setBackendError(null); setActiveModal('FORM'); }}
          className="w-full md:w-auto px-6 py-3 bg-[#0528d6] text-white rounded-lg font-bold text-sm shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
        >
          <Plus size={18} /> {t.vehicles.addBtn}
        </button>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredVehicles.map(v => (
          <VehicleCard 
            key={v.id} 
            vehicle={v} 
            userData={userData}
            staffPermissions={staffPermissions}
            categoryName={categories.find(c => c.id === v.categoryId)?.name}
            onEdit={(veh: any) => { setEditingVehicle(veh); setBackendError(null); setActiveModal('FORM'); }}
            onDelete={async (id: string) => { if(confirm(t.vehicles.deleteConfirmMsg)) { await vehicleService.deleteVehicle(id); loadData(); } }}
            onStatusUpdate={handleQuickStatus}
            onQuickStatus={(veh: any) => { setEditingVehicle(veh); setQuickStatusError(null); setActiveModal('QUICK_STATUS'); }}
            onViewDetails={(veh: any) => setViewingVehicleId(veh.id)}
            t={t}
          />
        ))}
      </div>

      {activeModal === 'QUICK_STATUS' && editingVehicle && hasPermission(userData, staffPermissions, 'vehicle:update') && (
        <QuickStatusModal
          key={editingVehicle.id}
          t={t}
          vehicle={editingVehicle}
          onSubmit={handleQuickStatusSubmit}
          modalLoading={modalLoading}
          error={quickStatusError}
          onClose={() => { setActiveModal(null); setQuickStatusError(null); }}
        />
      )}

      {activeModal === 'FORM' && (
        <VehicleFormModal 
          key={editingVehicle?.id ?? 'new'}
          t={t}
          backendError={backendError}
          editingVehicle={editingVehicle}
          categories={categories}
          initialData={buildVehicleFormInitialData(editingVehicle)}
          onClose={() => setActiveModal(null)}
          onSubmit={handleSubmit}
          modalLoading={modalLoading}
        />
      )}

      {viewingVehicleId && (
        <ResourceDetailsModal 
          t={t}
          resourceId={viewingVehicleId}
          type="VEHICLE"
          onClose={() => setViewingVehicleId(null)}
        />
      )}
    </div>
  );
};