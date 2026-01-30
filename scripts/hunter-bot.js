const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');

// Config
const PROJECT_DIR = path.resolve(__dirname, '..');
const DATA_FILE = path.join(PROJECT_DIR, 'saas.json');
const LOG_FILE = path.join(PROJECT_DIR, 'hunter.log');
const BRAVE_API_KEY = 'BSAOPQ4mA6hI8lYL0PZqLpFTEAkKZab';

function log(msg) {
    const entry = `[${new Date().toISOString()}] ${msg}\n`;
    fs.appendFileSync(LOG_FILE, entry);
    console.log(msg);
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function loadData() {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function braveSearch(query) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.search.brave.com',
            path: `/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`,
            headers: { 'Accept': 'application/json', 'Accept-Encoding': 'gzip', 'X-Subscription-Token': BRAVE_API_KEY }
        };
        https.get(options, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
            });
        }).on('error', reject);
    });
}

// Simple fetch for content (fallback to gemini if fetch fails/blocks)
async function fetchPageContent(url) {
    // Note: Node's native fetch might be blocked by some sites. 
    // In a real prod env, we'd use Puppeteer or a proxy.
    // For now, let's try a simple fetch.
    try {
        const res = await fetch(url);
        const text = await res.text();
        return text.substring(0, 15000); // Limit context
    } catch (e) {
        return null;
    }
}

async function analyzeWithGemini(content, url) {
    log('Analisando com Gemini...');
    const prompt = `
    Analise o conteúdo deste site SaaS (${url}) e extraia os dados para um JSON estrito.
    Se não encontrar um dado exato, infira com base no contexto ou coloque "N/A".
    
    Campos necessários:
    - name: Nome do produto
    - desc: Descrição curta (1 frase)
    - mrr: Receita mensal estimada (apenas números, ex: 5000)
    - customers: Número de clientes
    - ticket: Preço do plano inicial (apenas números)
    - why: Por que funciona? (Resumo de mercado)
    - stack: Tecnologias prováveis
    - time: Tempo estimado de MVP
    - cost: Custo estimado de operação
    - briefing: Texto longo e detalhado (3 parágrafos) vendendo o produto, explicando funcionalidades e modelo de negócio.

    Conteúdo do site:
    ${content.replace(/"/g, "'")}
    
    Responda APENAS o JSON válido. Sem markdown.
    `;

    try {
        // Usando o CLI do gemini instalado no sistema
        // Precisamos escapar o prompt para o shell
        const cmd = `/home/escobar/.npm-global/bin/gemini "${prompt.replace(/"/g, '\\"')}"`;
        const output = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
        
        // Limpar markdown code blocks se o gemini colocar
        const jsonStr = output.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (e) {
        log(`Erro no Gemini: ${e.message}`);
        return null;
    }
}

async function huntSaas() {
    const queries = [
        '"SaaS" "MRR" "revenue" 2025 site:indiehackers.com',
        '"SaaS" "open startup" "MRR" 2025'
    ];
    const query = queries[Math.floor(Math.random() * queries.length)];
    
    try {
        await delay(3000);
        const results = await braveSearch(query);
        
        if (!results.web || !results.web.results) return null;

        const currentData = loadData();
        const existingUrls = new Set(currentData.map(s => s.url));

        for (const result of results.web.results) {
            let url = result.url;
            
            // Se for indiehackers, o gemini pode ler o post e achar a url real
            // Mas para simplificar, vamos tentar pegar links diretos de produtos se possível
            // Ou analisar o próprio post do IH que contém os dados ricos
            
            if (existingUrls.has(url)) continue;

            log(`Analisando candidato: ${url}`);
            
            const content = await fetchPageContent(url);
            if (!content) continue;

            const analysis = await analyzeWithGemini(content, url);
            
            if (analysis && analysis.name) {
                return {
                    id: `saas_${Date.now()}`,
                    ...analysis,
                    url: url, // Mantém a URL original da fonte se o gemini não achar a do produto
                    addedAt: new Date().toISOString()
                };
            }
        }
        return null;

    } catch (e) {
        log(`Erro: ${e.message}`);
        return null;
    }
}

async function main() {
    try {
        const newSaas = await huntSaas();

        if (newSaas) {
            const currentData = loadData();
            // Double check duplication by name extracted
            if (currentData.some(s => s.name.toLowerCase() === newSaas.name.toLowerCase())) {
                log(`Duplicata por nome: ${newSaas.name}`);
                return;
            }

            currentData.unshift(newSaas);
            fs.writeFileSync(DATA_FILE, JSON.stringify(currentData, null, 4));
            log(`Sucesso: ${newSaas.name}`);

            try {
                execSync(`cd ${PROJECT_DIR} && git add saas.json && git commit -m "Bot: Add ${newSaas.name}" && git push`);
            } catch (gitErr) {}
        }
    } catch (error) {
        log(`FATAL: ${error.message}`);
    }
}

main();
