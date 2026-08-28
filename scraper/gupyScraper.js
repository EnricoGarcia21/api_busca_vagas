const axios = require('axios');

async function buscarVagas(keyword = 'desenvolvedor') {
  try {
    const url = `https://employability-portal.gupy.io/api/v1/jobs?jobName=${encodeURIComponent(keyword)}&limit=25&offset=0`;
    console.log(`🌐 Consultando API pública da Gupy para: "${keyword}"`);

    const response = await axios.get(url, {
      timeout: 8000,
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    });

    if (!response.data || !response.data.data) {
      return [];
    }

    const vagas = response.data.data.map(vaga => {
      const isRemote = vaga.isRemoteWork || vaga.workplaceType === 'remote';
      const local = isRemote 
        ? 'Remoto' 
        : `${vaga.city || ''}${vaga.state ? ' - ' + vaga.state : ''}`.trim() || 'Brasil';

      return {
        titulo: vaga.name || 'Vaga de Tecnologia',
        empresa: vaga.careerPageName || 'Empresa parceira Gupy',
        localizacao: local,
        link: vaga.jobUrl || `https://portal.gupy.io/job/${vaga.id}?jobBoardSource=gupy_portal`,
        descricao: vaga.description 
          ? vaga.description.replace(/<[^>]*>?/gm, '').slice(0, 220) + '...'
          : 'Confira os requisitos completos no portal da Gupy.',
        salario: 'A combinar',
        plataforma: 'Gupy'
      };
    });

    console.log(`✅ Coletadas ${vagas.length} vagas da Gupy.`);
    return vagas;

  } catch (error) {
    console.error("Erro ao consultar a API da Gupy:", error.message);
    return [];
  }
}

module.exports = { 
  buscarVagas 
};