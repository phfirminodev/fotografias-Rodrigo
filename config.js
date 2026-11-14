/**
 * RODRIGO ZAGO FOTOGRAFIA & FILME — CONFIGURAÇÃO DE ATIVOS (CLOUDFLARE R2 & CDN)
 * 
 * Este arquivo centraliza o endereço de distribuição de mídia do site.
 * 
 * - Em desenvolvimento local: deixe cdnUrl como '' (vazio). O site usará os arquivos locais da pasta assets/.
 * - No Cloudflare Pages com R2 Binding: deixe cdnUrl como '' (vazio). O Pages Function (/functions/assets/[[path]].js)
 *   irá buscar automaticamente no bucket R2 vinculado sem necessidade de alterar nenhuma URL.
 * - Com Subdomínio R2 dedicado (ex: media.rodrigozago.com.br ou pub-xxx.r2.dev):
 *   preencha com a URL completa (sem barra no final).
 */
window.RZ_CONFIG = {
  // Exemplo: 'https://media.rodrigozago.com.br' ou 'https://pub-xxxxxxxxxxxxxx.r2.dev'
  cdnUrl: ''
};
