# Metodologia SaaS Hunter: Encontrar SaaS Replicáveis 🎯

**Objetivo:** Encontrar 1 SaaS com receita real (>$5K MRR), tecnicamente simples de construir.

## 1. Buscar produtos com tração
Pesquisar em **Indie Hackers, Hacker News, Product Hunt e Twitter (#buildinpublic)** por:
*   Produtos que compartilharam métricas de receita (MRR, ARR, clientes pagos).
*   Lançamentos recentes com evidência de pagantes.

## 2. Filtrar rapidamente
Manter apenas produtos que:
*   ✅ Têm receita comprovada (não só usuários gratuitos).
*   ✅ Têm pricing público.
*   ✅ Não dependem de ML complexo ou hardware.

## 3. Investigar o melhor candidato
Buscar no site oficial e fontes do fundador:
*   MRR/ARR e número de clientes.
*   Preço cobrado.
*   Problema que resolve.
*   Público alvo.

## 4. Analisar (Output Esperado)
Para cada produto selecionado, gerar o seguinte relatório:

```markdown
# [Nome do Produto]

## O que é
[O que faz, quando lançou, principal métrica]

## Tração
- MRR: $X | Clientes: Y | Ticket: $Z
- Fonte: [URL]

## Por que funciona
[2-3 fatores de sucesso]

## Como replicar
- Stack: [tecnologias]
- Tempo MVP: [estimativa]
- Custo mensal: [estimativa]

## Oportunidades similares
[2-3 nichos adjacentes]
```

## ⚠️ Regras de Pesquisa (Brave API)
*   **Rate Limit:** Respeitar intervalo de **3 segundos** entre cada requisição à API do Brave.
*   **Foco:** Validar receita real, não métricas de vaidade.
