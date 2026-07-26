/**
 * Labormed Vacinas - Cloudflare Worker
 * Serve a landing page pelos static assets nativos do Wrangler (binding ASSETS).
 * /health responde JSON; qualquer outro caminho e servido dos assets
 * (static/index.html, com fallback SPA via not_found_handling).
 * Custom domain: vacina.labormed.app
 */

interface Env {
  ASSETS: Fetcher;
  ENVIRONMENT: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Health check
    if (url.pathname === "/health") {
      return new Response(
        JSON.stringify({
          status: "ok",
          service: "labormed-vac",
          timestamp: new Date().toISOString(),
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    // Demais caminhos: servidos pelos static assets (index.html; fallback SPA).
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

// 2026-07-26 — Blog Labormed: o botao flutuante do blog ENTROU e SAIU no mesmo dia.
// Motivo da saida (decisao da Mirian): o blog e publico e expoe nome e data de
// aniversario de colaboradores; esta pagina e do PACIENTE. O botao fica so nos apps
// internos, que tem login. Nao reintroduzir aqui sem decisao dela.
// Bump mantido para forcar a republicacao dos assets do front (a remocao e so-de-tela).
