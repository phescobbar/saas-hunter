// Turso Database Configuration
const TURSO_CONFIG = {
    url: 'https://alphonse-phescobbar.aws-us-east-2.turso.io',
    authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njk4MDkzODcsImlkIjoiOTVkODM0MGItZTgyYS00MDY0LTg5ZDctZmRiMmIxNGM3MjQxIiwicmlkIjoiNTVkMDdlYjAtMGI0Yi00NzE5LTk0MDgtMjZhOGM3ZjE4MzlkIn0.rh4kcIVul-KxMnfbDmvDFOeSUuNtNfU_jIst1I18QMBqml4iFUe-uNeS9dBnV1xfuft2zkNnZcPltIU_wLNPDw'
};

async function queryTurso(sql, params = []) {
    // Pipeline v2 endpoint is more robust for fetch
    const args = params.map(p => {
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
    if (!response.ok) throw new Error(`Turso Error: ${JSON.stringify(data)}`);
    
    const executeResult = data.results.find(r => r.type === 'execute');
    if (executeResult.error) throw new Error(executeResult.error.message);
    
    const result = executeResult.response.result;
    return {
        cols: result.cols.map(c => ({ name: c.name })),
        rows: result.rows.map(row => row.map(value => ({ value })))
    };
}

async function commandTurso(sql, params = []) {
    return await queryTurso(sql, params);
}

window.TursoDB = { query: queryTurso, command: commandTurso };