<?php
/*
 * Copie para meu-pix/config.php no servidor.
 * Credenciais e chave Pix reais não são versionadas no portfólio.
 */

return [
    'client_id' => 'SEU_CLIENT_ID_EFI',
    'client_secret' => 'SEU_CLIENT_SECRET_EFI',
    'sandbox' => false,
    'pix_cert' => __DIR__ . '/certificado.pem',
    'pix_key' => 'SUA_CHAVE_PIX'
];
