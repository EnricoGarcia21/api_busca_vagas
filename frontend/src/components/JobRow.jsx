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

export function JobRow({
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
    <div className="group bg-zinc-900/30 hover:bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700/80 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all">
      {/* Left: Avatar + Title + Company */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="h-9 w-9 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center font-bold text-xs text-zinc-300 shrink-0 font-mono">
          {getInitials(vaga.empresa)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              onClick={() => onOpenDetails(vaga)}
              className="text-sm font-semibold text-zinc-100 group-hover:text-white cursor-pointer hover:underline truncate"
              title={vaga.titulo}
            >
              {vaga.titulo}
            </h3>
            {vaga.match && vaga.match.score > 0 && (
              <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded border ${
                vaga.match.score >= 70
                  ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/40'
                  : vaga.match.score >= 40
                  ? 'bg-amber-950/50 text-amber-300 border-amber-800/40'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}>
                {vaga.match.score}% match
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 truncate mt-0.5" title={vaga.empresa}>
            {vaga.empresa || 'Empresa Confidencial'}
          </p>
        </div>
      </div>

      {/* Center: Location + Platform */}
      <div className="flex items-center gap-3 shrink-0 text-xs text-zinc-400 pl-12 md:pl-0">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3 text-zinc-500" />
          <span className="truncate max-w-[130px]">{vaga.localizacao || 'Brasil'}</span>
          {isRemote && (
            <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/30 px-1 py-0.2 rounded">
              Remoto
            </span>
          )}
        </div>

        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded border ${pBadge.bg} ${pBadge.border} ${pBadge.text}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${pBadge.dot}`}></span>
          {vaga.plataforma}
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0 justify-end pt-2 md:pt-0 border-t md:border-t-0 border-zinc-800/60">
        <button
          type="button"
          onClick={() => onCopyLink(vaga.link)}
          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
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
              : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
          title={isSaved ? 'Remover dos favoritos' : 'Salvar vaga'}
        >
          <Bookmark className={`h-3.5 w-3.5 ${isSaved ? 'fill-amber-400' : ''}`} />
        </button>

        <button
          type="button"
          onClick={() => onOpenDetails(vaga)}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Ver prévia"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>

        <a
          href={vaga.link || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 hover:bg-white text-zinc-950 transition-all cursor-pointer"
        >
          <span>Abrir</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
