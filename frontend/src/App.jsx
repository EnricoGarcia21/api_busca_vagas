import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, RefreshCw, AlertCircle, ExternalLink, Sparkles, TrendingUp, Upload, FileText, Check, Trash2, Cpu } from 'lucide-react';

function App() {
  const [vagas, setVagas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Parâmetros de busca da API
  const [keyword, setKeyword] = useState('desenvolvedor');
  const [location, setLocation] = useState('Brasil');
  
  // Filtros locais (client-side)
  const [localSearch, setLocalSearch] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  
  // Histórico de buscas recentes (salvo no localStorage)
  const [recentSearches, setRecentSearches] = useState([]);

  // Estados do Agente de Currículo
  const [resumeText, setResumeText] = useState('');
  const [pdfBase64, setPdfBase64] = useState('');
  const [pdfName, setPdfName] = useState('');
  const [analyzingResume, setAnalyzingResume] = useState(false);
  const [resumeAgentData, setResumeAgentData] = useState(null); // { skills, keywords, summary, isDemo }
  const [showAgentPanel, setShowAgentPanel] = useState(false);

  useEffect(() => {
    // Carregar histórico do localStorage
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
    // Carregar currículo salvo se houver
    const savedResume = localStorage.getItem('resumeAgentData');
    if (savedResume) {
      setResumeAgentData(JSON.parse(savedResume));
    }
    // Carregar vagas iniciais
    buscarVagas('desenvolvedor', 'Brasil');
  }, []);

  const buscarVagas = async (searchKey = keyword, searchLoc = location) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/vagas?keyword=${encodeURIComponent(searchKey)}&location=${encodeURIComponent(searchLoc)}`);
      
      if (!response.ok) {
        throw new Error('Falha ao buscar vagas no servidor.');
      }
      
      const data = await response.json();
      setVagas(data);
      
      // Salva no histórico se não estiver duplicado
      const searchItem = { keyword: searchKey, location: searchLoc };
      setRecentSearches(prev => {
        const filtered = prev.filter(x => !(x.keyword.toLowerCase() === searchKey.toLowerCase() && x.location.toLowerCase() === searchLoc.toLowerCase()));
        const updated = [searchItem, ...filtered].slice(0, 5);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
        return updated;
      });
      
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    buscarVagas(keyword, location);
  };

  const handleRecentClick = (item) => {
    setKeyword(item.keyword);
    setLocation(item.location);
    buscarVagas(item.keyword, item.location);
  };

  const handleClearHistory = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  // Upload/Leitura de Arquivo PDF
  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      alert("Por favor, selecione apenas arquivos em formato PDF.");
      return;
    }

    setPdfName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setPdfBase64(reader.result);
      setResumeText(''); // Limpa texto se inseriu arquivo
    };
    reader.readAsDataURL(file);
  };

  // Chamada de Análise de Currículo
  const analisarPerfil = async () => {
    setAnalyzingResume(true);
    try {
      const body = {};
      if (pdfBase64) {
        body.file = pdfBase64;
      } else if (resumeText.trim()) {
        body.text = resumeText;
      } else {
        alert("Cole o texto do seu currículo ou faça o upload de um PDF.");
        setAnalyzingResume(false);
        return;
      }

      const response = await fetch('/api/analisar-curriculo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro ao analisar currículo.');
      }

      const data = await response.json();
      setResumeAgentData(data);
      localStorage.setItem('resumeAgentData', JSON.stringify(data));
      
      // Auto-preenche a busca principal com a primeira keyword sugerida
      if (data.keywords && data.keywords.length > 0) {
        setKeyword(data.keywords[0]);
      }
      
      setShowAgentPanel(false); // Fecha o painel de input
      
    } catch (err) {
      alert(`Erro na análise: ${err.message}`);
    } finally {
      setAnalyzingResume(false);
    }
  };

  const limparPerfilAnalisado = () => {
    setResumeAgentData(null);
    setPdfBase64('');
    setPdfName('');
    setResumeText('');
    localStorage.removeItem('resumeAgentData');
  };

  // Lógica de cálculo de match
  const getMatchDetails = (vaga) => {
    if (!resumeAgentData || !resumeAgentData.skills || resumeAgentData.skills.length === 0) {
      return null;
    }
    
    const textToSearch = `${vaga.titulo} ${vaga.descricao || ''}`.toLowerCase();
    const matched = resumeAgentData.skills.filter(skill => {
      // Faz uma busca simples e segura do termo
      const cleanSkill = skill.toLowerCase().trim();
      if (!cleanSkill) return false;
      return textToSearch.includes(cleanSkill);
    });

    const totalSkills = resumeAgentData.skills.length;
    // Consideramos que ter 4 skills correspondentes já garante 100% de match para a vaga
    const normalizer = Math.min(totalSkills, 4);
    const score = normalizer > 0 ? Math.min(Math.round((matched.length / normalizer) * 100), 100) : 0;

    return {
      score,
      matched
    };
  };

  // Filtragem e ordenação client-side
  const filteredVagas = vagas
    .map(v => {
      const match = getMatchDetails(v);
      return { ...v, match };
    })
    .filter(vaga => {
      // Filtro por Plataforma
      if (selectedPlatform !== 'All' && vaga.plataforma !== selectedPlatform) {
        return false;
      }
      // Filtro textual local
      const query = localSearch.toLowerCase().trim();
      if (!query) return true;
      
      return (
        vaga.titulo?.toLowerCase().includes(query) ||
        vaga.empresa?.toLowerCase().includes(query) ||
        vaga.localizacao?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      // Ordenação por Match Score se houver perfil analisado
      if (sortBy === 'match' && a.match && b.match) {
        return b.match.score - a.match.score;
      }
      if (sortBy === 'title') {
        return a.titulo.localeCompare(b.titulo);
      }
      if (sortBy === 'company') {
        return a.empresa.localeCompare(b.empresa);
      }
      return 0; // padrão
    });

  // Estatísticas
  const totalCount = filteredVagas.length;
  const linkedinCount = filteredVagas.filter(v => v.plataforma === 'LinkedIn').length;
  const cathoCount = filteredVagas.filter(v => v.plataforma === 'Catho').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Top Banner Gradient Line */}
      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500"></div>

      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white font-bold text-lg shadow-lg shadow-indigo-600/30 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-cyan-200 animate-pulse" />
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              BuscaVagas
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAgentPanel(!showAgentPanel)}
              className="relative group bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all"
            >
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-indigo-500 border border-slate-900 flex items-center justify-center text-[8px] text-white font-bold">AI</span>
              </span>
              <Cpu className="h-4 w-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
              Agente de Carreira
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              API: <span className="text-emerald-400">Online</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Painel do Agente de Carreira - Input (Drawer/Modal simulado) */}
        {showAgentPanel && (
          <div className="bg-slate-900 border border-indigo-500/30 p-6 sm:p-8 rounded-3xl mb-8 shadow-2xl relative">
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-36 h-36 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Cpu className="text-indigo-400 h-5 w-5 animate-bounce" />
              Agente de Perfil (IA Gemini)
            </h3>
            <p className="text-slate-400 text-xs mb-6">
              Envie seu currículo abaixo. Nosso agente irá extrair suas skills técnicas e sugerir vagas ideais, calculando a compatibilidade em tempo real.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Opção 1: Upload PDF */}
              <div className="border border-slate-800 bg-slate-950/40 p-5 rounded-2xl flex flex-col items-center justify-center text-center group hover:border-indigo-500/30 transition-all relative">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="h-10 w-10 text-indigo-400 group-hover:scale-110 transition-transform mb-3" />
                <span className="text-sm font-semibold text-slate-200">Carregar Currículo em PDF</span>
                <span className="text-[10px] text-slate-500 mt-1">Apenas formato .pdf (máximo 10MB)</span>
                {pdfName && (
                  <div className="mt-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs py-1 px-3 rounded-full flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {pdfName}
                  </div>
                )}
              </div>

              {/* Opção 2: Colar Texto */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Ou cole seu currículo em texto:</label>
                <textarea
                  value={resumeText}
                  onChange={(e) => {
                    setResumeText(e.target.value);
                    setPdfBase64(''); // Limpa arquivo se inseriu texto
                    setPdfName('');
                  }}
                  placeholder="Cole aqui a descrição profissional, experiências e qualificações do seu currículo..."
                  rows={5}
                  className="w-full bg-slate-950/70 border border-slate-800 focus:border-indigo-500 rounded-2xl p-4 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 resize-none transition-all"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAgentPanel(false);
                  limparPerfilAnalisado();
                }}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-400 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={analisarPerfil}
                disabled={analyzingResume || (!pdfBase64 && !resumeText.trim())}
                className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20"
              >
                {analyzingResume ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Analisando Perfil...
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Analisar Currículo
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Informações do Currículo Analisado (Se houver) */}
        {resumeAgentData && (
          <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-slate-900/60 border border-indigo-500/20 p-5 rounded-3xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="bg-indigo-500/10 text-indigo-300 text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-indigo-500/20 flex items-center gap-1 uppercase tracking-wider">
                  <Cpu className="h-3 w-3" />
                  Agente Carregado
                </span>
                {resumeAgentData.isDemo && (
                  <span className="bg-amber-500/10 text-amber-300 text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-amber-500/20 uppercase tracking-wider">
                    Modo Demonstração (Sem Chave API)
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-slate-350 italic mb-3">
                "{resumeAgentData.summary}"
              </p>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mr-1">Minhas Skills:</span>
                {resumeAgentData.skills.map((skill, i) => (
                  <span key={i} className="bg-slate-950 border border-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-md font-semibold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {resumeAgentData.keywords && resumeAgentData.keywords.length > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Sugestões de Busca:</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {resumeAgentData.keywords.map((kw, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setKeyword(kw);
                          buscarVagas(kw, location);
                        }}
                        className="bg-indigo-600/90 hover:bg-indigo-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-all"
                      >
                        {kw}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <button
                onClick={limparPerfilAnalisado}
                className="bg-slate-950 hover:bg-rose-950/20 border border-slate-850 hover:border-rose-900/30 text-slate-400 hover:text-rose-400 p-2.5 rounded-xl transition-all cursor-pointer self-end"
                title="Remover Perfil"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Formulário de Busca Principal */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-6 sm:p-8 rounded-3xl mb-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <h2 className="text-xl sm:text-2xl font-bold mb-2 flex items-center gap-2">
            <TrendingUp className="text-indigo-400 h-6 w-6" />
            Buscador Multiplataforma
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            Consulte o LinkedIn e a Catho simultaneamente. Nossos robôs foram otimizados para buscar múltiplos resultados.
          </p>

          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5 relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Cargo, palavra-chave (Ex: React, Node, Python...)"
                className="w-full pl-12 pr-4 py-3 bg-slate-950/70 border border-slate-800 focus:border-indigo-500/50 rounded-2xl focus:outline-none focus:ring-1 focus:ring-indigo-500/30 text-slate-100 placeholder-slate-500 transition-all font-medium text-sm"
                required
              />
            </div>
            
            <div className="md:col-span-4 relative">
              <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Localização (Ex: Remoto, São Paulo...)"
                className="w-full pl-12 pr-4 py-3 bg-slate-950/70 border border-slate-800 focus:border-indigo-500/50 rounded-2xl focus:outline-none focus:ring-1 focus:ring-indigo-500/30 text-slate-100 placeholder-slate-500 transition-all font-medium text-sm"
              />
            </div>

            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-[0.98] disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {loading ? (
                  <>
                    <RefreshCw className="animate-spin h-5 w-5 animate-pulse" />
                    Buscando (15-20s)...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-5 w-5" />
                    Buscar Vagas
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Histórico Recente */}
          {recentSearches.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-2 pt-4 border-t border-slate-800/40">
              <span className="text-xs text-slate-500 font-medium">Buscas recentes:</span>
              {recentSearches.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleRecentClick(item)}
                  className="text-xs bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-slate-300 px-3 py-1 rounded-full cursor-pointer transition-colors hover:text-indigo-400 flex items-center gap-1 animate-fadeIn"
                >
                  {item.keyword} <span className="text-slate-500">({item.location})</span>
                </button>
              ))}
              <button
                type="button"
                onClick={handleClearHistory}
                className="text-xs text-rose-400/80 hover:text-rose-400 hover:underline ml-auto cursor-pointer"
              >
                Limpar
              </button>
            </div>
          )}
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition-all">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Encontrado</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-white">{loading ? '...' : totalCount}</span>
              <span className="text-xs text-slate-400">vagas exibidas</span>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition-all group">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">No LinkedIn</span>
              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-blue-400 group-hover:text-blue-300 transition-colors">
                {loading ? '...' : linkedinCount}
              </span>
              <span className="text-xs text-slate-400">vagas</span>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition-all group">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Na Catho</span>
              <span className="h-2 w-2 rounded-full bg-red-500"></span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-red-400 group-hover:text-red-300 transition-colors">
                {loading ? '...' : cathoCount}
              </span>
              <span className="text-xs text-slate-400">vagas</span>
            </div>
          </div>
        </div>

        {/* Filtros Secundários e Ordenação */}
        <div className="bg-slate-900/30 border border-slate-850 p-4 rounded-2xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Botões de Filtro de Plataforma */}
          <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-850 self-start">
            <button
              onClick={() => setSelectedPlatform('All')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedPlatform === 'All'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-205'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setSelectedPlatform('LinkedIn')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedPlatform === 'LinkedIn'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-205'
              }`}
            >
              LinkedIn
            </button>
            <button
              onClick={() => setSelectedPlatform('Catho')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedPlatform === 'Catho'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-205'
              }`}
            >
              Catho
            </button>
          </div>

          {/* Filtro por Texto e Select de Ordenação */}
          <div className="flex flex-1 flex-col sm:flex-row items-center gap-3 w-full md:justify-end">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-550" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Filtrar por título, empresa..."
                className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 focus:border-indigo-500/50 rounded-xl focus:outline-none text-xs text-slate-200 placeholder-slate-650"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto bg-slate-950/80 border border-slate-800 focus:border-indigo-500/50 rounded-xl py-2 px-3 text-xs text-slate-350 focus:outline-none cursor-pointer font-medium"
            >
              <option value="default">Ordem Padrão</option>
              {resumeAgentData && <option value="match">Match Score (Alto → Baixo)</option>}
              <option value="title">Título (A-Z)</option>
              <option value="company">Empresa (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Notificações e Alertas */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-450 p-4 rounded-2xl mb-8 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">Erro de Conexão</h4>
              <p className="text-xs text-rose-400/80 mt-1">{error}</p>
              <button 
                onClick={() => buscarVagas(keyword, location)} 
                className="mt-2 text-xs font-semibold text-rose-350 underline hover:text-rose-250 cursor-pointer"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        )}

        {/* Grid de Vagas */}
        {loading ? (
          /* Skeletons Animados */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-slate-900/30 border border-slate-850 rounded-3xl p-6 h-60 flex flex-col justify-between animate-pulse">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-5 w-24 bg-slate-850 rounded-full"></div>
                    <div className="h-4 w-20 bg-slate-850 rounded-full"></div>
                  </div>
                  <div className="h-5 w-3/4 bg-slate-850 rounded-md mb-3"></div>
                  <div className="h-4 w-full bg-slate-850 rounded-md mb-2"></div>
                  <div className="h-4 w-5/6 bg-slate-850 rounded-md"></div>
                </div>
                <div className="h-10 w-full bg-slate-850 rounded-xl mt-4"></div>
              </div>
            ))}
          </div>
        ) : filteredVagas.length > 0 ? (
          /* Vagas Renderizadas */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVagas.map((vaga, index) => (
              <div
                key={index}
                className="bg-slate-900/45 border border-slate-850 hover:border-indigo-500/50 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/5 group"
              >
                <div>
                  {/* Header do Card (Empresa + Localização + Match Badge) */}
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <span className="bg-slate-950 border border-slate-850 text-slate-350 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider max-w-[140px] truncate" title={vaga.empresa}>
                      {vaga.empresa || 'Confidencial'}
                    </span>
                    
                    {vaga.match ? (
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        vaga.match.score >= 70 
                          ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20' 
                          : vaga.match.score >= 30
                          ? 'bg-amber-500/10 text-amber-450 border border-amber-500/20'
                          : 'bg-slate-800 text-slate-500 border border-slate-850'
                      }`}>
                        {vaga.match.score}% Match
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                        {vaga.localizacao || 'Remoto / Brasil'}
                      </span>
                    )}
                  </div>

                  {/* Título da Vaga */}
                  <h3 className="text-base font-extrabold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-2 mb-2 leading-snug">
                    {vaga.titulo}
                  </h3>

                  {/* Descrição Curta */}
                  <p className="text-slate-400 text-xs line-clamp-3 mb-4 leading-relaxed">
                    {vaga.descricao || 'Confira os detalhes desta oportunidade clicando no botão abaixo para acessar o portal original.'}
                  </p>

                  {/* Skills Correspondentes (Destaque do Match) */}
                  {vaga.match && vaga.match.matched.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-1 items-center">
                      <span className="text-[9px] text-emerald-400 font-bold uppercase mr-1">Requisitos:</span>
                      {vaga.match.matched.map((sk, i) => (
                        <span key={i} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] px-2 py-0.5 rounded font-bold animate-fadeIn">
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Rodapé do Card */}
                <div className="pt-4 border-t border-slate-850/60 flex items-center justify-between mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Salário</span>
                    <span className="text-xs font-bold text-emerald-400">{vaga.salario || 'A combinar'}</span>
                  </div>
                  
                  {/* Link externo */}
                  <a
                    href={vaga.link || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm cursor-pointer ${
                      vaga.plataforma === 'LinkedIn' 
                        ? 'bg-blue-600/80 hover:bg-blue-600 shadow-blue-500/10' 
                        : 'bg-red-600/80 hover:bg-red-600 shadow-red-500/10'
                    }`}
                  >
                    Ver no {vaga.plataforma}
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Estado Vazio */
          <div className="text-center py-16 px-4 bg-slate-900/10 border border-dashed border-slate-800 rounded-3xl">
            <Briefcase className="mx-auto h-12 w-12 text-slate-650 mb-3" />
            <h3 className="text-lg font-bold text-slate-400">Nenhuma vaga correspondente</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mt-1">
              Não encontramos vagas para o filtro selecionado. Tente alterar o texto do filtro ou faça uma nova busca acima.
            </p>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-slate-900/60 bg-slate-950 py-6 mt-12 text-center text-xs text-slate-600">
        <p>© 2026 BuscaVagas. Desenvolvido de forma leve com React, Vite e Tailwind CSS.</p>
      </footer>
    </div>
  );
}

export default App;
