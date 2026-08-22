<?php
header('Content-Type: application/json; charset=utf-8');

require __DIR__ . '/config.php';

try {
    $conn = abrirConexao();
    $result = $conn->query('SELECT nome FROM Convidados ORDER BY nome ASC');

    $nomes = [];
    while ($row = $result->fetch_assoc()) {
        $nomes[] = $row['nome'];
    }

    echo json_encode($nomes, JSON_UNESCAPED_UNICODE);
    $conn->close();
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['erro' => 'Não foi possível carregar os convidados.'], JSON_UNESCAPED_UNICODE);
}
