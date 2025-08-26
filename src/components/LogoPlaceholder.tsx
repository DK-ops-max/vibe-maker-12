import loomiLogo from "@/assets/loomi-logo.png";

interface LogoPlaceholderProps {
  className?: string;
}

export const LogoPlaceholder = ({ className = "w-10 h-10" }: LogoPlaceholderProps) => {
  return (
    <img 
      src={loomiLogo} 
      alt="Loomi Logo" 
      className={`${className} object-contain`}
    />
  );
};