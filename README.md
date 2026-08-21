# Site de Casamento — Jorge & Benícia 💍

Este repositório preserva o projeto do site de casamento mantendo a identidade visual e a estrutura que foram criadas originalmente.

A versão pública foi organizada para portfólio sem redesenhar o site: foram mantidas a paleta terracota, a imagem de capa, a divisória floral, o contador regressivo, a confirmação de presença e a lista de presentes.

## Estrutura visual preservada

- header terracota com sombra;
- título `Jorge & Benícia` com a fonte Alex Brush;
- `imagens/capa.png` no header;
- fundo terracota claro;
- contador regressivo no estilo flip/vintage;
- `imagens/divisoria.png` entre as seções;
- seção de confirmação de presença;
- seção de lista de presentes;
- footer terracota.

## Arquivos principais

```text
.
├── index.html
├── style.css
├── script.js
├── imagens/
│   ├── capa.png
│   └── divisoria.png
├── backend/
├── docs/
├── sql/
└── .github/workflows/pages.yml
```

## Evolução técnica do projeto

O projeto começou em HTML, CSS e JavaScript e, durante seu desenvolvimento, passou a utilizar backend PHP, banco MySQL e integrações relacionadas a confirmação de presença e pagamentos Pix.

Os diretórios `backend/`, `sql/` e `docs/` servem apenas para documentar essa evolução técnica. Eles não alteram a aparência do site publicado no GitHub Pages.

## Segurança

A integração original com Google Sheets utilizava credenciais no JavaScript. Essas credenciais não são reutilizadas na versão pública atual.

Da mesma forma, nenhuma chave Pix, certificado, senha de banco, token ou dado pessoal de convidado é publicado no código atual.

## GitHub Pages

O workflow publica somente os arquivos que compõem o site original:

- `index.html`;
- `style.css`;
- `script.js`;
- pasta `imagens/`.

A intenção deste repositório é apresentar o projeto como ele foi construído, e não redesenhá-lo para parecer um projeto diferente.
