'use strict';
keys.push('feedSizing','feedSpacing');
const beforeFeedPlacements=placements;
placements=function(){if($('mode').value!=='feed')return beforeFeedPlacements();const w=n('tw'),h=n('th'),vertical=$('direction').value==='vertical',length=vertical?h:w,cross=vertical?w:h,active=assets.filter(a=>a.enabled),texts=$('feedText').value.split('\n').filter(t=>t.trim()),count=active.length+texts.length;if(!count)return [];const slot=length/count,gap=n('feedGap'),available=Math.max(1,slot-gap),sizing=$('feedSizing').value;
let items=active.map(a=>{let scale=($('feedFit').value==='cover'&&sizing==='individual'&&$('feedSpacing').value==='slots'?Math.max:Math.min)((vertical?cross:available)/a.w,(vertical?available:cross)/a.h);return {a,width:a.w*scale,height:a.h*scale,angle:a.rotate,flip:a.flip,opacity:a.opacity/100}});
if(sizing!=='individual'&&items.length){const measure=p=>sizing==='height'?p.height:sizing==='width'?p.width:Math.sqrt(p.width*p.height),target=Math.min(...items.map(measure));items.forEach(p=>{const f=target/measure(p);p.width*=f;p.height*=f})}
items.forEach(p=>{p.width*=p.a.scale/100;p.height*=p.a.scale/100});items.push(...texts.map(text=>({text,width:Math.min(cross,text.length*n('fontSize')*.6),height:n('fontSize')*1.3,angle:0})));
const extent=p=>{const a=p.angle*Math.PI/180;return vertical?Math.abs(Math.sin(a))*p.width+Math.abs(Math.cos(a))*p.height:Math.abs(Math.cos(a))*p.width+Math.abs(Math.sin(a))*p.height};
if($('feedSpacing').value==='edges'){const total=items.reduce((s,p)=>s+extent(p),0),f=Math.min(1,Math.max(1,length-count*gap)/Math.max(1,total));items.forEach(p=>{if(!p.text){p.width*=f;p.height*=f}});const used=items.reduce((s,p)=>s+extent(p),0),spacing=Math.max(0,(length-used)/count);let cursor=spacing/2;items.forEach(p=>{const e=extent(p);p.x=vertical?w/2:cursor+e/2;p.y=vertical?cursor+e/2:h/2;cursor+=e+spacing})}
else items.forEach((p,i)=>{p.x=vertical?w/2:slot*(i+.5);p.y=vertical?slot*(i+.5):h/2;p.clip={x:vertical?0:i*slot,y:vertical?i*slot:0,w:vertical?w:slot,h:vertical?slot:h}});
return items.map((p,i)=>({...p,id:'feed-'+i}));};
for(const id of ['feedSizing','feedSpacing'])$(id).oninput=update;
$('showNeighbours').oninput=()=>draw();

const textureDown=$('preview').onpointerdown;$('preview').onpointerdown=e=>{if($('mode').value==='texture'&&$('showNeighbours').checked){const oldPoint=point;point=function(event){const p=oldPoint(event);return p?{x:mod(p.x,n('tw')),y:mod(p.y,n('th'))}:p};try{textureDown(e)}finally{point=oldPoint}}else textureDown(e)};
$('exportTop').onclick=()=>{const panel=$('output').closest('aside');panel.scrollTop=$('output').offsetTop-panel.offsetTop-40;$('output').focus();toast('Choose tile or canvas, dimensions and export scale below')};
