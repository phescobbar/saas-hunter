// ===== SaaS Hunter - App Logic (Turso DB Version) =====

class SaasHunter {
    constructor() {
        this.tools = [];
        this.init();
    }

    async init() {
        this.bindEvents();
        if (window.TursoDB) {
            await this.loadTools();
        } else {
            const checkDB = setInterval(async () => {
                if (window.TursoDB) {
                    clearInterval(checkDB);
                    await this.loadTools();
                }
            }, 100);
        }
    }

    // ===== Storage =====
    async loadTools() {
        this.showLoading(true);
        try {
            const result = await window.TursoDB.query('SELECT * FROM tools ORDER BY addedAt DESC');
            
            if (!result || !result.rows) {
                this.tools = [];
            } else {
                const columns = result.cols.map(c => c.name);
                this.tools = result.rows.map(row => {
                    const tool = {};
                    row.forEach((val, i) => {
                        tool[columns[i]] = (val && typeof val === 'object' && 'value' in val) ? val.value : val;
                    });
                    return tool;
                });
            }

            this.render();
        } catch (e) {
            console.error('Erro ao carregar do Turso:', e);
            this.render();
        } finally {
            this.showLoading(false);
        }
    }

    async saveToolToDB(data) {
        this.showLoading(true);
        try {
            const id = Date.now().toString(36);
            const addedAt = new Date().toISOString();
            
            await window.TursoDB.command(
                'INSERT INTO tools (id, name, url, desc, mrr, customers, ticket, why, stack, time, cost, briefing, addedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [id, data.name, data.url, data.desc, data.mrr, data.customers, data.ticket, data.why, data.stack, data.time, data.cost, data.briefing, addedAt]
            );
            
            await this.loadTools();
        } catch (e) {
            console.error('Erro ao salvar no Turso:', e);
            alert('Erro ao salvar no banco online.');
        } finally {
            this.showLoading(false);
        }
    }

    showLoading(show) {
        const btn = document.getElementById('addSaasBtn');
        if (!btn) return;
        if (show) {
            btn.classList.add('loading');
            btn.disabled = true;
        } else {
            btn.classList.remove('loading');
            btn.disabled = false;
        }
    }

    // ===== Events =====
    bindEvents() {
        const modal = document.getElementById('addModal');
        const openBtn = document.getElementById('addSaasBtn');
        const closeBtns = [document.getElementById('closeModal'), document.getElementById('cancelAdd')];
        const saveBtn = document.getElementById('saveSaas');

        if (openBtn) openBtn.onclick = () => modal.classList.add('open');
        closeBtns.forEach(b => { if (b) b.onclick = () => modal.classList.remove('open'); });
        
        if (saveBtn) {
            saveBtn.onclick = async () => {
                const data = {
                    name: document.getElementById('saasName').value.trim(),
                    url: document.getElementById('saasUrl').value.trim(),
                    desc: document.getElementById('saasDesc').value.trim(),
                    mrr: document.getElementById('saasMrr').value.trim(),
                    customers: document.getElementById('saasCustomers').value.trim(),
                    ticket: document.getElementById('saasTicket').value.trim(),
                    why: document.getElementById('saasWhy').value.trim(),
                    stack: document.getElementById('saasStack').value.trim(),
                    time: document.getElementById('saasTime').value.trim(),
                    cost: document.getElementById('saasCost').value.trim(),
                    briefing: document.getElementById('saasBriefing').value.trim()
                };

                if (data.name && data.url) {
                    await this.saveToolToDB(data);
                    modal.classList.remove('open');
                    document.querySelectorAll('input, textarea').forEach(el => el.value = '');
                } else {
                    alert('Nome e URL são obrigatórios');
                }
            };
        }

        const briefingModal = document.getElementById('briefingModal');
        const closeBriefingBtns = [document.getElementById('closeBriefing'), document.getElementById('closeBriefingBtn')];
        closeBriefingBtns.forEach(b => { if (b) b.onclick = () => briefingModal.classList.remove('open'); });

        const search = document.getElementById('searchInput');
        if (search) {
            search.addEventListener('input', (e) => {
                this.render(e.target.value);
            });
        }
    }

