// 🔑 Sua chave da API do Google (substitua abaixo)
const API_KEY = 'AIzaSyAW5NHrRfdmMwLDeax9Ge-w20Td0sQXYnE';
// 📄 ID da planilha secundária (espelho)
const SHEET_ID = 'https://docs.google.com/spreadsheets/d/11-lA-Cv1B25-UgL8TGHBBVWZ6-wqOJ2Ie3Nfa-jxrZE/edit?usp=sharing';
// 📍 Intervalo da aba onde estão os nomes
const RANGE = 'Site casaento - banco de dados!A1:A'; // ou o nome da aba correta

// Função para buscar convidados da planilha
async function carregarConvidados() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.values) {
      const nomes = data.values.flat().filter(nome => nome.trim() !== "");
      preencherAutoComplete(nomes);
    } else {
      console.error('Nenhum dado retornado:', data);
    }
  } catch (error) {
    console.error('Erro ao carregar convidados:', error);
  }
}

// Preenche o datalist com os nomes
function preencherAutoComplete(nomes) {
  const datalist = document.getElementById('listaConvidados');
  datalist.innerHTML = ""; // limpa se já tiver algo
  nomes.forEach(nome => {
    const option = document.createElement('option');
    option.value = nome;
    datalist.appendChild(option);
  });
}

// Formulário de presença
document.getElementById('formPresenca').addEventListener('submit', function(e) {
  e.preventDefault();
  const nome = e.target.nome.value;
  const presenca = e.target.presenca.value;

  alert(`Obrigado, ${nome}! Presença registrada como: ${presenca}`);
  e.target.reset();
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

// 🚀 Iniciar carregamento dos convidados na página
carregarConvidados();
