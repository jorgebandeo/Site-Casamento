const STORAGE_RSVP = 'casamento_demo_rsvp_v1';
const STORAGE_PRESENTES = 'casamento_demo_presentes_v1';

let convidados = [];
let presentesBase = [];
let presenteAtual = null;
let valorAtual = 0;
let expiracaoPix = null;
let timerPix = null;

document.addEventListener('DOMContentLoaded', async () => {
  await carregarConvidados();
  configurarAutocomplete(document.getElementById('inputNome'), document.getElementById('autocompleteList'));
  configurarFormularioPresenca();
  await carregarPresentes();
  atualizarContador();
  setInterval(atualizarContador, 1000);
});

async function carregarConvidados() {
  try {
    const response = await fetch('data/convidados.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Falha ao carregar convidados');
    const dados = await response.json();
    convidados = Array.isArray(dados) ? dados : [];
  } catch (error) {
    console.error(error);
    convidados = [
      'Débora Luana',
      'Luiza e João',
      'Matias e Sabrina',
      'Vauri e Lurdes',
      'Telmo Testoni',
      'Joanna e João',
      'Amanda e Gabriel',
      'Thomas',
      'Telmelize, Roberto e Leonardo'
    ];
  }
}

function normalizarNome(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function nomeExiste(nome) {
  const alvo = normalizarNome(nome);
  return convidados.some(item => normalizarNome(item) === alvo);
}

function configurarAutocomplete(input, lista) {
  if (!input || !lista) return;

  input.addEventListener('input', () => {
    const filtro = normalizarNome(input.value);
    lista.innerHTML = '';

    if (!filtro) {
      lista.classList.add('hidden');
      return;
    }

    convidados
      .filter(nome => normalizarNome(nome).includes(filtro))
      .slice(0, 8)
      .forEach(nome => {
        const item = document.createElement('li');
        item.textContent = nome;
        item.addEventListener('mousedown', event => {
          event.preventDefault();
          input.value = nome;
          lista.classList.add('hidden');
        });
        lista.appendChild(item);
      });

    lista.classList.toggle('hidden', lista.children.length === 0);
  });

  input.addEventListener('blur', () => {
    setTimeout(() => lista.classList.add('hidden'), 120);
  });
}

function configurarFormularioPresenca() {
  const form = document.getElementById('formPresenca');
  if (!form) return;

  const status = criarStatusAbaixoDoFormulario(form);

  form.addEventListener('submit', event => {
    event.preventDefault();

    const nome = form.nome.value.trim();
    const presenca = form.presenca.value;

    if (!nome || !presenca) {
      mostrarStatus(status, 'Preencha seu nome e selecione uma opção de presença.', 'erro');
      return;
    }

    if (!nomeExiste(nome)) {
      mostrarStatus(status, 'Nome não encontrado na lista. Verifique se digitou corretamente.', 'erro');
      return;
    }

    const registros = lerJsonLocal(STORAGE_RSVP, {});
    registros[normalizarNome(nome)] = {
      nome,
      presenca,
      atualizadoEm: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_RSVP, JSON.stringify(registros));

    mostrarStatus(status, 'Presença confirmada com sucesso! Obrigado 💕', 'sucesso');
    form.reset();
  });
}

function criarStatusAbaixoDoFormulario(form) {
  let status = document.getElementById('statusPresenca');
  if (!status) {
    status = document.createElement('p');
    status.id = 'statusPresenca';
    status.className = 'mensagem-status hidden';
    status.setAttribute('role', 'status');
    form.appendChild(status);
  }
  return status;
}

function mostrarStatus(elemento, mensagem, tipo) {
  elemento.textContent = mensagem;
  elemento.className = `mensagem-status ${tipo}`;
}

async function carregarPresentes() {
  const lista = document.getElementById('listaPresentes');
  if (!lista) return;

  try {
    const response = await fetch('data/presentes-pages.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Falha ao carregar presentes');
    presentesBase = await response.json();
    renderizarPresentes();
  } catch (error) {
    console.error(error);
    lista.innerHTML = '<li>Não foi possível carregar a lista de presentes.</li>';
  }
}

function estadoPresentes() {
  return lerJsonLocal(STORAGE_PRESENTES, {});
}

function valorRecolhidoAtual(presente) {
  const estado = estadoPresentes();
  const adicional = Number(estado[presente.id]?.adicional || 0);
  return Math.min(Number(presente.valor_total), Number(presente.valor_recolhido || 0) + adicional);
}

function renderizarPresentes() {
  const lista = document.getElementById('listaPresentes');
  lista.innerHTML = '';

  presentesBase.forEach(presente => {
    const total = Number(presente.valor_total || 0);
    const recolhido = valorRecolhidoAtual(presente);
    const restante = Math.max(0, total - recolhido);
    const concluido = Number(presente.ativo) === 0 || restante <= 0.009;

    const li = document.createElement('li');
    li.className = 'presente-card';

    const card = document.createElement('div');
    card.className = `card${concluido ? ' desativado' : ''}`;

    if (concluido) {
      const check = document.createElement('div');
      check.className = 'fundo-confere';
      check.textContent = '✓';
      card.appendChild(check);
    }

    if (presente.imagem_path) {
      const imagem = document.createElement('img');
      imagem.src = presente.imagem_path;
      imagem.alt = presente.nome;
      imagem.addEventListener('error', () => imagem.remove());
      card.appendChild(imagem);
    }

    const titulo = document.createElement('h3');
    titulo.textContent = presente.nome;
    card.appendChild(titulo);

    const descricao = document.createElement('p');
    descricao.textContent = presente.descricao || '';
    card.appendChild(descricao);

    if (concluido) {
      const recebido = document.createElement('p');
      recebido.className = 'presente-recebido';
      recebido.textContent = '🎁 Presente já recebido com carinho!';
      card.appendChild(recebido);
    } else {
      const valor = document.createElement('p');
      valor.className = 'valor-restante';
      valor.textContent = `Restante: ${formatarMoeda(restante)}`;
      card.appendChild(valor);

      const progresso = document.createElement('div');
      progresso.className = 'progresso-presente';
      const barra = document.createElement('span');
      barra.style.width = `${Math.min(100, (recolhido / total) * 100)}%`;
      progresso.appendChild(barra);
      card.appendChild(progresso);

      const btDiv = document.createElement('div');
      btDiv.className = 'bt_div';
      const botao = document.createElement('button');
      botao.type = 'button';
      botao.className = 'bt_Contribuir';
      botao.textContent = 'Contribuir';
      botao.addEventListener('click', () => abrirContribuicao(presente));
      btDiv.appendChild(botao);
      card.appendChild(btDiv);
    }

    li.appendChild(card);
    lista.appendChild(li);
  });
}

function abrirContribuicao(presente) {
  presenteAtual = presente;
  garantirModalContribuicao();

  const recolhido = valorRecolhidoAtual(presente);
  const restante = Math.max(0, Number(presente.valor_total) - recolhido);

  document.getElementById('modalTituloPresente').textContent = presente.nome;
  document.getElementById('modalRestante').textContent = `Restante: ${formatarMoeda(restante)}`;
  document.getElementById('contribuicaoRangeDemo').value = '25';
  document.getElementById('valorManualDemo').value = '';
  document.getElementById('nomeContribuinteDemo').value = '';
  document.getElementById('etapaContribuicao').classList.remove('hidden');
  document.getElementById('etapaPix').classList.add('hidden');
  document.getElementById('etapaSucesso').classList.add('hidden');
  atualizarValorContribuicao();

  document.getElementById('modalContribuicao').classList.add('aberto');
  document.body.classList.add('modal-aberto');
}

function garantirModalContribuicao() {
  if (document.getElementById('modalContribuicao')) return;

  const modal = document.createElement('div');
  modal.id = 'modalContribuicao';
  modal.className = 'modal-demo';
  modal.innerHTML = `
    <div class="modal-demo-conteudo" role="dialog" aria-modal="true" aria-labelledby="modalTituloPresente">
      <button type="button" class="modal-fechar" aria-label="Fechar">×</button>

      <div id="etapaContribuicao">
        <h2 id="modalTituloPresente"></h2>
        <p id="modalRestante" class="valor-restante"></p>

        <label for="contribuicaoRangeDemo">Quanto você gostaria de contribuir?</label>
        <input type="range" id="contribuicaoRangeDemo" min="0" max="100" step="25" value="25">
        <div class="range-label-demo"><span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span></div>

        <p>Valor selecionado: <strong id="valorSelecionadoDemo"></strong></p>

        <label for="valorManualDemo">Ou digite outro valor:</label>
        <input type="number" id="valorManualDemo" min="5" step="0.01" placeholder="Valor mínimo R$ 5,00">

        <div class="autocomplete-wrapper modal-autocomplete">
          <input type="text" id="nomeContribuinteDemo" placeholder="Deixe seu nome" autocomplete="off">
          <ul id="autocompleteContribuicaoDemo" class="autocomplete-list hidden"></ul>
        </div>

        <p id="statusContribuicaoDemo" class="mensagem-status hidden"></p>
        <button type="button" id="gerarPixDemo" class="bt_Contribuir">Gerar pagamento</button>
      </div>

      <div id="etapaPix" class="hidden">
        <h2>Pagamento via Pix</h2>
        <p>Escaneie com seu app bancário</p>
        <div class="qr-demo" aria-label="QR Code demonstrativo">PIX<br>DEMO</div>
        <p id="pixTempoDemo" class="pix-tempo"></p>
        <textarea id="pixCodigoDemo" readonly></textarea>
        <button type="button" id="copiarPixDemo" class="bt_Contribuir">Copiar código Pix</button>
        <button type="button" id="confirmarPixDemo" class="bt_Contribuir botao-secundario-demo">Simular pagamento confirmado</button>
      </div>

      <div id="etapaSucesso" class="hidden">
        <div class="confirmacao-demo">✓</div>
        <h2>Pagamento confirmado</h2>
        <p>A contribuição foi registrada localmente nesta demonstração.</p>
        <button type="button" id="voltarListaDemo" class="bt_Contribuir">Voltar para a lista</button>
      </div>
    </div>`;

  document.body.appendChild(modal);

  configurarAutocomplete(
    document.getElementById('nomeContribuinteDemo'),
    document.getElementById('autocompleteContribuicaoDemo')
  );

  document.querySelector('.modal-fechar').addEventListener('click', fecharContribuicao);
  modal.addEventListener('click', event => {
    if (event.target === modal) fecharContribuicao();
  });

  document.getElementById('contribuicaoRangeDemo').addEventListener('input', () => {
    document.getElementById('valorManualDemo').value = '';
    atualizarValorContribuicao();
  });
  document.getElementById('valorManualDemo').addEventListener('input', atualizarValorContribuicao);
  document.getElementById('gerarPixDemo').addEventListener('click', gerarPixDemonstrativo);
  document.getElementById('copiarPixDemo').addEventListener('click', copiarPixDemonstrativo);
  document.getElementById('confirmarPixDemo').addEventListener('click', confirmarPixDemonstrativo);
  document.getElementById('voltarListaDemo').addEventListener('click', fecharContribuicao);
}

function calcularRestanteAtual() {
  if (!presenteAtual) return 0;
  return Math.max(0, Number(presenteAtual.valor_total) - valorRecolhidoAtual(presenteAtual));
}

function calcularValorContribuicao() {
  const restante = calcularRestanteAtual();
  const manual = Number(document.getElementById('valorManualDemo')?.value || 0);

  let valor;
  if (manual > 0) {
    valor = manual;
  } else {
    const percentual = Number(document.getElementById('contribuicaoRangeDemo')?.value || 0);
    valor = restante * percentual / 100;
  }

  if (valor > restante) valor = restante;
  return Math.max(0, valor);
}

function atualizarValorContribuicao() {
  valorAtual = calcularValorContribuicao();
  const span = document.getElementById('valorSelecionadoDemo');
  if (span) span.textContent = formatarMoeda(valorAtual);
}

function gerarPixDemonstrativo() {
  const nome = document.getElementById('nomeContribuinteDemo').value.trim();
  const status = document.getElementById('statusContribuicaoDemo');
  valorAtual = calcularValorContribuicao();

  if (!nome) {
    mostrarStatus(status, 'Informe seu nome para continuar.', 'erro');
    return;
  }

  if (valorAtual < 5) {
    mostrarStatus(status, 'A contribuição mínima é de R$ 5,00.', 'erro');
    return;
  }

  const restante = calcularRestanteAtual();
  if (valorAtual > restante + 0.009) {
    mostrarStatus(status, 'O valor não pode ser maior que o restante do presente.', 'erro');
    return;
  }

  const codigo = [
    'PIX-DEMO',
    `PRESENTE-${presenteAtual.id}`,
    `VALOR-${valorAtual.toFixed(2)}`,
    `NOME-${nome}`,
    `TXID-${Date.now()}`
  ].join('|');

  document.getElementById('pixCodigoDemo').value = codigo;
  document.getElementById('etapaContribuicao').classList.add('hidden');
  document.getElementById('etapaPix').classList.remove('hidden');

  expiracaoPix = Date.now() + 180000;
  atualizarTempoPix();
  clearInterval(timerPix);
  timerPix = setInterval(atualizarTempoPix, 1000);
}

function atualizarTempoPix() {
  const elemento = document.getElementById('pixTempoDemo');
  if (!elemento || !expiracaoPix) return;

  const restante = Math.max(0, expiracaoPix - Date.now());
  const segundos = Math.ceil(restante / 1000);
  const min = Math.floor(segundos / 60);
  const seg = String(segundos % 60).padStart(2, '0');
  elemento.textContent = `Expira em ${min}:${seg}`;

  if (restante <= 0) {
    clearInterval(timerPix);
    timerPix = null;
    elemento.textContent = 'Cobrança expirada';
    document.getElementById('confirmarPixDemo').disabled = true;
  } else {
    document.getElementById('confirmarPixDemo').disabled = false;
  }
}

async function copiarPixDemonstrativo() {
  const codigo = document.getElementById('pixCodigoDemo').value;
  try {
    await navigator.clipboard.writeText(codigo);
    mostrarToast('Código Pix copiado!');
  } catch (error) {
    const campo = document.getElementById('pixCodigoDemo');
    campo.select();
    document.execCommand('copy');
    mostrarToast('Código Pix copiado!');
  }
}

function confirmarPixDemonstrativo() {
  if (!presenteAtual || valorAtual < 5) return;
  if (expiracaoPix && Date.now() > expiracaoPix) return;

  const estado = estadoPresentes();
  const registro = estado[presenteAtual.id] || { adicional: 0, transacoes: [] };
  registro.adicional = Number(registro.adicional || 0) + valorAtual;
  registro.transacoes = Array.isArray(registro.transacoes) ? registro.transacoes : [];
  registro.transacoes.push({
    valor: valorAtual,
    confirmadoEm: new Date().toISOString()
  });
  estado[presenteAtual.id] = registro;
  localStorage.setItem(STORAGE_PRESENTES, JSON.stringify(estado));

  clearInterval(timerPix);
  timerPix = null;
  document.getElementById('etapaPix').classList.add('hidden');
  document.getElementById('etapaSucesso').classList.remove('hidden');
  renderizarPresentes();
}

function fecharContribuicao() {
  const modal = document.getElementById('modalContribuicao');
  if (!modal) return;

  modal.classList.remove('aberto');
  document.body.classList.remove('modal-aberto');
  presenteAtual = null;
  valorAtual = 0;
  expiracaoPix = null;
  clearInterval(timerPix);
  timerPix = null;
}

function mostrarToast(mensagem) {
  let toast = document.getElementById('toastDemo');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastDemo';
    toast.className = 'toast-demo';
    document.body.appendChild(toast);
  }

  toast.textContent = mensagem;
  toast.classList.add('show');
  clearTimeout(window.__toastDemoTimer);
  window.__toastDemoTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function atualizarContador() {
  const dataCasamento = new Date('2025-08-15T12:00:00-03:00');
  const agora = new Date();
  const diferenca = dataCasamento - agora;
  const contador = document.getElementById('contador');
  if (!contador) return;

  if (diferenca <= 0) {
    contador.innerHTML = '<h2 class="data-realizada">15 de agosto de 2025 💍</h2>';
    return;
  }

  const dias = Math.floor(diferenca / 86400000);
  const horas = Math.floor((diferenca / 3600000) % 24);
  const minutos = Math.floor((diferenca / 60000) % 60);
  const segundos = Math.floor((diferenca / 1000) % 60);

  document.getElementById('dias').textContent = String(dias).padStart(2, '0');
  document.getElementById('horas').textContent = String(horas).padStart(2, '0');
  document.getElementById('minutos').textContent = String(minutos).padStart(2, '0');
  document.getElementById('segundos').textContent = String(segundos).padStart(2, '0');
}

function lerJsonLocal(chave, fallback) {
  try {
    const valor = JSON.parse(localStorage.getItem(chave));
    return valor && typeof valor === 'object' ? valor : fallback;
  } catch (error) {
    return fallback;
  }
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}
