# Arquitetura

A reconstrução separa a demonstração estática do backend histórico.

## Front-end
- HTML, CSS e JavaScript Vanilla
- convite personalizado por query string
- RSVP demonstrativo com localStorage
- lista de presentes carregada de `data/presentes.json`

## Backend demonstrativo
- PHP 8+
- PDO
- MySQL
- endpoints de RSVP e presentes
- ponto de integração Pix deliberadamente desativado

## Fluxo original
Browser → PHP → MySQL e, no pagamento, PHP → API Pix → confirmação → atualização da transação/produto.

O GitHub Pages publica apenas HTML, `assets/` e `data/`; `backend/`, `sql/` e `docs/` permanecem somente como documentação técnica no repositório.
