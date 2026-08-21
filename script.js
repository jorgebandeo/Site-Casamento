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

    const resultados = nomes.filter(nome => nome.toLowerCase().includes(filtro));

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

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.autocomplete-wrapper')) {
      list.classList.add('hidden');
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('formPresenca');

  /*
   * No site original, os nomes eram carregados da planilha Google.
   * A credencial antiga não é mantida nesta versão pública do repositório.
   */
  preencherAutoComplete([]);

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const nome = form.nome.value.trim();
      const presenca = form.presenca.value;

      if (!nome || !presenca) {
        alert('Preencha seu nome e selecione uma opção de presença.');
        return;
      }

      alert('Presença registrada nesta demonstração do projeto.');
      form.reset();
    });
  }

  const presentes = [
    'Cafeteira Elétrica',
    'Jantar Romântico',
    'Panela de Pressão',
    'Vale Viagem Lua de Mel',
    'Kit Toalhas Bordadas'
  ];

  const lista = document.getElementById('listaPresentes');
  if (lista) {
    presentes.forEach(presente => {
      const li = document.createElement('li');
      li.textContent = presente;
      lista.appendChild(li);
    });
  }
});

function atualizarContador() {
  const contador = document.getElementById('contador');
  if (!contador) return;

  const dataCasamento = new Date('2025-08-01T00:00:00');
  const agora = new Date();
  const diferenca = dataCasamento - agora;

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

setInterval(atualizarContador, 1000);
atualizarContador();
