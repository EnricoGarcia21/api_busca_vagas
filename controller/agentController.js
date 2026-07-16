const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdfParse = require('pdf-parse');

async function analisarCurriculo(req, res) {
    try {
        let textoCurriculo = '';

        // 1. Extração de texto (PDF ou Texto corrido)
        if (req.body.file) {
            console.log("📄 Recebido arquivo PDF em Base64 para análise.");
            // Remove o prefixo do dataURI se houver
            const base64Data = req.body.file.replace(/^data:application\/pdf;base64,/, "");
            const buffer = Buffer.from(base64Data, 'base64');
            
            try {
                const pdfData = await pdfParse(buffer);
                textoCurriculo = pdfData.text;
                console.log(`✅ PDF extraído com sucesso! Caracteres extraídos: ${textoCurriculo.length}`);
            } catch (pdfError) {
                console.error("Erro ao analisar PDF:", pdfError);
                return res.status(400).json({ error: "Falha ao extrair texto do PDF enviado." });
            }
        } else if (req.body.text) {
            console.log("✍️ Recebido currículo em texto corrido.");
            textoCurriculo = req.body.text;
        } else {
            return res.status(400).json({ error: "É necessário enviar o texto do currículo ou um PDF em Base64." });
        }

        if (!textoCurriculo.trim()) {
            return res.status(400).json({ error: "O conteúdo do currículo está vazio." });
        }

        // 2. Fallback caso não possua chave do Gemini
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes("sua_chave") || process.env.GEMINI_API_KEY.trim() === "") {
            console.warn("⚠️ GEMINI_API_KEY não configurada no arquivo .env. Usando análise simulada.");
            return res.json({
                skills: ["React", "Node.js", "JavaScript", "HTML", "CSS", "Express", "Git"],
                keywords: ["Desenvolvedor React", "React Developer", "Desenvolvedor Front-end"],
                summary: "Desenvolvedor Full Stack com ênfase em React e Node.js (Análise simulada, configure a GEMINI_API_KEY para análise real).",
                isDemo: true
            });
        }

        // 3. Integração real com a API do Gemini
        console.log("🤖 Enviando perfil ao agente Gemini para análise estruturada...");
        
        // Inicializa o SDK do Gemini
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                responseMimeType: 'application/json'
            }
        });
        
        const prompt = `Você é um recrutador especialista em TI. Analise o seguinte currículo e extraia informações estruturadas no formato JSON abaixo.
O JSON deve seguir exatamente este formato, sem formatação de código markdown extra (retorne apenas a string JSON limpa):
{
  "skills": ["Tecnologia 1", "Tecnologia 2"],
  "keywords": ["Cargo ideal 1", "Cargo ideal 2"],
  "summary": "Resumo profissional curto do candidato em até duas linhas."
}

As keywords devem ser os termos mais adequados e específicos para pesquisar vagas de emprego compatíveis (ex: se o currículo possui React, sugira "Desenvolvedor React", "React Developer", etc).
As skills devem ser as tecnologias ou ferramentas presentes (ex: "React", "Node.js", "Docker").

Currículo para análise:
${textoCurriculo}`;

        const response = await model.generateContent(prompt);

        const textResponse = response.response.text();
        console.log("📝 Resposta bruta do Gemini recebida.");
        
        const jsonResult = JSON.parse(textResponse);
        
        return res.json({
            skills: jsonResult.skills || [],
            keywords: jsonResult.keywords || [],
            summary: jsonResult.summary || "Perfil profissional de TI analisado.",
            isDemo: false
        });

    } catch (error) {
        console.error("Erro na análise do currículo pelo agente:", error);
        return res.status(500).json({ error: "Erro interno no agente de análise de currículo." });
    }
}

module.exports = { analisarCurriculo };
