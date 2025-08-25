import { Music } from "lucide-react";

interface LogoPlaceholderProps {
  className?: string;
}

export const LogoPlaceholder = ({ className = "w-10 h-10" }: LogoPlaceholderProps) => {
  return (
    <div className={`rounded-full bg-gradient-primary flex items-center justify-center ${className}`}>
      <Music className="w-6 h-6 text-white" />
    </div>
  );
};