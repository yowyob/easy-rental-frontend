export const Button = ({ children, variant = 'primary', className = '' }: { children: React.ReactNode, variant?: 'primary' | 'secondary' | 'outline', className?: string }) => {
  const baseStyle = "px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md";
  const variants = {
    primary: "bg-orange-500 text-white hover:bg-orange-600",
    secondary: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border-2 border-white text-white hover:bg-white hover:text-blue-600"
  };
  return <button className={`${baseStyle} ${variants[variant]} ${className}`}>{children}</button>;
};