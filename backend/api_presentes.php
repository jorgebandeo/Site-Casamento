<?php
header('Content-Type: application/json; charset=utf-8');
require __DIR__ . '/db.php';

try {
    $stmt = db()->query(
        'SELECT id, nome, descricao, valor_total, valor_recolhido, imagem_path, ativo
         FROM produtos
         ORDER BY ativo DESC, id ASC'
    );
    echo json_encode(['ok' => true, 'items' => $stmt->fetchAll()], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Erro interno']);
}
