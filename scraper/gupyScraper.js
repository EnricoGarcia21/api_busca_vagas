const puppeteer = require('puppeteer');

async function rodarRoboDeBusca(keyword = 'desenvolvedor') {

  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  const todasVagas = [];
  const baseKeyword = keyword.toLowerCase().trim().replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-');
  const formattedKeyword = encodeURIComponent(baseKeyword);

  try {
    // Vamos raspar as páginas 1 e 2
    for (let pageNum = 1; pageNum <= 2; pageNum++) {
      const url = pageNum === 1 
        ? `https://www.catho.com.br/vagas/${formattedKeyword}/` 
        : `https://www.catho.com.br/vagas/${formattedKeyword}/?page=${pageNum}`;

      console.log(`🌐 Scraper Catho acessando página ${pageNum}: ${url}`);

      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
        
        // Espera pelos seletores de artigos, se der timeout finaliza o loop
        await page.waitForSelector('article', { timeout: 10000 });

        const vagasDaPagina = await page.evaluate(() => {
          const cards = document.querySelectorAll('article');
          const lista = [];

          cards.forEach(card => {
            const titulo = card.querySelector('h2')?.innerText || 'Título não encontrado';
            const empresa = card.querySelector('p')?.innerText || 'Empresa Confidencial';
            const link = card.querySelector('h2 a')?.href || '';

            if (titulo !== 'Título não encontrado') {
              lista.push({
                titulo,
                empresa,
                link,
                localizacao: 'Brasil',
                descricao: 'Clique no link para conferir a descrição detalhada diretamente no portal da Catho.',
                salario: 'A combinar',
                plataforma: 'Catho'
              });
            }
          });

          return lista;
        });

        if (vagasDaPagina.length === 0) {
          console.log(`⚠️ Nenhuma vaga encontrada na página ${pageNum} da Catho. Encerrando paginação.`);
          break;
        }

        todasVagas.push(...vagasDaPagina);
        console.log(`✅ Coletadas ${vagasDaPagina.length} vagas da página ${pageNum} da Catho.`);

      } catch (pageError) {
        console.error(`Erro ao processar página ${pageNum} da Catho:`, pageError.message);
        // Se falhar na página 2, prossegue com as vagas da página 1
        if (pageNum === 1) break;
      }
    }

    return todasVagas;

  } catch (error) {
    console.error("Erro geral no scraper da Catho:", error);
    return todasVagas;
  } finally {
    await browser.close();
  }
}


module.exports = { 
    buscarVagas: rodarRoboDeBusca 
};