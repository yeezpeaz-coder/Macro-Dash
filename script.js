let charts = {};

async function loadData() {
  const btn = document.getElementById('refreshBtn');
  btn.textContent = '↻ Loading...';
  btn.disabled = true;

  await Promise.all([
    fetchYahoo('KRW=X', 'usdkrw', '₩', 2),
    fetchYahoo('%5EKR10Y', 'kr10y', '%', 3)
  ]);

  btn.textContent = '↻ Refresh';
  btn.disabled = false;
}

async function fetchYahoo(ticker, id, unit, decimals) {
  try {
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1mo`;
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(yahooUrl)}`;

    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

    const data = await res.json();

    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      throw new Error('No data returned');
    }

    const result = data.chart.result[0];
    const timestamps = result.timestamp;
    const closes = result.indicators.quote[0].close;

    const points = timestamps
      .map((ts, i) => ({
        label: formatDate(ts),
        value: closes[i]
      }))
      .filter(d => d.value !== null && d.value !== undefined);

    if (points.length === 0) throw new Error('All values were null');

    const labels = points.map(d => d.label);
    const values = points.map(d => d.value);

    const latest = values[values.length - 1];
    const prev = values[values.length - 2];
    const change = latest - prev;
    const changePct = ((change / prev) * 100).toFixed(2);

    document.getElementById(`${id}-latest​​​​​​​​​​​​​​​​


