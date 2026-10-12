// SPDX-License-Identifier: MIT
(()=>{
// One cached geometric arrangement. Asset references stay live for animation frames.
const oldSmart=smartPlacements;let cacheKey='',cache=null,hits=0,misses=0;
smartPlacements=function(){const ids=['mode','tw','th','layout','cols','rows','seed','jitter','mix','size','gapx','gapy','sizeJitter','rotation','rotJitter','avoidOverlap','clearance','independentSeeds','mixSeed','sizeSeed','angleSeed'];const key=JSON.stringify([ids.map(k=>$(k).type==='checkbox'?$(k).checked:$(k).value),assets.map(a=>[renderSourceId(a),a.enabled,a.w,a.h,a.scale,a.rotate,a.flip,a.opacity,a.posX,a.posY,a.repeatCount,a.repeatStyle,a.visibleBox]),manualItems]);if(key!==cacheKey){cacheKey=key;cache=oldSmart();misses++}else hits++;return cache.map(p=>({...p}))};
// Count painting so navigation tests can verify reused repeat samples.
let paints=0;const oldPaint=paintLogicalTile;paintLogicalTile=function(...args){paints++;return oldPaint(...args)};
window.JagoRepeatPerformance={get arrangementHits(){return hits},get arrangementMisses(){return misses},get logicalPaints(){return paints}};
// Freeze does not remove sources; the preview copy list can be built in linear time.
copyGroups=function(){const ps=placements().filter(p=>p.a),sets=new Map(),map=new Map();for(const p of ps){const key=renderSourceId(p.a)+'|'+p.setId;if(!sets.has(key))sets.set(key,{members:[],signs:new Set()});const group=sets.get(key);group.members.push(p);group.signs.add((p.linkX||1)+'|'+(p.linkY||1))}for(const p of ps){const group=sets.get(renderSourceId(p.a)+'|'+p.setId),reflected=group.signs.size>1,id=reflected?p.setId:p.id;if(!map.has(id))map.set(id,{id,p,members:reflected?group.members:[p],reflected})}return [...map.values()]};
})();
