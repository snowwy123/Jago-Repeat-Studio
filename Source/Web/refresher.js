// SPDX-License-Identifier: MIT
// Reuse the variation bench and project history instead of creating a second editor.
(()=>{
const bank=document.createElement('input');bank.type='hidden';bank.id='repeatSavedDirections';bank.value='[]';document.body.append(bank);keys.push(bank.id);
function directions(){
 try{if(bank.value.length>600000)throw Error();const list=JSON.parse(bank.value);if(!Array.isArray(list)||list.length>8)throw Error();return list.map(d=>{if(typeof d.name!=='string'||!d.name.trim()||d.name.length>64||typeof d.preview!=='string'||d.preview.length>70000||!d.preview.startsWith('data:image/png;base64,'))throw Error();return {...d,settings:JagoRepeatVariations.validateRecipe({format:'jago-repeat-recipe',version:1,settings:d.settings})};});}catch{return [];}
}
function saveBank(list){flushHistory();bank.value=JSON.stringify(list);update();flushHistory();renderBank();}
function keep(settings,preview){
 const list=directions();if(list.length>=8)return toast('This project has eight saved directions. Remove one to make room.');
 const name=prompt('Name this pattern direction','A little variation');if(!name?.trim())return;
 const img=new Image();const owner=$('suiteProjectId').value;img.onload=()=>{if($('suiteProjectId').value!==owner)return;const thumb=canvas(128,88);thumb.getContext('2d').drawImage(img,0,0,128,88);const current=directions();if(current.length>=8)return toast('Keep up to eight directions.');current.push({name:name.trim().slice(0,64),settings,preview:thumb.toDataURL()});saveBank(current);toast('Direction kept in this project. Save the project to keep it on disk.');};img.src=preview;
}
const toolbar=document.createElement('div');toolbar.className='repeat-refresh-bar';
const explore=document.createElement('button');explore.textContent='Explore patterns…';explore.id='repeatExplore';
const motifs=document.createElement('button');motifs.textContent='Edit several motifs…';motifs.id='repeatBatchMotifs';
const check=document.createElement('button');check.textContent='Check repeat…';check.id='repeatCheck';
toolbar.append(explore,motifs,check);document.querySelector('.workspace-bar').after(toolbar);
const bench=$('variationBench'),slot=document.createElement('span');bench.before(slot);
const quick=$('quickVariations');
const family=document.createElement('label');family.textContent='Pattern family';family.innerHTML+='<select id="repeatExploreFamily"><option value="any">Any family</option><option value="ordered">Ordered repeats</option><option value="flowing">Flowing arrangements</option><option value="graphic">Graphic geometry</option></select>';
bench.querySelector('label').before(family);
const related=document.createElement('button');related.textContent='Variations of this layout…';related.onclick=()=>JagoRepeatVariations.compare(true).catch(e=>toast(e.message));
$('compareVariations').textContent='Generate six comparisons…';$('compareVariations').after(related);quick.textContent='Surprise me';
const bankList=document.createElement('div');bankList.className='repeat-direction-bank';
let exploreDialog=null;
function renderBank(){bankList.replaceChildren();const list=directions();if(!list.length){bankList.textContent='Keep a direction from a comparison to find it here. Save your project to include its directions.';return;}
 for(const [i,d]of list.entries()){
  const card=document.createElement('section'),image=new Image(),name=document.createElement('strong');image.src=d.preview;image.alt='Saved repeating proof';name.textContent=d.name;
  const use=document.createElement('button');use.textContent='Apply';use.onclick=()=>{if(exportBusy)return toast('Wait for export to finish.');if(Object.keys(overrides).length||manualItems.length){if(!confirm('Replace this arrangement with the saved layout settings? Your sources remain and Undo restores the arrangement.'))return;}JagoRepeatVariations.apply(d.settings);exploreDialog?.querySelector('.close-dialog').click();};
  const rename=document.createElement('button');rename.textContent='Rename';rename.onclick=()=>{const value=prompt('Direction name',d.name);if(value?.trim()){const next=directions();if(!next[i])return;next[i].name=value.trim().slice(0,64);saveBank(next);}};
  const remove=document.createElement('button');remove.textContent='Remove';remove.onclick=()=>saveBank(directions().filter((_,j)=>j!==i));card.append(image,name,use,rename,remove);bankList.append(card);
 }
}
explore.onclick=()=>{
 if(exportBusy)return toast('Wait for export to finish.');if(exploreDialog?.open)return;
 const dlg=document.createElement('dialog');exploreDialog=dlg;dlg.className='repeat-refresh-dialog';
 dlg.innerHTML='<button class="close-dialog" aria-label="Close pattern exploration">×</button><h2>Explore your pattern</h2><p>Generate repeats a seed. Surprise me chooses a fresh seed. Variations stays close to your current layout. Applying replaces its arrangement; your sources stay and Undo restores it.</p><h3>Saved directions in this project</h3>';
 bench.open=true;dlg.querySelector('h3').before(bench,quick);dlg.append(bankList);renderBank();document.body.append(dlg);
 const close=()=>{slot.after(quick,bench);bench.open=false;dlg.close();dlg.remove();exploreDialog=null;};dlg.querySelector('button').onclick=close;dlg.oncancel=e=>{e.preventDefault();close();};dlg.showModal();
};
function groupKey(p){return p.setId||p.id;}
function editableGroups(){const map=new Map();for(const p of manualItems){const id=groupKey(p);if(!map.has(id))map.set(id,[]);map.get(id).push(p);}return [...map].map(([id,items])=>({id,items}));}
function centre(items){const a=items[0];return {x:mod(a.x+items.reduce((n,p)=>n+RepeatLayout.delta(p.x,a.x,1),0)/items.length,1),y:mod(a.y+items.reduce((n,p)=>n+RepeatLayout.delta(p.y,a.y,1),0)/items.length,1)};}
function transformGroups(ids,action,value){
 if(exportBusy||$('mode').value!=='pattern'||$('layout').value!=='manual')throw Error('Make this pattern editable first.');
 const groups=editableGroups().filter(g=>ids.has(g.id));if(!groups.length)throw Error('Select one or more motif groups.');
 if(!Number.isFinite(value))throw Error('Enter a valid number.');
 if(action==='scale'&&(value<10||value>300)||action==='rotate'&&Math.abs(value)>180||['x','y'].includes(action)&&Math.abs(value)>n(action==='x'?'tw':'th'))throw Error('Use the limits shown beside this control.');
 const originals=new Map(groups.map(g=>[g.id,centre(g.items)])),positions=[...originals.values()];
 const first=positions[0],wx=n('tw'),hy=n('th'),changes=new Map();
 const axis=action==='distributeX'?'x':'y',ordered=[...groups].sort((a,b)=>originals.get(a.id)[axis]-originals.get(b.id)[axis]);
 for(const [index,g]of groups.entries()){
  const c=originals.get(g.id);let dx=0,dy=0;
  if(action==='alignX')dx=RepeatLayout.delta(first.x,c.x,1);
  if(action==='alignY')dy=RepeatLayout.delta(first.y,c.y,1);
  if(action.startsWith('distribute')&&groups.length>2){const j=ordered.indexOf(g),lo=originals.get(ordered[0].id)[axis],hi=originals.get(ordered.at(-1).id)[axis],delta=lo+(hi-lo)*j/(groups.length-1)-c[axis];if(axis==='x')dx=delta;else dy=delta;}
  if(action==='x')dx=value/wx;if(action==='y')dy=value/hy;
  for(const p of g.items){const q={...p};
   if(action==='scale'){const scale=value/100;q.x=mod(c.x+RepeatLayout.delta(p.x,c.x,1)*scale,1);q.y=mod(c.y+RepeatLayout.delta(p.y,c.y,1)*scale,1);q.width*=scale;q.height*=scale;}
   else if(action==='rotate'){const a=value*Math.PI/180,x=RepeatLayout.delta(p.x,c.x,1)*wx,y=RepeatLayout.delta(p.y,c.y,1)*hy;q.x=mod(c.x+(x*Math.cos(a)-y*Math.sin(a))/wx,1);q.y=mod(c.y+(x*Math.sin(a)+y*Math.cos(a))/hy,1);q.angle=((q.angle+value+540)%360)-180;}
   else{q.x=mod(p.x+dx,1);q.y=mod(p.y+dy,1);}
   if(q.width>20||q.height>20)throw Error('These motifs would be too large. Choose a smaller scale.');changes.set(q.id,q);
  }
 }
 flushHistory();manualItems=manualItems.map(p=>changes.get(p.id)||p);update();flushHistory();return groups.length;
}
motifs.onclick=()=>{
 if($('mode').value!=='pattern')return toast('Switch to Pattern to edit motif groups.');if(exportBusy)return;
 const dlg=document.createElement('dialog');dlg.className='repeat-refresh-dialog';
 dlg.innerHTML='<button class="close-dialog" aria-label="Close motif editor">×</button><h2>Edit several motifs</h2><p>Each checkbox selects a whole group, including reflected partners. Edge copies remain part of that motif.</p><button data-make>Make arrangement editable</button><div class="repeat-motif-list"></div><div class="repeat-batch-controls"><button data-all>Select all</button><button data-none>Clear selection</button><label>Scale % <input data-scale type="number" min="10" max="300" value="100"></label><button data-act="scale">Scale groups</button><label>Rotate ° <input data-rotate type="number" min="-180" max="180" value="15"></label><button data-act="rotate">Rotate groups</button><label>Move X px <input data-x type="number" value="10"></label><button data-act="x">Move X</button><label>Move Y px <input data-y type="number" value="10"></label><button data-act="y">Move Y</button><button data-act="alignX">Align vertical centres</button><button data-act="alignY">Align horizontal centres</button><button data-act="distributeX">Space centres across</button><button data-act="distributeY">Space centres down</button></div><p class="help">Scaling and rotation use each group’s centre. Alignment uses the first group as an anchor. Distribution uses the selected centres from left to right or top to bottom. Each edit is one Undo step.</p><p role="status"></p>';
 document.body.append(dlg);const ids=new Set(),list=dlg.querySelector('.repeat-motif-list'),status=dlg.querySelector('[role=status]'),owner=$('suiteProjectId').value;
 const fill=()=>{list.replaceChildren();const manual=$('layout').value==='manual';dlg.querySelector('[data-make]').hidden=manual;dlg.querySelector('.repeat-batch-controls').hidden=!manual;if(!manual){list.textContent='Convert the generated arrangement to editable motifs before making precise group changes. Undo restores the generated layout.';return;}
 for(const [i,g]of editableGroups().entries()){const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=ids.has(g.id);input.onchange=()=>{if(input.checked)ids.add(g.id);else ids.delete(g.id);status.textContent=ids.size+' groups selected';};label.append(input,document.createTextNode((assets[g.items[0].asset]?.name||'Artwork')+' · group '+(i+1)+' · '+g.items.length+' piece(s)'));list.append(label);}};
 dlg.querySelector('[data-make]').onclick=()=>{flushHistory();freeze();flushHistory();fill();};dlg.querySelector('[data-all]').onclick=()=>{editableGroups().forEach(g=>ids.add(g.id));fill();};dlg.querySelector('[data-none]').onclick=()=>{ids.clear();fill();};
 dlg.querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>{try{if($('suiteProjectId').value!==owner)throw Error('The project changed. Reopen the motif editor.');const action=b.dataset.act,value=Number(dlg.querySelector('[data-'+action+']')?.value||0);status.textContent=transformGroups(ids,action,value)+' groups updated. Undo restores this edit.';}catch(e){status.textContent=e.message;}});
 const close=()=>{dlg.close();dlg.remove();};dlg.querySelector('button').onclick=close;dlg.oncancel=e=>{e.preventDefault();close();};fill();dlg.showModal();
};
check.onclick=()=>{
 if(exportBusy)return;const previous=loopPhase;let tile;try{loopPhase=null;tile=rasterTile(Math.min(1,512/n('tw'),512/n('th')));}finally{loopPhase=previous;}
 const dlg=document.createElement('dialog');dlg.className='repeat-refresh-dialog';dlg.innerHTML='<button class="close-dialog" aria-label="Close repeat check">×</button><h2>Check your repeat</h2><p>Look for abrupt edges and distracting rows across actual repeated artwork. A visible rhythm can be intentional; matching edge colours alone cannot prove a good repeat.</p><label><input data-guides type="checkbox" checked> Tile boundaries</label><label><input data-shift type="checkbox" checked> Bring seams into the centre</label><label>Tile size in proof <input data-size type="range" min="80" max="320" value="220"></label><div class="repeat-inspection"></div><button data-save>Save this proof PNG</button>';
 const output=canvas(720,480),ctx=output.getContext('2d');dlg.querySelector('.repeat-inspection').append(output);document.body.append(dlg);
 function paint(){const s=+dlg.querySelector('[data-size]').value/Math.max(tile.width,tile.height),w=tile.width*s,h=tile.height*s,ox=dlg.querySelector('[data-shift]').checked?mod(360,w)-w:0,oy=dlg.querySelector('[data-shift]').checked?mod(240,h)-h:0;ctx.clearRect(0,0,720,480);for(let y=oy;y<480;y+=h)for(let x=ox;x<720;x+=w)ctx.drawImage(tile,x,y,w,h);if(dlg.querySelector('[data-guides]').checked){ctx.strokeStyle='#d94b71';ctx.lineWidth=1;for(let x=ox;x<720;x+=w){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,480);ctx.stroke();}for(let y=oy;y<480;y+=h){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(720,y);ctx.stroke();}}}
 dlg.querySelectorAll('input').forEach(i=>i.oninput=paint);dlg.querySelector('[data-save]').onclick=()=>output.toBlob(blob=>{close();download(blob,'Jago-repeat-check.png');});
 const close=()=>{dlg.close();dlg.remove();};dlg.querySelector('button').onclick=close;dlg.oncancel=e=>{e.preventDefault();close();};paint();dlg.showModal();
};
const css=document.createElement('style');css.textContent='.repeat-refresh-bar{display:flex;gap:8px;flex-wrap:wrap;padding:8px 12px;border-bottom:1px solid var(--line,#aaa)}.repeat-refresh-dialog{width:min(850px,94vw);max-height:88vh;overflow:auto;background:var(--panel,#f7f3e9);color:var(--text,#283e40);padding:24px;border:1px solid var(--line,#aaa);border-radius:8px}.repeat-refresh-dialog .close-dialog{float:right}.repeat-refresh-dialog input:not([type=checkbox]),.repeat-refresh-dialog select{max-width:170px}.repeat-direction-bank{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}.repeat-direction-bank section{border:1px solid var(--line,#aaa);padding:10px;display:flex;gap:6px;flex-wrap:wrap}.repeat-direction-bank img{width:100%;height:110px;object-fit:contain}.repeat-direction-bank strong{width:100%}.repeat-motif-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px;max-height:32vh;overflow:auto;margin:14px 0}.repeat-motif-list label{display:flex;align-items:center;gap:8px}.repeat-batch-controls{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.repeat-batch-controls label{max-width:140px}.repeat-batch-controls input{width:80px}.repeat-inspection{background:repeating-conic-gradient(#8883 0 25%,transparent 0 50%) 0/16px 16px;margin:16px 0}.repeat-inspection canvas{width:100%;height:auto}.repeat-refresh-dialog [hidden]{display:none!important}.repeat-refresh-dialog #variationBench{border:0;padding:0}.repeat-refresh-dialog #variationBench>summary{display:none}';document.head.append(css);
window.JagoRepeatRefresh={keep,directions,groups:editableGroups,transform:transformGroups,open:()=>explore.click(),check:()=>check.click()};
})();
