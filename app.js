require('dotenv').config();
const express = require('express');
const path = require('path');

const vagasController = require('./controller/vagasController');
const agentController = require('./controller/agentController');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Rota de busca de vagas com agregador multiplataforma (Gupy, Catho, LinkedIn) e cache
app.get('/api/vagas', vagasController.buscarVagas);

// Rota do agente de análise de currículo (IA / Gemini)
app.post('/api/analisar-curriculo', agentController.analisarCurriculo);

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Servidor rodando em http://localhost:${port}`);
    });
}

module.exports = app;


