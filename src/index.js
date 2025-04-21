addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.startsWith("/search")) {
    // Build the backend URL
    const backendUrl = new URL(event.request.url);
    backendUrl.protocol = "https";
    backendUrl.hostname = "khovsepyan.com";
    backendUrl.pathname = "/some/path";

    // Proxy the original request (no auto‑redirect)
    const proxyReq = new Request(backendUrl.toString(), {
      method: event.request.method,
      headers: event.request.headers,
      body: event.request.body,
      redirect: "manual",
    });

    return event.respondWith(
      fetch(proxyReq).then((res) => {
        // If the backend issues a redirect, rewrite Location→ 8bit.am
        if (res.status >= 300 && res.status < 400) {
          const loc = res.headers.get("Location");
          if (loc) {
            const newLoc = new URL(loc);
            newLoc.hostname = "8bit.am";
            return new Response(null, {
              status: res.status,
              headers: { Location: newLoc.toString() },
            });
          }
        }
        // Otherwise, stream the response as‑is
        return new Response(res.body, {
          status: res.status,
          headers: res.headers,
        });
      })
    );
  }

  // All other requests → normal origin
  return event.respondWith(fetch(event.request));
});
