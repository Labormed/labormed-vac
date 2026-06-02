/**
 * Labormed Vacinas - Cloudflare Worker
 * Serves static landing page from R2 bucket.
 * Custom domain: vacina.labormed.app
 */

interface Env {
  BUCKET: R2Bucket;
  ENVIRONMENT: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Health check
    if (path === "/health") {
      return new Response(
        JSON.stringify({
          status: "ok",
          service: "labormed-vac",
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Serve index.html from R2 for root and any non-asset path
    const key = path === "/" || path === "" ? "index.html" : path.slice(1);
    const object = await env.BUCKET.get(key);

    if (object) {
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("Cache-Control", "public, max-age=3600");
      headers.set("X-Powered-By", "Labormed Vacinas");
      return new Response(object.body, { headers });
    }

    // Fallback: try index.html for SPA-style routing
    if (!path.includes(".")) {
      const fallback = await env.BUCKET.get("index.html");
      if (fallback) {
        const headers = new Headers();
        fallback.writeHttpMetadata(headers);
        headers.set("Cache-Control", "public, max-age=3600");
        return new Response(fallback.body, { headers });
      }
    }

    return new Response("Pagina nao encontrada", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
