<?php
header('Content-Type: text/plain; charset=utf-8');

require __DIR__ . '/config.php';

$nome = trim($_POST['nome'] ?? '');
$presenca = trim($_POST['presenca'] ?? '');

if ($nome === '' || !in_array($presenca, ['sim', 'nao'], true)) {
    http_response_code(400);
    echo 'Dados inválidos.';
    exit;
}

try {
    $conn = abrirConexao();

    $stmt = $conn->prepare('UPDATE Convidados SET `confirmação` = ? WHERE nome = ?');
    $stmt->bind_param('ss', $presenca, $nome);
    $stmt->execute();

    if ($stmt->affected_rows < 1) {
        http_response_code(404);
        echo 'Convidado não encontrado.';
    } else {
        echo 'Presença confirmada com sucesso!';
    }

    $stmt->close();
    $conn->close();
} catch (Throwable $e) {
    http_response_code(500);
    echo 'Erro ao confirmar presença.';
}
