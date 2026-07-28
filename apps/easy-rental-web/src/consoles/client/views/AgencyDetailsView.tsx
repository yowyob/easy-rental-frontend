/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Navigation, Globe, Zap, Car } from 'lucide-react';
import { ArrowLeft, MapPin, Phone, Mail, Clock, CreditCard, Loader2, Store, MessageSquare, X } from 'lucide-react';
import { agencyService, vehicleService } from '@pwa-easy-rental/shared-services';
import { VehicleCard } from './catalog/VehicleCard';
import { VehicleDetailsView } from './VehicleDetailsView';
import { ChatPanel } from '../../shared-chat/ChatPanel';

export const AgencyDetailsView = ({ agencyId, userData, onBack, onContactAgency }: { agencyId: string, userData: any, onBack: () => void, onContactAgency?: (agencyId: string) => void }) => {
  const [agency, setAgency] = useState<any>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // On récupère les détails ET les véhicules en parallèle
        const [resA, resV] = await Promise.all([
          agencyService.getAgencyDetails(agencyId),
          vehicleService.getVehiclesByAgency(agencyId) 
        ]);
        
        if (resA.ok) setAgency(resA.data);
        if (resV.ok) setVehicles(resV.data || []);
      } catch (error) {
        console.error("Erreur lors du chargement des données de l'agence", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [agencyId]);
  
  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-[#0528d6] size-10" /></div>;
//   if (!agency) return <div className="p-10 text-center"><button onClick={onBack}>Retour</button></div>;

  if (selectedVehicleId) {
      return (
        <VehicleDetailsView 
          vehicleId={selectedVehicleId} 
          userData={userData} 
          onBack={() => setSelectedVehicleId(null)} 
        />
      );
    }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 space-y-8">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 transition-all">
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-3xl font-black  italic text-slate-900 dark:text-white leading-none">{agency?.name}</h2>
            {(agency?.organizationAccountType === 'FREELANCE' || agency?.organization_account_type === 'FREELANCE') && (
              <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-700 text-[9px] font-black rounded-full border border-amber-100">
                Particulier
              </span>
            )}
          </div>
          <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] mt-2">{"Détails de l'agence "}</p>
        </div>
        <button
          type="button"
          onClick={() => (onContactAgency ? onContactAgency(agencyId) : setShowChat(true))}
          className="ml-auto flex items-center gap-2 px-5 py-3 bg-[#0528d6] text-white text-xs font-black rounded-xl hover:opacity-90 transition shadow-lg shadow-blue-600/20"
        >
          <MessageSquare size={16} />
          Contacter l&apos;agence
        </button>
      </div>

      {showChat && !onContactAgency && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl bg-[#f4f7fe] dark:bg-[#0f1323] rounded-[2rem] p-6 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black italic text-slate-900 dark:text-white">
                Discussion avec {agency?.name || 'l\'agence'}
              </h3>
              <button
                type="button"
                onClick={() => setShowChat(false)}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 transition-all"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatPanel
                role="CLIENT"
                selfId={userData?.id}
                initialTarget={{ type: 'AGENCY', id: agencyId, label: agency?.name }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CARTE PRINCIPALE */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="size-32 rounded-[2rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden border">
                {agency?.logoUrl ? <img src={agency?.logoUrl} className="w-full h-full object-cover" /> : <Store size={40} className="text-slate-200" />}
              </div>
              <div className="space-y-4">
                <p className="text-slate-500 font-medium leading-relaxed">{agency?.description || "Aucune description fournie pour cette agence."}</p>
                <div className="flex flex-wrap gap-2">
                  {agency?.is24Hours && <span className="px-3 py-1 bg-green-50 text-green-600 text-[9px] font-black rounded-full  tracking-tighter">Ouvert 24h/24</span>}
                  {agency?.allowOnlineBooking && <span className="px-3 py-1 bg-blue-50 text-[#0528d6] text-[9px] font-black rounded-full  tracking-tighter">Booking en ligne</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoBlock icon={<MapPin className="text-red-500" />} label="Adresse" value={`${agency?.address}, ${agency?.city}`} subValue={`${agency?.postalCode} ${agency?.country}`} />
            <InfoBlock icon={<Clock className="text-blue-500" />} label="Horaires Travail" value={agency?.workingHours || "Non spécifié"} subValue={agency?.timezone} />
            <InfoBlock icon={<Globe className="text-indigo-500" />}  label="Région"  value={`${agency?.region || "N/A"} - ${agency?.country}`}  subValue={`Fuseau : ${agency?.timezone || "Non défini"}`} />
            <InfoBlock  icon={<Navigation className="text-emerald-500" />}  label="Zone de service"  value={`${agency?.geofenceRadius} m`}  subValue="Rayon autorisé autour de l'agence"/>
          </div>
        </div>

        {/* COLONNE CONTACT & PAIEMENT */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-8">
            <div className="space-y-6">
              <ContactRow icon={<Phone size={16} />} label="Téléphone" value={agency?.phone} />
              <ContactRow icon={<Mail size={16} />} label="Email" value={agency?.email} />
            </div>
            {(agency?.ratingsCount ?? 0) > 0 && (
              <div className="pt-6 border-t border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-black tracking-widest text-slate-400">Note clients</span>
                </div>
                <p className="text-xl font-black italic flex items-center gap-2">
                  <span className="text-amber-400">★</span>
                  {Number(agency?.averageRating ?? 0).toFixed(1)}
                  <span className="text-[11px] font-bold text-slate-400">({agency?.ratingsCount} avis)</span>
                </p>
              </div>
            )}
            <div className="pt-6 border-t border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <CreditCard className="text-blue-400" size={18} />
                <span className="text-[10px] font-black  tracking-widest text-slate-400">Conditions</span>
              </div>
              <p className="text-xl font-black italic">{agency?.depositPercentage}% {"de caution"}</p>
              <p className="text-[10px] text-slate-400 mt-1 ">Caution restituée au retour, déduction faite des dommages</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
            <p className="text-[9px] font-black  tracking-[0.2em] text-slate-400 mb-1">
            Localisation GPS
            </p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
            {agency?.latitude}, {agency?.longitude}
            </p>
        </div>

        <a
            href={`https://www.google.com/maps?q=${agency?.latitude},${agency?.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-3 bg-[#0528d6] text-white text-xs font-bold rounded-xl hover:opacity-90 transition"
        >
            <Navigation size={14} />
            Ouvrir la carte
        </a>
      </div>
        <div className="space-y-6">
        <div className="flex items-center gap-4 px-4">
          <div className="size-10 bg-[#0528d6] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#0528d6]/20">
            <Car size={20} />
          </div>
          <div>
            <h3 className="text-2xl font-black  italic text-slate-900 dark:text-white">Notre Flotte</h3>
            <p className="text-[10px] font-bold text-slate-400  tracking-widest">{vehicles.length} véhicules disponibles dans cette agence</p>
          </div>
        </div>

        {vehicles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vehicles.map((v) => (
              <VehicleCard 
                key={v.id} 
                vehicle={v} 
                categoryName="Disponible"
                onViewDetails={(id) => setSelectedVehicleId(id) }
              />
            ))}
          </div>
        ) : (
          <div className="py-20 bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800 text-center">
            <Zap className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-bold  text-xs tracking-widest italic">{"Aucun véhicule n'est actuellement listé pour cette agence."}</p>
          </div>
        )}
      </div>
 
    </div>
  );
};

const InfoBlock = ({ icon, label, value, subValue }: any) => (
  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
    <div className="size-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-4">{icon}</div>
    <p className="text-[9px] font-black text-slate-400  tracking-[0.2em] mb-1">{label}</p>
    <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{value}</p>
    <p className="text-[10px] text-slate-400 mt-1 font-medium">{subValue}</p>
  </div>
);

const ContactRow = ({ icon, label, value }: any) => (
  <div className="flex items-center gap-4">
    <div className="size-10 bg-white/5 rounded-xl flex items-center justify-center">{icon}</div>
    <div>
      <p className="text-[8px] font-black text-slate-500  tracking-widest mb-0.5">{label}</p>
      <p className="text-xs font-bold">{value || 'N/A'}</p>
    </div>
  </div>
);