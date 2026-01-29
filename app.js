// ===== SaaS Hunter - App Logic =====

class SaasHunter {
    constructor() {
        this.tools = [];
        this.init();
    }

    init() {
        this.loadTools();
        this.bindEvents();
        this.render();
    }

    // ===== Storage =====
    loadTools() {
        const saved = localStorage.getItem('saas_hunter_tools');
        this.tools = saved ? JSON.parse(saved) : [];
    }

    saveTools() {
        localStorage.setItem('saas_hunter_tools', JSON.stringify(this.tools));
    }

    // ===== CRUD =====
    addTool(data) {
        const tool = {
            id: Date.now().toString(36),
            ...data,
            addedAt: new Date().toISOString()
        };
        this.tools.unshift(tool);
        this.saveTools();
        this.render();
    }

    deleteTool(id) {
        if (confirm('Remover esta ferramenta?')) {
            this.tools = this.tools.filter(t => t.id !== id);
            this.saveTools();
            this.render();
        }
    }

    // ===== Events =====
    bindEvents() {
        // Modal
        const modal = document.getElementById('addModal');
        const openBtn = document.getElementById('addSaasBtn');
        const closeBtns = [document.getElementById('closeModal'), document.getElementById('cancelAdd')];
        const saveBtn = document.getElementById('saveSaas');

        openBtn.onclick = () => modal.classList.add('open');
        closeBtns.forEach(b => b.onclick = () => modal.classList.remove('open'));
        
        saveBtn.onclick = () => {
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
                cost: document.getElementById('saasCost').value.trim()
            };

            if (data.name && data.url) {
                this.addTool(data);
                modal.classList.remove('open');
                // Clear fields
                document.querySelectorAll('input, textarea').forEach(el => el.value = '');
            } else {
                alert('Nome e URL são obrigatórios');
            }
        };

        // Search
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.render(e.target.value);
        });
    }

    // ===== Render =====
    render(query = '') {
        const grid = document.getElementById('saasGrid');
        const emptyState = document.getElementById('emptyState');
        const count = document.getElementById('totalCount');

        let filtered = this.tools;
        if (query) {
            const q = query.toLowerCase();
            filtered = this.tools.filter(t => 
                t.name.toLowerCase().includes(q) || 
                t.desc.toLowerCase().includes(q) ||
                (t.stack && t.stack.toLowerCase().includes(q))
            );
        }

        count.textContent = filtered.length;

        if (filtered.length === 0) {
            grid.innerHTML = '';
            emptyState.classList.add('visible');
            return;
        }

        emptyState.classList.remove('visible');
        grid.innerHTML = filtered.map(tool => `
            <div class="saas-card">
                <div class="saas-header">
                    <h3 class="saas-title">${tool.name}</h3>
                    <button onclick="hunter.deleteTool('${tool.id}')" style="background:none;border:none;color:var(--text-secondary);cursor:pointer">&times;</button>
                </div>
                <a href="${tool.url.startsWith('http') ? tool.url : 'https://' + tool.url}" target="_blank" class="saas-link">
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

                ${tool.stack ? `
                <div class="saas-stack" style="font-size:0.75rem;color:var(--text-secondary);margin-bottom:0.5rem">
                    🛠️ ${tool.stack}
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
