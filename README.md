# SaaS Hunter Database Structure

Estamos usando o Turso (SQLite online) como banco de dados persistente.

## Tabela: tools
Armazena as ferramentas SaaS encontradas e analisadas.

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| id | TEXT (PK) | ID único gerado por timestamp (base36) |
| name | TEXT | Nome do produto |
| url | TEXT | URL do site |
| desc | TEXT | Descrição curta |
| mrr | TEXT | Faturamento mensal |
| customers | TEXT | Número de clientes |
| ticket | TEXT | Ticket médio |
| why | TEXT | Fatores de sucesso |
| stack | TEXT | Stack tecnológica |
| time | TEXT | Tempo de desenvolvimento MVP |
| cost | TEXT | Custo operacional mensal |
| briefing | TEXT | Conteúdo completo da análise |
| addedAt | TEXT | Data de inserção (ISO) |

---
*Documentado por Alphonse 🎩 em 2026-01-30.*
