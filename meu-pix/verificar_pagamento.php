<?php
header('Content-Type: application/json; charset=utf-8');

define('PIX_VERIFICADOR_SOMENTE_FUNCOES', true);
require __DIR__ . '/verificar_transacoes.php';

$txid = trim($_GET['codigo'] ?? '');

if ($txid === '') {
    http_response_code(400);
    echo json_encode(['erro' => 'Código não informado.'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $conn = abrirConexao();

    $stmt = $conn->prepare(
        'SELECT id, presente_id, convidado_id, nome_manual, valor, txid, status, criado_em
         FROM transacoes_pix
         WHERE txid = ?
         LIMIT 1'
    );
    $stmt->bind_param('s', $txid);
    $stmt->execute();
    $transacao = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$transacao) {
        $conn->close();
        http_response_code(404);
        echo json_encode(['erro' => 'Transação não encontrada.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($transacao['status'] === 'confirmado') {
        $conn->close();
        echo json_encode(['status' => 'confirmado'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $idade = time() - strtotime($transacao['criado_em']);

    if ($idade <= 300) {
        $api = criarApiPix();
        $status = consultarEAtualizarTransacao($conn, $api, $transacao);
    } else {
        $status = $transacao['status'] === 'pendente' ? 'expirado' : $transacao['status'];

        if ($transacao['status'] === 'pendente') {
            $id = (int)$transacao['id'];
            $stmtExpira = $conn->prepare(
                'UPDATE transacoes_pix SET status = "expirado" WHERE id = ?'
            );
            $stmtExpira->bind_param('i', $id);
            $stmtExpira->execute();
            $stmtExpira->close();
        }
    }

    $conn->close();

    echo json_encode(['status' => $status], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['erro' => 'Falha ao consultar o pagamento.'], JSON_UNESCAPED_UNICODE);
}
