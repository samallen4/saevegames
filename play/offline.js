// Cache the game after its first successful start. This avoids precaching
// a second copy of the large WASM payload while Safari starts the engine.
if ("serviceWorker" in navigator) {
  const loading = document.getElementById("status");
  const register = () => navigator.serviceWorker.register("./offline-worker.js").catch(() => {});
  if (loading) {
    const observer = new MutationObserver(() => {
      if (loading.isConnected) return;
      observer.disconnect();
      register();
    });
    observer.observe(loading.parentNode, { childList: true });
  } else {
    register();
  }
}
