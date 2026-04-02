import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  hover?: boolean;
}

export default function Card({ children, className, glow, hover }: CardProps) {
  return (
    <div
      className={cn(
        "glass",
        hover && "glass-hover cursor-pointer",
        glow && "amber-glow",
        className
      )}
    >
      {children}
    </div>
  );
}
