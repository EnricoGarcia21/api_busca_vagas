// src/scrapers/vagasScraper.js
const puppeteer = require('puppeteer');

async function rodarRoboDeBusca() {

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    
    const url = 'https://www.catho.com.br/vagas/desenvolvedor/';
    
   
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });


    await page.waitForSelector('article', { timeout: 15000 });

    
    const vagasReais = await page.evaluate(() => {
      
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
            link
          });
        }
      });

      return lista;
    });

    return vagasReais;

  } catch (error) {
    console.error("Erro ao raspar o site real:", error);
    throw new Error(`Falha na raspagem real: ${error.message}`);
  } finally {
  
    await browser.close();
  }
}

module.exports = { rodarRoboDeBusca };