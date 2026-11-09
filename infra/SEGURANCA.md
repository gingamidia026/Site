# Segurança da hospedagem

Autora: Dominique-Oliveira-ChatGPT🤖💚.

O site continua estático. O formulário abre o WhatsApp; não há API, banco ou recebimento de cadastro neste site.

As duas páginas têm CSP por meta e política de referência. Scripts próprios e dados estruturados autorizados por resumo SHA-256; sem execução de scripts inline genéricos, objetos, conexões por fetch ou envio de formulário. Mudança no JSON-LD ou CSS inline exige recalcular o respectivo resumo. Links para WhatsApp continuam sendo navegações normais, fora da diretiva connect-src.

O GitHub Pages não oferece configuração destes cabeçalhos por um arquivo _headers. A CSP por meta não consegue aplicar frame-ancestors, HSTS ou X-Content-Type-Options. O Caddyfile ao lado implementa essas proteções em um servidor estático separado; só vale após ativação nessa hospedagem. Não substituir essa limitação por uma declaração de conclusão.

Em 09/11/2026, o GitHub informou certificado pendente para gingamidia.com e recusou https_enforced. O DNS retornou A 185.199.109.153, 185.199.110.153 e 185.199.111.153; faltou 185.199.108.153. Corrigir no painel DNS, conferir o apontamento www se usado, aguardar emissão e ativar Enforce HTTPS. Não remover o domínio ou ignorar a validação do certificado como solução.

Fonte: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
