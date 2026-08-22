<?php
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/../config.php';

use Gerencianet\Exception\GerencianetException;
use Gerencianet\Gerencianet;

function criarApiPix(): Gerencianet
{
    $configPath = __DIR__ . '/config.php';
    if (!is_file($configPath)) {
        throw new RuntimeException('Configuração Pix não encontrada.');
    }

    $pixConfig = require $configPath;

    return new Gerencianet([
        'client_id' => $pixConfig['client_id'],
        'client_secret' => $pixConfig['client_secret'],
        'sandbox' => (bool)$pixConfig['sandbox'],
        'pix_cert' => $pixConfig['pix_cert']
    ]);
}

function confirmarTransacao(mysqli $conn, array $transacao): void
{
    $conn->begin_transaction();

    try {
        $stmtLock = $conn->prepare(
            'SELECT status FROM transacoes_pix WHERE id = ? FOR UPDATE'
        );
        $id = (int)$transacao['id'];
        $stmtLock->bind_param('i', $id);
        $stmtLock->execute();
        $atual = $stmtLock->get_result()->fetch_assoc();
        $stmtLock->close();

        if (!$atual || $atual['status'] === 'confirmado') {
            $conn->rollback();
            return;
        }

        $stmtUpdate = $conn->prepare(
            'UPDATE transacoes_pix
             SET status = "confirmado", confirmado_em = NOW()
             WHERE id = ?'
        );
        $stmtUpdate->bind_param('i', $id);
        $stmtUpdate->execute();
        $stmtUpdate->close();

        $presenteId = (int)$transacao['presente_id'];
        $valor = (float)$transacao['valor'];

        $stmtPresente = $conn->prepare(
            'UPDATE presentes
             SET valor_recolhido = LEAST(valor_total, valor_recolhido + ?)
             WHERE id = ?'
        );
        $stmtPresente->bind_param('di', $valor, $presenteId);
        $stmtPresente->execute();
        $stmtPresente->close();

        $conn->commit();
    } catch (Throwable $e) {
        $conn->rollback();
        throw $e;
    }
}

function consultarEAtualizarTransacao(mysqli $conn, Gerencianet $api, array $transacao): string
{
    $txid = $transacao['txid'];

    try {
        $cobranca = $api->pixDetailCharge(['txid' => $txid]);
    } catch (GerencianetException $e) {
        return $transacao['status'];
    }

    if (($cobranca['status'] ?? '') === 'CONCLUIDA') {
        confirmarTransacao($conn, $transacao);
        return 'confirmado';
    }

    $criadoEm = strtotime($transacao['criado_em']);
    $idade = time() - $criadoEm;

    // O QR era considerado expirado após 3 minutos.
    // A transação permanece verificável até completar 5 minutos
    // para cobrir atrasos/sincronização do pagamento.
    if ($idade >= 180 && $transacao['status'] !== 'expirado') {
        $id = (int)$transacao['id'];
        $stmt = $conn->prepare(
            'UPDATE transacoes_pix
             SET status = "expirado"
             WHERE id = ? AND status = "pendente"'
        );
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $stmt->close();
        return 'expirado';
    }

    return $transacao['status'];
}

function processarTransacoesRecentes(): array
{
    $conn = abrirConexao();
    $api = criarApiPix();

    $result = $conn->query(
        'SELECT id, presente_id, convidado_id, nome_manual, valor, txid, status, criado_em
         FROM transacoes_pix
         WHERE criado_em >= (NOW() - INTERVAL 5 MINUTE)
           AND status IN ("pendente", "expirado")
         ORDER BY criado_em ASC'
    );

    $resumo = [
        'consultadas' => 0,
        'confirmadas' => 0,
        'expiradas' => 0
    ];

    while ($transacao = $result->fetch_assoc()) {
        $resumo['consultadas']++;

        $status = consultarEAtualizarTransacao($conn, $api, $transacao);

        if ($status === 'confirmado') {
            $resumo['confirmadas']++;
        } elseif ($status === 'expirado') {
            $resumo['expiradas']++;
        }
    }

    $conn->close();
    return $resumo;
}

if (!defined('PIX_VERIFICADOR_SOMENTE_FUNCOES')) {
    header('Content-Type: application/json; charset=utf-8');

    try {
        echo json_encode(processarTransacoesRecentes(), JSON_UNESCAPED_UNICODE);
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(['erro' => 'Falha ao verificar transações Pix.'], JSON_UNESCAPED_UNICODE);
    }
}
