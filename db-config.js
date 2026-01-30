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

    const body = await response.json();
    if (!response.ok) {
        throw new Error(`Turso HTTP Error: ${JSON.stringify(body)}`);
    }
    return body;
}

async function queryTurso(sql, params = []) {
    const data = await executeTursoQuery(sql, params);
    // Find result in the pipeline response array
    const results = data.results || (Array.isArray(data) ? data : [data]);
    const executeResult = results.find(r => r.type === 'execute' || r.kind === 'execute');
    
    if (!executeResult) throw new Error('Turso response missing execute block');
    if (executeResult.error) throw new Error(executeResult.error.message);
    
    const result = executeResult.response ? executeResult.response.result : (executeResult.result || executeResult);
    if (!result) throw new Error('Turso response missing result data');
    
    return result;
}

async function commandTurso(sql, params = []) {
    return await queryTurso(sql, params);
}

window.TursoDB = { query: queryTurso, command: commandTurso };