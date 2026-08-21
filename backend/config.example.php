<?php
// Copie este arquivo para config.php apenas no servidor.
// NUNCA publique o config.php real no GitHub.
return [
    'db' => [
        'dsn' => 'mysql:host=localhost;dbname=casamento_portfolio;charset=utf8mb4',
        'user' => 'SEU_USUARIO',
        'password' => 'SUA_SENHA',
    ],
    'pix' => [
        'client_id' => 'SEU_CLIENT_ID',
        'client_secret' => 'SEU_CLIENT_SECRET',
        'certificate_path' => '/caminho/fora/do/public/certificado.p12',
    ],
];
