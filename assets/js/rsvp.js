const rsvpForm = document.querySelector('#rsvp-form');
const statusBox = document.querySelector('#rsvp-status');

if (rsvpForm) {
  rsvpForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(rsvpForm).entries());

    if (!data.nome || !data.presenca) {
      statusBox.className = 'form-status show error';
      statusBox.textContent = 'Preencha seu nome e informe se poderá comparecer.';
      return;
    }

    const records = JSON.parse(localStorage.getItem('portfolio_rsvp') || '[]');
    records.push({ ...data, createdAt: new Date().toISOString() });
    localStorage.setItem('portfolio_rsvp', JSON.stringify(records));

    statusBox.className = 'form-status show success';
    statusBox.textContent = data.presenca === 'sim'
      ? 'Presença registrada! Será um prazer celebrar juntos. 💛'
      : 'Resposta registrada. Obrigado por nos avisar com carinho.';
    rsvpForm.reset();
  });
}
