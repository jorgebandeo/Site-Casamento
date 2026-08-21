<?php
header('Content-Type: application/json; charset=utf-8');

// Endpoint deliberadamente sem integração financeira real.
// Serve apenas para documentar a fronteira entre front-end e backend.
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método não permitido']);
    exit;
}

http_response_code(501);
echo json_encode([
    'ok' => false,
    'demo' => true,
    'message' => 'Integração Pix removida da versão pública de portfólio.'
], JSON_UNESCAPED_UNICODE);
