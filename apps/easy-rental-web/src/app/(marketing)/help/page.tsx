'use client';

import React, { useEffect, useState } from 'react';
import { Search, ChevronDown, ChevronUp, Mail, Phone, MessageCircle, HelpCircle } from 'lucide-react';
import { supportService } from '@pwa-easy-rental/shared-services';

const faqData = [
  {
    category: 'Réservation & Location',
    items: [
      { q: 'Comment réserver un véhicule ?', a: 'Créez un compte client, parcourez le catalogue, choisissez vos dates et confirmez. L\'acompte se règle en agence.' },
      { q: 'Puis-je modifier ma réservation ?', a: 'Oui, jusqu\'à 24h avant le départ via votre espace client ou en contactant l\'agence.' },
    ],
  },
  {
    category: 'Paiement & Tarifs',
    items: [
      { q: 'Quels moyens de paiement ?', a: 'Mobile Money (Orange/MTN), espèces et carte en agence.' },
      { q: 'La caution est-elle remboursable ?', a: 'Oui, sous 48h après restitution du véhicule sans dommage constaté.' },
    ],
  },
  {
    category: 'Assistance',
    items: [
      { q: 'Comment contacter le support ?', a: 'Utilisez le chat en bas à droite ou écrivez-nous par email. Un administrateur vous répondra dans votre messagerie.' },
      { q: 'Que faire en cas de panne ?', a: 'Contactez l\'agence via la fiche de votre location ou notre support.' },
    ],
  },
];

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState('support@easyrental.local');
  const [query, setQuery] = useState('');

  useEffect(() => {
    supportService.getConfig().then((res) => {
      const email = res.data?.adminEmail;
      if (res.ok && typeof email === 'string' && email.length > 0) {
        setAdminEmail(email);
      }
    });
  }, []);

  const openChat = () => {
    window.dispatchEvent(new CustomEvent('support:open-chat'));
  };

  const normalizedQuery = query.trim().toLowerCase();
  const filteredFaq = faqData
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          !normalizedQuery
          || item.q.toLowerCase().includes(normalizedQuery)
          || item.a.toLowerCase().includes(normalizedQuery)
          || cat.category.toLowerCase().includes(normalizedQuery),
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0f1323] text-slate-800 dark:text-slate-100">
      <section className="bg-primary py-10 md:py-12 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -right-10 w-56 h-56 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -left-8 w-40 h-40 bg-secondary/25 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20">
            <HelpCircle size={12} /> Centre d&apos;aide
          </div>
          <h1 className="text-2xl md:text-4xl font-[900] italic text-white mb-5 tracking-tight">
            Comment pouvons-nous vous aider ?
          </h1>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher (annulation, paiement, chauffeur…)"
              className="w-full py-3.5 pl-12 pr-4 rounded-2xl shadow-xl outline-none text-slate-700 text-sm bg-white border border-white/40 focus:ring-2 focus:ring-white/50"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-10 md:py-12">
        <h2 className="text-xl md:text-2xl font-[900] italic text-primary text-center mb-8 tracking-tight">
          Questions fréquentes
        </h2>
        <div className="space-y-6">
          {filteredFaq.length === 0 && (
            <p className="text-center text-sm text-slate-500 italic py-8">
              Aucun résultat pour « {query} ». Essayez un autre mot-clé.
            </p>
          )}
          {filteredFaq.map((cat, catIdx) => (
            <div key={cat.category}>
              <h3 className="text-secondary font-black text-[11px] uppercase tracking-[0.15em] mb-3">
                {cat.category}
              </h3>
              <div className="space-y-2.5">
                {cat.items.map((item, itemIdx) => {
                  const id = `${catIdx}-${itemIdx}`;
                  const isOpen = openIndex === id;
                  return (
                    <div
                      key={id}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenIndex(isOpen ? null : id)}
                        className="w-full flex justify-between items-center gap-3 p-4 md:p-5 text-left font-bold text-sm text-slate-700 dark:text-slate-100 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        <span>{item.q}</span>
                        {isOpen
                          ? <ChevronUp size={18} className="shrink-0 text-primary" />
                          : <ChevronDown size={18} className="shrink-0 text-slate-400" />}
                      </button>
                      {isOpen && (
                        <div className="px-4 md:px-5 pb-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pb-12">
        <div className="max-w-3xl mx-auto bg-primary rounded-[2rem] p-8 md:p-10 text-center text-white relative overflow-hidden shadow-xl shadow-primary/25">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-secondary/30 rounded-full blur-2xl" />
          <div className="relative">
            <h2 className="text-lg md:text-xl font-[900] italic mb-3 tracking-tight">
              Vous ne trouvez pas votre réponse ?
            </h2>
            <p className="text-sm text-blue-100 mb-6 max-w-md mx-auto leading-relaxed">
              Écrivez-nous via le chat — un administrateur vous répondra dans votre messagerie.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                type="button"
                onClick={openChat}
                className="flex items-center justify-center gap-2 bg-white text-primary hover:bg-blue-50 px-5 py-3 rounded-xl text-sm font-black transition-colors"
              >
                <MessageCircle size={18} /> Messagerie support
              </button>
              <a
                href={`mailto:${adminEmail}?subject=${encodeURIComponent('Support Easy Rental')}`}
                className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 px-5 py-3 rounded-xl text-sm font-bold transition-colors"
              >
                <Mail size={18} /> {adminEmail}
              </a>
              <a
                href="tel:+237600000000"
                className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 px-5 py-3 rounded-xl text-sm font-bold transition-colors"
              >
                <Phone size={18} /> +237 600 000 000
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
