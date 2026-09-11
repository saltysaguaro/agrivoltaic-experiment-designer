const run = document.getElementById('run'),
  out = document.getElementById('results'),
  status = document.getElementById('status');
run.onclick = () => {
  run.disabled = true;
  const w = new Worker(new URL('./extensions-worker.js', import.meta.url), { type: 'module' });
  const timeout = setTimeout(() => {
    w.terminate();
    status.textContent = 'Timed out at 120 seconds';
    run.disabled = false;
  }, 120000);
  w.onmessage = ({ data }) => {
    status.textContent = data.message;
    if (data.report) out.textContent = JSON.stringify(data.report, null, 2);
    if (data.done) {
      clearTimeout(timeout);
      w.terminate();
      run.disabled = false;
      document.getElementById('download').disabled = false;
    }
  };
  w.onerror = (e) => {
    clearTimeout(timeout);
    w.terminate();
    status.textContent = e.message;
    run.disabled = false;
  };
  w.postMessage({});
};
document.getElementById('download').onclick = () => {
  const url = URL.createObjectURL(new Blob([out.textContent], { type: 'application/json' })),
    a = document.createElement('a');
  a.href = url;
  a.download = 'transmission-period-validation.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
