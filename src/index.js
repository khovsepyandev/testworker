// === src/index.js ===

addEventListener("fetch", (event) => {
  event.respondWith(handle(event.request));
});

async function handle(request) {
  const url = new URL(request.url);

  // Only intercept anything under /search
  if (url.pathname.startsWith("/search")) {
    // 1) Extract the suffix after "/search"
    const suffix = url.pathname.slice("/search".length) || "/";
    //    e.g. "/products/widget", or "/" if exactly "/search"

    // 2) Build the backend URL:
    //    https://khovsepyan.com/some/path + suffix + original query
    const backend = new URL(request.url);
    backend.protocol = "https";
    backend.hostname = "khovsepyan.com";
    backend.pathname = `/some/path${suffix}`;
    //    backend.search is untouched, so query string is preserved

    // 3) Fetch from your backend, but do NOT let the browser see any 3xx:
    let res = await fetch(backend.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: "manual",
    });

    // 4) If your backend returns a redirect, follow it once here:
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("Location");
      if (loc) {
        // Resolve relative or absolute URLs against your backend domain
        const next = new URL(loc, "https://khovsepyan.com");
        res = await fetch(next.toString(), {
          method: request.method,
          headers: request.headers,
          body: request.body,
        });
      }
    }

    // 5) Return the final response to the user—URL stays at /search…
    return new Response(res.body, {
      status: res.status,
      headers: res.headers,
    });
  }

  // Non-/search traffic: pass straight through to origin
  return fetch(request);
}
