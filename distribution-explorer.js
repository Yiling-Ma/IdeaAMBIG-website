/* Counts are computed from released IDs; Combined is the union, not an average. */
(() => {
  'use strict';
  const root=document.querySelector('#distribution-explorer');
  const $=s=>root.querySelector(s), $$=s=>[...root.querySelectorAll(s)];
  const names={real:'Real-world',synthetic:'Synthetic',combined:'Combined'};
  const colors={real:'var(--brick)',synthetic:'#f3a653',combined:'var(--olive)'};
  let data, dimension='level1', subset='compare', unit='share', sort=false, pinned=null, hover=null;
  const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
  const cats=()=>data.dimensions[dimension].categories;
  const sets=()=>subset==='compare'?['real','synthetic','combined']:[subset];
  const percentage=(cat,set)=>100*cat.counts[set]/data.totals[set];
  const format=(cat,set)=>unit==='share'?percentage(cat,set).toFixed(1)+'%':cat.counts[set].toLocaleString('en-US');
  function fallback(){const set=subset==='compare'?'combined':subset;return {id:[...cats()].sort((a,b)=>b.counts[set]-a.counts[set])[0].id,set};}
  function selected(){return pinned||hover||fallback();}
  function announce(text){$('#distribution-live').textContent=text;}
  function focusSummary(){
    const active=selected(),cat=cats().find(c=>c.id===active.id),set=active.set,pct=percentage(cat,set);
    $('#dist-focus-subset').textContent=`${names[set]} · ${data.totals[set]} instances`;
    $('#dist-focus-title').textContent=cat.label;$('#dist-focus-description').textContent=cat.description;
    $('#dist-focus-percent').textContent=pct.toFixed(1)+'%';$('#dist-focus-count').textContent=`${cat.counts[set]} of ${data.totals[set]} instances`;
    const ring=$('#dist-ring-value');ring.setAttribute('stroke-dasharray',`${pct} 100`);ring.setAttribute('stroke',colors[set]);ring.style.visibility=pct===0?'hidden':'visible';
    $('#distribution-ring').setAttribute('aria-label',`${cat.label}: ${cat.counts[set]} of ${data.totals[set]} ${names[set]} instances, ${pct.toFixed(1)} percent`);
    const detail=$('#dist-focus-breakdown');detail.replaceChildren();
    for(const key of ['real','synthetic','combined']){const row=el('div',undefined,'dist-breakdown-row');row.dataset.subset=key;row.append(el('span',names[key]),el('strong',`${cat.counts[key]} / ${data.totals[key]}`),el('span',percentage(cat,key).toFixed(1)+'%'));detail.append(row);}
    $$('.dist-row').forEach(n=>{
      n.classList.toggle('is-active',n.dataset.category===active.id);
      n.querySelector('.dist-category-button').setAttribute('aria-pressed',String(pinned?.id===n.dataset.category));
      const detail=n.querySelector('.dist-inline-detail');detail.hidden=pinned?.id!==n.dataset.category;
    });
    $$('.dist-bar-button').forEach(n=>n.setAttribute('aria-pressed',String(pinned?.id===n.dataset.category&&pinned?.set===n.dataset.subset)));
    $('#distribution-chart').classList.toggle('has-pin',!!pinned);$('#distribution-clear').hidden=!pinned;
  }
  function pin(id,set){pinned=pinned?.id===id&&pinned?.set===set?null:{id,set};hover=null;focusSummary();announce(pinned?`${cats().find(c=>c.id===id).label} selected. ${names[set]}.`:'Category highlight cleared.');}
  function render(){
    const config=data.dimensions[dimension],visible=sets(),baseSet=subset==='compare'?'combined':subset;
    $$('[data-dist-dimension]').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.distDimension===dimension)));
    $$('[data-dist-subset]').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.distSubset===subset)));
    $$('[data-dist-unit]').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.distUnit===unit)));
    $('#distribution-sort').setAttribute('aria-pressed',String(sort));
    $('#distribution-context').textContent=`${config.title} · ${subset==='compare'?'163 real-world + 497 synthetic = 660 combined instances':data.totals[subset]+' '+names[subset].toLowerCase()+' instances'}`;
    $('#distribution-note').textContent=config.note+' Combined is the union of the two subsets.';
    $('#dist-measure-title').textContent=unit==='share'?'Share of instances (%)':'Number of instances';
    const order=[...cats()];if(sort)order.sort((a,b)=>b.counts[baseSet]-a.counts[baseSet]||a.label.localeCompare(b.label));
    const maximum=unit==='share'?100:Math.max(20,Math.ceil(Math.max(...cats().flatMap(c=>visible.map(s=>c.counts[s])))/20)*20);
    const legend=$('#distribution-legend');legend.replaceChildren();
    visible.forEach(set=>{const label=el('span',undefined,'dist-legend-item'),dot=el('i');dot.style.background=colors[set];dot.setAttribute('aria-hidden','true');label.append(dot,document.createTextNode(names[set]));legend.append(label);});
    const axis=$('#distribution-axis');axis.replaceChildren();[0,.25,.5,.75,1].forEach(t=>axis.append(el('span',unit==='share'?(t*100)+'%':String(Math.round(maximum*t)))));
    const chart=$('#distribution-chart');chart.replaceChildren();const pending=[];
    order.forEach(cat=>{
      const row=el('div',undefined,'dist-row');row.dataset.category=cat.id;
      const label=el('button',cat.label,'dist-category-button');label.type='button';label.setAttribute('aria-pressed',String(pinned?.id===cat.id));label.addEventListener('click',()=>pin(cat.id,baseSet));label.addEventListener('focus',()=>{hover={id:cat.id,set:baseSet};focusSummary();});label.addEventListener('blur',()=>{hover=null;focusSummary();});row.append(label);
      const bars=el('div',undefined,'dist-bars');
      visible.forEach(set=>{
        const value=cat.counts[set],pct=percentage(cat,set);const button=el('button',undefined,'dist-bar-button');button.type='button';button.dataset.category=cat.id;button.dataset.subset=set;button.dataset.count=value;button.dataset.percentage=pct;button.setAttribute('aria-pressed',String(pinned?.id===cat.id&&pinned?.set===set));button.setAttribute('aria-label',`${cat.label}, ${names[set]}: ${value} of ${data.totals[set]} instances, ${pct.toFixed(1)} percent. Select to pin.`);
        const track=el('span',undefined,'dist-bar-track'),fill=el('span',undefined,'dist-bar-fill');fill.style.background=colors[set];fill.style.width='0%';track.append(fill);button.append(track,el('span',format(cat,set),'dist-bar-number'));bars.append(button);
        pending.push([fill,(unit==='share'?pct:value/maximum*100)+'%']);
        const enter=()=>{hover={id:cat.id,set};focusSummary();};button.addEventListener('pointerenter',enter);button.addEventListener('focus',enter);button.addEventListener('blur',()=>{hover=null;focusSummary();});button.addEventListener('click',()=>pin(cat.id,set));
      });
      row.append(bars);const extra=el('p',['real','synthetic','combined'].map(set=>`${names[set]}: ${cat.counts[set]} / ${data.totals[set]} (${percentage(cat,set).toFixed(1)}%)`).join(' · '),'dist-inline-detail');extra.hidden=true;row.append(extra);
      row.addEventListener('pointerenter',()=>{hover={id:cat.id,set:baseSet};focusSummary();});row.addEventListener('pointerleave',()=>{hover=null;focusSummary();});chart.append(row);
    });
    // Reading layout before the next frame lets bars animate from zero after a control change.
    chart.getBoundingClientRect();requestAnimationFrame(()=>pending.forEach(([n,width])=>{n.style.width=width;}));focusSummary();
  }
  $$('[data-dist-dimension]').forEach(n=>n.addEventListener('click',()=>{dimension=n.dataset.distDimension;pinned=null;hover=null;render();announce(data.dimensions[dimension].title+' displayed.');}));
  $$('[data-dist-subset]').forEach(n=>n.addEventListener('click',()=>{subset=n.dataset.distSubset;pinned=null;hover=null;render();announce(subset==='compare'?'Comparing all three subsets.':names[subset]+' displayed.');}));
  $$('[data-dist-unit]').forEach(n=>n.addEventListener('click',()=>{unit=n.dataset.distUnit;render();}));
  $('#distribution-sort').addEventListener('click',()=>{sort=!sort;render();});
  $('#distribution-clear').addEventListener('click',()=>{pinned=null;hover=null;focusSummary();});
  root.addEventListener('keydown',event=>{if(event.key==='Escape'){pinned=null;hover=null;focusSummary();}});
  $$('button').forEach(n=>{n.disabled=true;});
  fetch('data/distributions.json?v=interactive-1').then(r=>{if(!r.ok)throw new Error('Unable to load distributions');return r.json();}).then(value=>{
    for(const dimension of Object.values(value.dimensions))for(const set of ['real','synthetic','combined']){
      if(dimension.categories.some(c=>!Number.isInteger(c.counts[set])||c.counts[set]<0||c.counts.combined!==c.counts.real+c.counts.synthetic)||dimension.categories.reduce((sum,c)=>sum+c.counts[set],0)!==value.totals[set])throw new Error('Distribution totals do not match');
    }
    data=value;$$('button').forEach(n=>{n.disabled=false;});root.setAttribute('aria-busy','false');render();
  }).catch(()=>{$('#distribution-context').textContent='Interactive data could not be loaded. Reload this page or open the original PDF above.';root.setAttribute('aria-busy','false');});
})();
