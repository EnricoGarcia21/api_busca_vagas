const { rodarRoboDeBusca } = require('../scraper/vagasScraper');

async function dispararBusca(req, res) {
  try {
    
    console.log("🕵️‍♂️ Robô de busca acionado pela API...");

    
    const resultadoDasVagas = await rodarRoboDeBusca();

    
    return res.status(200).json({
      sucesso: true,
      mensagem: "Busca realizada com sucesso!",
      total_vagas: resultadoDasVagas.length,
      vagas: resultadoDasVagas
    });

  } catch (error) {
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao rodar o processo de busca de vagas.",
      erro: error.message
    });
  }
}

module.exports = { dispararBusca };