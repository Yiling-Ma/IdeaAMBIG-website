/* Paired-subset explorer. Reported scores are loaded unchanged from results.json. */
(() => {
  'use strict';
  const root = document.querySelector('#results-explorer');
  const $ = selector => root.querySelector(selector);
  const $$ = selector => [...root.querySelectorAll(selector)];
  const metrics = [
    {name:'Readiness', metric:'Macro-F1', sample:'Task 1: 100 READY + 100 NOT READY specifications per subset.'},
    {name:'Localization', metric:'Macro DRR', sample:'Task 2: 163 real-world instances and 200 controlled synthetic instances.'},
    {name:'Clarification', metric:'Macro-CAS', sample:'Task 3: 163 real-world instances and 200 controlled synthetic instances. The annotated defect is supplied.'}
  ];
  const groups = {
    proprietary: 'Frontier proprietary models',
    reasoning: 'Open-weight reasoning models',
    general: 'Open-weight general models'
  };
  const ns = 'http://www.w3.org/2000/svg';
  let rows = [], selected = new Set(), view = 'compare', metric = 0, pinned = null, hovered = null;
  const colors = {up:'var(--olive)', down:'var(--brick)', same:'var(--rank-neutral)'};
  const signed = number => `${number > 0 ? '+' : number < 0 ? '−' : ''}${Math.abs(number).toFixed(1)}`;
  function node(tag, text, cls) {
    const n = document.createElement(tag);
    if (text !== undefined) n.textContent = text;
    if (cls) n.className = cls;
    return n;
  }
  function svgNode(tag, attrs = {}, text) {
    const n = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([key,value]) => n.setAttribute(key, value));
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function selectedRows() { return rows.filter(row => selected.has(row.model)); }
  function ranked(subset) {
    const sorted = selectedRows().sort((a,b) => b[subset][metric] - a[subset][metric] || a.model.localeCompare(b.model));
    return sorted.map((row, index) => ({...row, rank:1 + sorted.filter(other => other[subset][metric] > row[subset][metric]).length, slot:index}));
  }
  function movement(row, synth, real) { return synth.get(row.model).rank - real.get(row.model).rank; }
  function groupClass(row) { return Object.keys(groups).find(key => groups[key] === row.group); }
  function renderChips() {
    const host = $('#model-toggles');
    if (!host.children.length) rows.forEach(row => {
      const button = node('button', undefined, `model-toggle group-${groupClass(row)}`);
      button.type = 'button'; button.dataset.model = row.model;
      button.append(node('span', '', 'model-family-dot'), node('span', row.model));
      button.title = row.group;
      button.addEventListener('click', () => {
        if (selected.has(row.model)) selected.delete(row.model); else selected.add(row.model);
        if (!selected.has(pinned)) pinned = null;
        hovered = null; render();
      });
      host.append(button);
    });
    $$('.model-toggle').forEach(button => button.setAttribute('aria-pressed', String(selected.has(button.dataset.model))));
    $$('[data-preset]').forEach(button => {
      const names = button.dataset.preset === 'all' ? rows.map(r => r.model) : button.dataset.preset === 'none' ? [] : rows.filter(r => r.group === groups[button.dataset.preset]).map(r => r.model);
      button.setAttribute('aria-pressed', String(names.length === selected.size && names.every(name => selected.has(name))));
    });
  }
  function showDetail(name) {
    const out = $('#rank-detail');
    if (!name) { out.textContent = 'Hover or focus a model to trace it. Click or press Enter to pin; Escape clears the highlight.'; return; }
    const row = rows.find(r => r.model === name), synth = new Map(ranked('synthetic').map(r => [r.model,r])), real = new Map(ranked('real').map(r => [r.model,r]));
    if (!row || !synth.has(name)) return;
    const shift = movement(row,synth,real);
    out.textContent = `${name} · Synthetic ${row.synthetic[metric].toFixed(1)}% · Real-world ${row.real[metric].toFixed(1)}% · Score difference ${signed(row.real[metric]-row.synthetic[metric])} pp · ${shift === 0 ? 'No rank change' : (shift > 0 ? 'Up '+shift : 'Down '+Math.abs(shift))+' rank'+(Math.abs(shift) === 1 ? '' : 's')} on real-world.`;
  }
  function highlight() {
    const active = hovered || pinned;
    const svg = $('#rank-chart svg');
    if (svg) {
      svg.classList.toggle('has-highlight', !!active);
      svg.querySelectorAll('[data-model]').forEach(n => {
        n.classList.toggle('is-highlighted', n.dataset.model === active);
        if (n.classList.contains('rank-node')) n.setAttribute('aria-pressed', String(n.dataset.model === pinned));
      });
    }
    $('#clear-rank-highlight').hidden = !pinned;
    showDetail(active);
  }
  function togglePin(name) { pinned = pinned === name ? null : name; hovered = null; highlight(); }
  function renderChart() {
    const host = $('#rank-chart'); host.replaceChildren();
    const left = ranked('synthetic'), right = ranked('real');
    if (!left.length) { host.append(node('p','Select at least one model above to compare the subsets.','results-empty')); $('#clear-rank-highlight').hidden=true; showDetail(null); return; }
    const synthMap = new Map(left.map(r => [r.model,r])), realMap = new Map(right.map(r => [r.model,r]));
    const width = 1080, step = 49, top = 62, height = top + left.length * step + 8;
    const svg = svgNode('svg', {viewBox:`0 0 ${width} ${height}`, role:'group', 'aria-label':`${metrics[metric].metric}: synthetic and real-world model rankings`});
    const desc = svgNode('desc', {}, 'Synthetic rankings on the left, real-world rankings on the right. Each curve connects the same model. Ties share a competition rank. Scores are percentages.'); svg.append(desc);
    svg.append(svgNode('text',{x:0,y:24,class:'rank-column-heading'},'SYNTHETIC'));
    svg.append(svgNode('text',{x:1080,y:24,'text-anchor':'end',class:'rank-column-heading'},'REAL-WORLD'));
    svg.append(svgNode('text',{x:540,y:24,'text-anchor':'middle',class:'rank-metric-heading'},`${metrics[metric].metric} ↑`));
    left.forEach(row => {
      const target = realMap.get(row.model), shift = row.rank - target.rank;
      const start = top + row.slot * step + 19, end = top + target.slot * step + 19;
      const path = svgNode('path', {d:`M 414 ${start} C 505 ${start}, 575 ${end}, 666 ${end}`,fill:'none',stroke:colors[shift>0?'up':shift<0?'down':'same'],'stroke-width':2.2,class:'rank-link','data-model':row.model,'data-synthetic-rank':row.rank,'data-real-rank':target.rank,pathLength:1,'aria-hidden':'true'});
      path.addEventListener('pointerenter',()=>{hovered=row.model;highlight();});path.addEventListener('pointerleave',()=>{hovered=null;highlight();});path.addEventListener('click',()=>togglePin(row.model));svg.append(path);
    });
    for (const [side, list, x] of [['synthetic',left,0],['real',right,674]]) {
      list.forEach(row => {
        const y=top+row.slot*step,shift=movement(row,synthMap,realMap), score=row[side][metric];
        const g=svgNode('g',{class:'rank-node',transform:`translate(${x} ${y})`,'data-model':row.model,'data-side':side,'data-score':score,'data-rank':row.rank,tabindex:0,role:'button','aria-pressed':String(pinned===row.model),'aria-label':`${row.model}, ${side==='real'?'real-world':'synthetic'}, rank ${row.rank}, ${score.toFixed(1)} percent. Select to trace.`});
        g.append(svgNode('rect',{x:0,y:0,width:406,height:38,rx:8,class:'rank-node-bg'}));
        g.append(svgNode('text',{x:12,y:25,class:'rank-number'},`#${row.rank}`));
        g.append(svgNode('text',{x:47,y:25,class:'rank-model-name'},row.model));
        g.append(svgNode('text',{x:side==='real'?351:393,y:25,'text-anchor':'end',class:'rank-score'},score.toFixed(1)));
        if(side==='real')g.append(svgNode('text',{x:394,y:25,'text-anchor':'end',class:`rank-shift ${shift>0?'rank-up':shift<0?'rank-down':'rank-same'}`},shift>0?`↑${shift}`:shift<0?`↓${Math.abs(shift)}`:'—'));
        g.addEventListener('pointerenter',()=>{hovered=row.model;highlight();});g.addEventListener('pointerleave',()=>{hovered=null;highlight();});g.addEventListener('focus',()=>{hovered=row.model;highlight();});g.addEventListener('blur',()=>{hovered=null;highlight();});g.addEventListener('click',()=>togglePin(row.model));g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();togglePin(row.model);}if(e.key==='Escape'){pinned=null;hovered=null;highlight();}});svg.append(g);
      });
    }
    host.append(svg);highlight();
  }
  function renderTable() {
    const body=$('#results-body');body.replaceChildren();const set=view==='compare'?'real':view;
    const chosen=selectedRows(),best=[0,1,2].map(i=>Math.max(...chosen.map(r=>r[set][i])));
    const sorted=chosen.sort((a,b)=>b[set][metric]-a[set][metric]||a.model.localeCompare(b.model));
    sorted.forEach(row=>{
      const tr=node('tr');tr.dataset.model=row.model;if(row.model==='GPT-5.6-Sol')tr.className='winner';
      const name=node('th');name.scope='row';name.append(node('span',row.model),node('small',row.group));tr.append(name);
      row[set].forEach((score,i)=>tr.append(node('td',score.toFixed(1),score===best[i]?'best':'')));
      const delta=row.real[metric]-row.synthetic[metric];tr.append(node('td',signed(delta),`score-delta ${delta>0?'rank-up':delta<0?'rank-down':'rank-same'}`));body.append(tr);
    });
    if(!sorted.length){const tr=node('tr'),td=node('td','Select at least one model above.','results-empty');td.colSpan=5;tr.append(td);body.append(tr);}
    $$('[data-order]').forEach(button=>button.closest('th').setAttribute('aria-sort',Number(button.dataset.order)===metric?'descending':'none'));
    $('#score-gap-metric').textContent=`${metrics[metric].metric} · pp`;
    $('#results-table-caption').textContent=`${set==='real'?'Real-world':'Controlled synthetic'} subset results for the selected models. All scores are percentages; the final column is real-world minus synthetic for ${metrics[metric].metric}, in percentage points.`;
  }
  function render() {
    renderChips();
    $$('[data-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.view===view)));
    $$('[data-metric]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.metric)===metric)));
    $('#results-sample').textContent=`${selected.size} of ${rows.length} models selected. ${metrics[metric].sample}`;
    $('#rank-comparison').hidden=view!=='compare';$('#results-table-wrap').hidden=view==='compare';
    $('#table-context').hidden=view==='compare';
    $('#table-context').textContent=`${view==='real'?'Real-world':'Controlled synthetic'} scores, sorted by ${metrics[metric].metric}. Δ is always Real-world − Synthetic for the selected metric, in percentage points.`;
    renderChart();renderTable();
  }
  $$('[data-view]').forEach(button=>button.addEventListener('click',()=>{view=button.dataset.view;hovered=null;render();}));
  $$('[data-metric]').forEach(button=>button.addEventListener('click',()=>{metric=Number(button.dataset.metric);hovered=null;render();}));
  $$('[data-order]').forEach(button=>button.addEventListener('click',()=>{metric=Number(button.dataset.order);render();}));
  $$('[data-preset]').forEach(button=>button.addEventListener('click',()=>{selected=new Set(rows.filter(row=>button.dataset.preset==='all'||row.group===groups[button.dataset.preset]).map(row=>row.model));if(!selected.has(pinned))pinned=null;hovered=null;render();}));
  $('#clear-rank-highlight').addEventListener('click',()=>{pinned=null;hovered=null;highlight();});
  root.addEventListener('keydown',event=>{if(event.key==='Escape'){pinned=null;hovered=null;highlight();}});
  fetch('data/results.json?v=rank-compare-1').then(response=>{if(!response.ok)throw new Error('Unable to load results');return response.json();}).then(data=>{
    if(!Array.isArray(data)||data.some(r=>!r.model||!Array.isArray(r.real)||!Array.isArray(r.synthetic)||r.real.length!==3||r.synthetic.length!==3||[...r.real,...r.synthetic].some(n=>!Number.isFinite(n))))throw new Error('Invalid result data');
    rows=data;selected=new Set(rows.map(row=>row.model));root.setAttribute('aria-busy','false');render();
  }).catch(()=>{root.setAttribute('aria-busy','false');$('#results-sample').textContent='Results could not be loaded. Reload this page or consult the paper.';});
})();
