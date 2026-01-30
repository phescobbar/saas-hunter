// Turso Database Configuration
const TURSO_CONFIG = {
    url: 'https://alphonse-phescobbar.aws-us-east-2.turso.io',
    authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njk4MDkzODcsImlkIjoiOTVkODM0MGItZTgyYS00MDY0LTg5ZDctZmRiMmIxNGM3MjQxIiwicmlkIjoiNTVkMDdlYjAtMGI0Yi00NzE5LTk0MDgtMjZhOGM3ZjE4MzlkIn0.rh4kcIVul-KxMnfbDmvDFOeSUuNtNfU_jIst1I18QMBqml4iFUe-uNeS9dBnV1xfuft2zkNnZcPltIU_wLNPDw'
};

async function queryTurso(sql, params = []) {
    const response = await fetch(TURSO_CONFIG.url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${TURSO_CONFIG.authToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ statements: [{ sql, args: params }] })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(`Turso Error: ${JSON.stringify(data)}`);
    
    // Standard format for Turso /statements endpoint
    const result = data[0].results;
    return {
        cols: result.columns.map(name => ({ name })),
        rows: result.rows.map(row => row.map(value => ({ value })))
    };
}

async function commandTurso(sql, params = []) {
    return await queryTurso(sql, params);
}

window.TursoDB = { query: queryTurso, command: commandTurso };