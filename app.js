require('dotenv').config();
const express = require('express');
const app = express();


const { dispararBusca } = require('./controller/vagasController');

app.use(express.json());

const PORT = process.env.PORT || 3000;

// Rota base de teste
app.get('/', (req, res) => {
  res.json({ mensagem: "API do Gestor de Vagas rodando com sucesso!" });
});


app.get('/buscar-vagas', dispararBusca);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta http://localhost:${PORT}`);
});