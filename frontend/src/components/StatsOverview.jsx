import React from 'react';
import { Briefcase, Globe, Sparkles, Building } from 'lucide-react';

export function StatsOverview({
  totalCount,
  linkedinCount,
  gupyCount,
  cathoCount,
  remoteCount,
  hasResumeData,
  averageMatch,
  loading
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-zinc-900/40 border border-zinc-800/80 animate-pulse p-3 flex flex-col justify-between">
            <div className="h-3 w-16 bg-zinc-800 rounded"></div>
            <div className="h-5 w-10 bg-zinc-800 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* Metric 1: Total Jobs */}
      <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
            Vagas Tech Ativas
          </span>
          <span className="text-xl font-extrabold text-zinc-100 font-mono mt-0.5 block">
            {totalCount}
          </span>
        </div>
        <div className="h-8 w-8 rounded-lg bg-zinc-800/60 flex items-center justify-center text-zinc-400">
          <Briefcase className="h-4 w-4" />
        </div>
      </div>

      {/* Metric 2: Remote Jobs */}
      <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
            Trabalho Remoto
          </span>
          <span className="text-xl font-extrabold text-emerald-400 font-mono mt-0.5 block">
            {remoteCount}
          </span>
        </div>
        <div className="h-8 w-8 rounded-lg bg-emerald-950/40 border border-emerald-800/30 flex items-center justify-center text-emerald-400">
          <Globe className="h-4 w-4" />
        </div>
      </div>

      {/* Metric 3: Platform Breakdown */}
      <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
            Fontes Ativas
          </span>
          <div className="flex items-center gap-1.5 mt-1 font-mono text-xs text-zinc-300">
            <span title="LinkedIn" className="text-sky-400 font-semibold">{linkedinCount} <span className="text-zinc-600 font-normal">in</span></span>
            <span className="text-zinc-700">•</span>
            <span title="Gupy" className="text-emerald-400 font-semibold">{gupyCount} <span className="text-zinc-600 font-normal">gp</span></span>
            <span className="text-zinc-700">•</span>
            <span title="Catho" className="text-rose-400 font-semibold">{cathoCount} <span className="text-zinc-600 font-normal">ct</span></span>
          </div>
        </div>
        <div className="h-8 w-8 rounded-lg bg-zinc-800/60 flex items-center justify-center text-zinc-400">
          <Building className="h-4 w-4" />
        </div>
      </div>

      {/* Metric 4: Match average or status */}
      <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
            {hasResumeData ? 'Média de Match' : 'Status do Agregador'}
          </span>
          <span className="text-xl font-extrabold text-zinc-100 font-mono mt-0.5 block">
            {hasResumeData ? `${averageMatch}%` : 'Online'}
          </span>
        </div>
        <div className="h-8 w-8 rounded-lg bg-zinc-800/60 flex items-center justify-center text-zinc-400">
          <Sparkles className="h-4 w-4 text-zinc-400" />
        </div>
      </div>
    </div>
  );
}
