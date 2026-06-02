const express = require('express');
const path = require('path');

const gupyScraper = require('./scraper/gupyScraper');
const linkedinScraper = require('./scraper/linkedinScraper');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/vagas', async (req, res) => {
    try {
        console.log('🔄 Iniciando busca multiplataforma...');

  
        const [vagasGupy, vagasLinkedin] = await Promise.all([
            gupyScraper.buscarVagas().catch(err => {
                console.error("Erro no scraper da Gupy:", err);
                return [];
            }),
            linkedinScraper.buscarVagas().catch(err => {
                console.error("Erro no scraper do LinkedIn:", err);
                return [];
            })
        ]);

        
        const todasAsVagas = [...vagasGupy, ...vagasLinkedin];

        console.log(`✨ Busca finalizada! Total de vagas encontradas: ${todasAsVagas.length}`);
        
     
        res.json(todasAsVagas);

    } catch (error) {
        console.error('Erro geral na rota de vagas:', error);
        res.status(500).json({ error: 'Erro ao processar a busca de vagas.' });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});