const gupyScraper = require('../scraper/gupyScraper');
const cathoScraper = require('../scraper/cathoScraper');
const linkedinScraper = require('../scraper/linkedinScraper');
const { isTechJob, sanitizeTechKeyword } = require('../utils/techFilter');

// Cache em memória simples para os resultados da busca
const searchCache = {};
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos

async function buscarVagas(req, res) {
  try {
    const rawKeyword = req.query.keyword || 'desenvolvedor';
    const location = req.query.location || 'Brasil';
    
    // Otimiza o termo para direcionar a busca em TI nas APIs externas
    const keyword = sanitizeTechKeyword(rawKeyword);

    const cacheKey = `${rawKeyword.toLowerCase().trim()}_${location.toLowerCase().trim()}`;
    const now = Date.now();

    // Verifica se há resultado em cache dentro do tempo de validade
    if (searchCache[cacheKey] && (now - searchCache[cacheKey].timestamp < CACHE_DURATION)) {
      console.log(`🎯 Cache hit para a busca: "${rawKeyword}" em "${location}". Retornando ${searchCache[cacheKey].data.length} vagas de Tecnologia.`);
      return res.json(searchCache[cacheKey].data);
    }

    console.log(`🔄 Iniciando busca multiplataforma de TI para: "${keyword}" em "${location}"...`);

    const [vagasGupy, vagasCatho, vagasLinkedin] = await Promise.all([
      gupyScraper.buscarVagas(keyword).catch(err => {
        console.error("Erro no scraper da Gupy:", err.message);
        return [];
      }),
      cathoScraper.buscarVagas(keyword).catch(err => {
        console.error("Erro no scraper da Catho:", err.message);
        return [];
      }),
      linkedinScraper.buscarVagas(keyword, location).catch(err => {
        console.error("Erro no scraper do LinkedIn:", err.message);
        return [];
      })
    ]);

    const todasVagasBrutas = [...vagasGupy, ...vagasCatho, ...vagasLinkedin];

    // Filtra rigorosamente para garantir apenas oportunidades de Tecnologia/TI
    const resultadoDasVagas = todasVagasBrutas.filter(isTechJob);

    console.log(`🧹 Filtro de TI aplicado: ${todasVagasBrutas.length} brutas -> ${resultadoDasVagas.length} vagas de Tecnologia confirmadas.`);

    // Salva os resultados no cache apenas se houver vagas encontradas
    if (resultadoDasVagas.length > 0) {
      searchCache[cacheKey] = {
        timestamp: now,
        data: resultadoDasVagas
      };
    }

    return res.json(resultadoDasVagas);

  } catch (error) {
    console.error('Erro geral na busca de vagas:', error.message || error);
    return res.status(500).json({ error: 'Erro ao processar a busca de vagas.' });
  }
}

module.exports = { 
  buscarVagas,
  dispararBusca: buscarVagas
};