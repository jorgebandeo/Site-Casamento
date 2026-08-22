<?php
require __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $conn = abrirConexao();

    // A versão final precisava manter também os itens já esgotados/inativos
    // visíveis, apenas com o card dissolvido e sem o botão de contribuição.
    $sql = 'SELECT id, nome, descricao, valor_total, valor_recolhido, imagem_path, ativo
            FROM presentes
            ORDER BY id ASC';

    $resultado = $conn->query($sql);
    $presentes = [];

    while ($linha = $resultado->fetch_assoc()) {
        $presentes[] = $linha;
    }

    echo json_encode($presentes, JSON_UNESCAPED_UNICODE);
    $conn->close();
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro ao carregar presentes']);
}
