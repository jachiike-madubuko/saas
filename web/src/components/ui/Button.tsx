"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, disabled, className = "", children, ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 select-none";

    const variants = {
      primary: "bg-cyber-cyan text-cyber-bg hover:shadow-neon-cyan",
      secondary: "bg-cyber-surface border border-cyber-border text-cyber-text hover:border-cyber-cyan/40",
      ghost: "text-cyber-dim hover:text-cyber-text hover:bg-cyber-surface",
      danger: "bg-cyber-red/20 border border-cyber-red/40 text-cyber-red hover:bg-cyber-red/30",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-5 py-2.5 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {children}
          </span>
        ) : children}
      </button>
    );
  }
);

Button.displayName = "Button";
