# Site de Casamento — Jorge & Benícia 💍

Projeto full stack reconstruído para portfólio a partir de um site de casamento real. A aplicação centraliza convite personalizado, confirmação de presença, orientações aos convidados e lista de presentes.

A implementação original começou em HTML/CSS/JavaScript e evoluiu para PHP, MySQL e integração Pix no backend. Esta versão pública preserva a arquitetura e a experiência sem publicar dados pessoais, tokens, certificados ou credenciais reais.

## Funcionalidades

- 💌 convite personalizado por convidado e idioma;
- ✅ RSVP com nome, presença, acompanhantes e observações;
- 🎁 lista de presentes carregada dinamicamente por JSON;
- 📊 progresso de contribuição e estado ativo/inativo;
- 👗 página de vestimenta;
- 📍 página de localização demonstrativa;
- 🗄️ schema MySQL e endpoints PHP documentados;
- 💳 arquitetura Pix preservada como demonstração segura;
- 🚀 deploy automatizado com GitHub Actions e GitHub Pages.

## Tecnologias

**Front-end:** HTML5, CSS3, JavaScript Vanilla, Fetch API e Web Storage.

**Backend/documentação:** PHP 8+, PDO, MySQL e modelagem relacional.

**DevOps:** Git, GitHub Actions e GitHub Pages.

## Estrutura

```text
.
├── .github/workflows/pages.yml
├── assets/
│   ├── css/styles.css
│   └── js/
├── backend/
├── data/presentes.json
├── docs/
├── sql/schema.sql
├── index.html
├── convite.html
├── confirmacao.html
├── presentes.html
├── vestimenta.html
└── local.html
```

## Demonstração

O front-end funciona como site estático. A confirmação de presença usa `localStorage` e a lista de presentes usa `data/presentes.json`, permitindo demonstrar a experiência sem servidor.

O backend em `backend/` documenta como o projeto operava com PHP/MySQL. O endpoint `gerar_pix_demo.php` é deliberadamente desativado e não cria cobranças reais.

## Segurança

Credenciais, certificados, chaves Pix, CPF e dados reais de convidados não fazem parte desta versão. `backend/config.php` é ignorado pelo Git; somente `config.example.php` é versionado.

O script legado que continha referências antigas de integração foi removido do estado atual da reconstrução. Consulte `docs/SECURITY.md`.

## História do projeto

O repositório original ainda preservava uma versão inicial do site, incluindo paleta terracota, contador regressivo, confirmação via Google Sheets e imagens. A reconstrução foi adicionada como uma nova etapa para manter o histórico de evolução do projeto.

Consulte `docs/RECOVERY.md` e `docs/ARCHITECTURE.md` para mais detalhes.

## Publicação

O workflow em `.github/workflows/pages.yml` publica somente os arquivos necessários ao GitHub Pages: HTML, `assets/` e `data/`.

> Projeto reconstruído para fins de portfólio. Integrações financeiras e dados pessoais reais foram removidos.
