import React from 'react';
import { MapPin, ExternalLink, Bookmark, Copy, Check, Eye } from 'lucide-react';

function getInitials(name) {
  if (!name) return 'V';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getPlatformBadge(platform) {
  switch (platform) {
    case 'LinkedIn':
      return { dot: 'bg-sky-500', text: 'text-sky-400', border: 'border-sky-500/20', bg: 'bg-sky-500/5' };
    case 'Gupy':
      return { dot: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5' };
    case 'Catho':
      return { dot: 'bg-rose-500', text: 'text-rose-400', border: 'border-rose-500/20', bg: 'bg-rose-500/5' };
    default:
      return { dot: 'bg-zinc-500', text: 'text-zinc-400', border: 'border-zinc-500/20', bg: 'bg-zinc-500/5' };
  }
}

export function JobCard({
  vaga,
  isSaved,
  onToggleSave,
  onOpenDetails,
  onCopyLink,
  copiedId
}) {
  const pBadge = getPlatformBadge(vaga.plataforma);
  const isRemote = (vaga.localizacao || '').toLowerCase().includes('remoto');
  const isCopied = copiedId === vaga.link;

  return (
    <div className="group relative bg-zinc-900/40 hover:bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700/90 rounded-xl p-5 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-md">
      <div>
        {/* Top Bar: Company info + Platform badge + Actions */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center font-bold text-xs text-zinc-300 shrink-0 font-mono">
              {getInitials(vaga.empresa)}
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-semibold text-zinc-300 truncate" title={vaga.empresa}>
                {vaga.empresa || 'Empresa Confidencial'}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.2 rounded border ${pBadge.bg} ${pBadge.border} ${pBadge.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${pBadge.dot}`}></span>
                  {vaga.plataforma}
                </span>
                {isRemote && (
                  <span className="text-[10px] font-medium text-emerald-400/90 bg-emerald-950/40 border border-emerald-800/40 px-1.5 py-0.2 rounded">
                    Remoto
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions (Save & Copy) */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onCopyLink(vaga.link)}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/80 transition-colors cursor-pointer"
              title="Copiar link"
            >
              {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => onToggleSave(vaga)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isSaved
                  ? 'text-amber-400 bg-amber-400/10'
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/80'
              }`}
              title={isSaved ? 'Remover dos favoritos' : 'Salvar vaga'}
            >
              <Bookmark className={`h-3.5 w-3.5 ${isSaved ? 'fill-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Job Title */}
        <h3
          onClick={() => onOpenDetails(vaga)}
          className="text-sm sm:text-base font-bold text-zinc-100 group-hover:text-white transition-colors cursor-pointer line-clamp-2 leading-snug mb-2"
          title={vaga.titulo}
        >
          {vaga.titulo}
        </h3>

        {/* Location & Salary Chips */}
        <div className="flex flex-wrap items-center gap-2 mb-3 text-xs text-zinc-400">
          <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400">
            <MapPin className="h-3 w-3 text-zinc-500 shrink-0" />
            <span className="truncate max-w-[180px]">{vaga.localizacao || 'Brasil'}</span>
          </span>
          {vaga.salario && vaga.salario !== 'A combinar' && (
            <span className="text-[11px] font-mono text-zinc-300 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
              {vaga.salario}
            </span>
          )}
        </div>

        {/* Match Percentage Badge & Matching Skills (if calculated) */}
        {vaga.match && vaga.match.score > 0 && (
          <div className="mb-3 p-2 rounded-lg bg-zinc-950/80 border border-zinc-800/80">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="text-zinc-400 font-medium">Compatibilidade:</span>
              <span className={`font-semibold font-mono text-xs ${
                vaga.match.score >= 70
                  ? 'text-emerald-400'
                  : vaga.match.score >= 40
                  ? 'text-amber-400'
                  : 'text-zinc-400'
              }`}>
                {vaga.match.score}%
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  vaga.match.score >= 70
                    ? 'bg-emerald-500'
                    : vaga.match.score >= 40
                    ? 'bg-amber-500'
                    : 'bg-zinc-500'
                }`}
                style={{ width: `${vaga.match.score}%` }}
              ></div>
            </div>
            {/* Matched skills pill chips */}
            {vaga.match.matched && vaga.match.matched.length > 0 && (
              <div className="flex flex-wrap items-center gap-1">
                {vaga.match.matched.slice(0, 4).map((sk, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium text-emerald-300 bg-emerald-950/40 border border-emerald-800/30 px-1.5 py-0.2 rounded"
                  >
                    {sk}
                  </span>
                ))}
                {vaga.match.matched.length > 4 && (
                  <span className="text-[10px] text-zinc-500 font-mono">
                    +{vaga.match.matched.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Short Description */}
        <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed mb-4">
          {vaga.descricao || 'Consulte os requisitos completos na página original da vaga.'}
        </p>
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between gap-2 mt-auto">
        <button
          type="button"
          onClick={() => onOpenDetails(vaga)}
          className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 py-1.5 px-2 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Prévia</span>
        </button>

        <a
          href={vaga.link || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 hover:bg-white text-zinc-950 transition-all cursor-pointer shadow-sm"
        >
          <span>Acessar Vaga</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
