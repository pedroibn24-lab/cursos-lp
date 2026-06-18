# Landing Page — Quero saber mais sobre os cursos

> **Uso exclusivo IBN — Instituto Brasileiro de Negócios** — este repositório é propriedade da IBN e seu uso, cópia ou distribuição sem autorização é expressamente proibido.

Landing page de captação de leads para a Faculdade Anhanguera e Unopar. Direcionada a pessoas que desejam informações sobre cursos de graduação e pós-graduação — valores, bolsas e formas de ingresso. Os dados preenchidos no formulário são enviados automaticamente para uma planilha via Google Apps Script.

## Tecnologias

- **HTML5** — estrutura semântica da página
- **CSS3** — estilização, animações e responsividade (mobile-first)
- **JavaScript (Vanilla)** — validação de formulário, rate limiting e envio via `fetch`
- **Google Apps Script** — backend serverless para receber e gravar leads na planilha
- **Google Sheets** — armazenamento dos leads captados

## Formulário / Backend

Os dados são enviados para o Google Sheets via Google Apps Script (endpoint configurado em `script.js`). Não há servidor próprio — o envio usa `fetch` com `mode: no-cors`.

**Proteções:** honeypot anti-bot, rate limiting de 30s entre envios, sanitização contra XSS e injeção de fórmula em planilha.

## Arquivos

| Arquivo | Descrição |
|---|---|
| `index.html` | Página principal com o formulário |
| `style.css` | Estilos da página |
| `script.js` | Validação e envio dos dados para a planilha |
| `legal.html` | Política de Privacidade |
| `.htaccess` | Configurações de segurança e compressão (Apache) |
