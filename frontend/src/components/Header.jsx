import React from 'react';
import { Compass, FileText, Bookmark, CheckCircle2 } from 'lucide-react';

export function Header({
  savedJobsCount,
  showSavedOnly,
  onToggleSavedOnly,
  resumeData,
  onOpenProfileModal
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-100 shadow-sm">
            <Compass className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-zinc-100">
                Radar Vagas Tech
              </span>
              <span className="hidden sm:inline-flex text-[10px] uppercase font-semibold tracking-wider text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-1.5 py-0.5 rounded">
                100% TI & Software
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-zinc-500 font-medium leading-none mt-0.5">
              LinkedIn • Gupy • Catho
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Saved Jobs Toggle Button */}
          <button
            type="button"
            onClick={onToggleSavedOnly}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
              showSavedOnly
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-zinc-900/80 hover:bg-zinc-800 border-zinc-800 text-zinc-300 hover:text-zinc-100'
            }`}
            title="Ver vagas favoritadas"
          >
            <Bookmark className={`h-3.5 w-3.5 ${showSavedOnly ? 'fill-amber-400 text-amber-400' : 'text-zinc-400'}`} />
            <span>Salvas</span>
            {savedJobsCount > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                showSavedOnly ? 'bg-amber-400/20 text-amber-200' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {savedJobsCount}
              </span>
            )}
          </button>

          {/* Profile & Resume Matching Button */}
          <button
            type="button"
            onClick={onOpenProfileModal}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
              resumeData
                ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300 hover:bg-emerald-950/60'
                : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-200 hover:border-zinc-700'
            }`}
          >
            {resumeData ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Perfil Ativo:</span>
                <span className="font-semibold">{resumeData.skills?.length || 0} skills</span>
              </>
            ) : (
              <>
                <FileText className="h-3.5 w-3.5 text-zinc-400" />
                <span>Compatibilidade de CV</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
