import React, { useState } from 'react';
import { X, Upload, FileText, Plus, Trash2, CheckCircle2, RefreshCw, Search } from 'lucide-react';

export function ProfileModal({
  isOpen,
  onClose,
  resumeData,
  onSaveResumeData,
  onClearResumeData,
  onTriggerSearch
}) {
  const [activeTab, setActiveTab] = useState('pdf');
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfBase64, setPdfBase64] = useState('');
  const [pdfName, setPdfName] = useState('');
  const [textInput, setTextInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setErrorMsg('Apenas arquivos PDF são aceitos.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('O arquivo PDF deve ter menos de 10MB.');
      return;
    }

    setPdfFile(file);
    setPdfName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setPdfBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    setErrorMsg('');
    setAnalyzing(true);

    try {
      const payload = {};
      if (activeTab === 'pdf') {
        if (!pdfBase64) {
          setErrorMsg('Selecione um arquivo PDF antes de analisar.');
          setAnalyzing(false);
          return;
        }
        payload.file = pdfBase64;
      } else {
        if (!textInput.trim()) {
          setErrorMsg('Cole o texto do seu currículo antes de analisar.');
          setAnalyzing(false);
          return;
        }
        payload.text = textInput;
      }

      const res = await fetch('/api/analisar-curriculo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erro ao processar currículo.');
      }

      const data = await res.json();
      onSaveResumeData(data);
    } catch (err) {
      setErrorMsg(err.message || 'Falha na análise.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    const trimmed = newSkillInput.trim();
    if (!trimmed || !resumeData) return;

    const currentSkills = resumeData.skills || [];
    if (!currentSkills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      const updated = {
        ...resumeData,
        skills: [...currentSkills, trimmed]
      };
      onSaveResumeData(updated);
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    if (!resumeData) return;
    const updated = {
      ...resumeData,
      skills: (resumeData.skills || []).filter(s => s !== skillToRemove)
    };
    onSaveResumeData(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-400" />
              <span>Perfil & Compatibilidade de Vagas</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Analise seu currículo para calcular automaticamente a correspondência com as vagas abertas.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* If already has resume data */}
          {resumeData ? (
            <div className="space-y-4">
              {/* Summary Card */}
              <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Resumo do Perfil
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="h-3 w-3" />
                    Ativo
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {resumeData.summary || 'Perfil técnico analisado.'}
                </p>
              </div>

              {/* Skills Interactive Manager */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Competências / Tecnologias ({resumeData.skills?.length || 0})
                  </label>
                  <span className="text-[10px] text-zinc-500">
                    Clique no ✕ para remover ou adicione novas
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 min-h-16">
                  {resumeData.skills?.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-700/80 text-zinc-200 text-xs font-medium group hover:border-zinc-600 transition-colors"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-zinc-500 group-hover:text-rose-400 p-0.5 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                        title={`Remover ${skill}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add new skill inline */}
                <form onSubmit={handleAddSkill} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    placeholder="Adicionar nova habilidade (ex: Docker, GraphQL, AWS)..."
                    className="flex-1 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Adicionar</span>
                  </button>
                </form>
              </div>

              {/* Recommended Search Queries */}
              {resumeData.keywords && resumeData.keywords.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Cargos Recomendados para Busca:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {resumeData.keywords.map((kw, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          onTriggerSearch(kw);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/60 text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
                      >
                        <Search className="h-3 w-3 text-zinc-400" />
                        <span>{kw}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Upload / Input Tabs */
            <div className="space-y-4">
              {/* Tab Selector */}
              <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('pdf')}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    activeTab === 'pdf'
                      ? 'bg-zinc-800 text-zinc-100'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Arquivo PDF
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('text')}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    activeTab === 'text'
                      ? 'bg-zinc-800 text-zinc-100'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Colar Texto
                </button>
              </div>

              {activeTab === 'pdf' ? (
                /* PDF Upload Dropzone */
                <label className="border-2 border-dashed border-zinc-800 hover:border-zinc-700 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-zinc-950/40">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3 text-zinc-400">
                    <Upload className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-semibold text-zinc-200">
                    {pdfName || 'Clique para selecionar seu currículo em PDF'}
                  </span>
                  <span className="text-xs text-zinc-500 mt-1">
                    {pdfName ? 'Arquivo pronto para análise' : 'Formato PDF até 10MB'}
                  </span>
                </label>
              ) : (
                /* Plain text paste */
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400">
                    Cole o conteúdo do seu currículo, resumo ou perfil do LinkedIn:
                  </label>
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    rows={6}
                    placeholder="Ex: Desenvolvedor Front-end com 3 anos de experiência em React, TypeScript, Next.js, Tailwind CSS e Node.js..."
                    className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 font-mono resize-none"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/50 flex items-center justify-between gap-3">
          {resumeData ? (
            <>
              <button
                type="button"
                onClick={onClearResumeData}
                className="text-xs text-zinc-400 hover:text-rose-400 flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Remover Perfil</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs rounded-xl transition-all cursor-pointer"
              >
                Concluído
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-zinc-400 hover:text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={analyzing || (activeTab === 'pdf' ? !pdfBase64 : !textInput.trim())}
                className="px-5 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Processando Perfil...</span>
                  </>
                ) : (
                  <>
                    <span>Analisar Currículo</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
