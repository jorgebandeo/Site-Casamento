const API_KEY = 'AIzaSyAW5NHrRfdmMwLDeax9Ge-w20Td0sQXYnE';
const SHEET_ID = '11-lA-Cv1B25-UgL8TGHBBVWZ6-wqOJ2Ie3Nfa-jxrZE';
const RANGE = "'Página1'!A2:A";
const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbxt0K8uFLFkbTi5svZaT1ksp3ZECkz5wkTIe0f-n1WrUSo0OnaprKmQT4dvR60aVOqBuw/exec'; // 🔁 coloque aqui a URL do Apps Script

function initGoogleAPI() {
  gapi.load('client', start);
}

async function start() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
  });

  try {
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    });

    console.log("🔍 Dados brutos da API:", response.result.values);

    const dados = response.result.values || [];
    const nomes = dados.flat().filter(nome => nome.trim() !== '');

    console.log("✅ Nomes lidos:", nomes);

    preencherAutoComplete(nomes);
    window.listaNomes = nomes;


  } catch (error) {
    console.error('❌ Erro ao carregar convidados:', error);
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

  // Fecha a lista se clicar fora
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.autocomplete-wrapper')) {
      list.classList.add('hidden');
    }
  });
}


document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('formPresenca');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const nome = form.nome.value.trim();
    const presenca = form.presenca.value;

    if (!nome || !presenca) {
      alert("Preencha seu nome e selecione uma opção de presença.");
      return;
    }

    const nomes = window.listaNomes || [];
    const existe = nomes.some(n => n.trim().toLowerCase() === nome.toLowerCase());

    if (!existe) {
      alert("Nome não encontrado na lista. Verifique se digitou corretamente.");
      return;
    }

    try {
      const botao = form.querySelector('button');
      botao.disabled = true;
      botao.textContent = 'Enviando...';
    
      const res = await fetch(WEBAPP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ nome, presenca })
      });
    
      const text = await res.text();
      alert("Presença confirmada com sucesso! Obrigado 💕");
    
      form.reset();
      botao.textContent = 'Confirmar Presença';
      botao.disabled = false;
    
    } catch (error) {
      console.error('Erro ao enviar confirmação:', error);
      alert("Ocorreu um erro ao registrar sua presença.");
      const botao = form.querySelector('button');
      botao.textContent = 'Confirmar Presença';
      botao.disabled = false;
    }
    
  });

  // Lista de presentes (estática)
  const presentes = [
    'Cafeteira Elétrica',
    'Jantar Romântico',
    'Panela de Pressão',
    'Vale Viagem Lua de Mel',
    'Kit Toalhas Bordadas'
  ];

  const lista = document.getElementById('listaPresentes');
  presentes.forEach(presente => {
    const li = document.createElement('li');
    li.textContent = presente;
    lista.appendChild(li);
  });
});


function atualizarContador() {
  const dataCasamento = new Date("2025-08-01T00:00:00"); // Altere a data se necessário
  const agora = new Date();
  const diferenca = dataCasamento - agora;

  if (diferenca <= 0) {
    document.getElementById('contador').innerHTML = "<h2>É hoje! 💍</h2>";
    return;
  }

  const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
  const horas = Math.floor((diferenca / (1000 * 60 * 60)) % 24);
  const minutos = Math.floor((diferenca / (1000 * 60)) % 60);
  const segundos = Math.floor((diferenca / 1000) % 60);

  document.getElementById("dias").textContent = String(dias).padStart(2, '0');
  document.getElementById("horas").textContent = String(horas).padStart(2, '0');
  document.getElementById("minutos").textContent = String(minutos).padStart(2, '0');
  document.getElementById("segundos").textContent = String(segundos).padStart(2, '0');
}

setInterval(atualizarContador, 1000);
atualizarContador(); // Inicializa imediatamente
