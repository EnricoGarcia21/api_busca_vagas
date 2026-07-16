const puppeteer = require('puppeteer');

async function buscarVagas(keyword = 'desenvolvedor', location = 'Brasil') {
    
    const url = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}`;
    
    console.log(`🌐 Scraper LinkedIn acessando: ${url}`);

    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--start-maximized', '--no-sandbox'] 
    });
    
    const page = await browser.newPage();
    
  
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForSelector('.jobs-search__results-list li', { timeout: 10000 });
       
        console.log("⏳ Rolando página do LinkedIn para carregar mais vagas...");
        
        // Loop de rolagem para carregar mais itens via lazy loading e tentar clicar no botão "ver mais"
        await page.evaluate(async () => {
            const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
            for (let i = 0; i < 4; i++) {
                // Rola a janela
                window.scrollTo(0, document.body.scrollHeight);
                // Rola o container específico se existir
                const resultsList = document.querySelector('.jobs-search__results-list');
                if (resultsList) {
                    resultsList.scrollTo(0, resultsList.scrollHeight);
                }
                await delay(1200);

                // Tenta clicar no botão "Ver mais vagas" (infinite scroll button no LinkedIn público)
                const seeMoreBtn = document.querySelector('button.infinite-scroller__show-more-button');
                if (seeMoreBtn && !seeMoreBtn.disabled) {
                    console.log("Clicando em 'Ver mais vagas'...");
                    seeMoreBtn.click();
                    await delay(1500);
                }
            }
        });

        // Espera pequena para renderização dos novos elementos
        await new Promise(resolve => setTimeout(resolve, 1000));

        const vagas = await page.evaluate(() => {
            const itens = document.querySelectorAll('.jobs-search__results-list li');
            const lista = [];

            itens.forEach(el => {
                const tituloElement = el.querySelector('.base-search-card__title');
                const empresaElement = el.querySelector('.base-search-card__subtitle a') || el.querySelector('.base-search-card__subtitle');
                const localElement = el.querySelector('.job-search-card__location');
                const linkElement = el.querySelector('.base-card__full-link') || el.querySelector('a');

                if (tituloElement && linkElement) {
                    const titulo = tituloElement.innerText.trim();
                    const link = linkElement.getAttribute('href');

                    if (titulo && link) {
                        lista.push({
                            titulo: titulo,
                            empresa: empresaElement ? empresaElement.innerText.trim() : 'Não informada',
                            localizacao: localElement ? localElement.innerText.trim() : 'Brasil',
                            link: link.split('?')[0], // Limpa parâmetros extras do link
                            descricao: 'Vaga coletada via painel público do LinkedIn.',
                            salario: 'A combinar',
                            plataforma: 'LinkedIn'
                        });
                    }
                }
            });

            return lista;
        });

        console.log(`✅ Coletadas ${vagas.length} vagas do LinkedIn.`);
        await browser.close();
        return vagas;

    } catch (error) {
        console.error("Erro ao raspar o LinkedIn:", error);
        await browser.close();
        return []; 
    }
}

module.exports = { buscarVagas };