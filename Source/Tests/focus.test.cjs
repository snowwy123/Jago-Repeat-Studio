const test=require('node:test'),assert=require('node:assert/strict'),V=require('../Web/variation-engine.js'),L=require('../Web/layout-engine.js'),S=require('../Web/shape-spacing.js');
const base={mode:'pattern',layout:'grid',cols:'3',rows:'3',size:'75',sizeJitter:'9',rotation:'17',rotJitter:'21',jitter:'23',mix:'random',seed:'42'};
test('Variation recipes are deterministic, bounded and preserve input',()=>{const before=JSON.stringify(base),a=V.variations(base,42);assert.deepEqual(a,V.variations(base,42));assert.notDeepEqual(a,V.variations(base,43));assert.equal(a.length,6);assert.equal(JSON.stringify(base),before);for(const p of a){assert.ok(V.styles.includes(p.layout));assert.ok(+p.cols>=2&&+p.cols<=6);assert.ok(+p.rows>=2&&+p.rows<=6)}});
test('All creative locks preserve their controls',()=>{const a=V.variations(base,91,{layout:true,density:true,size:true,angle:true,position:true,mix:true});for(const p of a)for(const k of ['layout','cols','rows','size','sizeJitter','rotation','rotJitter','jitter','mix'])assert.equal(p[k],base[k])});
test('Locked density stays intact even with odd half drop counts',()=>{for(const p of V.variations({...base,layout:'brick'},4,{layout:true,density:true}))assert.equal(p.rows,'3')});
test('Unlocked regular half drops have even repeating counts',()=>{for(let seed=0;seed<30;seed++)for(const p of V.variations(base,seed)){if(['brick','diamond'].includes(p.layout))assert.equal(+p.rows%2,0);if(['column','diamond'].includes(p.layout))assert.equal(+p.cols%2,0)}});
test('Invalid seeds are rejected',()=>{for(const seed of [-1,1.2,NaN,1000000])assert.throws(()=>V.variations(base,seed))});

test('Pattern families constrain exploration while explicit layout locks win',()=>{
 for(const [family,allowed]of Object.entries({ordered:['grid','brick','column'],flowing:['organic','balanced'],graphic:['mirror','diagonal','diamond']})){
  for(const p of V.variations(base,42,{}, {family}))assert.ok(allowed.includes(p.layout));
  for(const p of V.variations(base,42,{layout:true},{family}))assert.equal(p.layout,base.layout);
 }
});

test('Related directions preserve character, respect locks and keep half drops regular',()=>{
 const source={...base,layout:'brick',cols:'4',rows:'4',size:'80'};
 const a=V.variations(source,81,{}, {related:true});assert.deepEqual(a,V.variations(source,81,{}, {related:true}));
 for(const p of a){assert.equal(p.layout,'brick');assert.equal(+p.rows%2,0);assert.ok(+p.size>=68&&+p.size<=92);assert.equal(p.mix,source.mix);}
 for(const p of V.variations(source,81,{size:true,angle:true,density:true},{related:true}))for(const k of ['size','sizeJitter','rotation','rotJitter','cols','rows'])assert.equal(p[k],source[k]);
});
test('Toroidal distance checks neighbours across tile boundaries',()=>{assert.equal(L.distance({x:2,y:10},{x:98,y:10},100,100),4);assert.equal(L.delta(99,1,100),-2)});
test('Every lattice style stays in tile and is deterministic',()=>{for(const type of V.styles){const a=L.lattice(4,4,100,80,type,41,30);assert.deepEqual(a,L.lattice(4,4,100,80,type,41,30));for(const p of a)assert.ok(p.x>=0&&p.x<100&&p.y>=0&&p.y<80)}});
test('Balanced layouts are stable and keep requested count',()=>{for(const relaxed of [false,true]){const a=L.balanced(20,100,80,22,relaxed);assert.equal(a.length,20);assert.deepEqual(a,L.balanced(20,100,80,22,relaxed))}});
test('Spacing sees overlap across opposite edges and fits without mutation',()=>{const a=[{id:'a',x:3,y:30,width:20,height:20,angle:0},{id:'b',x:97,y:30,width:20,height:20,angle:0}],before=JSON.stringify(a);assert.ok(S.minimum(a,100,100)<0);const fitted=S.fit(a,100,100,2,true);assert.ok(S.minimum(fitted,100,100)>=1.9);assert.equal(JSON.stringify(a),before)});
test('Rotated visible bounds respect transparency and reflection',()=>{const p={x:50,y:50,width:80,height:40,angle:90,flip:false,a:{visibleBox:{left:0,top:0,right:.5,bottom:1}}},a=S.box(p),b=S.box({...p,flip:true});assert.ok(Math.abs(a.x-50)<1e-8);assert.ok(a.y<50&&b.y>50);assert.equal(a.hw,20)});
