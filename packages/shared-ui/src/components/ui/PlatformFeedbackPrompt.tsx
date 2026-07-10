'use client';

import React, { useEffect, useState } from 'react';
import { Star, X } from 'lucide-react';

type PlatformFeedbackPromptProps = {
  feedbackUrl: string;
  label?: string;
};

export function PlatformFeedbackPrompt({ feedbackUrl, label }: PlatformFeedbackPromptProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const done = localStorage.getItem('easyrental_first_usage_done') === '1';
    const dismissed = localStorage.getItem('easyrental_feedback_prompt_dismissed') === '1';
    if (done && !dismissed) setVisible(true);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem('easyrental_feedback_prompt_dismissed', '1');
    setVisible(false);
  };

  return (
    <div className="mx-0 mb-3 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-start gap-3 flex-1">
        <Star className="text-orange-500 shrink-0 mt-0.5" size={20} fill="currentColor" />
        <div>
          <p className="text-sm font-black uppercase italic text-slate-800 dark:text-white">
            {label || 'Comment trouvez-vous Easy Rental ?'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Partagez votre avis après votre première utilisation — cela nous aide à améliorer la plateforme.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <a
          href={feedbackUrl}
          className="px-4 py-2 rounded-xl bg-[#F76513] text-white text-xs font-black uppercase italic shadow-md shadow-orange-500/25 hover:bg-orange-600 transition-colors"
        >
          Noter
        </a>
        <button type="button" onClick={dismiss} className="p-2 text-slate-400 hover:text-slate-600">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
