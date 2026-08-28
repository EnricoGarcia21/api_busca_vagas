import React, { useRef, useEffect } from 'react';
import { Search, MapPin, RefreshCw, X, ArrowRight } from 'lucide-react';

const QUICK_TAGS = [
  { label: 'Remoto', loc: 'Remoto' },
  { label: 'React', key: 'React' },
  { label: 'Node.js', key: 'Node.js' },
  { label: 'Frontend', key: 'Frontend' },
  { label: 'Backend', key: 'Backend' },
  { label: 'Full Stack', key: 'Full Stack' },
  { label: 'Python', key: 'Python' },
  { label: 'Tech Lead', key: 'Tech Lead' },
  { label: 'Júnior', key: 'Júnior' },
  { label: 'Sênior', key: 'Sênior' }
];

export function SearchBar({
  keyword,
  setKeyword,
  location,
  setLocation,
  onSearch,
  loading,
  recentSearches,
  onSelectRecent,
  onClearRecent
}) {
  const keywordInputRef = useRef(null);

  // Keyboard shortcut: Press '/' to focus keyword input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== keywordInputRef.current && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        keywordInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(keyword, location);
  };

  const handleQuickTag = (tag) => {
    let nextKey = keyword;
    let nextLoc = location;

    if (tag.key) {
      nextKey = tag.key;
      setKeyword(tag.key);
    }
    if (tag.loc) {
      nextLoc = tag.loc;
      setLocation(tag.loc);
    }
    onSearch(nextKey, nextLoc);
  };

  return (
    <div className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 shadow-sm">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
        {/* Keyword Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
          <input
            ref={keywordInputRef}
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Cargo, stack ou tecnologia (ex: React, Python, DevOps, Dados...)"
            className="w-full pl-10 pr-9 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all"
            required
          />
          {keyword && (
            <button
              type="button"
              onClick={() => setKeyword('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-0.5 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Location Input */}
        <div className="w-full md:w-64 relative">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Localização (ex: Remoto, Brasil, SP)"
            className="w-full pl-10 pr-9 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all"
          />
          {location && (
            <button
              type="button"
              onClick={() => setLocation('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-0.5 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="bg-zinc-100 hover:bg-white text-zinc-950 font-semibold px-5 py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-sm"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin text-zinc-900" />
              <span>Buscando...</span>
            </>
          ) : (
            <>
              <span>Buscar Vagas</span>
              <ArrowRight className="h-4 w-4 text-zinc-900" />
            </>
          )}
        </button>
      </form>

      {/* Quick Tags & Recents */}
      <div className="mt-3.5 pt-3 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mr-1">
            Sugestões:
          </span>
          {QUICK_TAGS.map((tag, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickTag(tag)}
              className="px-2 py-0.5 rounded-md bg-zinc-950/60 hover:bg-zinc-800 border border-zinc-800/80 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 text-[11px] font-medium transition-colors cursor-pointer"
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* Recent Searches */}
        {recentSearches && recentSearches.length > 0 && (
          <div className="flex items-center gap-1.5 text-zinc-500 text-[11px]">
            <span>Recentes:</span>
            <div className="flex items-center gap-1 flex-wrap">
              {recentSearches.slice(0, 3).map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectRecent(item)}
                  className="text-zinc-400 hover:text-zinc-200 underline decoration-zinc-700 hover:decoration-zinc-400 cursor-pointer"
                >
                  {item.keyword}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onClearRecent}
              className="text-zinc-500 hover:text-rose-400 ml-1 cursor-pointer"
              title="Limpar histórico"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
