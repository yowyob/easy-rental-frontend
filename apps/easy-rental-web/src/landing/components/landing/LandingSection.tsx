import React from 'react';

/** Espacement vertical uniforme pour toutes les sections de la landing. */
export const LANDING_SECTION_SPACING = 'py-10 md:py-12';

type LandingSectionProps = {
  id?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'muted';
  containerClassName?: string;
};

export function LandingSection({
  id,
  children,
  className = '',
  variant = 'default',
  containerClassName = '',
}: LandingSectionProps) {
  const variantClass =
    variant === 'muted' ? 'bg-slate-50 dark:bg-slate-900/50' : '';

  return (
    <section
      id={id}
      className={`${LANDING_SECTION_SPACING} ${variantClass} scroll-mt-24 ${className}`}
    >
      <div className={`max-w-7xl mx-auto px-6 ${containerClassName}`}>{children}</div>
    </section>
  );
}

type SectionTitleProps = {
  children: React.ReactNode;
  eyebrow?: string;
  subtitle?: string;
  className?: string;
};

export function SectionTitle({ children, eyebrow, subtitle, className = '' }: SectionTitleProps) {
  return (
    <div className={`text-center mb-8 md:mb-10 ${className}`}>
      {eyebrow && (
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-[900] italic tracking-tighter text-primary leading-[1.05]">
        {children}
      </h2>
      {subtitle && (
        <p className="mt-3 text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
