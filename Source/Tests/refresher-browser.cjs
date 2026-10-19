const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const repo=path.resolve(__dirname,'../..'),root=path.dirname(repo),out=process.env.REPEAT_TEST_OUTPUT||path.join(require('os').tmpdir(),'jago-repeat-refresher');fs.mkdirSync(out,{recursive:true});
const url=p=>'file:///'+p.replaceAll('\\','/');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await browser.newPage({viewport:{width:1450,height:950}}),errors=[];p.on('pageerror',e=>errors.push(e.stack));await p.goto(url(path.join(repo,'index.html')));await p.waitForFunction(()=>window.JagoRepeatRefresh);await p.evaluate(()=>window.initialAssetLoad);
 const svg='data:image/svg+xml;base64,'+Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><path fill="#d45047" d="M80 5 150 105H10Z"/><circle cx="80" cy="67" r="22" fill="#f8dc73"/></svg>').toString('base64');
 await p.evaluate(async src=>{assets=[];await loadAsset(src,'Triangle flower');$('mode').value='pattern';$('layout').value='brick';$('cols').value=$('rows').value=4;$('tw').value=512;$('th').value=384;update();flushHistory();},svg);
 const before=await p.evaluate(()=>({signature:liveSignature(),animate:$('animate').checked,phase:loopPhase}));
 await p.evaluate(()=>JagoRepeatVariations.compare());assert.equal(await p.locator('.repeat-variation-grid section').count(),6);await p.locator('.repeat-variation-dialog .close-dialog').click();
 assert.deepEqual(await p.evaluate(()=>({signature:liveSignature(),animate:$('animate').checked,phase:loopPhase})),before,'cancel preserves settings and playback');
 await p.locator('#repeatExplore').click();await p.locator('#repeatExploreFamily').selectOption('graphic');await p.locator('#compareVariations').click();await p.waitForFunction(()=>document.querySelectorAll('.repeat-variation-grid section').length===6);
 p.once('dialog',d=>d.accept('Warm geometry'));await p.getByRole('button',{name:'Keep direction…',exact:true}).first().click();await p.waitForFunction(()=>JagoRepeatRefresh.directions().length===1);
 await p.screenshot({path:path.join(out,'explore.png')});await p.locator('.repeat-variation-dialog .close-dialog').click();await p.getByRole('button',{name:'Close pattern exploration',exact:true}).click();
 const document=await p.evaluate(()=>JagoSuite.adapter.captureDocument());await p.evaluate(data=>JagoSuite.adapter.restoreDocument(data),document);assert.equal(await p.evaluate(()=>JagoRepeatRefresh.directions()[0].name),'Warm geometry');
 await p.locator('#repeatBatchMotifs').click();await p.getByRole('button',{name:'Make arrangement editable',exact:true}).click();await p.getByRole('button',{name:'Select all',exact:true}).click();
 const original=await p.evaluate(()=>JSON.stringify(manualItems));await p.locator('[data-scale]').fill('125');await p.getByRole('button',{name:'Scale groups',exact:true}).click();
 assert.notEqual(await p.evaluate(()=>JSON.stringify(manualItems)),original);await p.getByRole('button',{name:'Close motif editor',exact:true}).click();await p.evaluate(()=>undoAction());assert.equal(await p.evaluate(()=>JSON.stringify(manualItems)),original,'group scale undo');
 const groupCheck=await p.evaluate(()=>{
  const groups=JagoRepeatRefresh.groups(),ids=new Set(groups.slice(0,3).map(g=>g.id)),outside=manualItems.filter(x=>!ids.has(x.setId||x.id)).map(x=>JSON.stringify(x));
  JagoRepeatRefresh.transform(ids,'rotate',30);const unchanged=manualItems.filter(x=>!ids.has(x.setId||x.id)).map(x=>JSON.stringify(x));
  return {unchanged:JSON.stringify(outside)===JSON.stringify(unchanged),valid:manualItems.every(x=>x.x>=0&&x.x<1&&x.y>=0&&x.y<1)};
 });assert.deepEqual(groupCheck,{unchanged:true,valid:true});
 assert.ok(await p.evaluate(()=>manualItems.every(item=>item.asset>=0&&assets[item.asset])),'freezing restored artwork retains live source references');
 const ink=await p.evaluate(()=>{const t=rasterTile(1),pixels=t.getContext('2d').getImageData(0,0,t.width,t.height).data;return pixels.some((v,i)=>i%4===0&&v>100);});assert.ok(ink,'edited pattern still contains coloured motif pixels');
 await p.locator('#repeatCheck').click();const download=Promise.all([p.waitForEvent('download'),p.getByRole('button',{name:'Save this proof PNG',exact:true}).click()]);await (await download)[0].saveAs(path.join(out,'proof.png'));await p.screenshot({path:path.join(out,'proof-ui.png')});await p.locator('#closeExport').click();
 await p.setViewportSize({width:800,height:700});await p.screenshot({path:path.join(out,'narrow.png')});assert.ok(await p.locator('#repeatExplore').isVisible());await p.setViewportSize({width:1450,height:950});
 // Real studio adapters: Wobble loop -> Repeat -> Material and World.
 const w=await browser.newPage();await w.goto(url(path.join(root,'Jago-Wobble-Studio/index.html')));await w.waitForFunction(()=>window.jagoAppReady);
 const wobble=await w.evaluate(async()=>{project=fresh(320,240);makeDemo();resizeBuffers();invalidate();updateUI();return JagoSuite.adapter.export({scope:'whole',count:4,seconds:1,fps:4,maxEdge:320,alpha:true,original:true,separate:false,progress:()=>{}});});
 await p.evaluate(data=>JagoSuite.adapter.import(data,{mode:'new',purpose:'pattern'}),wobble);
 assert.ok(await p.evaluate(()=>assets.some(a=>a.animation?.frames.length===4)),'Wobble animation preserved as repeat source');
 const repeat=await p.evaluate(async()=>{$('output').value='tile';$('cols').value=$('rows').value=2;update();return JagoSuite.adapter.export({scope:'whole',count:1,seconds:1,fps:1,maxEdge:320,alpha:true,original:true,separate:false,progress:()=>{}});});
 const material=await browser.newPage();await material.goto(url(path.join(root,'Jago-Material-Studio/index.html')));await material.waitForFunction(()=>window.JagoSuite?.adapter);await material.evaluate(data=>JagoSuite.adapter.import(data,{mode:'new',purpose:'texture'}),repeat);
 assert.ok(await material.evaluate(()=>project.layers.some(l=>l.suiteSource==='repeat')));
 const world=await browser.newPage();await world.goto(url(path.join(root,'Jago-World-Studio/index.html')));await world.waitForFunction(()=>window.appReady&&window.WorldSuiteAdapter);await world.evaluate(data=>WorldSuiteAdapter.import(data,{mode:'new',purpose:'texture',textureRole:'land',tileWidth:128}),repeat);
 assert.ok(await world.evaluate(()=>currentMap().materialSources.land&&world.assets.some(a=>a.suiteSource==='repeat')));
 await p.evaluate(()=>JagoRepeatNew.create('pattern',false));assert.equal(await p.evaluate(()=>JagoRepeatRefresh.directions().length),0,'new documents do not inherit saved directions');
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'result.json'),JSON.stringify({ok:true,checks:['cancel preserves document and playback','six comparisons and saved direction','direction survives project restore','whole-group scaling and Undo','selected-only rotation with wrapped centres','proof PNG download','narrow layout','Wobble animated source received','Repeat tile received as Material texture','Repeat tile assigned to World land texture','new document clears direction bank'],errors},null,2));console.log('Repeat refresher and cross-studio adapter checks passed.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
