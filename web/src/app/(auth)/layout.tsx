export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full overflow-y-auto grid-bg flex flex-col items-center justify-center p-6">
      {/* Neon grid + radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl bg-cyber-cyan" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl bg-cyber-magenta" />
      </div>
      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-3 animate-float">🦆</div>
          <h1 className="text-3xl font-bold tracking-tight text-cyber-text">
            Cyber<span className="text-cyber-cyan">Duck</span>
          </h1>
          <p className="text-cyber-dim text-sm mt-1">Build habits. Gear your duck. Own the city.</p>
        </div>
        {children}
      </div>
    </div>
  );
}
