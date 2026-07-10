import React from 'react';
import { 
  User, Star, Phone, ShieldCheck, 
   MessageSquareOff, ExternalLink 
} from 'lucide-react';
import MyCalendar from '@/components/MyCalendar';

// --- Interfaces ---
interface Pricing {
  pricePerHour: number;
  pricePerDay: number;
  currency: string;
}

interface Driver {
  id: string;
  firstname: string;
  lastname: string;
  tel: string;
  age: number;
  profilUrl: string;
  cniUrl: string;
  drivingLicenseUrl: string;
  status: string;
}

interface Schedule {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  authorName: string;
  createdAt: string;
}

interface DriverDetailsProps {
  data: {
    driver: Driver;
    pricing: Pricing;
    schedule: Schedule[];
    rating: number;
    reviews: Review[];
    isDriverBookingRequired: boolean;
  };
}

const DriverDetailView: React.FC<DriverDetailsProps> = ({ data }) => {
  const { driver, pricing, reviews, rating } = data;

  // Formateur de date
  const formatDate = (dateStr: string) => 
    new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gray-50 min-h-screen space-y-6">
      
      {/* 1. HEADER : Infos Principales */}
      {/* <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6">
        <img 
          src={driver.profilUrl} 
          alt={driver.firstname} 
          className="w-28 h-28 rounded-full border-4 border-blue-50 object-cover"
        />
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <h1 className="text-2xl font-black text-gray-800">{driver.firstname} {driver.lastname}</h1>
            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold w-fit mx-auto md:mx-0">
              {driver.status}
            </span>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3 text-gray-600 text-sm">
            <span className="flex items-center gap-1"><User size={16}/> {driver.age} ans</span>
            <span className="flex items-center gap-1 font-bold text-amber-500"><Star size={16} className="fill-current"/> {rating}</span>
            <span className="flex items-center gap-1"><Phone size={16}/> {driver.tel}</span>
          </div>
        </div>
        <div className="bg-blue-600 text-white p-4 rounded-xl text-center min-w-[150px]">
          <p className="text-xs opacity-80  font-bold">À partir de</p>
          <p className="text-xl font-black">{pricing.pricePerDay} {pricing.currency}</p>
          <p className="text-[10px]">par jour</p>
        </div>
      </div> */}
      {/* 1. HEADER : Infos Principales (Optimisé pour Popup) */}
<div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-4">
  
  {/* Avatar compact */}
  <img 
    src={driver.profilUrl} 
    alt={driver.firstname} 
    className="w-20 h-20 rounded-lg border-2 border-blue-50 object-cover shrink-0"
  />

  {/* Zone de contenu : Nom + Infos + Prix en bas */}
  <div className="flex-1 flex flex-col justify-between min-w-0">
    
    {/* Haut : Nom et Statut */}
    <div className="flex flex-wrap items-center gap-2 mb-1">
      <h1 className="text-lg font-bold text-gray-900 truncate">
        {driver.firstname} {driver.lastname}
      </h1>
      <span className="bg-green-100 text-green-700 text-[9px] px-2 py-0.5 rounded-full font-bold  tracking-wide shrink-0">
        {driver.status}
      </span>
    </div>

    {/* Milieu : Infos clés condensées */}
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-gray-500 text-xs mb-2">
      <span className="flex items-center gap-1">
        <User size={14} className="text-blue-500"/> {driver.age} ans
      </span>
      <span className="flex items-center gap-1 font-bold text-amber-500">
        <Star size={14} className="fill-current"/> {rating}
      </span>
      <span className="flex items-center gap-1">
        <Phone size={14} className="text-blue-500"/> {driver.tel}
      </span>
    </div>

    {/* Bas : Prix intégré proprement */}
    <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
      <span className="text-[10px] text-gray-400 font-semibold ">Tarif :</span>
      <span className="text-sm font-black text-blue-600">
        {pricing.pricePerDay.toLocaleString()} {pricing.currency}
      </span>
      <span className="text-[10px] text-gray-400">/ jour</span>
    </div>
  </div>

</div>

      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> */}
        
        {/* 2. PLANNING D'INDISPONIBILITÉ */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          {/* <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
            <Calendar size={20} className="text-red-500" /> 
            Occupé aux dates suivantes
          </h3>
          
          {schedule.length > 0 ? (
            <div className="space-y-3">
              {schedule.map((slot) => (
                <div key={slot.id} className="p-3 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                  <p className="text-sm font-bold text-red-800">{slot.reason || "Indisponible"}</p>
                  <p className="text-xs text-red-600">
                    Du {formatDate(slot.startDate)} au {formatDate(slot.endDate)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed">
              <CalendarOff size={40} className="mb-2 opacity-20" />
              <p className="text-sm font-medium">Aucune indisponibilité prévue</p>
              <p className="text-xs">Le chauffeur est entièrement libre.</p>
            </div>
          )} */}
          <MyCalendar schedules={data.schedule} />
        </div>

        {/* 3. AVIS CLIENTS */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
            <Star size={20} className="text-amber-500 fill-current" /> 
            Commentaires clients
          </h3>

          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="border-b border-gray-50 pb-4 last:border-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm text-gray-700">{rev.authorName}</span>
                    <span className="text-[10px] text-gray-400">{formatDate(rev.createdAt)}</span>
                  </div>
                  <div className="flex text-amber-400 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className={i < rev.rating ? "fill-current" : "text-gray-200"} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 italic">{rev.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed">
              <MessageSquareOff size={40} className="mb-2 opacity-20" />
              <p className="text-sm font-medium">Aucun avis pour le moment</p>
              <p className="text-xs">Soyez le premier à louer ses services !</p>
            </div>
          )}
        </div>

        {/* 4. DOCUMENTS (Vérification) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4 text-gray-800">Documents vérifiés</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href={driver.drivingLicenseUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors border border-gray-100">
              <span className="text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="text-blue-600" size={18}/> Permis de conduire
              </span>
              <ExternalLink size={14} className="text-gray-400"/>
            </a>
            <a href={driver.cniUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors border border-gray-100">
              <span className="text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="text-blue-600" size={18}/> {"Pièce d'identité (CNI)"}
              </span>
              <ExternalLink size={14} className="text-gray-400"/>
            </a>
          </div>
        </div>
      {/* </div> */}
    </div>
  );
};

export default DriverDetailView;