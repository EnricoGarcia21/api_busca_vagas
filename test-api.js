// Script de teste leve para validar as rotas da API local
const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

async function rodarTestes() {
  console.log("=========================================");
  console.log("🚀 INICIANDO TESTES DE INTEGRAÇÃO DA API");
  console.log("=========================================");
  
  // Certifica-se de que o servidor local está rodando antes de prosseguir
  try {
    const health = await fetch(BASE_URL).catch(() => null);
    if (!health) {
      console.error(`\n❌ ERRO: O servidor backend não parece estar rodando na porta ${PORT}.`);
      console.error("Por favor, rode 'npm run dev' ou 'npm run start' em outro terminal antes de testar.\n");
      process.exit(1);
    }
  } catch (e) {}

  // Teste 1: Buscar Vagas (Endpoint básico dos Scrapers)
  try {
    console.log("\n🧪 Teste 1: Buscando vagas de 'Node' em tempo real...");
    console.log("ℹ️ (Isso pode levar de 15 a 20 segundos pois os robôs estão rodando)");
    
    const start = Date.now();
    const res = await fetch(`${BASE_URL}/api/vagas?keyword=Node&location=Brasil`);
    
    if (!res.ok) throw new Error(`Status: ${res.status}`);
    
    const data = await res.json();
    const duration = Math.round((Date.now() - start) / 1000);
    
    console.log(`✅ Sucesso! Busca finalizada em ${duration}s.`);
    console.log(`📊 Total de vagas encontradas: ${data.length}`);
    
    if (data.length > 0) {
      console.log(`👉 Exemplo da primeira vaga:`);
      console.log(`   - Título: "${data[0].titulo}"`);
      console.log(`   - Empresa: "${data[0].empresa}"`);
      console.log(`   - Plataforma: "${data[0].plataforma}"`);
    } else {
      console.log("⚠️ Nenhuma vaga retornada. Verifique se o site Catho/LinkedIn bloqueou temporariamente.");
    }
  } catch (err) {
    console.error("❌ Falha no Teste 1:", err.message);
  }

  // Teste 2: Cache Hit de Performance
  try {
    console.log("\n🧪 Teste 2: Buscando 'Node' novamente para validar Cache Hit...");
    
    const start = Date.now();
    const res = await fetch(`${BASE_URL}/api/vagas?keyword=Node&location=Brasil`);
    
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
}

rodarTestes();
