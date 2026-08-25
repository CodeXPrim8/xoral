(function () {
  try {
    if (sessionStorage.getItem('xoral-sw-killed') === '1') return;
  } catch (e) { /* ignore */ }

  var host = location.hostname;
  var local =
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host.indexOf('trycloudflare.com') !== -1 ||
    /^192\.168\./.test(host) ||
    /^10\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host);
  if (!local) return;

  function done() {
    try { sessionStorage.setItem('xoral-sw-killed', '1'); } catch (e) { /* ignore */ }
  }

  var jobs = [];
  if (navigator.serviceWorker) {
    jobs.push(
      navigator.serviceWorker.getRegistrations().then(function (regs) {
        return Promise.all(regs.map(function (reg) { return reg.unregister(); }));
      })
    );
  }
  if (window.caches) {
    jobs.push(
      caches.keys().then(function (keys) {
        return Promise.all(
          keys.map(function (key) {
            if (key.indexOf('xoral-party') === 0) return caches.delete(key);
          })
        );
      })
    );
  }
  Promise.all(jobs).then(done, done);
})();
