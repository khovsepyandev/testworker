addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only intercept /search (and anything beneath it)
  if (url.pathname.startsWith("/search")) {
    // Rebuild the URL to point at your backend
    const backendUrl = new URL(event.request.url);
    backendUrl.protocol = "https";
    backendUrl.hostname = "khovsepyan.com";
    backendUrl.pathname = "/some/path";
    // query string (e.g. ?q=foo) is preserved automatically

    // Forward the original request to the backend
    const proxyReq = new Request(backendUrl.toString(), {
      method: event.request.method,
      headers: event.request.headers,
      body: event.request.body,
      redirect: "manual", // do not auto‑follow backend redirects
    });

    return event.respondWith(
      fetch(proxyReq).then((res) => {
        // If the backend issues a redirect, rewrite it back to 8bit.am
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
        // Otherwise, stream the backend’s response directly
        return new Response(res.body, {
          status: res.status,
          headers: res.headers,
        });
      })
    );
  }

  // For all other requests, fall back to your origin
  return event.respondWith(fetch(event.request));
});
