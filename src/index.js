addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.startsWith("/search")) {
    // Build target at khovsepyan.com/some/path
    const backendUrl = new URL(event.request.url);
    backendUrl.protocol = "https";
    backendUrl.hostname = "khovsepyan.com";
    backendUrl.pathname = "/some/path";

    const proxyReq = new Request(backendUrl, {
      method: event.request.method,
      headers: event.request.headers,
      body: event.request.body,
      redirect: "manual",
    });

    return event.respondWith(
      fetch(proxyReq).then((res) => {
        // If backend redirects, rewrite to keep 8bit.am in address bar
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
        // Otherwise proxy the response body directly
        return new Response(res.body, {
          status: res.status,
          headers: res.headers,
        });
      })
    );
  }

  // default pass‑through
  return event.respondWith(fetch(event.request));
});
