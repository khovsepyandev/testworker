addEventListener("fetch", (event) => {
  event.respondWith(handle(event.request));
});

async function handle(request) {
  const url = new URL(request.url);

  // Only proxy anything under /search
  if (url.pathname.startsWith("/search")) {
    // Compute the “suffix” path (what comes after /search)
    const suffix = url.pathname.substring("/search".length);
    // e.g. "/products/widget"

    // Build the backend URL: khovsepyan.com/some/path + suffix
    const backendUrl = new URL(request.url);
    backendUrl.protocol = "https";
    backendUrl.hostname = "khovsepyan.com";
    backendUrl.pathname = `/some/path${suffix}`;
    // Query string is preserved automatically

    // Forward the request to the backend
    const response = await fetch(backendUrl.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.body,
      // By default fetch() follows 3xx redirects
    });

    // Return the backend’s response unmodified
    return new Response(response.body, {
      status: response.status,
      headers: response.headers,
    });
  }

  // All other requests → normal route (WordPress origin)
  return fetch(request);
}
