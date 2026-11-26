"use strict";
(() => {
  // Paper Tables 15–16, GPT-5.6-Sol; values are percentages.
  const datasets = {
    readiness: {labels: ['Macro-F1 ↑', 'UnsafePass ↓', 'OverFlag ↓'], real: [67.49, 31, 34], synthetic: [86.40, 5, 22]},
    localization: {labels: ['Level-1 label accuracy ↑', 'Level-2 label accuracy ↑', 'Blocker localization accuracy ↑', 'Macro DRR ↑'], real: [60.1, 25.2, 16.0, 9.6], synthetic: [65.0, 32.0, 20.0, 12.2]}
  };
  document.querySelectorAll('[data-finding-chart]').forEach(chart => {
    const data = datasets[chart.dataset.findingChart];
    const rows = data.labels.map(label => {
      const row = document.createElement('div'); row.className = 'finding-metric';
      const heading = document.createElement('div');
      const name = document.createElement('span'); name.textContent = label;
      const value = document.createElement('strong');
      heading.append(name, value);
      const track = document.createElement('div'); track.className = 'finding-metric-track';
      const fill = document.createElement('span'); fill.style.width = '0%'; track.append(fill);
      row.append(heading, track); chart.querySelector('.finding-metric-bars').append(row);
      return {value, fill};
    });
    let active = 'real', visible = false;
    const render = () => {
      chart.querySelector('.finding-chart-context').textContent = `GPT-5.6-Sol · ${active === 'real' ? 'Real-world' : 'Controlled synthetic'}`;
      chart.dataset.activeSet = active;
      chart.querySelectorAll('[data-finding-set]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.findingSet === active)));
      rows.forEach((row, i) => {const value = data[active][i]; row.value.textContent = `${value.toFixed(1)}%`; row.fill.style.width = visible ? `${value}%` : '0%';});
    };
    chart.querySelectorAll('[data-finding-set]').forEach(button => button.addEventListener('click', () => {active = button.dataset.findingSet; render();}));
    const observer = new IntersectionObserver(entries => {if (entries.some(entry => entry.isIntersecting)) {visible = true; render(); observer.disconnect();}}, {threshold: .15});
    render(); observer.observe(chart);
  });
})();
