'use client';

import React, { useState } from 'react';
import { Star, Send, ThumbsUp, MessageSquare, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { reviewService } from '@pwa-easy-rental/shared-services';

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [authorName, setAuthorName] = useState('');
  const [authorRole, setAuthorRole] = useState('Client');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback(null);

    if (!authorName.trim()) {
      setFeedback({ type: 'error', message: 'Indiquez votre nom.' });
      return;
    }
    if (rating < 1) {
      setFeedback({ type: 'error', message: 'Sélectionnez une note entre 1 et 5 étoiles.' });
      return;
    }

    setSubmitting(true);
    const res = await reviewService.submitPlatformFeedback({
      authorName: authorName.trim(),
      authorRole,
      rating,
      comment: comment.trim() || undefined,
    });
    setSubmitting(false);

    if (!res.ok) {
      const apiMessage =
        res.data && typeof res.data === 'object'
          ? String(
              (res.data as Record<string, unknown>).message
              ?? (res.data as Record<string, unknown>).error
              ?? (res.data as Record<string, unknown>).detail
              ?? '',
            )
          : '';
      setFeedback({
        type: 'error',
        message: apiMessage.trim()
          || (res.status === 0
            ? 'Impossible de joindre l\'API. Vérifiez que le backend tourne sur le port 8081.'
            : `Envoi refusé (HTTP ${res.status}). Réessayez dans un instant.`),
      });
      return;
    }

    setFeedback({
      type: 'success',
      message: 'Merci ! Votre avis a été transmis à l\'équipe. Il pourra apparaître sur la page d\'accueil après validation.',
    });
    setAuthorName('');
    setAuthorRole('Client');
    setRating(0);
    setComment('');
  };

  const reasons = [
    {
      icon: ThumbsUp,
      title: 'Amélioration continue',
      desc: 'Vos retours font évoluer nos services de location au quotidien.',
    },
    {
      icon: Star,
      title: 'Mise en avant',
      desc: 'Les meilleurs agents et agences gagnent en visibilité.',
    },
    {
      icon: MessageSquare,
      title: 'Support réactif',
      desc: 'Nous répondons concrètement à vos besoins spécifiques.',
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0f1323] text-slate-800 dark:text-slate-100 font-sans">
      <section className="bg-primary text-white py-10 md:py-12 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-10 w-48 h-48 bg-secondary/20 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20">
            <Sparkles size={12} /> Votre voix compte
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-[900] italic tracking-tight mb-3">
            Votre avis compte pour nous
          </h1>
          <p className="text-blue-100 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Aidez-nous à améliorer Easy Rental. Que vous soyez client, agent ou organisation,
            votre retour d&apos;expérience est précieux.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-10 md:py-12">
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
          <aside className="lg:col-span-2 space-y-4">
            <h2 className="text-xl md:text-2xl font-[900] italic text-primary tracking-tight mb-2">
              Pourquoi donner votre avis ?
            </h2>
            {reasons.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex gap-4 p-4 md:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
                >
                  <div className="shrink-0 size-11 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-secondary flex items-center justify-center">
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="font-black text-slate-800 dark:text-white text-sm mb-1">{item.title}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </aside>

          <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-[1.75rem] border border-slate-100 dark:border-slate-800 shadow-sm p-6 md:p-8 lg:p-10">
            <h2 className="text-xl md:text-2xl font-[900] italic text-primary tracking-tight mb-6">
              Partagez votre expérience
            </h2>

            {feedback && (
              <div
                className={`mb-6 flex items-start gap-3 rounded-xl px-4 py-3 text-sm ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                    : 'bg-red-50 text-red-800 border border-red-100'
                }`}
              >
                {feedback.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
                <p>{feedback.message}</p>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                    Votre nom
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Votre prénom ou nom"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                    Votre rôle
                  </label>
                  <select
                    value={authorRole}
                    onChange={(e) => setAuthorRole(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  >
                    <option>Client</option>
                    <option>Agent</option>
                    <option>Organisation</option>
                    <option>Chauffeur</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
                  Notez votre expérience
                </label>
                <div className="flex gap-2">
                  {[...Array(5)].map((_, index) => {
                    const ratingValue = index + 1;
                    const active = ratingValue <= (hover || rating);
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setRating(ratingValue)}
                        onMouseEnter={() => setHover(ratingValue)}
                        onMouseLeave={() => setHover(0)}
                        className="p-1 transition-transform hover:scale-110"
                        aria-label={`Note ${ratingValue} sur 5`}
                      >
                        <Star
                          size={34}
                          className={`transition-colors ${
                            active ? 'fill-secondary text-secondary' : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                  Votre message
                </label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Racontez-nous votre expérience…"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-white font-black py-4 rounded-xl hover:bg-primary-dark transition flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-60"
              >
                {submitting ? 'Envoi en cours…' : 'Envoyer mon avis'} <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
