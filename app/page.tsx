import React from 'react';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-8 text-center">
      <div className="max-w-3xl space-y-6">
        <span className="inline-block px-4 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-sm font-semibold tracking-wide">
          Initiative 4057
        </span>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          T57 Platform
        </h1>
        <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Sovereign-Grade Infrastructure for Global Trade & Food Security.
        </p>
        <div className="pt-4 flex justify-center gap-4">
          <a
            href="#contact"
            className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all shadow-lg shadow-blue-500/25"
          >
            Access Platform
          </a>
        </div>
      </div>
    </main>
  );
}
