# Publicação

A reconstrução usa o repositório original `jorgebandeo/Site-Casamento` para preservar o histórico.

Fluxo recomendado:
1. desenvolver na branch `portfolio-rebuild`;
2. revisar a alteração em pull request;
3. fazer merge na `main`;
4. em Settings → Pages, selecionar GitHub Actions como origem.

O workflow `.github/workflows/pages.yml` publica somente os arquivos HTML, `assets/` e `data/`, deixando PHP, SQL e documentação fora do site estático.
