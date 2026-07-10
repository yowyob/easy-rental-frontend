/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { 
  ArrowDownLeft, ArrowUpRight, ChevronDown, 
  Car, User, Receipt, Loader2, 
  Copy, CheckCircle2, MapPin, Phone, ShieldCheck, Info, Clock, Tag
} from 'lucide-react';
import { transactionService } from '@shared-services/api';

export const TransactionCard = ({ tx }: { tx: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const isCredit = tx.type?.toLowerCase() === 'credit' || tx.type?.toLowerCase() === 'payment';

  useEffect(() => {
    if (tx.id && isOpen && !details) {
      const fetchDetails = async () => {
        setLoading(true);
        try {
          const res = await transactionService.getTransactionDetails(tx.id);
          if (res.ok) setDetails(res.data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
      };
      fetchDetails();
    }
  }, [isOpen, tx.id, details]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`mb-3 overflow-hidden transition-all duration-300 rounded-2xl border ${
      isOpen 
        ? 'bg-white dark:bg-[#1e2235] border-[#0528d6]/30 shadow-lg' 
        : 'bg-white dark:bg-[#1a1d2d] border-slate-100 dark:border-slate-800 shadow-sm hover:border-slate-200'
    }`}>
      
      {/* --- HEADER PRINCIPAL --- */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 flex items-center justify-between cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          <div className={`size-11 rounded-xl flex items-center justify-center transition-all ${
            isCredit ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10' : 'bg-rose-100 text-rose-600 dark:bg-rose-500/10'
          }`}>
            {isCredit ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white tracking-tight">
              {tx.description}
            </h4>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                {tx.method}
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                {new Date(tx.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className={`text-base font-black italic ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isCredit ? '+' : '-'}{tx.amount.toLocaleString()} <span className="text-[10px] not-italic">XAF</span>
            </p>
            <span className="text-[9px] font-bold text-slate-400 tracking-widest">{tx.status}</span>
          </div>
          <ChevronDown className={`text-slate-300 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#0528d6]' : ''}`} size={18} />
        </div>
      </div>

      {/* --- SECTION DÉTAILS --- */}
      <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="px-6 pb-8">
            <div className="h-px bg-slate-100 dark:bg-slate-800 mb-6" />

            {loading ? (
              <div className="flex flex-col items-center py-10 gap-2">
                <Loader2 className="animate-spin text-[#0528d6]" />
                <span className="text-[10px] font-bold text-slate-400  tracking-widest">Récupération des données...</span>
              </div>
            ) : details ? (
              <div className="space-y-6">
                
                {/* 1. LE "HERO" : L'OBJET DE LA TRANSACTION */}
                <div className={`p-5 rounded-[1.5rem] flex flex-wrap items-center justify-between gap-4 ${
                  details.rentalDetails ? 'bg-blue-50 dark:bg-blue-500/5' : 'bg-purple-50 dark:bg-purple-500/5'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`size-14 rounded-2xl flex items-center justify-center shadow-sm ${
                      details.rentalDetails ? 'bg-white text-blue-600' : 'bg-white text-purple-600'
                    }`}>
                      {details.rentalDetails ? <Car size={32} /> : <Receipt size={32} />}
                    </div>
                    <div>
                      <p className="text-[10px] font-black  tracking-widest text-slate-400 mb-1">
                        {details.rentalDetails ? "Véhicule loué" : "Forfait souscrit"}
                      </p>
                      <h3 className="text-xl font-black italic  text-slate-900 dark:text-white leading-none">
                        {details.rentalDetails?.vehicle 
                          ? `${details.rentalDetails.vehicle.brand} ${details.rentalDetails.vehicle.model}`
                          : details.planDetails?.name}
                      </h3>
                      {details.rentalDetails?.vehicle && (
                        <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-slate-900 rounded-lg text-white font-mono text-xs font-bold tracking-wider">
                          <Tag size={12} className="text-blue-400" />
                          {details.rentalDetails.vehicle.licencePlate}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Prix Info (Plan) ou Status Location */}
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400  mb-1">Statut Dossier</p>
                    <div className="px-4 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                       <span className="text-sm font-black text-[#0528d6] ">
                        {details.rentalDetails?.rental?.status || details.status}
                       </span>
                    </div>
                  </div>
                </div>

                {/* 2. GRILLE D'INFO LISIBLE */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* COLONNE A : TEMPS & LIEU */}
                  <div className="space-y-4">
                    <Label icon={<Clock size={14}/>} text="Période & Lieu" />
                    <div className="space-y-3 pl-6 border-l-2 border-slate-100 dark:border-slate-800">
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 ">Durée</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {details.rentalDetails ? (
                            `Du ${new Date(details.rentalDetails.rental.startDate).toLocaleDateString()} au ${new Date(details.rentalDetails.rental.endDate).toLocaleDateString()}`
                          ) : (
                            `${details.planDetails?.durationDays} Jours de validité`
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 ">Localisation</p>
                        <div className="flex items-center gap-1 text-xs font-bold text-slate-800 dark:text-slate-200">
                          <MapPin size={12} className="text-rose-500" />
                          {details.rentalDetails?.agency?.name || "Siège Central"} ({details.rentalDetails?.agency?.city || '—'})
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* COLONNE B : ACTEURS (CLIENT/CHAUFFEUR) */}
                  <div className="space-y-4">
                    <Label icon={<User size={14}/>} text="Intervenants" />
                    <div className="space-y-3 pl-6 border-l-2 border-slate-100 dark:border-slate-800">
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 ">Client</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          {details.rentalDetails?.rental?.clientName || "N/A"}
                          <a href={`tel:${details.rentalDetails?.rental?.clientPhone}`} className="text-blue-500"><Phone size={12}/></a>
                        </p>
                      </div>
                      {details.rentalDetails?.driver && (
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 ">Chauffeur</p>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {details.rentalDetails.driver.firstname} {details.rentalDetails.driver.lastname}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* COLONNE C : FINANCES & RÉF */}
                  <div className="space-y-4">
                    <Label icon={<ShieldCheck size={14}/>} text="Sécurité & ID" />
                    <div className="space-y-3 pl-6 border-l-2 border-slate-100 dark:border-slate-800">
                       <button 
                        onClick={() => copyToClipboard(details.id)}
                        className="group/btn flex flex-col items-start w-full"
                      >
                        <p className="text-[9px] font-bold text-slate-400  flex items-center gap-1">
                          ID Transaction {copied ? <CheckCircle2 size={10} className="text-emerald-500" /> : <Copy size={10} />}
                        </p>
                        <p className="text-[10px] font-mono text-slate-500 truncate w-full text-left group-hover/btn:text-blue-500 transition-colors">
                          {details.id}
                        </p>
                      </button>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 ">Référence Paiement</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{details.reference || '—'}</p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* 3. FOOTER DES DÉTAILS (DESCRIPTION OPTIONNELLE) */}
                {details.description && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    <div className="flex items-start gap-3">
                      <Info size={16} className="text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400  mb-1">Note complémentaire</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">
                          {details.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center py-6 text-slate-400 font-bold  text-[10px] tracking-widest">Erreur de données</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- PETIT COMPOSANT HELPER POUR LES TITRES ---
const Label = ({ icon, text }: { icon: any, text: string }) => (
  <div className="flex items-center gap-2 mb-2">
    <div className="text-[#0528d6]">{icon}</div>
    <span className="text-[10px] font-black  tracking-[0.15em] text-slate-400">{text}</span>
  </div>
);