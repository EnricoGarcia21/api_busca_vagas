# 🔍 BuscaVagas - Dashboard & Otimizador de Currículos com IA

Uma aplicação moderna e completa projetada para automatizar a busca de vagas de emprego na área de Tecnologia da Informação (TI). O sistema realiza a raspagem de dados (*web scraping*) em tempo real no LinkedIn e na Catho, faz cache inteligente dos resultados e utiliza um **Agente de IA (Gemini)** para analisar o currículo do candidato, sugerir termos de busca e calcular a compatibilidade (Match Score %) de cada oportunidade.

---

## ⚡ Funcionalidades Principais

*   **Painel Dashboard Moderno:** Desenvolvido em **React**, **Vite** e **Tailwind CSS**, oferecendo um visual dark-mode, responsivo, com skeletons de carregamento e efeitos visuais fluidos.
*   **Agente de IA de Currículo:**
    *   **Leitor de PDF:** Permite fazer upload de currículos em formato PDF (processamento em memória com `pdf-parse`) ou copiar e colar o texto profissional direto no painel.
    *   **Análise do Perfil:** Conexão com a API do **Google Gemini** para extração estruturada de competências técnicas (*skills*), criação de resumo profissional e sugestão de palavras-chave.
    *   **Modo Demo:** O sistema executa em modo de demonstração com dados simulados caso a chave de API não esteja configurada.
*   **Match Score Inteligente (%):** Compara automaticamente as competências extraídas do currículo com os títulos e descrições das vagas encontradas, atribuindo uma nota de aderência de 0% a 100% e destacando as tecnologias correspondentes.
*   **Scrapers de Alto Volume:**
    *   **Catho:** Paginação automática sequencial (páginas 1 e 2) para coletar mais oportunidades.
    *   **LinkedIn:** Rotina de auto-scroll para forçar o *lazy loading* de mais vagas e clique automatizado no botão "Ver mais vagas".
*   **Cache na API:** Armazena em cache memória no Express as buscas realizadas por termo/cidade por 15 minutos, fazendo com que pesquisas repetidas retornem instantaneamente (<100ms).
*   **Filtros no Frontend:** Filtragem instantânea por texto (título/empresa) e botões rápidos por plataforma de origem (LinkedIn ou Catho).

---

## 🛠️ Tecnologias Utilizadas

### Servidor (Backend)
*   **Node.js & Express:** Ambiente de execução e servidor de rotas da API.
*   **Puppeteer:** Automação de navegação para raspagem dinâmica dos portais de vaga.
*   **@google/generative-ai:** SDK oficial da Google para integração com o modelo Gemini (para análise inteligente do perfil).
*   **pdf-parse:** Extrator de texto bruto de documentos PDF em memória.
*   **Concurrently:** Execução em paralelo dos servidores de frontend e backend em ambiente de desenvolvimento.

### Painel (Frontend)
*   **React (v19):** Biblioteca de construção de interfaces de usuário reativas.
*   **Vite:** Builder de frontend extremamente veloz para bundling de produção.
*   **Tailwind CSS (v4):** Estilização utilitária e moderna rápida.
*   **Lucide React:** Coleção de ícones profissionais em SVG.

---

## 📁 Estrutura do Projeto

```text
api_busca_vagas/
├── controller/               # Lógica de controle de rotas do Express
│   ├── agentController.js    # Controlador do Agente de IA (Gemini / PDF)
│   └── vagasController.js    # (Opcional) Controlador antigo
├── scraper/                  # Scripts de Web Scraping com Puppeteer
│   ├── gupyScraper.js        # Scraper paginado da Catho
│   └── linkedinScraper.js    # Scraper dinâmico do LinkedIn
├── public/                   # Pasta estática (Vite compila o frontend aqui)
├── frontend/                 # Código-fonte da aplicação React + Vite
│   ├── src/
│   │   ├── App.jsx           # Componente principal do Dashboard
│   │   ├── index.css         # Configurações de Tailwind CSS
│   │   └── main.jsx          # Inicializador do React
│   └── vite.config.js        # Configuração do Vite (proxy e build path)
├── .env.example              # Modelo de variáveis de ambiente
├── app.js                    # Inicializador do servidor Express
├── package.json              # Dependências e scripts globais
├── test-api.js               # Script de testes automatizados da API
└── README.md                 # Documentação do projeto
```

---

## 🚀 Como Iniciar o Projeto

### Pré-requisitos
*   Node.js instalado (v18 ou superior recomendado).
*   Uma chave de API da Google AI (obtenha em [Google AI Studio](https://aistudio.google.com/)).

### Instalação de Dependências

1.  Na pasta raiz do projeto, instale as dependências gerais do servidor e utilitários:
    ```bash
    npm install
    ```
2.  Instale as dependências da pasta do frontend React:
    ```bash
    cd frontend
    npm install
    cd ..
    ```

### Configurando Variáveis de Ambiente

Crie um arquivo chamado `.env` na raiz do projeto copiando o modelo `.env.example`:
```bash
# No Windows/PowerShell
copy .env.example .env
```
Abra o arquivo `.env` e configure sua chave da API do Gemini:
```env
GEMINI_API_KEY=sua_chave_do_gemini_aqui
```

### Executando em Ambiente de Desenvolvimento

Para rodar o backend (porta `3000`) e o frontend React (porta `5173` com proxy automático) concorrentemente, execute:
```bash
npm run dev
```
Acesse o sistema no seu navegador: **[http://localhost:5173/](http://localhost:5173/)**

### Compilando para Produção

Caso queira gerar a build de produção otimizada para o Express servir de forma estática pura, rode:
```bash
npm run build
```
O Vite compilará os arquivos estáticos e os moverá para a pasta `/public` na raiz. A partir daí, basta subir o backend com `npm start`.

---

## 🧪 Como Executar Testes

### 1. Teste Manual (Interface Gráfica)
Acesse a aplicação no navegador em [http://localhost:5173/](http://localhost:5173/):
1.  Clique no botão **Agente de Carreira** no cabeçalho.
2.  Envie um currículo (PDF ou texto corrido) e clique em **Analisar**.
3.  Observe as sugestões de cargos geradas e clique em uma delas.
4.  Veja as vagas carregando e o cálculo automático do Score de Match % em cada vaga.
5.  Use a barra de busca rápida no grid para filtrar localmente.

### 2. Testes de Integração Automatizados (API)
Com o servidor de desenvolvimento rodando em um terminal, abra um **outro terminal** na raiz e execute:
```bash
npm test
```
Este comando executará o script `test-api.js`, validando sequencialmente:
1.  A integridade das rotas do Express.
2.  O tempo de resposta do scraping em tempo real da Catho e LinkedIn.
3.  O funcionamento correto do cache em memória (verificando se a segunda requisição responde em menos de 100ms).
4.  O envio e decodificação do currículo pelo agente do Gemini.
