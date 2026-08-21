<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

require __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método não permitido']);
    exit;
}

$payload = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$nome = trim((string)($payload['nome'] ?? ''));
$presenca = $payload['presenca'] ?? null;
$acompanhantes = max(0, min(10, (int)($payload['acompanhantes'] ?? 0)));
$observacao = trim((string)($payload['mensagem'] ?? ''));

if ($nome === '' || !in_array($presenca, ['sim', 'nao'], true)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Dados inválidos']);
    exit;
}

try {
    $pdo = db();
    $stmt = $pdo->prepare(
        'UPDATE convidados
         SET confirmado = :confirmado, acompanhantes = :acompanhantes, observacao = :observacao
         WHERE nome = :nome'
    );
    $stmt->execute([
        ':confirmado' => $presenca === 'sim' ? 1 : 0,
        ':acompanhantes' => $acompanhantes,
        ':observacao' => $observacao ?: null,
        ':nome' => $nome,
    ]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['ok' => false, 'error' => 'Convidado não encontrado']);
        exit;
    }

    echo json_encode(['ok' => true]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Erro interno']);
}
