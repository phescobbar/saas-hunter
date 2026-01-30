// Turso Database Configuration
const TURSO_CONFIG = {
    url: 'https://alphonse-phescobbar.aws-us-east-2.turso.io',
    authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njk4MDkzODcsImlkIjoiOTVkODM0MGItZTgyYS00MDY0LTg5ZDctZmRiMmIxNGM3MjQxIiwicmlkIjoiNTVkMDdlYjAtMGI0Yi00NzE5LTk0MDgtMjZhOGM3ZjE4MzlkIn0.rh4kcIVul-KxMnfbDmvDFOeSUuNtNfU_jIst1I18QMBqml4iFUe-uNeS9dBnV1xfuft2zkNnZcPltIU_wLNPDw'
};

async function executeTursoQuery(sql, params = []) {
    const args = params.map(p => {
        if (typeof p === 'string') return { type: 'text', value: p };
        if (typeof p === 'number') return { type: 'integer', value: p };
        if (p === null) return { type: 'null', value: null };
        return { type: 'text', value: String(p) };
    });

    const response = await fetch(`${TURSO_CONFIG.url}/v2/pipeline`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${TURSO_CONFIG.authToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            requests: [
                { type: 'execute', stmt: { sql, args } },
                { type: 'close' }
            ]
        })
    });

    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(`Turso HTTP Error: ${JSON.stringify(data)}`);
    }

    return data.results;
}

async function queryTurso(sql, params = []) {
    const results = await executeTursoQuery(sql, params);
    const executeResult = results.find(r => r.type === 'execute');
    
    if (executeResult.type === 'error') {
        throw new Error(executeResult.error.message);
    }
    
    return executeResult.response.result;
}

async function commandTurso(sql, params = []) {
    const results = await executeTursoQuery(sql, params);
    const executeResult = results.find(r => r.type === 'execute');
    
    if (executeResult.type === 'error') {
        throw new Error(executeResult.error.message);
    }
    
    return executeResult.response.result;
}

window.TursoDB = { query: queryTurso, command: commandTurso };