    showBriefing(id) {
        const tool = this.tools.find(t => t.id === id);
        if (tool) {
            document.getElementById('briefingTitle').textContent = `Ficha Técnica: ${tool.name}`;
            
            let html = `
                <div class="briefing-grid">
                    <div class="briefing-section">
                        <h4>📊 Tração e Mercado</h4>
                        <p><strong>MRR:</strong> $${tool.mrr || 'N/A'}</p>
                        <p><strong>Clientes:</strong> ${tool.customers || 'N/A'}</p>
                        <p><strong>Ticket Médio:</strong> $${tool.ticket || 'N/A'}</p>
                    </div>
                    <div class="briefing-section">
                        <h4>🛠️ Desenvolvimento</h4>
                        <p><strong>Stack:</strong> ${tool.stack || 'N/A'}</p>
                        <p><strong>Tempo MVP:</strong> ${tool.time || 'N/A'}</p>
                        <p><strong>Custo Mensal:</strong> $${tool.cost || 'N/A'}</p>
                    </div>
                </div>
                <div class="briefing-section full-width" style="margin-top:1.5rem">
                    <h4>🧠 Por que funciona?</h4>
                    <p>${tool.why || 'N/A'}</p>
                </div>
                <div class="briefing-section full-width" style="margin-top:1.5rem; border-top: 1px solid var(--border-color); padding-top: 1.5rem">
                    <h4>📝 Briefing Detalhado</h4>
                    <div style="white-space: pre-wrap; line-height: 1.6; color: var(--text-secondary)">
                        ${tool.briefing || 'Sem briefing detalhado.'}
                    </div>
                </div>
            `;
            
            document.getElementById('briefingContent').innerHTML = html;
            document.getElementById('briefingModal').classList.add('open');
        }
    }

    render(query = '') {
        const grid = document.getElementById('saasGrid');
        const emptyState = document.getElementById('emptyState');
        const count = document.getElementById('totalCount');

        if (!grid) return;

        let filtered = this.tools;
        if (query) {
            const q = query.toLowerCase();
            filtered = this.tools.filter(t => 
                (t.name && t.name.toLowerCase().includes(q)) || 
                (t.desc && t.desc.toLowerCase().includes(q)) ||
                (t.stack && t.stack.toLowerCase().includes(q))
            );
        }

        if (count) count.textContent = filtered.length;

        if (filtered.length === 0) {
            grid.innerHTML = '';
            if (emptyState) emptyState.classList.add('visible');
            return;
        }

        if (emptyState) emptyState.classList.remove('visible');
        grid.innerHTML = filtered.map(tool => `
            <div class="saas-card">
                <div class="saas-header">
                    <h3 class="saas-title">${tool.name}</h3>
                    <div style="display:flex;gap:0.5rem">
                        <button onclick="hunter.showBriefing('${tool.id}')" class="btn-briefing">Ver Ficha Completa</button>
                    </div>
                </div>
                <a href="${(tool.url && tool.url.startsWith('http')) ? tool.url : 'https://' + tool.url}" target="_blank" class="saas-link">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                    </svg>
                    ${tool.url}
                </a>
                <p class="saas-desc">${tool.desc || 'Sem descrição.'}</p>
                
                ${tool.mrr || tool.customers ? `
                <div class="saas-stats" style="display:flex;gap:1rem;margin:1rem 0;font-family:var(--font-mono);font-size:0.8rem;color:var(--accent-primary)">
                    ${tool.mrr ? `<span>💰 $${tool.mrr}/mês</span>` : ''}
                    ${tool.customers ? `<span>👥 ${tool.customers} clientes</span>` : ''}
                </div>
                ` : ''}

                <div class="saas-meta">
                    <span>Adicionado em ${new Date(tool.addedAt).toLocaleDateString()}</span>
                </div>
            </div>
        `).join('');
    }
}

// Init
const hunter = new SaasHunter();
window.hunter = hunter;