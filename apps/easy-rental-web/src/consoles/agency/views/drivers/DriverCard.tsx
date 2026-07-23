/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React from 'react';
import { Phone, User, Trash2, Edit3, ShieldCheck, FileText, BadgeCheck, Info, DollarSign } from 'lucide-react';
import { hasPermission } from '../../utils/permissions';

export const DriverCard = ({ driver, onEdit, onEditPricing, onViewDetails, onDelete, staffPermissions, t, userData }: any) => {
  return (
    <div className="bg-white dark:bg-[#1a1d2d] rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group text-left">
      <div className="flex justify-between items-start mb-6">
        <div className="relative">
          <div className="size-16 rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
            {driver.profilUrl ? (
              <img src={driver.profilUrl} alt="Profil" className="w-full h-full object-cover" />
            ) : (
              <User size={30} className="text-slate-300" />
            )}
          </div>
          <div className={`absolute -bottom-1 -right-1 size-6 rounded-full border-2 border-white dark:border-[#1a1d2d] flex items-center justify-center ${
            driver.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'
          }`}>
            <ShieldCheck size={12} className="text-white" />
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onViewDetails(driver)}
            title={t.common.view}
            className="p-2 text-slate-400 hover:text-[#0528d6] hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
          >
            <Info size={16} />
          </button>
          {hasPermission(userData, staffPermissions, 'driver:update') && (
              <>
                <button onClick={() => onEdit(driver)} title={t.staff.modal.titleEdit} className="p-2 text-slate-400 hover:text-[#0528d6] hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"><Edit3 size={16}/></button>
                {onEditPricing && (
                  <button onClick={() => onEditPricing(driver)} title={t.driverStatus?.pricingSection || 'Prix / Statut'} className="p-2 text-slate-400 hover:text-[#0528d6] hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"><DollarSign size={16}/></button>
                )}
              </>
          )}
          {hasPermission(userData, staffPermissions, 'driver:delete') && (
              <button onClick={() => onDelete(driver.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"><Trash2 size={16}/></button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-black text-slate-900 dark:text-white leading-tight truncate uppercase italic tracking-tighter text-lg">
          {driver.firstname} {driver.lastname}
        </h4>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">
          {driver.age} {t.driverCard.years} — {driver.gender === 0 ? t.driverForm.male : t.driverForm.female}
        </p>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300 italic">
          <div className="size-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 text-[#0528d6]">
            <Phone size={14} />
          </div>
          {driver.tel}
        </div>
        <div className="flex items-center gap-3 text-[10px] font-black text-[#0528d6] dark:text-blue-400 uppercase italic">
            <BadgeCheck size={14} /> {t.driverCard.verifiedLicense}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-50 dark:border-slate-800">
        <a href={driver.drivingLicenseUrl} target="_blank" className="flex items-center justify-center gap-2 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-[#0528d6] rounded-xl text-[9px] font-black uppercase transition-all italic tracking-tighter">
          <FileText size={12}/> {t.driverCard.licenseBtn}
        </a>
        <a href={driver.cniUrl} target="_blank" className="flex items-center justify-center gap-2 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-[#0528d6] rounded-xl text-[9px] font-black uppercase transition-all italic tracking-tighter">
          <FileText size={12}/> {t.driverCard.cniBtn}
        </a>
      </div>
    </div>
  );
};