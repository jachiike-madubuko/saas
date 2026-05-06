import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  neon?: "cyan" | "magenta" | "amber" | "green" | "violet";
}

export function Card({ neon, className = "", children, ...props }: CardProps) {
  const neonStyles = {
    cyan: "border-cyber-cyan/30 shadow-[inset_0_0_10px_rgba(0,245,255,0.05)]",
    magenta: "border-cyber-magenta/30 shadow-[inset_0_0_10px_rgba(255,0,200,0.05)]",
    amber: "border-cyber-amber/30 shadow-[inset_0_0_10px_rgba(255,184,0,0.05)]",
    green: "border-cyber-green/30 shadow-[inset_0_0_10px_rgba(57,255,20,0.05)]",
    violet: "border-cyber-violet/30 shadow-[inset_0_0_10px_rgba(139,92,246,0.05)]",
  };

  return (
    <div
      className={`bg-cyber-card rounded-2xl border ${neon ? neonStyles[neon] : "border-cyber-border"} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
