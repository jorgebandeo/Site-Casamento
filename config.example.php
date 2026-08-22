<?php
/*
 * Copie este arquivo para config.php no servidor.
 * As credenciais reais usadas na hospedagem original foram removidas do repositório público.
 */

define('DB_HOST', 'localhost');
define('DB_NAME', 'u553486494_Casamento');
define('DB_USER', 'SEU_USUARIO_MYSQL');
define('DB_PASS', 'SUA_SENHA_MYSQL');

function abrirConexao(): mysqli
{
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($conn->connect_error) {
        throw new RuntimeException('Erro de conexão com o banco de dados.');
    }
    $conn->set_charset('utf8mb4');
    return $conn;
}
