const giftsRoot = document.querySelector('#gifts-root');
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

async function loadGifts() {
  if (!giftsRoot) return;
  try {
    const res = await fetch('./data/presentes.json');
    const gifts = await res.json();
    renderGifts(gifts);
  } catch (error) {
    giftsRoot.innerHTML = '<p>Não foi possível carregar os presentes nesta visualização.</p>';
  }
}

function renderGifts(gifts) {
  giftsRoot.innerHTML = gifts.map(gift => {
    const pct = Math.max(0, Math.min(100, Math.round((gift.valor_recolhido / gift.valor_total) * 100)));
    const soldOut = !gift.ativo || pct >= 100;
    return `
      <article class="present-card ${soldOut ? 'is-disabled' : ''}">
        <div class="present-visual" aria-hidden="true">${gift.emoji}</div>
        <div class="present-content">
          <div>
            <span class="badge">${soldOut ? 'Presenteado' : 'Disponível'}</span>
            <h3 style="margin-top:12px">${gift.nome}</h3>
            <p>${gift.descricao}</p>
          </div>
          <div>
            <div class="present-meta">
              <span class="price">${money.format(gift.valor_total)}</span>
              <small>${pct}%</small>
            </div>
            <div class="progress" aria-label="${pct}% presenteado"><span style="width:${pct}%"></span></div>
          </div>
          <button class="btn btn-primary gift-btn" data-id="${gift.id}" ${soldOut ? 'disabled' : ''}>
            ${soldOut ? 'Já presenteado' : 'Simular contribuição'}
          </button>
        </div>
      </article>`;
  }).join('');

  document.querySelectorAll('.gift-btn:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast('Demonstração de portfólio: pagamento real foi desativado.');
    });
  });
}

loadGifts();
