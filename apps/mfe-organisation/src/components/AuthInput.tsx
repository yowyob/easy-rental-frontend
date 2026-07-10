'use client';
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface AuthInputProps {
  icon: React.ReactNode;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  label: string;
}

export const AuthInput = ({ icon, type = "text", placeholder, value, onChange, label }: AuthInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="space-y-1.5 group w-full">
      <label className="text-[11px] font-bold text-slate-400 tracking-widest ml-1 italic transition-colors group-focus-within:text-[#0528d6]">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0528d6] transition-colors">
          {React.cloneElement(icon as React.ReactElement, { size: 20 })}
        </div>
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl pl-12 ${isPassword ? 'pr-12' : 'pr-4'} py-3.5 text-sm font-medium text-slate-700 dark:text-white outline-none focus:bg-white dark:focus:bg-[#0f1323] focus:border-[#0528d6] transition-all shadow-sm`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#0528d6] transition-colors"
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};
