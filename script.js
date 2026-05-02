let charts = {};
const API_KEY = '451be6f89061491c834957a24a0b1367';

async function loadData() {
  const btn = document.getElementById('refreshBtn');
  btn.textContent = '↻ Loading...';
  btn.disabled = true;

  await Promise.all([
    fetchSeries('USD/KRW', 'usdkrw', '₩', 2, '#2563eb'),
    fetchSeries('KR10Y', 'kr10y', '%', 3, '#7c3aed')
  ]);

  btn.textContent = '↻ Refresh';
  btn.disabled = false;
}

async function fetchSeries(symbol, id, unit, decimals, color) {
  try {
    const today = new Date();
    const from = new Date();
    from.setDate(today.getDate() - 35);
    const fromStr = from.toISOString().split('T')[0];
    const toStr = today.toISOString().split('T')[0];

    const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&start_date=${fromStr}&end_date=${toStr}&apikey=${API_KEY}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    if (data.status === 'error') throw new Error(data.message);
    if (!data.values || data.values.length === 0) throw new Error('No data returned');

    // Twelve Data returns newest first, so reverse
    const sorted = [...data.values].reverse();

    const labels = sorted.map(d => {
      const dt = new Date(d.datetime);
      return `${dt.getMonth() + 1}/${dt.getDate()}`;
    });
    const values = sorted.map(d => parseFloat(d.close));

    const latest = values[values.length - 1];
    const prev = values[values.length - 2];
    const change = latest - prev​​​​​​​​​​​​​​​​
