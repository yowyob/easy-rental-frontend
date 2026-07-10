'use client';
import React, { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  isWithinInterval, 
  parseISO,
  addMonths,
  subMonths
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Schedule {
  startDate: string;
  endDate: string;
  reason: string;
}

interface CalendarProps {
  schedules: Schedule[];
  onDatesChange?: (dates: Date[]) => void;
  selectedDates?: Date[];
}

const MyCalendar: React.FC<CalendarProps> = ({ schedules, onDatesChange, selectedDates = [] }) => {
  // État pour gérer le mois affiché
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  // Fonctions de navigation
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const isDayDisabled = (day: Date) => {
    return schedules.some(slot => 
      isWithinInterval(day, {
        start: parseISO(slot.startDate),
        end: parseISO(slot.endDate)
      }) || isSameDay(day, parseISO(slot.startDate)) || isSameDay(day, parseISO(slot.endDate))
    );
  };

  const handleDateClick = (day: Date, disabled: boolean) => {
    if (disabled) return;

    let newSelection = [...selectedDates];
    const isAlreadySelected = newSelection.find(d => isSameDay(d, day));

    if (isAlreadySelected) {
      newSelection = newSelection.filter(d => !isSameDay(d, day));
    } else {
      newSelection.push(day);
    }

    if (onDatesChange) {
      onDatesChange(newSelection);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2  tracking-wider">
          <CalendarIcon size={16} className="text-blue-600" />
          Disponibilités
        </h3>
        
        {/* Navigation entre les mois */}
        <div className="flex items-center gap-3 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
          <button 
            onClick={prevMonth}
            className="p-1 hover:bg-white rounded-md transition-colors text-gray-400 hover:text-blue-600"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-[10px] font-black text-gray-600  min-w-[100px] text-center italic">
            {format(currentMonth, 'MMMM yyyy', { locale: fr })}
          </span>
          <button 
            onClick={nextMonth}
            className="p-1 hover:bg-white rounded-md transition-colors text-gray-400 hover:text-blue-600"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 mb-2 text-center">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
          <span key={i} className="text-[10px] font-bold text-gray-400">{d}</span>
        ))}
      </div>

      {/* Grille des jours */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, i) => {
          const disabled = isDayDisabled(day);
          const isCurrentMonth = isSameDay(startOfMonth(day), monthStart);
          const isSelected = selectedDates.some(d => isSameDay(d, day));

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleDateClick(day, disabled)}
              disabled={disabled && !isSelected}
              className={`
                relative h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all
                ${!isCurrentMonth ? 'text-gray-200' : ''}
                ${isSelected 
                   ? 'bg-blue-600 text-white shadow-md z-10' 
                   : disabled 
                      ? 'bg-red-50 text-red-400 cursor-not-allowed overflow-hidden' 
                      : 'bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer'}
              `}
            >
              {format(day, 'd')}
              
              {disabled && !isSelected && (
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <div className="w-full h-[2px] bg-red-400 rotate-45"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Légende & Sélection */}
      <div className="mt-4 pt-3 border-t border-gray-50 space-y-3">
        <div className="flex justify-between items-center text-[10px]">
            <div className="flex gap-3">
              <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span> Libre
              </span>
              <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-400"></span> Occupé
              </span>
              <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span> Sélection
              </span>
            </div>
        </div>

        {/* Rappel des dates choisies */}
        {selectedDates.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
                {selectedDates.sort((a,b) => a.getTime() - b.getTime()).map((date, idx) => (
                    <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-[9px] font-bold flex items-center gap-1 border border-blue-100">
                        {format(date, 'dd MMM')}
                        <X size={10} className="cursor-pointer hover:text-red-500" onClick={() => handleDateClick(date, false)} />
                    </span>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default MyCalendar;