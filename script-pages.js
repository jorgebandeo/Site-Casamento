document.addEventListener('DOMContentLoaded', () => {
  configurarFormularioPresenca();
  atualizarContador();
  setInterval(atualizarContador, 1000);

  document.querySelectorAll('.bt_Contribuir').forEach(botao => {
    botao.addEventListener('click', () => {
      alert('Esta é a versão estática publicada no GitHub Pages. O fluxo real de contribuição dependia de PHP/MySQL na hospedagem original.');
    });
  });
});

function configurarFormularioPresenca() {
  const form = document.getElementById('formPresenca');
  if (!form) return;

  form.addEventListener('submit', event => {
    event.preventDefault();
    alert('Esta é a versão estática publicada no GitHub Pages. A confirmação real dependia de PHP/MySQL na hospedagem original.');
  });
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
