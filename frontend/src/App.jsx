import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AlertCircle, FilterX } from 'lucide-react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { FilterToolbar } from './components/FilterToolbar';
import { JobCard } from './components/JobCard';
import { JobRow } from './components/JobRow';
import { ProfileModal } from './components/ProfileModal';
import { JobDetailModal } from './components/JobDetailModal';
import { StatsOverview } from './components/StatsOverview';
import { Toast } from './components/Toast';

export function App() {
  const [vagas, setVagas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search parameters
  const [keyword, setKeyword] = useState('desenvolvedor');
  const [location, setLocation] = useState('Brasil');

  // Client-side filters & view
  const [localSearch, setLocalSearch] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Saved Jobs & History
  const [savedJobs, setSavedJobs] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);

  // Resume / Profile Match State
  const [resumeData, setResumeData] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Job Detail Modal State
  const [selectedJobForDetail, setSelectedJobForDetail] = useState(null);

  // Feedback Toast & Copied State
  const [toast, setToast] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedSearchesData = localStorage.getItem('recentSearches');
      if (savedSearchesData) {
        setRecentSearches(JSON.parse(savedSearchesData));
      }

      const savedResumeData = localStorage.getItem('resumeAgentData');
      if (savedResumeData) {
        setResumeData(JSON.parse(savedResumeData));
      }

      const savedJobsData = localStorage.getItem('savedJobs');
      if (savedJobsData) {
        setSavedJobs(JSON.parse(savedJobsData));
      }

      const savedViewMode = localStorage.getItem('jobRadarViewMode');
      if (savedViewMode) {
        setViewMode(savedViewMode);
      }
    } catch (e) {
      console.error('Falha ao restaurar dados do localStorage:', e);
    }

    // Initial search
    buscarVagas('desenvolvedor', 'Brasil');
  }, []);

  const buscarVagas = async (searchKey = keyword, searchLoc = location) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/vagas?keyword=${encodeURIComponent(searchKey)}&location=${encodeURIComponent(searchLoc)}`
      );

      if (!res.ok) {
        throw new Error('Falha ao conectar com o servidor de busca.');
      }

      const data = await res.json();
      setVagas(data);

      // Save to recent searches
      const searchItem = { keyword: searchKey, location: searchLoc };
      setRecentSearches(prev => {
        const filtered = prev.filter(
          x => !(x.keyword.toLowerCase() === searchKey.toLowerCase() && x.location.toLowerCase() === searchLoc.toLowerCase())
        );
        const updated = [searchItem, ...filtered].slice(0, 6);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erro inesperado ao buscar vagas.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRecent = (item) => {
    setKeyword(item.keyword);
    setLocation(item.location);
    buscarVagas(item.keyword, item.location);
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  // Resume profile handling
  const handleSaveResumeData = (data) => {
    setResumeData(data);
    localStorage.setItem('resumeAgentData', JSON.stringify(data));
    showToast('Perfil profissional atualizado com sucesso!', 'success');
  };

  const handleClearResumeData = () => {
    setResumeData(null);
    localStorage.removeItem('resumeAgentData');
    showToast('Perfil removido.', 'info');
  };

  // Bookmark / Save jobs handling
  const handleToggleSaveJob = (vaga) => {
    const key = vaga.link || `${vaga.titulo}_${vaga.empresa}`;
    const exists = savedJobs.some(j => (j.link || `${j.titulo}_${j.empresa}`) === key);

    let updated;
    if (exists) {
      updated = savedJobs.filter(j => (j.link || `${j.titulo}_${j.empresa}`) !== key);
      showToast('Vaga removida dos favoritos.', 'info');
    } else {
      updated = [vaga, ...savedJobs];
      showToast('Vaga salva nos favoritos!', 'success');
    }
    setSavedJobs(updated);
    localStorage.setItem('savedJobs', JSON.stringify(updated));
  };

  // Copy link handling
  const handleCopyLink = async (link) => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(link);
      showToast('Link copiado para a área de transferência!', 'success');
      setTimeout(() => setCopiedId(null), 2500);
    } catch (err) {
      console.error(err);
      showToast('Falha ao copiar link.', 'error');
    }
  };

  const handleChangeViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('jobRadarViewMode', mode);
  };

  // Match score calculation
  const calculateMatch = useCallback((vaga) => {
    if (!resumeData || !resumeData.skills || resumeData.skills.length === 0) {
      return null;
    }

    const textToSearch = `${vaga.titulo || ''} ${vaga.descricao || ''}`.toLowerCase();
    const matched = resumeData.skills.filter(skill => {
      const clean = skill.toLowerCase().trim();
      if (!clean) return false;
      return textToSearch.includes(clean);
    });

    const normalizer = Math.min(resumeData.skills.length, 4);
    const score = normalizer > 0 ? Math.min(Math.round((matched.length / normalizer) * 100), 100) : 0;

    return { score, matched };
  }, [resumeData]);

  // Compute processed and filtered jobs
  const processedVagas = useMemo(() => {
    let list = showSavedOnly ? savedJobs : vagas;

    // Attach match score
    list = list.map(v => ({
      ...v,
      match: calculateMatch(v)
    }));

    // Filter by platform
    if (selectedPlatform !== 'All') {
      list = list.filter(v => v.plataforma === selectedPlatform);
    }

    // Filter by remote
    if (remoteOnly) {
      list = list.filter(v => (v.localizacao || '').toLowerCase().includes('remoto'));
    }

    // Filter by text search
    if (localSearch.trim()) {
      const q = localSearch.toLowerCase().trim();
      list = list.filter(v =>
        (v.titulo || '').toLowerCase().includes(q) ||
        (v.empresa || '').toLowerCase().includes(q) ||
        (v.localizacao || '').toLowerCase().includes(q)
      );
    }

    // Sort list
    list.sort((a, b) => {
      if (sortBy === 'match' && a.match && b.match) {
        return b.match.score - a.match.score;
      }
      if (sortBy === 'title') {
        return (a.titulo || '').localeCompare(b.titulo || '');
      }
      if (sortBy === 'company') {
        return (a.empresa || '').localeCompare(b.empresa || '');
      }
      return 0;
    });

    return list;
  }, [vagas, savedJobs, showSavedOnly, selectedPlatform, remoteOnly, localSearch, sortBy, calculateMatch]);

  // Counts for tabs and overview
  const baseListForCounts = showSavedOnly ? savedJobs : vagas;
  const counts = {
    total: baseListForCounts.length,
    linkedin: baseListForCounts.filter(v => v.plataforma === 'LinkedIn').length,
    gupy: baseListForCounts.filter(v => v.plataforma === 'Gupy').length,
    catho: baseListForCounts.filter(v => v.plataforma === 'Catho').length,
    remote: baseListForCounts.filter(v => (v.localizacao || '').toLowerCase().includes('remoto')).length
  };

  const averageMatch = useMemo(() => {
    if (!resumeData || processedVagas.length === 0) return 0;
    const scores = processedVagas.map(v => v.match?.score || 0);
    const sum = scores.reduce((acc, val) => acc + val, 0);
    return Math.round(sum / scores.length);
  }, [resumeData, processedVagas]);

  const isJobSaved = useCallback((vaga) => {
    const key = vaga.link || `${vaga.titulo}_${vaga.empresa}`;
    return savedJobs.some(j => (j.link || `${j.titulo}_${j.empresa}`) === key);
  }, [savedJobs]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col antialiased">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Main Top Header */}
      <Header
        savedJobsCount={savedJobs.length}
        showSavedOnly={showSavedOnly}
        onToggleSavedOnly={() => setShowSavedOnly(!showSavedOnly)}
        resumeData={resumeData}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Search Command Bar (Hidden if showing saved only, unless toggled) */}
        {!showSavedOnly ? (
          <SearchBar
            keyword={keyword}
            setKeyword={setKeyword}
            location={location}
            setLocation={setLocation}
            onSearch={buscarVagas}
            loading={loading}
            recentSearches={recentSearches}
            onSelectRecent={handleSelectRecent}
            onClearRecent={handleClearRecent}
          />
        ) : (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-amber-300">
              <span className="font-semibold">Modo Favoritos:</span>
              <span>Exibindo {savedJobs.length} vagas salvas no seu navegador.</span>
            </div>
            <button
              type="button"
              onClick={() => setShowSavedOnly(false)}
              className="text-xs text-amber-400 hover:text-amber-200 underline font-medium cursor-pointer"
            >
              Voltar à busca geral
            </button>
          </div>
        )}

        {/* Stats Overview */}
        <StatsOverview
          totalCount={counts.total}
          linkedinCount={counts.linkedin}
          gupyCount={counts.gupy}
          cathoCount={counts.catho}
          remoteCount={counts.remote}
          hasResumeData={Boolean(resumeData)}
          averageMatch={averageMatch}
          loading={loading}
        />

        {/* Filter and View Mode Toolbar */}
        <FilterToolbar
          selectedPlatform={selectedPlatform}
          setSelectedPlatform={setSelectedPlatform}
          counts={counts}
          localSearch={localSearch}
          setLocalSearch={setLocalSearch}
          remoteOnly={remoteOnly}
          setRemoteOnly={setRemoteOnly}
          sortBy={sortBy}
          setSortBy={setSortBy}
          viewMode={viewMode}
          setViewMode={handleChangeViewMode}
          hasResumeData={Boolean(resumeData)}
        />

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-rose-400" />
            <div className="flex-1">
              <span className="font-semibold block text-sm text-rose-200">Erro na busca de vagas</span>
              <p className="mt-0.5 text-rose-300/90">{error}</p>
              <button
                type="button"
                onClick={() => buscarVagas(keyword, location)}
                className="mt-2 text-xs font-semibold text-rose-200 underline hover:text-white cursor-pointer"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        )}

        {/* Results Container */}
        {loading ? (
          /* Skeletons */
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-56 rounded-xl bg-zinc-900/40 border border-zinc-800/80 p-5 flex flex-col justify-between animate-pulse">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-24 bg-zinc-800 rounded"></div>
                      <div className="h-4 w-16 bg-zinc-800 rounded"></div>
                    </div>
                    <div className="h-5 w-3/4 bg-zinc-800 rounded"></div>
                    <div className="h-3 w-full bg-zinc-800 rounded"></div>
                    <div className="h-3 w-5/6 bg-zinc-800 rounded"></div>
                  </div>
                  <div className="h-8 w-full bg-zinc-800/60 rounded-lg mt-4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-zinc-900/40 border border-zinc-800/80 p-3 flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-zinc-800"></div>
                    <div className="space-y-1.5">
                      <div className="h-4 w-48 bg-zinc-800 rounded"></div>
                      <div className="h-3 w-28 bg-zinc-800 rounded"></div>
                    </div>
                  </div>
                  <div className="h-8 w-24 bg-zinc-800 rounded"></div>
                </div>
              ))}
            </div>
          )
        ) : processedVagas.length > 0 ? (
          /* Rendered Jobs */
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {processedVagas.map((vaga, idx) => (
                <JobCard
                  key={idx}
                  vaga={vaga}
                  isSaved={isJobSaved(vaga)}
                  onToggleSave={handleToggleSaveJob}
                  onOpenDetails={(v) => setSelectedJobForDetail(v)}
                  onCopyLink={handleCopyLink}
                  copiedId={copiedId}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {processedVagas.map((vaga, idx) => (
                <JobRow
                  key={idx}
                  vaga={vaga}
                  isSaved={isJobSaved(vaga)}
                  onToggleSave={handleToggleSaveJob}
                  onOpenDetails={(v) => setSelectedJobForDetail(v)}
                  onCopyLink={handleCopyLink}
                  copiedId={copiedId}
                />
              ))}
            </div>
          )
        ) : (
          /* Empty State */
          <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20">
            <div className="h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-3 text-zinc-500">
              <FilterX className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-200">
              Nenhuma vaga encontrada para os filtros atuais
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
              Tente redefinir o termo de busca local, mudar a plataforma ou pesquisar por outro cargo.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              {localSearch && (
                <button
                  type="button"
                  onClick={() => setLocalSearch('')}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium cursor-pointer"
                >
                  Limpar filtro de texto
                </button>
              )}
              {selectedPlatform !== 'All' && (
                <button
                  type="button"
                  onClick={() => setSelectedPlatform('All')}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium cursor-pointer"
                >
                  Ver todas as plataformas
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Profile & CV Analysis Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        resumeData={resumeData}
        onSaveResumeData={handleSaveResumeData}
        onClearResumeData={handleClearResumeData}
        onTriggerSearch={(kw) => {
          setKeyword(kw);
          buscarVagas(kw, location);
        }}
      />

      {/* Job Quick Preview Modal */}
      <JobDetailModal
        vaga={selectedJobForDetail}
        isOpen={Boolean(selectedJobForDetail)}
        onClose={() => setSelectedJobForDetail(null)}
        isSaved={selectedJobForDetail ? isJobSaved(selectedJobForDetail) : false}
        onToggleSave={handleToggleSaveJob}
        onCopyLink={handleCopyLink}
        copiedId={copiedId}
      />

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-6 mt-12 text-center text-xs text-zinc-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Radar Vagas Tech © 2026 — Agregador de Oportunidades em Tecnologia</span>
          <div className="flex items-center gap-4 text-zinc-500">
            <span>LinkedIn</span>
            <span>•</span>
            <span>Gupy</span>
            <span>•</span>
            <span>Catho</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
