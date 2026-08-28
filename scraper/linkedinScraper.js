const axios = require('axios');
const cheerio = require('cheerio');

async function buscarVagas(keyword = 'desenvolvedor', location = 'Brasil') {
  try {
    const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}&start=0`;
    console.log(`🌐 Scraper LinkedIn (HTTP leve) acessando: ${url}`);

    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 10000
    });

    const $ = cheerio.load(html);
    const vagas = [];

    $('li').each((_, el) => {
      const tituloElement = $(el).find('h3.base-search-card__title, .base-search-card__title, h3');
      const empresaElement = $(el).find('h4.base-search-card__subtitle a, .base-search-card__subtitle, h4');
      const localElement = $(el).find('.job-search-card__location');
      const linkElement = $(el).find('a.base-card__full-link, a');
      const dataElement = $(el).find('time.job-search-card__listdate, time');

      const rawTitulo = tituloElement.text() || '';
      const rawEmpresa = empresaElement.text() || '';
      const rawLocal = localElement.text() || '';

      const titulo = rawTitulo.replace(/\s+/g, ' ').trim();
      const empresa = rawEmpresa.replace(/\s+/g, ' ').trim();
      const localizacao = rawLocal.replace(/\s+/g, ' ').trim();
      const link = linkElement.attr('href');

      if (titulo && !titulo.includes('{[') && link) {
        vagas.push({
          titulo,
          empresa: empresa || 'Não informada',
          localizacao: localizacao || location,
          link: link.split('?')[0],
          descricao: dataElement.text().trim() 
            ? `Publicada no LinkedIn: ${dataElement.text().replace(/\s+/g, ' ').trim()}` 
            : 'Vaga coletada via painel público do LinkedIn.',
          salario: 'A combinar',
          plataforma: 'LinkedIn'
        });
      }
    });

    console.log(`✅ Coletadas ${vagas.length} vagas do LinkedIn.`);
    return vagas;

  } catch (error) {
    console.error("Erro ao raspar o LinkedIn:", error.message);
    return [];
  }
}

module.exports = { buscarVagas };