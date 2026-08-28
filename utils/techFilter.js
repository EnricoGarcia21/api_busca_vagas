/**
 * Módulo de Validação e Filtragem de Vagas de Tecnologia (TI).
 * Garante que apenas oportunidades da área de software, infraestrutura,
 * dados, cibersegurança, produto e engenharia de TI sejam retornadas.
 */

// Palavras e cargos que definem inequivocamente uma vaga de Tecnologia
const TECH_TITLE_REGEXES = [
  // Desenvolvimento & Engenharia de Software
  /\b(desenvolvedor|desenvolvedora|developer|dev|programador|programadora|programmer)\b/i,
  /\b(frontend|front-end|backend|back-end|fullstack|full-stack|full stack|web developer|mobile developer)\b/i,
  /\b(software engineer|engenheiro de software|engenheira de software|software architect|arquiteto de software)\b/i,
  /\b(tech lead|tech manager|cto|engineering manager|head of tech|líder técnico|lider tecnico)\b/i,
  
  // Dados, IA & Analytics
  /\b(engenheiro de dados|data engineer|cientista de dados|data scientist|analista de dados|data analyst)\b/i,
  /\b(business intelligence|analista de bi|power bi|tableau|dba|database administrator|arquiteto de dados)\b/i,
  /\b(machine learning|deep learning|inteligência artificial|inteligencia artificial|engenheiro de ia|prompt engineer|mlops)\b/i,

  // DevOps, Cloud & Infraestrutura
  /\b(devops|devsecops|sre|site reliability|cloud engineer|engenheiro de nuvem|arquiteto cloud)\b/i,
  /\b(sysadmin|administrador de sistemas|administrador de redes|analista de infraestrutura|analista de infra)\b/i,
  /\b(analista de ti|suporte ti|suporte tecnico ti|suporte técnico ti|helpdesk|service desk|analista de suporte|técnico de ti|tecnico de ti)\b/i,

  // Segurança da Informação
  /\b(cybersecurity|cyber security|segurança da informação|seguranca da informacao|infosec|pentest|pentesters|soc|analista de seguranca)\b/i,

  // Qualidade de Software & Testes
  /\b(qa|tester|testes automatizados|quality assurance|sdet|analista de testes|automação de testes|automacao de testes)\b/i,

  // Design Digital & Produto de TI
  /\b(ui\/ux|ux\/ui|ux designer|ui designer|product designer|web designer)\b/i,
  /\b(scrum master|agile coach|product owner|po tech|product manager tech)\b/i,

  // ERPs e Sistemas Corporativos
  /\b(analista de sistemas|consultor ti|consultor erp|consultor sap|programador sap|abap|advpl|protheus|salesforce)\b/i,

  // Estágio e Trainee Tech
  /\b(estagio ti|estágio ti|estágio em ti|estagio em ti|estagio desenvolvimento|estágio desenvolvimento|trainee tech|trainee ti)\b/i,

  // Stacks e Tecnologias explícitas no título
  /\b(react|reactjs|react native|node|nodejs|node\.js|python|java|c#|\.net|dotnet|golang|rust|ruby|rails|php|laravel|symfony|flutter|kotlin|swift|angular|vue|vuejs|typescript|javascript|aws|azure|gcp|docker|kubernetes|sql|nosql|graphql|spring boot)\b/i
];

// Termos que indicam cargos de outras áreas (fora de TI)
const NON_TECH_EXCLUSION_REGEXES = [
  /\b(vendedor|vendedora|balconista|caixa|operador de caixa|repositor|estoquista|almoxarife|promotor de vendas)\b/i,
  /\b(motorista|entregador|manobrista|porteiro|vigia|segurança patrimonial|vigilante|controlador de acesso)\b/i,
  /\b(copeiro|cozinheiro|garçom|garcom|auxiliar de limpeza|faxineiro|diarista|baba|babá|cuidador|governanta)\b/i,
  /\b(enfermeiro|enfermagem|médico|medico|farmacêutico|farmaceutico|dentista|veterinário|veterinario|fisioterapeuta|nutricionista|psicólogo|psicologo)\b/i,
  /\b(advogado|jurídico|juridico|recepcionista|secretária|secretaria|telemarketing|cobrança|cobranca|corretor de imoveis|corretor)\b/i,
  /\b(pedreiro|eletricista predial|mecanico|mecânico|marceneiro|costureira|alfaiate|serralheiro)\b/i,
  /\b(analista fiscal|analista contábil|analista contabil|analista de cobrança|auxiliar de departamento pessoal)\b/i
];

// Stacks técnicas para validação contextual no corpo do texto
const TECH_STACK_SIGNALS = [
  /\b(javascript|typescript|python|java|c#|golang|rust|ruby|php|kotlin|swift|dart|c\+\+|scala|elixir)\b/i,
  /\b(react|vue|angular|node\.js|nodejs|spring boot|\.net|django|flask|fastapi|laravel|next\.js)\b/i,
  /\b(sql|mysql|postgresql|mongodb|redis|docker|kubernetes|aws|azure|gcp|git|github|ci\/cd|api rest|restful)\b/i,
  /\b(html5|css3|sass|tailwind|bootstrap|figma|scrum|kanban|linux|microservices|microsserviços)\b/i
];

/**
 * Avalia se uma vaga pertence ao domínio de Tecnologia/TI.
 * @param {Object} job - Objeto da vaga { titulo, empresa, descricao, localizacao }
 * @returns {boolean} - true se for vaga de tecnologia, false caso contrário.
 */
function isTechJob(job) {
  if (!job) return false;

  const title = (job.titulo || '').toLowerCase();
  const desc = (job.descricao || '').toLowerCase();
  const fullText = `${title} ${desc} ${(job.empresa || '')}`.toLowerCase();

  // 1. Validação positiva forte no título
  for (const regex of TECH_TITLE_REGEXES) {
    if (regex.test(title)) {
      return true;
    }
  }

  // 2. Filtro de exclusão de cargos não técnicos
  for (const regex of NON_TECH_EXCLUSION_REGEXES) {
    if (regex.test(title)) {
      // Se não houver menção explícita a TI/software no título, descarta
      if (!/\b(ti|tecnologia|software|sistemas|dados|computação|computacao)\b/i.test(title)) {
        return false;
      }
    }
  }

  // 3. Validação por densidade de termos técnicos no texto da vaga
  let signalCount = 0;
  for (const regex of TECH_STACK_SIGNALS) {
    if (regex.test(fullText)) {
      signalCount++;
    }
  }

  return signalCount >= 2;
}

/**
 * Otimiza a palavra-chave para garantir que as APIs externas
 * priorizem vagas da área de TI quando o termo for genérico.
 * @param {string} keyword
 * @returns {string}
 */
function sanitizeTechKeyword(keyword = '') {
  const clean = keyword.trim();
  if (!clean) return 'desenvolvedor';

  // Se o termo for muito genérico (ex: "estagio", "junior", "trainee", "remoto", "analista"),
  // adicionamos o contexto de TI na busca para aumentar a precisão dos scrapers
  const genericTerms = /^(estagio|estágio|junior|júnior|pleno|senior|sênior|trainee|remoto|analista|consultor|lider|líder|coordenador)$/i;
  if (genericTerms.test(clean)) {
    return `${clean} TI`;
  }

  return clean;
}

module.exports = {
  isTechJob,
  sanitizeTechKeyword
};
