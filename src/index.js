addEventListener("fetch", (event) => {
  event.respondWith(handle(event));
});

async function handle(event) {
  try {
    const url = new URL(event.request.url);

    if (url.pathname.startsWith("/search")) {
      // Build backend URL
      const backendUrl = new URL(event.request.url);
      backendUrl.protocol = "https";
      backendUrl.hostname = "khovsepyan.com";
      backendUrl.pathname = "/some/path";

      const proxyReq = new Request(backendUrl.toString(), {
        method: event.request.method,
        headers: event.request.headers,
        body: event.request.body,
        redirect: "manual",
      });

      const res = await fetch(proxyReq);
      // Handle redirects (optional) or just return:
      return new Response(res.body, {
        status: res.status,
        headers: res.headers,
      });
    }

    // Fallback
    return fetch(event.request);
  } catch (err) {
    // Log the full stack to Cloudflare logs
    console.error("Worker error:", err);
    // Return a simple 500 so you can still inspect the log
    return new Response("Internal Worker error", { status: 500 });
  }
}
