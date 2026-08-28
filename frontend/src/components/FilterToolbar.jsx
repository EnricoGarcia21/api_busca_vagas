import React from 'react';
import { Search, LayoutGrid, List, SlidersHorizontal, Globe } from 'lucide-react';

export function FilterToolbar({
  selectedPlatform,
  setSelectedPlatform,
  counts,
  localSearch,
  setLocalSearch,
  remoteOnly,
  setRemoteOnly,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  hasResumeData
}) {
  return (
    <div className="w-full bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
      {/* Left: Platform Tabs & Remote Toggle */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Platform tabs */}
        <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800/80">
          <button
            type="button"
            onClick={() => setSelectedPlatform('All')}
            className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedPlatform === 'All'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Todas</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-900 text-zinc-400 font-mono">
              {counts.total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedPlatform('LinkedIn')}
            className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedPlatform === 'LinkedIn'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-sky-500"></span>
            <span>LinkedIn</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-900 text-zinc-400 font-mono">
              {counts.linkedin}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedPlatform('Gupy')}
            className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedPlatform === 'Gupy'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>Gupy</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-900 text-zinc-400 font-mono">
              {counts.gupy}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedPlatform('Catho')}
            className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedPlatform === 'Catho'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-rose-500"></span>
            <span>Catho</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-900 text-zinc-400 font-mono">
              {counts.catho}
            </span>
          </button>
        </div>

        {/* Remote Only Toggle */}
        <button
          type="button"
          onClick={() => setRemoteOnly(!remoteOnly)}
          className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
            remoteOnly
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : 'bg-zinc-950/60 hover:bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Globe className="h-3.5 w-3.5" />
          <span>Apenas Remoto</span>
        </button>
      </div>

      {/* Right: Local Filter, Sort & View Mode */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Local Text Filter */}
        <div className="relative flex-1 sm:w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Filtrar nesta lista..."
            className="w-full pl-8 pr-3 py-1.5 bg-zinc-950/80 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
          />
        </div>

        {/* Sort Select */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 rounded-lg py-1.5 pl-3 pr-7 text-xs text-zinc-300 font-medium focus:outline-none cursor-pointer"
          >
            <option value="default">Ordenação padrão</option>
            {hasResumeData && <option value="match">Maior Match (%)</option>}
            <option value="title">Título (A-Z)</option>
            <option value="company">Empresa (A-Z)</option>
          </select>
          <SlidersHorizontal className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-500 pointer-events-none" />
        </div>

        {/* View Mode Toggle (Grid vs List) */}
        <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800/80">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-1 rounded-md transition-colors cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title="Visualização em Grade"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`p-1 rounded-md transition-colors cursor-pointer ${
              viewMode === 'list'
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title="Visualização em Lista Compacta"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
