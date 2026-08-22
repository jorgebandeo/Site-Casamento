<?php
header('Content-Type: application/json; charset=utf-8');

require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/../config.php';

use Gerencianet\Exception\GerencianetException;
use Gerencianet\Gerencianet;

$dados = json_decode(file_get_contents('php://input'), true) ?: [];

$nome = trim($dados['nome'] ?? '');
$valor = (float)($dados['valor'] ?? 0);
$presenteId = (int)($dados['presente_id'] ?? 0);

if ($nome === '' || $valor < 5 || $presenteId < 1) {
    http_response_code(400);
    echo json_encode(['erro' => 'Dados inválidos para gerar o Pix.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$configPath = __DIR__ . '/config.php';
if (!is_file($configPath)) {
    http_response_code(500);
    echo json_encode(['erro' => 'Configuração Pix não encontrada.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$pixConfig = require $configPath;

$options = [
    'client_id' => $pixConfig['client_id'],
    'client_secret' => $pixConfig['client_secret'],
    'sandbox' => (bool)$pixConfig['sandbox'],
    'pix_cert' => $pixConfig['pix_cert']
];

try {
    $conn = abrirConexao();

    $stmtPresente = $conn->prepare(
        'SELECT valor_total, valor_recolhido FROM presentes WHERE id = ? AND ativo = 1'
    );
    $stmtPresente->bind_param('i', $presenteId);
    $stmtPresente->execute();
    $presente = $stmtPresente->get_result()->fetch_assoc();
    $stmtPresente->close();

    if (!$presente) {
        throw new RuntimeException('Presente não encontrado.');
    }

    $restante = max(0, (float)$presente['valor_total'] - (float)$presente['valor_recolhido']);
    if ($valor > $restante || $restante <= 0) {
        throw new RuntimeException('Valor maior que o restante do presente.');
    }

    $api = new Gerencianet($options);

    $body = [
        'calendario' => [
            'expiracao' => 180
        ],
        'valor' => [
            'original' => number_format($valor, 2, '.', '')
        ],
        'chave' => $pixConfig['pix_key'],
        'solicitacaoPagador' => 'Contribuição para presente de casamento'
    ];

    $pix = $api->pixCreateImmediateCharge([], $body);

    $txid = $pix['txid'] ?? null;
    $loc = $pix['loc']['id'] ?? null;

    if (!$txid || !$loc) {
        throw new RuntimeException('A cobrança foi criada sem txid/localização.');
    }

    $qrcode = $api->pixGenerateQRCode(['id' => $loc]);

    $stmtConvidado = $conn->prepare(
        'SELECT ID FROM Convidados WHERE LOWER(TRIM(nome)) = LOWER(TRIM(?)) LIMIT 1'
    );
    $stmtConvidado->bind_param('s', $nome);
    $stmtConvidado->execute();
    $convidado = $stmtConvidado->get_result()->fetch_assoc();
    $stmtConvidado->close();

    if ($convidado) {
        $convidadoId = (int)$convidado['ID'];
        $stmt = $conn->prepare(
            'INSERT INTO transacoes_pix
             (presente_id, convidado_id, nome_manual, valor, txid, status)
             VALUES (?, ?, NULL, ?, ?, "pendente")'
        );
        $stmt->bind_param('iids', $presenteId, $convidadoId, $valor, $txid);
    } else {
        $stmt = $conn->prepare(
            'INSERT INTO transacoes_pix
             (presente_id, convidado_id, nome_manual, valor, txid, status)
             VALUES (?, NULL, ?, ?, ?, "pendente")'
        );
        $stmt->bind_param('isds', $presenteId, $nome, $valor, $txid);
    }

    $stmt->execute();
    $stmt->close();
    $conn->close();

    echo json_encode([
        'pix' => $qrcode['imagemQrcode'] ?? null,
        'copiaecola' => $qrcode['qrcode'] ?? null,
        'txid' => $txid
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

} catch (GerencianetException $e) {
    http_response_code(502);
    echo json_encode(['erro' => 'Erro ao gerar cobrança Pix.'], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(400);
    echo json_encode(['erro' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
