/* eslint-disable @typescript-eslint/no-explicit-any */
export const StepperInput = ({
  label, name, placeholder, value, onChange, type = "text",
  icon: Icon, required = true,
  pattern, title, inputMode, maxLength
}: any) => (
  <div className="space-y-1.5 group">
    <label className="text-[11px] font-bold  text-slate-400 dark:text-slate-500 tracking-wider ml-1 flex justify-between italic">
      <span>{label}</span>
      {required && <span className="text-[#0528d6]">*</span>}
    </label>
    <div className="relative group">
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0528d6] transition-colors">
          <Icon size={18} />
        </div>
      )}
      <input 
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        pattern={pattern}
        title={title}
        inputMode={inputMode}
        maxLength={maxLength}
        className={`w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl py-3 pr-4 ${Icon ? 'pl-11' : 'pl-4'} text-sm font-medium text-slate-700 dark:text-white outline-none focus:border-[#0528d6] transition-all shadow-sm valid:border-slate-100 invalid:border-red-200`}
        required={required}
      />
    </div>
    {placeholder && (
      <p className="text-[9px] text-slate-400 italic ml-1">ex: {placeholder}</p>
    )}
  </div>
);