# Site de Casamento — Jorge & Benícia

Reconstrução histórica do site de casamento desenvolvido em 2025.

A versão mais avançada do projeto foi desenvolvida diretamente na hospedagem da Hostinger e não foi enviada ao GitHub. A `main` guardou apenas um protótipo preliminar. Esta reconstrução usa as conversas do próprio projeto como backup funcional e procura manter apenas estruturas, comportamentos e decisões que foram efetivamente trabalhados naquela época.

## Estrutura recuperada

- `default.php` — página principal usada na hospedagem;
- `style.css` — identidade terracota e layout principal;
- `script.js` — contador, RSVP, autocomplete e carregamento da lista;
- `listar_convidados.php` — nomes da tabela `Convidados`;
- `confirmar_presenca.php` — confirmação de presença no MySQL;
- `get_presentes.php` — leitura da tabela `presentes`;
- `presente.php?id=...` — contribuição de um presente;
- `style-presente.css` — estilos da página individual;
- `vestimenta.html` — página PT/ES “Estilo & Vestimenta”;
- `convite.php?slug=...` — convite personalizado por nome/idioma;
- `meu-pix/pix.php` — criação da cobrança Pix Gerencianet/Efí;
- `meu-pix/verificar_pagamento.php` — consulta por `txid`;
- `meu-pix/verificar_transacoes.php` — verificação das transações recentes;
- `sql/schema.sql` — modelo relacional reconstruído.

## Página principal

Foram recuperados os elementos discutidos no projeto:

- paleta terracota;
- fundo terracota claro;
- `imagens/capa.png`;
- título Jorge & Benícia com fonte manuscrita;
- contador regressivo vintage;
- três atalhos abaixo do contador: confirmação, presentes e tipo de vestimenta;
- `imagens/divisoria.png`;
- confirmação de presença com autocomplete;
- lista de presentes carregada do MySQL;
- cards centralizados;
- área `#presentes` com aproximadamente 80% da largura;
- item concluído/inativo com classe `desativado`;
- remoção do botão `Contribuir` quando esgotado;
- texto “🎁 Presente já recebido com carinho!”.

## Contribuição de presente

A lista abre `presente.php?id=...`.

Na página individual foram recuperados:

- consulta do presente por `id` com `ativo=1`;
- nome, imagem e descrição;
- slider `#contribuicaoRange` com 0/25/50/75/100;
- `#valorSelecionado`;
- valor manual com mínimo de R$ 5,00;
- nome com autocomplete;
- botão “Gerar pagamento”;
- modal `#pixModal`;
- QR Code de 300 × 300;
- texto “Escaneie com seu app bancário”;
- código Pix copia-e-cola;
- botão “Copiar código Pix”;
- toast “Código Pix copiado!”;
- polling do pagamento.

## Confirmação de presença

A migração final deixou de depender do Google Sheets:

- `listar_convidados.php` executa `SELECT nome FROM Convidados`;
- o autocomplete usa esses nomes;
- o nome informado é validado sem diferenciar maiúsculas/minúsculas;
- `confirmar_presenca.php` executa `UPDATE Convidados SET confirmação = ? WHERE nome = ?`.

Mensagens recuperadas:

- “Preencha seu nome e selecione uma opção de presença.”
- “Nome não encontrado na lista. Verifique se digitou corretamente.”
- “Presença confirmada com sucesso! Obrigado 💕”

## Pix

O fluxo final discutido usava Gerencianet/Efí e MySQL.

Ao gerar a cobrança:

1. o front envia `nome`, `valor` e `presente_id`;
2. `meu-pix/pix.php` cria uma cobrança imediata com expiração de 180 segundos;
3. obtém QR Code, copia-e-cola e `txid`;
4. procura o nome em `Convidados`;
5. salva imediatamente em `transacoes_pix`;
6. se encontrar o convidado, salva `convidado_id`;
7. caso contrário, salva `nome_manual`.

A cobrança é tratada como expirada após 3 minutos, mas as transações recentes continuam sendo verificadas até completar 5 minutos para permitir confirmação de pagamentos sincronizados no limite do prazo.

Quando o status é `CONCLUIDA`/`confirmado`, a transação é marcada como confirmada e o valor é somado a `presentes.valor_recolhido`.

Fechar o modal não cancela a cobrança no servidor.

## Estilo & Vestimenta

A página recuperada mantém:

- versões em português e espanhol;
- casamento diurno ao ar livre em 15 de agosto, Costa Rosa;
- dress code “Esporte Chique” / “Sport Chic”;
- seção `#mulheres` com botão “Ver sugestões de vestimenta”;
- seção masculina “Para Homens”;
- cores reservadas discutidas no projeto;
- blocos de orientações/itens a evitar;
- IDs espanhóis próprios (`vestimentaSugestaoEs`, `vestimentaHomensEs`) para corrigir o bug dos toggles que existia quando PT e ES repetiam os mesmos IDs.

## Convite personalizado

A versão trabalhada usava:

- `convite.php?slug=...`;
- tabela `convites` com `slug`, `nome` e `idioma`;
- `imagens/carta.png` (arte da carta);
- `imagens/celo.png` sobreposto e clicável;
- etiqueta com o nome do convidado;
- `imagens/convite_pt.png` e `imagens/convite_es.png`;
- fonte local `fontes/snell-roundhand/SnellRoundhand-BoldScript.otf`;
- botão fixo “Site Casamento Jorge & Benícia” voltando para `default.php`.

## Imagens e fonte

A `main` atual ainda contém `imagens/capa.png` e `imagens/divisoria.png`.

As conversas comprovam que a versão hospedada também usou imagens de produtos, `carta.png`, `celo.png`, `convite_pt.png`, `convite_es.png` e a fonte SnellRoundhand. Esses arquivos binários não estão presentes no backup atual do GitHub; por isso o código mantém os caminhos históricos, sem gerar substitutos.

## Segurança

O código público não contém senha MySQL, Client ID/Secret da Efí, chave Pix real nem certificado.

Arquivos reais que existiam apenas no servidor continuam ignorados:

- `config.php`;
- `meu-pix/config.php`;
- `meu-pix/certificado.pem`;
- dependências em `meu-pix/vendor/`.

Para restaurar em PHP/Hostinger, copie os arquivos `.example.php`, configure as credenciais e importe `sql/schema.sql`.
