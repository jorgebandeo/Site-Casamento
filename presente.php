<?php
require __DIR__ . '/config.php';

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
$presente = null;

if ($id) {
    $conn = abrirConexao();
    $stmt = $conn->prepare('SELECT * FROM presentes WHERE id = ? AND ativo = 1');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $presente = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    $conn->close();
}

if (!$presente) {
    http_response_code(404);
}

$valorTotal = $presente ? (float)$presente['valor_total'] : 0;
$valorRecolhido = $presente ? (float)$presente['valor_recolhido'] : 0;
$restante = max(0, $valorTotal - $valorRecolhido);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= $presente ? htmlspecialchars($presente['nome']) : 'Presente não encontrado' ?></title>
  <link rel="stylesheet" href="style-presente.css?v=<?= time() ?>">
</head>
<body>
  <a href="default.php" class="botao-voltar-flutuante">Voltar</a>

  <main class="presente-container">
    <?php if (!$presente): ?>
      <h1>Presente não encontrado</h1>
    <?php else: ?>
      <h1><?= htmlspecialchars($presente['nome']) ?></h1>
      <img src="<?= htmlspecialchars($presente['imagem_path']) ?>?v=<?= time() ?>" alt="<?= htmlspecialchars($presente['nome']) ?>">
      <p><?= htmlspecialchars($presente['descricao']) ?></p>

      <div class="range-container">
        <label for="contribuicaoRange">Quanto você gostaria de contribuir?</label>
        <input type="range" id="contribuicaoRange" min="0" max="100" step="25" value="25" list="marcas">
        <datalist id="marcas">
          <option value="0"></option>
          <option value="25"></option>
          <option value="50"></option>
          <option value="75"></option>
          <option value="100"></option>
        </datalist>
        <div class="range-label"><span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span></div>
      </div>

      <p>Valor selecionado: <span id="valorSelecionado">R$ 0,00</span></p>

      <label for="valorManual">Ou digite outro valor:</label>
      <input type="number" id="valorManual" min="5" step="0.01" placeholder="Valor mínimo R$ 5,00">

      <div class="autocomplete-wrapper">
        <input type="text" id="inputNome" placeholder="Deixe seu nome" autocomplete="off">
        <ul id="autocompleteList" class="autocomplete-list hidden"></ul>
      </div>

      <button type="button" class="botao" onclick="mostrarPixModal()">Gerar pagamento</button>
    <?php endif; ?>
  </main>

  <div id="pixModal">
    <div class="conteudo-modal">
      <h2 id="tituloPix">Pagamento via Pix</h2>
      <p id="texto_explicativo">Escaneie com seu app bancário</p>

      <img id="qrcode" alt="QR Code Pix">
      <img id="imgSucesso" class="hidden" alt="Pagamento confirmado">

      <textarea id="pixCopiaCola" readonly></textarea>
      <button id="copiarBtn" type="button" class="botao" onclick="copiarCodigoPix()">Copiar código Pix</button>
      <button id="fexar" type="button" class="botao" onclick="fecharPixModal()">Fechar</button>
    </div>
  </div>

  <div id="toast">Código Pix copiado!</div>

<?php if ($presente): ?>
<script>
const presenteId = <?= (int)$id ?>;
const valorRestante = <?= json_encode($restante) ?>;
let listaNomes = [];
let txidAtual = null;
let intervaloPagamento = null;

document.addEventListener('DOMContentLoaded', () => {
  carregarConvidadosPresente();
  configurarValores();
  configurarPlaceholder();
});

async function carregarConvidadosPresente() {
  try {
    const response = await fetch('listar_convidados.php?v=' + Math.random());
    const nomes = await response.json();
    listaNomes = Array.isArray(nomes) ? nomes : [];
    preencherAutoComplete(listaNomes);
  } catch (error) {
    console.error(error);
  }
}

function preencherAutoComplete(nomes) {
  const input = document.getElementById('inputNome');
  const list = document.getElementById('autocompleteList');

  input.addEventListener('input', function () {
    const filtro = this.value.toLowerCase();
    list.innerHTML = '';

    if (!filtro) {
      list.classList.add('hidden');
      return;
    }

    nomes
      .filter(nome => String(nome).toLowerCase().includes(filtro))
      .forEach(nome => {
        const li = document.createElement('li');
        li.textContent = nome;
        li.onclick = () => {
          input.value = nome;
          list.classList.add('hidden');
        };
        list.appendChild(li);
      });

    if (list.children.length) list.classList.remove('hidden');
    else list.classList.add('hidden');
  });
}

