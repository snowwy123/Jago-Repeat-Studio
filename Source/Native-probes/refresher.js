(async()=>{const checks=[],ok=(name,value)=>{if(!value)throw Error(name);checks.push(name);};try{
 await window.initialAssetLoad;if(!window.JagoRepeatRefresh)throw Error('Refresher missing');
 const c=canvas(120,90),g=c.getContext('2d');g.fillStyle='#df6851';g.beginPath();g.arc(60,45,30,0,Math.PI*2);g.fill();assets=[];await loadAsset(c.toDataURL(),'Native circle');$('tw').value=$('th').value=256;$('layout').value='grid';$('cols').value=$('rows').value=3;update();flushHistory();
 const signature=liveSignature(),animation=$('animate').checked;const d=await JagoRepeatVariations.compare();ok('Six non-destructive native comparisons',d.querySelectorAll('.repeat-variation-grid section').length===6);d.querySelector('.close-dialog').click();ok('Cancel restores settings and playback',signature===liveSignature()&&animation===$('animate').checked);
 const document=await JagoSuite.adapter.captureDocument();await JagoSuite.adapter.restoreDocument(document);freeze();ok('Restored sources remain attached to editable motifs',manualItems.every(p=>p.asset>=0));flushHistory();
 const groups=JagoRepeatRefresh.groups(),ids=new Set(groups.slice(0,2).map(g=>g.id)),before=JSON.stringify(manualItems);JagoRepeatRefresh.transform(ids,'scale',120);ok('Native group transform changes artwork geometry',JSON.stringify(manualItems)!==before);undoAction();ok('Undo restores motif geometry',JSON.stringify(manualItems)===before);
 const t=rasterTile(1),pixels=t.getContext('2d').getImageData(0,0,t.width,t.height).data;ok('Rendered pattern retains coloured artwork',pixels.some((v,i)=>i%4===0&&v>120));
 const pack=await JagoSuite.adapter.export({scope:'whole',count:1,seconds:1,fps:1,maxEdge:256,alpha:true,original:true,separate:false,progress:()=>{}});JagoSuite.validate(pack);ok('Native tile transfer includes editable original',!!pack.original&&pack.layers[0].frames.length===1);
 window.suiteTestResult={ok:true,checks};
}catch(e){window.suiteTestResult={ok:false,error:e.stack,checks};}})();
