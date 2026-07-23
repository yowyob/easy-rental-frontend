/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  MapPin,
  UserIcon,
  X,
  Loader2,
  Phone,
  Mail,
  Calendar,
  Clock,
  Car,
  Shield,
  ChevronRight,
  Store,
  CreditCard,
} from "lucide-react";
import { resolveMediaDisplayUrl } from "@pwa-easy-rental/shared-services";

const VEHICLE_FALLBACK = "/client/vehicle-placeholder.svg";

const ReservationDetail = ({ data, onClose, onCancel, cancelling }: any) => {
  const { rental, vehicle, driver, agency } = data;

  const formatDate = (date?: string) => {
    if (!date) return '—';
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    if (rental?.rentalType !== "DAILY") {
      options.hour = "2-digit";
      options.minute = "2-digit";
    }
    try { return new Date(date).toLocaleDateString("fr-FR", options); }
    catch { return '—'; }
  };

  const start = rental?.startDate ? new Date(rental.startDate) : null;
  const end = rental?.endDate ? new Date(rental.endDate) : null;
  const diffMs = start && end ? end.getTime() - start.getTime() : 0;
  const durationDays = diffMs > 0 ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : null;
  const durationHours = diffMs > 0 ? Math.ceil(diffMs / (1000 * 60 * 60)) : null;
  const duration = rental?.rentalType === "DAILY" ? durationDays : durationHours;
  const durationLabel = rental?.rentalType === "DAILY" ? "Jours" : "Heures";

  const remaining = (rental?.totalAmount || 0) - (rental?.amountPaid || 0);
  const hasPaidOnline = Number(rental?.amountPaid ?? 0) > 0;
  const estimatedDeposit = Math.round(Number(rental?.totalAmount ?? 0) * 0.6);
  const vehicleImage = vehicle?.images?.[0]
    ? resolveMediaDisplayUrl(vehicle.images[0])
    : VEHICLE_FALLBACK;

  const SectionTitle = ({ title, icon: Icon }: any) => (
    <div className="flex items-center gap-2 mb-4">
      <div className="size-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
        <Icon size={14} />
      </div>
      <h4 className="text-[10px] font-black text-slate-400 tracking-[0.2em]">
        {title}
      </h4>
    </div>
  );

  const FeatureBadge = ({ label, active }: any) =>
    active ? (
      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-[#0528d6] rounded-xl text-[10px] font-bold border border-blue-100">
        <div className="size-1 bg-[#0528d6] rounded-full" />
        {label}
      </span>
    ) : null;

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden overflow-y-auto custom-scrollbar">

      {/* ─── BLOC (a) EN-TÊTE VÉHICULE — visuel + identité complète ─── */}
      <div className="relative h-72 bg-slate-900">
        <img
          src={vehicleImage}
          className="w-full h-full object-cover opacity-70"
          alt={`${vehicle?.brand ?? ''} ${vehicle?.model ?? ''}`}
          onError={(e) => { (e.target as HTMLImageElement).src = VEHICLE_FALLBACK; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />

        <button
          onClick={onClose}
          className="absolute top-6 right-6 size-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all z-20"
        >
          <X size={20} />
        </button>

        <div className="absolute bottom-8 left-8 right-8">
          <div className="flex justify-between items-end gap-4">
            <div className="min-w-0">
              <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-lg tracking-wider">
                {vehicle?.brand} {vehicle?.model}
              </span>
              <h3 className="text-4xl font-black text-white mt-3 tracking-tighter italic truncate">
                {vehicle?.licencePlate || `${vehicle?.brand ?? ''} ${vehicle?.model ?? ''}`.trim() || "Véhicule"}
              </h3>
              <p className="text-sm text-white/60 font-medium">
                {vehicle?.color || '—'} • Modèle {vehicle?.yearProduction?.slice?.(0, 4) || '—'}
              </p>
            </div>
            <div className="text-right hidden md:block shrink-0">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Référence</p>
              <p className="text-xs font-bold text-white tracking-widest">{rental?.id?.slice(0, 8)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bandeau infos véhicule — extension du bloc (a) : specs + équipements */}
      <div className="bg-slate-50 border-b border-slate-100">
        <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Statut</p>
            <p className="text-xs font-black text-slate-900 mt-1">{rental?.status ?? '—'}</p>
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sièges</p>
            <p className="text-xs font-black text-slate-900 mt-1">{vehicle?.places ? `${vehicle.places} sièges` : '—'}</p>
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Kilométrage</p>
            <p className="text-xs font-black text-slate-900 mt-1">{vehicle?.kilometrage ? `${vehicle.kilometrage} km` : '—'}</p>
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Transmission</p>
            <p className="text-xs font-black text-slate-900 mt-1">{vehicle?.transmission || '—'}</p>
          </div>
        </div>
        {vehicle?.functionalities && (
          <div className="px-6 pb-4 pt-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Car size={11}/> Équipements & confort
            </p>
            <div className="flex flex-wrap gap-2">
              <FeatureBadge label="Climatisation" active={vehicle?.functionalities?.air_condition} />
              <FeatureBadge label="Bluetooth" active={vehicle?.functionalities?.bluetooth} />
              <FeatureBadge label="GPS" active={vehicle?.functionalities?.gps} />
              <FeatureBadge label="USB" active={vehicle?.functionalities?.usb_input} />
              <FeatureBadge label="Ordinateur" active={vehicle?.functionalities?.onboard_computer} />
              <FeatureBadge label="Bagages" active={vehicle?.functionalities?.luggage} />
            </div>
          </div>
        )}
        {vehicle?.vinNumber && (
          <div className="px-6 pb-4">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">VIN</p>
            <p className="text-xs font-black text-slate-900 mt-1">{vehicle.vinNumber}</p>
          </div>
        )}
      </div>

      <div className="p-8 space-y-10">

        {/* ─── BLOC (b) FINANCIER ─── */}
        <section>
          <SectionTitle title="Solde" icon={CreditCard} />
          <div className="p-5 bg-slate-900 rounded-[2rem] text-white shadow-xl shadow-slate-200">
            <div className="flex justify-between items-center mb-4">
              <Store size={18} className="text-blue-400" />
              <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest ${
                rental?.status === 'PENDING' ? 'bg-orange-500/20 text-orange-300' : 'bg-blue-500/20 text-blue-300'
              }`}>
                {rental?.status}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-white/40 tracking-widest">
                {hasPaidOnline ? 'Reste à régler en agence' : 'Acompte à régler en agence'}
              </p>
              <p className="text-3xl font-black italic">
                {(hasPaidOnline ? remaining : estimatedDeposit).toLocaleString('fr-FR')}{' '}
                <span className="text-xs italic opacity-50">XAF</span>
              </p>
              {!hasPaidOnline && (
                <p className="text-[10px] text-white/50 mt-2">
                  Paiement en ligne bientôt disponible — appelez ou écrivez à l&apos;agence pour confirmer.
                </p>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-[10px] font-bold opacity-60">
              <span>TOTAL: {Number(rental?.totalAmount ?? 0).toLocaleString('fr-FR')}</span>
              {hasPaidOnline && <span>PAYÉ: {Number(rental?.amountPaid).toLocaleString('fr-FR')}</span>}
            </div>
          </div>
        </section>

        {/* ─── BLOC (c) PLANNING (Départ / Retour + durée) ─── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="size-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
              <Calendar size={14} />
            </div>
            <h4 className="text-[10px] font-black text-slate-400 tracking-[0.2em]">Planning de location</h4>
            {duration && (
              <span className="ml-auto text-[10px] font-black text-[#0528d6] bg-blue-50 px-2.5 py-1 rounded-full">
                <Clock size={10} className="inline mr-1" /> {duration} {durationLabel}
              </span>
            )}
          </div>
          <div className="relative pl-6 border-l-2 border-slate-100 space-y-8">
            <div className="relative">
              <div className="absolute -left-[31px] top-0 size-4 rounded-full bg-white border-4 border-blue-600" />
              <p className="text-[9px] font-black text-slate-400 tracking-widest">Départ</p>
              <p className="text-sm font-black text-slate-900">{formatDate(rental?.startDate)}</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[31px] top-0 size-4 rounded-full bg-white border-4 border-slate-200" />
              <p className="text-[9px] font-black text-slate-400 tracking-widest">Retour</p>
              <p className="text-sm font-black text-slate-900">{formatDate(rental?.endDate)}</p>
            </div>
          </div>
        </section>

        {/* ─── BLOC (d) AGENCE DE RETRAIT ─── */}
        <section>
          <SectionTitle title="Agence de retrait" icon={MapPin} />
          <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
            {agency ? (
              <>
                <p className="text-sm font-black text-slate-900 mb-1">{agency.name}</p>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  {[agency.address, agency.city].filter(Boolean).join(', ') || 'Adresse non renseignée'}
                </p>
                <div className="flex gap-2">
                  {agency.phone && (
                    <a href={`tel:${agency.phone}`} className="p-3 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600" title="Appeler">
                      <Phone size={16} />
                    </a>
                  )}
                  {agency.email && (
                    <a href={`mailto:${agency.email}`} className="p-3 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600" title="Email">
                      <Mail size={16} />
                    </a>
                  )}
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-400">Informations agence indisponibles.</p>
            )}
          </div>
        </section>

        {/* ─── EXTRAS : Client / Chauffeur / Équipements ─── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div className="space-y-4">
            <SectionTitle title="Client" icon={UserIcon} />
            <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <div className="size-12 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                <UserIcon size={24} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 leading-none mb-1">
                  {rental?.clientName || 'Client'}
                </p>
                <p className="text-[10px] text-slate-500 font-bold">{rental?.clientPhone}</p>
              </div>
            </div>
          </div>

          {driver && (
            <div className="space-y-4">
              <SectionTitle title="Chauffeur" icon={Shield} />
              <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <div className="size-12 rounded-xl overflow-hidden bg-slate-100">
                  {driver?.profilUrl ? (
                    <img src={resolveMediaDisplayUrl(driver.profilUrl)} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <UserIcon size={24} />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 leading-none mb-1">{driver?.firstname} {driver?.lastname}</p>
                  <p className="text-[10px] text-slate-500 font-bold italic flex gap-2"> <Phone size={12} />Tel: {driver?.tel}</p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ACTION FINALE */}
        <div className="pt-4">
          <button
            disabled={cancelling}
            onClick={() => onCancel(rental?.id)}
            className="w-full py-5 bg-red-50 text-red-500 rounded-[1.5rem] text-[11px] font-black tracking-widest hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-3 group shadow-lg shadow-red-100"
          >
            {cancelling ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                Annuler ma réservation
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          <p className="text-center text-[9px] font-bold text-slate-400 mt-4 tracking-tighter">
            Note: Une annulation tardive peut entraîner des frais de gestion.
          </p>
        </div>

      </div>
    </div>
  );
};

export default ReservationDetail;