function configurarPlaceholder() {
  const input = document.getElementById('inputNome');
  const texto = 'Deixe seu nome';
  input.addEventListener('focus', () => input.placeholder = '');
  input.addEventListener('blur', () => {
    if (!input.value) input.placeholder = texto;
  });
}

function configurarValores() {
  const range = document.getElementById('contribuicaoRange');
  const manual = document.getElementById('valorManual');

  range.addEventListener('input', () => {
    manual.value = '';
    atualizarValorSelecionado();
  });

  manual.addEventListener('input', atualizarValorSelecionado);
  atualizarValorSelecionado();
}

function valorDaContribuicao() {
  const manual = Number(document.getElementById('valorManual').value);
  if (manual > 0) return manual;

  const percentual = Number(document.getElementById('contribuicaoRange').value);
  return valorRestante * (percentual / 100);
}

function atualizarValorSelecionado() {
  let valor = valorDaContribuicao();
  if (valor > 0 && valor < 5) valor = 5;
  if (valor > valorRestante) valor = valorRestante;

  document.getElementById('valorSelecionado').textContent =
    valor.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
}

async function mostrarPixModal() {
  const nome = document.getElementById('inputNome').value.trim();
  let valor = valorDaContribuicao();

  if (!nome) {
    alert('Informe seu nome para continuar.');
    return;
  }

  if (!valor || valor < 5) {
    alert('A contribuição mínima é de R$ 5,00.');
    return;
  }

  if (valor > valorRestante) {
    alert('O valor não pode ser maior que o restante do presente.');
    return;
  }

  const modal = document.getElementById('pixModal');
  modal.style.display = 'flex';
  document.getElementById('texto_explicativo').textContent = 'Gerando QR Code...';
  document.getElementById('qrcode').classList.remove('hidden');
  document.getElementById('imgSucesso').classList.add('hidden');

  try {
    const response = await fetch('meu-pix/pix.php?v=' + Math.random(), {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        nome: nome,
        valor: valor.toFixed(2),
        presente_id: presenteId
      })
    });

    const data = await response.json();
    if (!response.ok || !data.txid) throw new Error(data.erro || 'Erro ao gerar Pix');

    txidAtual = data.txid;
    document.getElementById('qrcode').src = data.pix || '';
    document.getElementById('pixCopiaCola').value = data.copiaecola || '';
    document.getElementById('texto_explicativo').textContent = 'Escaneie com seu app bancário';

    iniciarVerificacaoPagamento(txidAtual);
  } catch (error) {
    console.error(error);
    document.getElementById('texto_explicativo').textContent = 'Erro ao gerar Pix.';
  }
}

function copiarCodigoPix() {
  const codigo = document.getElementById('pixCopiaCola').value;
  if (!codigo) return;

  navigator.clipboard.writeText(codigo);
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1800);
}

function fecharPixModal() {
  document.getElementById('pixModal').style.display = 'none';

  if (intervaloPagamento) {
    clearInterval(intervaloPagamento);
    intervaloPagamento = null;
  }
  // Fechar o modal não cancela a cobrança no servidor.
}

function iniciarVerificacaoPagamento(txid) {
  if (intervaloPagamento) clearInterval(intervaloPagamento);

  intervaloPagamento = setInterval(async () => {
    try {
      const response = await fetch(
        'meu-pix/verificar_pagamento.php?codigo=' + encodeURIComponent(txid) + '&v=' + Math.random()
      );
      const data = await response.json();

      if (data.status === 'CONCLUIDA' || data.status === 'confirmado') {
        clearInterval(intervaloPagamento);
        intervaloPagamento = null;

        document.getElementById('qrcode').classList.add('hidden');
        document.getElementById('imgSucesso').classList.remove('hidden');
        document.getElementById('texto_explicativo').textContent = 'Pagamento confirmado';
        document.getElementById('copiarBtn').classList.add('hidden');

        const fechar = document.getElementById('fexar');
        fechar.textContent = 'Voltar';
        fechar.onclick = () => window.location.href = 'default.php';
      }
    } catch (error) {
      console.error(error);
    }
  }, 5000);
}
</script>
<?php endif; ?>
</body>
</html>
