addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only proxy /search and deeper paths
  if (url.pathname.startsWith("/search")) {
    // Build the target URL at khovsepyan.com/some/path
    const backendUrl = new URL(event.request.url);
    backendUrl.protocol = "https";
    backendUrl.hostname = "khovsepyan.com";
    backendUrl.pathname = "/some/path";
    // query string (?foo=bar) is preserved

    // Forward the original request (method, headers, body) to the backend
    const proxyReq = new Request(backendUrl.toString(), {
      method: event.request.method,
      headers: event.request.headers,
      body: event.request.body,
      redirect: "manual",
    });
    // If your backend strictly checks Host, uncomment:
    // proxyReq.headers.set("Host", "khovsepyan.com");

    return event.respondWith(fetch(proxyReq));
  }

  // All other traffic falls back automatically to your origin
  return event.respondWith(fetch(event.request));
});
