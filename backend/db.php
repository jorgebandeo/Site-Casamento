<?php
function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $configFile = __DIR__ . '/config.php';
    if (!file_exists($configFile)) {
        throw new RuntimeException('Crie backend/config.php a partir de config.example.php.');
    }

    $config = require $configFile;
    $pdo = new PDO(
        $config['db']['dsn'],
        $config['db']['user'],
        $config['db']['password'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );

    return $pdo;
}
