addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.startsWith("/search")) {
    // rewrite to your GCP service
    const backend = new URL(event.request.url);
    backend.hostname = "khovsepyan.com";
    backend.protocol = "https";
    backend.pathname = "/some/path";

    const proxyReq = new Request(backend.toString(), {
      method: event.request.method,
      headers: event.request.headers,
      body: event.request.body,
      redirect: "manual",
    });
    // If you need Host: xyz.com on the backend, uncomment:
    // proxyReq.headers.set("Host", "xyz.com");

    return event.respondWith(fetch(proxyReq));
  }

  // all other paths fall through to origin
  return event.respondWith(fetch(event.request));
});
