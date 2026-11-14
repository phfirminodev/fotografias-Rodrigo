/**
 * Cloudflare Pages Function — Proxy Transparente de Mídia (Cloudflare R2)
 * 
 * Intercepta requisições para /assets/* e serve diretamente do Bucket R2 vinculado,
 * com suporte completo a HTTP Range Requests (RFC 7233) para streaming de vídeos MP4,
 * cabeçalhos de Content-Range, Content-Length, CORS e cache de alta performance.
 */

export async function onRequest(context) {
  const { request, params, env } = context;

  // Permite apenas métodos de leitura (GET e HEAD)
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // 1. Extrai o subcaminho solicitado (ex: 'video/filme-carol-alex.mp4')
  const subpath = Array.isArray(params.path) ? params.path.join('/') : (params.path || '');
  const objectKey = `assets/${subpath}`;

  // 2. Obtém a referência ao bucket R2 vinculado
  const bucket = env.R2_BUCKET || env.ASSETS_BUCKET;
  if (!bucket) {
    return context.next();
  }

  try {
    const rangeHeader = request.headers.get('Range');
    const getOptions = {};

    if (rangeHeader) {
      getOptions.range = request.headers;
    }

    // 3. Busca o objeto no R2
    let object = await bucket.get(objectKey, getOptions);

    // Fallback: busca sem o prefixo 'assets/' caso os arquivos estejam na raiz do bucket
    if (!object) {
      object = await bucket.get(subpath, getOptions);
    }

    // Se o arquivo não existir no bucket R2, repassa para os arquivos estáticos do Pages
    if (!object) {
      return context.next();
    }

    // 4. Configuração dos cabeçalhos HTTP
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    headers.set('Accept-Ranges', 'bytes');

    // Infere o Content-Type caso não esteja registrado no metadado do R2
    const ext = objectKey.split('.').pop()?.toLowerCase();
    const mimeTypes = {
      mp4: 'video/mp4',
      webm: 'video/webm',
      mov: 'video/quicktime',
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

    // Resposta para requisição condicional (304 Not Modified)
    if ('body' in object && object.body === null && request.method === 'GET') {
      return new Response(null, { headers, status: 304 });
    }

    // 5. Tratamento estrito de HTTP Range Requests (RFC 7233)
    let status = 200;

    if (rangeHeader && object.range) {
      status = 206;
      const start = object.range.offset ?? 0;
      const length = object.range.length ?? (object.size - start);
      const end = start + length - 1;
      headers.set('Content-Range', `bytes ${start}-${end}/${object.size}`);
      headers.set('Content-Length', String(length));
    } else if (rangeHeader) {
      // Se o cliente solicitou Range mas o R2 retornou o objeto completo
      const match = rangeHeader.match(/bytes=(\d*)-(\d*)/);
      if (match) {
        status = 206;
        const start = match[1] ? parseInt(match[1], 10) : 0;
        const end = match[2] ? parseInt(match[2], 10) : (object.size - 1);
        const length = end - start + 1;
        headers.set('Content-Range', `bytes ${start}-${end}/${object.size}`);
        headers.set('Content-Length', String(length));
      } else {
        headers.set('Content-Length', String(object.size));
      }
    } else {
      headers.set('Content-Length', String(object.size));
    }

    // Requisição HEAD não deve retornar corpo (apenas cabeçalhos)
    if (request.method === 'HEAD') {
      return new Response(null, { headers, status });
    }

    return new Response(object.body, {
      headers,
      status
    });
  } catch (error) {
    console.error(`Erro ao carregar ativo ${objectKey} do R2:`, error);
    return context.next();
  }
}
