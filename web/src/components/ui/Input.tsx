"use client";

import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-cyber-text">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full bg-cyber-surface border rounded-xl px-4 py-3 text-cyber-text
            placeholder:text-cyber-dim focus:outline-none transition-all duration-200
            ${error ? "border-cyber-red/50 focus:border-cyber-red" : "border-cyber-border focus:border-cyber-cyan/50"}
            ${className}`}
          {...props}
        />
        {hint && !error && <p className="text-xs text-cyber-dim">{hint}</p>}
        {error && <p className="text-xs text-cyber-red">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
