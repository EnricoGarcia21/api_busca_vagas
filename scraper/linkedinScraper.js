const puppeteer = require('puppeteer');

async function buscarVagas() {
    
    const url = 'https://www.linkedin.com/jobs/search/?keywords=desenvolvedor&location=Brasil';
    
    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--start-maximized', '--no-sandbox'] 
    });
    
    const page = await browser.newPage();
    
  
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForSelector('.jobs-search__results-list li', { timeout: 10000 });
       
        const vagas = await page.evaluate(() => {
            const itens = document.querySelectorAll('.jobs-search__results-list li');
            const lista = [];

            itens.forEach(el => {
                const tituloElement = el.querySelector('.base-search-card__title');
                const empresaElement = el.querySelector('.base-search-card__subtitle a');
                const localElement = el.querySelector('.job-search-card__location');
                const linkElement = el.querySelector('.base-card__full-link');

                if (tituloElement && linkElement) {
                    lista.push({
                        titulo: tituloElement.innerText.trim(),
                        empresa: empresaElement ? empresaElement.innerText.trim() : 'Não informada',
                        localizacao: localElement ? localElement.innerText.trim() : 'Brasil',
                        link: linkElement.getAttribute('href'),
                        descricao: 'Vaga coletada via painel público do LinkedIn.',
                        salario: 'A combinar'
                    });
                }
            });

            return lista;
        });

        await browser.close();
        return vagas;

    } catch (error) {
        console.error("Erro ao raspar o LinkedIn:", error);
        await browser.close();
        return []; 
    }
}

module.exports = { buscarVagas };