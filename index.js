addEventListener("fetch", (event) => {
  const reqUrl = new URL(event.request.url);

  // Only intercept /search (and anything under it)
  if (reqUrl.pathname.startsWith("/search")) {
    // Build the backend URL
    const backendUrl = new URL(event.request.url);
    backendUrl.hostname = "khovsepyan.com";
    backendUrl.protocol = "https";
    backendUrl.pathname = "/some/path";

    // Clone the original request, but point to backendUrl
    const proxyReq = new Request(backendUrl.toString(), {
      method: event.request.method,
      headers: event.request.headers,
      body: event.request.body,
      redirect: "manual",
    });
    // If your backend needs Host=xyz.com, uncomment:
    // proxyReq.headers.set('Host', 'xyz.com');

    return event.respondWith(fetch(proxyReq));
  }

  // All other traffic → original WordPress origin
  return event.respondWith(fetch(event.request));
});
