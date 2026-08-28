const app = require('./app');

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

async function rodarTestes() {
  console.log("=========================================");
  console.log("🚀 INICIANDO TESTES DE INTEGRAÇÃO DA API");
  console.log("=========================================");
  
  let serverInstance = null;
  // Certifica-se de que o servidor local está rodando antes de prosseguir
  try {
    const health = await fetch(BASE_URL).catch(() => null);
    if (!health) {
      console.log(`ℹ️ Servidor não estava rodando. Inicializando servidor de testes na porta ${PORT}...`);
      serverInstance = app.listen(PORT);
      await new Promise(resolve => setTimeout(resolve, 600));
    }
  } catch (e) {}

  try {
    // Teste 1: Buscar Vagas (Endpoint dos Scrapers)
    try {
      console.log("\n🧪 Teste 1: Buscando vagas de 'React' em tempo real...");
      console.log("ℹ️ (Multiplataforma: LinkedIn, Gupy e Catho)");
      
      const start = Date.now();
      const res = await fetch(`${BASE_URL}/api/vagas?keyword=React&location=Brasil`);
      
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      
      const data = await res.json();
      const duration = ((Date.now() - start) / 1000).toFixed(2);
      
      console.log(`✅ Sucesso! Busca finalizada em ${duration}s.`);
      console.log(`📊 Total de vagas encontradas: ${data.length}`);
      
      if (data.length > 0) {
        console.log(`👉 Exemplo da primeira vaga:`);
        console.log(`   - Título: "${data[0].titulo}"`);
        console.log(`   - Empresa: "${data[0].empresa}"`);
        console.log(`   - Localização: "${data[0].localizacao}"`);
        console.log(`   - Plataforma: "${data[0].plataforma}"`);
      } else {
        console.log("⚠️ Nenhuma vaga retornada.");
      }
    } catch (err) {
      console.error("❌ Falha no Teste 1:", err.message);
    }

    // Teste 2: Cache Hit de Performance
    try {
      console.log("\n🧪 Teste 2: Buscando 'React' novamente para validar Cache Hit...");
      
      const start = Date.now();
      const res = await fetch(`${BASE_URL}/api/vagas?keyword=React&location=Brasil`);
      
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      
      const data = await res.json();
      const duration = Date.now() - start;
      
      console.log(`✅ Sucesso!`);
      console.log(`⚡ Tempo de resposta: ${duration}ms (esperado < 100ms se obtido do cache)`);
      console.log(`📊 Vagas em cache retornadas: ${data.length}`);
      
      if (duration > 500) {
        console.warn("⚠️ Atenção: A resposta demorou mais de 500ms, o cache pode ter expirado ou falhado.");
      } else {
        console.log("🎯 Cache hit confirmado com sucesso!");
      }
    } catch (err) {
      console.error("❌ Falha no Teste 2:", err.message);
    }

    // Teste 3: Analisar Currículo (Agente de IA)
    try {
      console.log("\n🧪 Teste 3: Enviando currículo em texto para o Agente de IA...");
      
      const res = await fetch(`${BASE_URL}/api/analisar-curriculo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "José da Silva. Desenvolvedor Front-end especialista em React, JavaScript, HTML, CSS e Git. Familiaridade com Node.js."
        })
      });
      
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      
      const data = await res.json();
      
      console.log("✅ Sucesso! O Agente retornou a análise estruturada.");
      console.log("🤖 Perfil Extraído:");
      console.log(`   - Resumo: "${data.summary}"`);
      console.log(`   - Habilidades Identificadas: [${data.skills.join(", ")}]`);
      console.log(`   - Termos de Busca Recomendados: [${data.keywords.join(", ")}]`);
      console.log(`   - Modo de Execução: ${data.isDemo ? "Demonstração (Sem API Key)" : "Real (Gemini API)"}`);
    } catch (err) {
      console.error("❌ Falha no Teste 3:", err.message);
    }

    console.log("\n=========================================");
    console.log("🎉 TODOS OS TESTES FORAM PROCESSADOS!");
    console.log("=========================================\n");

  } finally {
    if (serverInstance) {
      serverInstance.close();
    }
  }
}

rodarTestes();
