let currentCleanup = null;

export function renderPage(renderFn, ...args) {
  if (typeof currentCleanup === "function") {
    currentCleanup();
    currentCleanup = null;
  }

  const cleanup = renderFn(...args);

  if (typeof cleanup === "function") {
    currentCleanup = cleanup;
  }
}
