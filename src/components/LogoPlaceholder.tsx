const loomiLogo = "/lovable-uploads/515e3055-0b4a-4c92-94cd-6382070e77e0.png";

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