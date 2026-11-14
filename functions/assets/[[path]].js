/**
 * Cloudflare Pages Function — Proxy Transparente de Mídia (Cloudflare R2)
 * 
 * Intercepta requisições para /assets/* e serve diretamente do Bucket R2 vinculado,
 * com suporte nativo a HTTP Range Requests (streaming de vídeos MP4),
 * cabeçalhos de cache otimizados para CDN e fallback para arquivos estáticos locais.
 */

export async function onRequest(context) {
  const { request, params, env } = context;

  // 1. Extrai o subcaminho solicitado (ex: 'video/filme-carol-alex.mp4')
  const subpath = Array.isArray(params.path) ? params.path.join('/') : (params.path || '');
  const objectKey = `assets/${subpath}`;

  // Permite apenas métodos de leitura (GET e HEAD)
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // 2. Obtém a referência ao bucket R2 vinculado nas configurações do Pages
  // Aceita 'R2_BUCKET' ou 'ASSETS_BUCKET' como nome da variável
  const bucket = env.R2_BUCKET || env.ASSETS_BUCKET;
  if (!bucket) {
    // Se o bucket não estiver vinculado, repassa para os arquivos estáticos do Pages
    return context.next();
  }

  try {
    const rangeHeader = request.headers.get('Range');

    // 3. Busca o objeto no R2 com suporte a Range Requests (streaming fracionado)
    const object = await bucket.get(objectKey, {
      range: request.headers,
      onlyIf: request.headers
    });

    // Se o arquivo não existir no bucket R2, tenta buscar nos arquivos estáticos do Pages
    if (!object) {
      return context.next();
    }

    // 4. Configuração dos cabeçalhos HTTP
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);

    // Cache de 1 ano no navegador e na CDN para ativos de mídia
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Accept-Ranges', 'bytes');

    // Infere o Content-Type caso não esteja registrado no metadado do R2
    if (!headers.get('Content-Type')) {
      const ext = objectKey.split('.').pop()?.toLowerCase();
      const mimeTypes = {
        mp4: 'video/mp4',
        webm: 'video/webm',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        webp: 'image/webp',
        svg: 'image/svg+xml',
        pdf: 'application/pdf',
        ico: 'image/x-icon'
      };
      if (ext && mimeTypes[ext]) {
        headers.set('Content-Type', mimeTypes[ext]);
      }
    }

    // Se for uma requisição por pedaço (Range Request), retorna HTTP 206 Partial Content
    const status = (rangeHeader && object.range) ? 206 : 200;

    return new Response(object.body, {
      headers,
      status
    });
  } catch (error) {
    console.error(`Erro ao carregar ativo ${objectKey} do R2:`, error);
    return context.next();
  }
}
