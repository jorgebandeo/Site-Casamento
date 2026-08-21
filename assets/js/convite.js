const envelope = document.querySelector('.envelope');
const guestName = document.querySelector('[data-guest-name]');
const langLabel = document.querySelector('[data-lang-label]');
const query = new URLSearchParams(location.search);

const id = query.get('id') || 'convidado';
const lang = (query.get('lang') || 'pt').toLowerCase();

const guestMap = {
  'debora-luana': 'Débora Luana',
  'luiza-joao': 'Luiza e João',
  'matias-sabrina': 'Matias e Sabrina',
  'vauri-lurdes': 'Vauri e Lurdes',
  'telmo-testoni': 'Telmo Testoni',
  'joanna-joao': 'Joanna e João',
  'amanda-gabriel': 'Amanda e Gabriel',
  'thomas': 'Thomas',
  'telmelize-roberto-leonardo': 'Telmelize, Roberto e Leonardo'
};

if (guestName) guestName.textContent = guestMap[id] || 'Convidado especial';
if (langLabel) {
  langLabel.textContent = lang === 'es'
    ? 'Nos haría muy felices celebrar este momento contigo.'
    : 'Ficaremos muito felizes em celebrar esse momento com você.';
}
if (envelope) envelope.addEventListener('click', () => envelope.classList.toggle('open'));
