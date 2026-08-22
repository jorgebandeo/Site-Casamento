let listaNomes = [];

document.addEventListener('DOMContentLoaded', () => {
  carregarConvidados();
  configurarFormularioPresenca();
  carregarPresentes();
  atualizarContador();
  setInterval(atualizarContador, 1000);
});

async function carregarConvidados() {
  try {
    const response = await fetch('listar_convidados.php?v=' + Math.random());
    const nomes = await response.json();
    listaNomes = Array.isArray(nomes) ? nomes : [];
    window.listaNomes = listaNomes;
    preencherAutoComplete(listaNomes);
  } catch (error) {
    console.error('Erro ao carregar convidados:', error);
  }
}

function preencherAutoComplete(nomes) {
  const input = document.getElementById('inputNome');
  const list = document.getElementById('autocompleteList');
  if (!input || !list) return;

  input.addEventListener('input', function () {
    const filtro = this.value.toLowerCase();
    list.innerHTML = '';

    if (!filtro) {
      list.classList.add('hidden');
      return;
    }

    const resultados = nomes.filter(nome =>
      String(nome).toLowerCase().includes(filtro)
    );

    if (resultados.length === 0) {
      list.classList.add('hidden');
      return;
    }

    resultados.forEach(nome => {
      const li = document.createElement('li');
      li.textContent = nome;
      li.addEventListener('click', () => {
        input.value = nome;
        list.classList.add('hidden');
      });
      list.appendChild(li);
    });

    list.classList.remove('hidden');
  });

  document.addEventListener('click', event => {
    if (!event.target.closest('.autocomplete-wrapper')) {
      list.classList.add('hidden');
    }
  });
}

function configurarFormularioPresenca() {
  const form = document.getElementById('formPresenca');
  if (!form) return;

  form.addEventListener('submit', async event => {
    event.preventDefault();

    const nome = form.nome.value.trim();
    const presenca = form.presenca.value;

    if (!nome || !presenca) {
      alert('Preencha seu nome e selecione uma opção de presença.');
      return;
    }

    const existe = (window.listaNomes || []).some(
      item => String(item).trim().toLowerCase() === nome.toLowerCase()
    );

    if (!existe) {
      alert('Nome não encontrado na lista. Verifique se digitou corretamente.');
      return;
    }

    const botao = form.querySelector('button[type="submit"]');
    botao.disabled = true;
    botao.textContent = 'Enviando...';

    try {
      const response = await fetch('confirmar_presenca.php?v=' + Math.random(), {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({nome, presenca})
      });

      if (!response.ok) throw new Error('Falha ao registrar presença');

      alert('Presença confirmada com sucesso! Obrigado 💕');
      form.reset();
    } catch (error) {
      console.error('Erro ao enviar confirmação:', error);
      alert('Ocorreu um erro ao registrar sua presença.');
    } finally {
      botao.textContent = 'Confirmar Presença';
      botao.disabled = false;
    }
  });
}

async function carregarPresentes() {
  const lista = document.getElementById('listaPresentes');
  if (!lista) return;

  try {
    const response = await fetch('get_presentes.php?v=' + Math.random());
    const presentes = await response.json();
    lista.innerHTML = '';

    presentes.forEach(p => {
      const total = Number(p.valor_total || 0);
      const recolhido = Number(p.valor_recolhido || 0);
      const restante = Math.max(0, total - recolhido);
      const esgotado = Number(p.ativo) === 0 || restante <= 0;

      const li = document.createElement('li');
      li.className = 'presente-card';

      const card = document.createElement('div');
      card.className = `card${esgotado ? ' desativado' : ''}`;

      if (esgotado) {
        const confere = document.createElement('div');
        confere.className = 'fundo-confere';
        confere.textContent = '✓';
        card.appendChild(confere);
      }

      const img = document.createElement('img');
      img.src = `${p.imagem_path}?v=${Math.random()}`;
      img.alt = p.nome;
      card.appendChild(img);

      const titulo = document.createElement('h3');
      titulo.textContent = p.nome;
      card.appendChild(titulo);

      const descricao = document.createElement('p');
      descricao.textContent = p.descricao || '';
      card.appendChild(descricao);

      if (!esgotado) {
        const valor = document.createElement('p');
        valor.className = 'valor-restante';
        valor.textContent = `Restante: ${formatarMoeda(restante)}`;
        card.appendChild(valor);

        const btDiv = document.createElement('div');
        btDiv.className = 'bt_div';

        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'bt_Contribuir';
        botao.textContent = 'Contribuir';
        botao.onclick = () => {
          window.location.href = `presente.php?id=${p.id}&v=${Math.floor(Math.random() * 1000000)}`;
        };

        btDiv.appendChild(botao);
        card.appendChild(btDiv);
      } else {
        const recebido = document.createElement('p');
        recebido.className = 'presente-recebido';
        recebido.textContent = '🎁 Presente já recebido com carinho!';
        card.appendChild(recebido);
      }

      li.appendChild(card);
      lista.appendChild(li);
    });
  } catch (error) {
    console.error('Erro ao carregar presentes:', error);
    lista.innerHTML = '<li>Não foi possível carregar a lista de presentes.</li>';
  }
}

function atualizarContador() {
  const dataCasamento = new Date('2025-08-15T12:00:00');
  const agora = new Date();
  const diferenca = dataCasamento - agora;
  const contador = document.getElementById('contador');

  if (!contador) return;

  if (diferenca <= 0) {
    contador.innerHTML = '<h2>É hoje! 💍</h2>';
    return;
  }

  const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
  const horas = Math.floor((diferenca / (1000 * 60 * 60)) % 24);
  const minutos = Math.floor((diferenca / (1000 * 60)) % 60);
  const segundos = Math.floor((diferenca / 1000) % 60);

  document.getElementById('dias').textContent = String(dias).padStart(2, '0');
  document.getElementById('horas').textContent = String(horas).padStart(2, '0');
  document.getElementById('minutos').textContent = String(minutos).padStart(2, '0');
  document.getElementById('segundos').textContent = String(segundos).padStart(2, '0');
}

function formatarMoeda(valor) {
  return Number(valor).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}
