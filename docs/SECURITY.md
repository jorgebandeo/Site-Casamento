# Segurança

Esta versão foi preparada para repositório público.

Não são versionados: credenciais MySQL, tokens, chaves Pix, certificados, CPF, dados financeiros ou listas reais de convidados.

O arquivo real `backend/config.php` deve existir somente no servidor/local e está coberto pelo `.gitignore`. O repositório inclui apenas `backend/config.example.php`.

O antigo `script.js` foi removido do estado atual da branch por conter referências de integração legadas. Se alguma chave antiga ainda estiver ativa, ela deve ser revogada ou restringida no provedor, pois commits históricos continuam existindo no Git.
