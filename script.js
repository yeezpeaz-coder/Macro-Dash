let charts = {};

async function loadData() {
  const btn = document.getElementById('refreshBtn');
  btn.textContent = '↻ Loading...';
  btn.disabled = true;

  await Promise.all([
    fetchYahoo('KRW=X', 'usdkrw', '₩', 2),
    fetchYahoo('^KR10Y', 'kr10y', '%', 3)
  ]);

  btn.textContent = '↻ Refresh';
  btn.disabled = false;
}

async function fetchYahoo(ticker, id, unit, decimals) {
  try {
    const url = `https://corsproxy.io/?${encodeURIComponent(
      `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1mo`
    )}`;

    const res = await fetch(url);
    const data = await res.json();
    const result = data.chart.result[0];

    const timestamps = result.timestamp;
    const closes = result.indicators.quote[0].close;

    // Build label/value pairs, filter nulls
    const points = timestamps
      .map((ts, i) => ({
        label: formatDate(ts),
        value: closes[i]
      }))
      .filter(d => d.value !== null);

    const labels = points.map(d => d.label);
    const values = points.map(d => d.value);

    const latest = values[values.length - 1];
    const prev = values[values.length - 2];
    const change = latest - prev;
    const changePct = ((change / prev) * 100).toFixed(2);

    // Latest value
    document.getElementById(`${id}-latest`).textContent =
      latest.toFixed(decimals) + ' ' + unit;

    // Change vs prev close
    const changeEl = document.getElementById(`${id}-change`);
    changeEl.textContent =
      `${change >= 0 ? '+' : ''}${change.toFixed(decimals)} (${changePct}%) vs prev close`;
    changeEl.className = 'change ' + (change >= 0 ? 'positive' : 'negative');

    // Timestamp
    document.getElementById(`${id}-updated`).textContent =
      'Last updated: ' + new Date().toLocaleString();

    // Draw chart
    const ctx = document.getElementById(`${id}-chart`).getContext('2d');
    if (charts[id]) charts[id].destroy();

    const color = id === 'usdkrw' ? '#2563eb' : '#7c3aed';

    charts[id] = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data: values,
          borderColor: color,
          backgroundColor: color + '15',
          borderWidth: 2,
          pointRadius: 2,
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            ticks: {
              callback: v => v.toFixed(decimals) + ' ' + unit
            }
          }
        }
      }
    });

  } catch (e) {
    document.getElementById(`${id}-latest`).textContent = 'Error loading data';
    console.error(e);
  }
}

function formatDate(ts) {
  const d = new Date(ts * 1000);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

// Load on startup
loadData();

