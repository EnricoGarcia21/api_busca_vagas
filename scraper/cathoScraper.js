const axios = require('axios');
const cheerio = require('cheerio');

function formatKeyword(keyword) {
  return keyword
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentuações com segurança
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-');
}

async function buscarVagas(keyword = 'desenvolvedor') {
  const todasVagas = [];
  const baseKeyword = formatKeyword(keyword);
  const formattedKeyword = encodeURIComponent(baseKeyword || 'desenvolvedor');

  try {
    const url = `https://www.catho.com.br/vagas/${formattedKeyword}/`;
    console.log(`🌐 Scraper Catho (HTTP leve) acessando: ${url}`);

    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      timeout: 10000
    });

    const $ = cheerio.load(res.data);
    const articles = $('article');

    articles.each((_, el) => {
      const h2Link = $(el).find('h2 a').first();
      const h2 = $(el).find('h2').first();
      const titulo = (h2Link.length ? h2Link.text() : h2.text()).replace(/\s+/g, ' ').trim();
      
      const rawLink = h2Link.attr('href') || $(el).find('a').first().attr('href') || '';
      const link = rawLink.startsWith('http') ? rawLink : (rawLink ? `https://www.catho.com.br${rawLink}` : '');
      
      const empresa = $(el).find('span.text-12, p.mb-2').first().text().replace(/\s+/g, ' ').trim() || 'Empresa Confidencial';
      
      const locEl = $(el).find('span.i_job_location').parent();
      let localizacao = locEl.text().replace(/\s+/g, ' ').replace(/^\s*\d+\s*vagas?\s*-\s*/i, '').trim();
      if (!localizacao) {
        localizacao = 'Brasil';
      }
      if (/trabalhe de casa|home office|remoto/i.test(titulo) && !/remoto/i.test(localizacao)) {
        localizacao = `Remoto (${localizacao})`;
      }

      const salEl = $(el).find('span.i_salary').parent();
      const salario = salEl.text().replace(/\s+/g, ' ').trim() || 'A combinar';

      const dataTag = $(el).find('span.tag').first().text().replace(/\s+/g, ' ').trim();

      if (titulo && link) {
        todasVagas.push({
          titulo,
          empresa,
          localizacao,
          link: link.split('?')[0],
          descricao: dataTag 
            ? `${dataTag} na Catho. Oportunidade para ${titulo} na empresa ${empresa}.`
            : `Oportunidade para ${titulo} na empresa ${empresa} divulgada na Catho.`,
          salario,
          plataforma: 'Catho'
        });
      }
    });

    console.log(`✅ Coletadas ${todasVagas.length} vagas da Catho.`);
    return todasVagas;
  } catch (error) {
    console.error("Erro ao consultar Catho:", error.message);
    return [];
  }
}

module.exports = { 
  buscarVagas 
};
