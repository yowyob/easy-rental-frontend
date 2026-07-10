/* eslint-disable @typescript-eslint/no-explicit-any */
export const StepperArea = ({ label, name, placeholder, value, onChange, icon: Icon }: any) => (
  <div className="space-y-1.5 group">
    <label className="text-[11px] font-bold  text-slate-400 tracking-wider ml-1 italic">
      {label} <span className="text-[#0528d6]">*</span>
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-4 top-4 text-slate-300 group-focus-within:text-[#0528d6] transition-colors">
          <Icon size={18} />
        </div>
      )}
      <textarea 
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={3}
        className={`w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl py-3 pr-4 ${Icon ? 'pl-11' : 'pl-4'} text-sm font-medium text-slate-700 dark:text-white outline-none focus:border-[#0528d6] transition-all shadow-sm`}
        required
      />
    </div>
  </div>
);