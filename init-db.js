async function inicializarBanco() {
    console.log('Iniciando Turso DB...');
    try {
        await TursoDB.command(`
            CREATE TABLE IF NOT EXISTS tools (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                url TEXT NOT NULL,
                desc TEXT,
                mrr TEXT,
                customers TEXT,
                ticket TEXT,
                why TEXT,
                stack TEXT,
                time TEXT,
                cost TEXT,
                briefing TEXT,
                addedAt TEXT NOT NULL
            )
        `);
        console.log('Tabela tools verificada/criada.');
    } catch (e) {
        console.error('Erro ao inicializar banco:', e);
    }
}
inicializarBanco();
