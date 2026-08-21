<?php
require __DIR__ . '/config.php';

$slug = trim($_GET['slug'] ?? '');
$convite = null;

if ($slug !== '') {
    try {
        $conn = abrirConexao();
        $stmt = $conn->prepare('SELECT nome, idioma FROM convites WHERE slug = ?');
        $stmt->bind_param('s', $slug);
        $stmt->execute();
        $convite = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        $conn->close();
    } catch (Throwable $e) {
        $convite = null;
    }
}

if (!$convite) {
    http_response_code(404);
}

$nome = $convite['nome'] ?? '';
$idioma = strtolower($convite['idioma'] ?? 'pt');
$imagemConvite = $idioma === 'es'
    ? 'imagens/convite_es.png'
    : 'imagens/convite_pt.png';
?>
<!DOCTYPE html>
<html lang="<?= $idioma === 'es' ? 'es' : 'pt-BR' ?>">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Convite — Jorge & Benícia</title>
  <style>
    @font-face {
      font-family: 'SnellRoundhand';
      src: url('fontes/snell-roundhand/SnellRoundhand-BoldScript.otf') format('opentype');
      font-weight: normal;
      font-style: normal;
    }

    :root {
      --terracota-escuro: #B65C47;
      --ajuste-x: 0%;
      --ajuste-y: 0%;
    }

    * { box-sizing: border-box; }

    html, body {
      margin: 0;
      width: 100%;
      min-height: 100%;
      background: #fff;
    }

    body {
      display: grid;
      place-items: center;
      min-height: 100vh;
      overflow-x: hidden;
      font-family: Arial, sans-serif;
    }

    .botao-voltar-flutuante {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 30;
      display: inline-block;
      padding: 10px 14px;
      background: var(--terracota-escuro);
      color: #fff;
      text-decoration: none;
      font-weight: bold;
      border-radius: 0 0 8px 0;
    }

    .carta-container {
      position: relative;
      width: min(724px, 96vw);
      aspect-ratio: 7240 / 10166;
      margin: 18px auto;
    }

    .carta, .convite-aberto {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
      user-select: none;
      -webkit-user-drag: none;
    }

    .carta { z-index: 1; }

    .convite-aberto {
      z-index: 5;
      opacity: 0;
      pointer-events: none;
      transition: opacity .45s ease;
    }

    .celo {
      position: absolute;
      left: calc(46.7% + var(--ajuste-x));
      top: calc(63.3% + var(--ajuste-y));
      width: 12%;
      height: auto;
      transform: translate(-50%, -50%);
      z-index: 4;
      cursor: pointer;
      transition: transform .2s ease;
    }

    .celo:hover {
      transform: translate(-50%, -50%) scale(1.04);
    }

    .nome-convidado {
      position: absolute;
      left: calc(53% + var(--ajuste-x));
      top: calc(63.3% + var(--ajuste-y));
      width: 35%;
      z-index: 3;
      transform: translateY(-50%);
      font-family: 'SnellRoundhand', cursive;
      font-size: clamp(1rem, 3.4vw, 2rem);
      line-height: 1.05;
      color: #3f302d;
      text-align: left;
      overflow-wrap: anywhere;
    }

    .carta-container.aberta .convite-aberto {
      opacity: 1;
      pointer-events: auto;
    }

    .carta-container.aberta .carta,
    .carta-container.aberta .celo,
    .carta-container.aberta .nome-convidado {
      opacity: 0;
      pointer-events: none;
    }

    .erro-convite {
      max-width: 560px;
      margin: 80px 20px;
      text-align: center;
      color: #333;
    }

    @media (max-width: 600px) {
      .botao-voltar-flutuante {
        font-size: 1rem !important;
        padding: 12px 14px !important;
      }

      .carta-container {
        width: 100vw;
        margin: 0;
      }

      .nome-convidado {
        font-size: clamp(1rem, 5vw, 1.6rem);
      }
    }
  </style>
</head>
<body>
  <a href="default.php" class="botao-voltar-flutuante">⬅ Site Casamento Jorge & Benícia</a>

  <?php if (!$convite): ?>
    <div class="erro-convite">
      <h2>Convite não encontrado</h2>
    </div>
  <?php else: ?>
    <div class="carta-container" id="cartaContainer">
      <img src="imagens/carta.png" alt="Carta" class="carta">
      <span class="nome-convidado"><?= htmlspecialchars($nome) ?></span>
      <img src="imagens/celo.png" alt="Abrir convite" class="celo" id="celo">
      <img src="<?= htmlspecialchars($imagemConvite) ?>" alt="Convite Jorge & Benícia" class="convite-aberto">
    </div>

    <script>
      const selo = document.getElementById('celo');
      const carta = document.getElementById('cartaContainer');

      selo.addEventListener('click', () => {
        carta.classList.add('aberta');
      });
    </script>
  <?php endif; ?>
</body>
</html>
