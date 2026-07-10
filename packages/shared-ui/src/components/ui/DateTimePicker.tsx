'use client';
import React, { useMemo } from 'react';

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];

type DateTimePickerProps = {
  label: string;
  value: string;
  onChange: (isoLocal: string) => void;
  required?: boolean;
};

function parseValue(value: string) {
  if (!value) {
    const now = new Date();
    return {
      date: now.toISOString().slice(0, 10),
      hour: String(now.getHours()).padStart(2, '0'),
      minute: '00',
    };
  }
  const [date, time = '00:00'] = value.split('T');
  const [hour, minute] = time.split(':');
  const snapped = MINUTES.includes(minute) ? minute : MINUTES.reduce((prev, curr) =>
    Math.abs(parseInt(curr) - parseInt(minute || '0')) < Math.abs(parseInt(prev) - parseInt(minute || '0')) ? curr : prev
  );
  return { date, hour: hour?.padStart(2, '0') ?? '00', minute: snapped };
}

export const DateTimePicker = ({ label, value, onChange, required }: DateTimePickerProps) => {
  const parts = useMemo(() => parseValue(value), [value]);

  const emit = (date: string, hour: string, minute: string) => {
    onChange(`${date}T${hour}:${minute}`);
  };

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-slate-400 uppercase italic ml-1">{label}</label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input
          type="date"
          required={required}
          value={parts.date}
          onChange={(e) => emit(e.target.value, parts.hour, parts.minute)}
          className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl font-bold text-xs outline-none focus:border-[#0528d6] dark:text-white"
        />
        <select
          value={parts.hour}
          onChange={(e) => emit(parts.date, e.target.value, parts.minute)}
          className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl font-bold text-xs outline-none focus:border-[#0528d6] dark:text-white"
          aria-label={`${label} heure`}
        >
          {HOURS.map((h) => (
            <option key={h} value={h}>{h} h</option>
          ))}
        </select>
        <select
          value={parts.minute}
          onChange={(e) => emit(parts.date, parts.hour, e.target.value)}
          className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl font-bold text-xs outline-none focus:border-[#0528d6] dark:text-white"
          aria-label={`${label} minutes`}
        >
          {MINUTES.map((m) => (
            <option key={m} value={m}>{m} min</option>
          ))}
        </select>
      </div>
    </div>
  );
};
