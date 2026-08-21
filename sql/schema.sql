-- Estrutura reconstruída a partir das conversas do projeto de casamento.
-- Banco usado na hospedagem original: u553486494_Casamento

CREATE TABLE IF NOT EXISTS Convidados (
    ID INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    `confirmação` VARCHAR(10) NULL,
    valor_aportado DECIMAL(10,2) NULL,
    PRIMARY KEY (ID),
    INDEX idx_convidados_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS presentes (
    id INT(11) NOT NULL AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    valor_recolhido DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    imagem_path VARCHAR(500) NULL,
    ativo TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS convites (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    slug VARCHAR(255) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    idioma VARCHAR(5) NOT NULL DEFAULT 'pt',
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_convites_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS transacoes_pix (
    id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    presente_id INT(11) NOT NULL,
    convidado_id INT(10) UNSIGNED NULL,
    nome_manual VARCHAR(255) NULL,
    valor DECIMAL(10,2) NOT NULL,
    txid VARCHAR(255) NOT NULL,
    status ENUM('pendente','confirmado','expirado') NOT NULL DEFAULT 'pendente',
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    confirmado_em TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_transacoes_pix_txid (txid),
    KEY idx_transacoes_pix_presente (presente_id),
    KEY idx_transacoes_pix_convidado (convidado_id),
    KEY idx_transacoes_pix_status_criado (status, criado_em),
    CONSTRAINT fk_transacoes_pix_presente
        FOREIGN KEY (presente_id) REFERENCES presentes(id),
    CONSTRAINT fk_transacoes_pix_convidado
        FOREIGN KEY (convidado_id) REFERENCES Convidados(ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exemplo de presente que foi adicionado durante o desenvolvimento:
INSERT INTO presentes (
    nome,
    descricao,
    valor_total,
    valor_recolhido,
    imagem_path,
    ativo
) VALUES (
    'Processador e Liquidificador',
    'Um aliado prático e elegante para facilitar os preparos e deixar os momentos na cozinha ainda mais gostosos a dois.',
    403.81,
    0.00,
    'imagens/ProcessadorLiquidificador.png',
    1
);
