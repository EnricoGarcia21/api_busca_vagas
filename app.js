require('dotenv').config();
const express = require('express');
const path = require('path');

const gupyScraper = require('./scraper/gupyScraper');
const linkedinScraper = require('./scraper/linkedinScraper');
const agentController = require('./controller/agentController');

const app = express();
const port = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Cache em memória simples para os resultados da busca
const searchCache = {};
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos

app.get('/api/vagas', async (req, res) => {
    try {
        const keyword = req.query.keyword || 'desenvolvedor';
        const location = req.query.location || 'Brasil';
        
        const cacheKey = `${keyword.toLowerCase().trim()}_${location.toLowerCase().trim()}`;
        const now = Date.now();

        // Verifica se há resultado em cache dentro do tempo de validade
        if (searchCache[cacheKey] && (now - searchCache[cacheKey].timestamp < CACHE_DURATION)) {
            console.log(`🎯 Cache hit para a busca: "${keyword}" em "${location}". Retornando resultados imediatamente.`);
            return res.json(searchCache[cacheKey].data);
        }

        console.log(`🔄 Iniciando busca multiplataforma para: "${keyword}" em "${location}"...`);

        const [vagasGupy, vagasLinkedin] = await Promise.all([
            gupyScraper.buscarVagas(keyword).catch(err => {
                console.error("Erro no scraper da Catho/Gupy:", err);
                return [];
            }),
            linkedinScraper.buscarVagas(keyword, location).catch(err => {
                console.error("Erro no scraper do LinkedIn:", err);
                return [];
            })
        ]);

        const todasAsVagas = [...vagasGupy, ...vagasLinkedin];

        console.log(`✨ Busca finalizada! Total de vagas encontradas: ${todasAsVagas.length}`);
        
        // Salva os resultados no cache
        searchCache[cacheKey] = {
            timestamp: now,
            data: todasAsVagas
        };
     
        res.json(todasAsVagas);

    } catch (error) {
        console.error('Erro geral na rota de vagas:', error);
        res.status(500).json({ error: 'Erro ao processar a busca de vagas.' });
    }
});

// Rota do agente de análise de currículo
app.post('/api/analisar-curriculo', agentController.analisarCurriculo);

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});