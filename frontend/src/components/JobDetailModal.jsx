import React from 'react';
import { X, ExternalLink, MapPin, Building2, DollarSign, Bookmark, Copy, Check, ShieldCheck } from 'lucide-react';

function getInitials(name) {
  if (!name) return 'V';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function JobDetailModal({
  vaga,
  isOpen,
  onClose,
  isSaved,
  onToggleSave,
  onCopyLink,
  copiedId
}) {
  if (!isOpen || !vaga) return null;

  const isCopied = copiedId === vaga.link;
  const isRemote = (vaga.localizacao || '').toLowerCase().includes('remoto');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="h-11 w-11 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-sm text-zinc-200 shrink-0 font-mono">
              {getInitials(vaga.empresa)}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-zinc-400 block truncate">
                {vaga.empresa || 'Empresa Confidencial'}
              </span>
              <h2 className="text-lg font-bold text-zinc-100 leading-snug mt-0.5" title={vaga.titulo}>
                {vaga.titulo}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Metadata badges row */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300">
              <Building2 className="h-3.5 w-3.5 text-zinc-500" />
              <span>Plataforma: {vaga.plataforma}</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300">
              <MapPin className="h-3.5 w-3.5 text-zinc-500" />
              <span>{vaga.localizacao || 'Brasil'}</span>
            </span>

            {isRemote && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/50 border border-emerald-800/40 text-emerald-300 font-medium">
                100% Remoto
              </span>
            )}

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300">
              <DollarSign className="h-3.5 w-3.5 text-zinc-500" />
              <span>{vaga.salario || 'A combinar'}</span>
            </span>
          </div>

          {/* Match Score info (if available) */}
          {vaga.match && vaga.match.score > 0 && (
            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Correspondência com seu perfil:
                </span>
                <span className="font-bold font-mono text-emerald-400 text-sm">
                  {vaga.match.score}%
                </span>
              </div>
              {vaga.match.matched && vaga.match.matched.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-zinc-500">Skills identificadas:</span>
                  {vaga.match.matched.map((sk, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs font-medium"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Description Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Descrição da Oportunidade
            </h4>
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line font-sans">
              {vaga.descricao || 'Detalhes adicionais podem ser visualizados diretamente na página da vaga na plataforma parceira.'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onCopyLink(vaga.link)}
              className="px-3 py-2 rounded-xl text-xs font-medium border border-zinc-800 hover:bg-zinc-800 text-zinc-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{isCopied ? 'Copiado' : 'Copiar Link'}</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleSave(vaga)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${
                isSaved
                  ? 'bg-amber-400/10 border-amber-400/30 text-amber-300'
                  : 'border-zinc-800 hover:bg-zinc-800 text-zinc-300'
              }`}
            >
              <Bookmark className={`h-3.5 w-3.5 ${isSaved ? 'fill-amber-400' : ''}`} />
              <span>{isSaved ? 'Salva nos favoritos' : 'Salvar'}</span>
            </button>
          </div>

          <a
            href={vaga.link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-white text-zinc-950 transition-all flex items-center gap-2 cursor-pointer shadow-sm ml-auto"
          >
            <span>Candidatar-se no {vaga.plataforma}</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
