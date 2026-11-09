// SPDX-License-Identifier: MIT
(function(root){
'use strict';
const wrap=(v,m)=>(v%m+m)%m,delta=(v,a,m)=>wrap(v-a+m/2,m)-m/2;
const defaults={rock:0,spin:0,breathe:0,swayX:0,swayY:0,cycles:1,phase:0,direction:1};
function validate(value){if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Choose valid group motion settings.');const o={...defaults};for(const k of Object.keys(defaults)){if(value[k]!==undefined)o[k]=value[k];if(typeof o[k]!=='number'||!Number.isFinite(o[k]))throw Error('Invalid motion '+k);}
 for(const [k,min,max]of [['rock',0,180],['spin',-4,4],['breathe',0,90],['swayX',0,2048],['swayY',0,2048],['cycles',1,8],['phase',0,1],['direction',-1,1]])if(o[k]<min||o[k]>max)throw Error('Motion '+k+' is outside its limits.');
 if(!Number.isInteger(o.cycles)||!Number.isInteger(o.spin)||![-1,1].includes(o.direction))throw Error('Use whole cycles and turns so the motion loops.');o.phase=wrap(o.phase,1);return o;
}
function apply(items,phase,w,h){if(!Number.isFinite(phase)||!Number.isFinite(w)||!Number.isFinite(h)||w<=0||h<=0)throw Error('Invalid animation frame.');const groups=new Map();for(const p of items){const key=p.setId||p.id;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(p);}const changes=new Map();
 for(const members of groups.values()){let m;try{m=validate(members[0].motion)}catch{continue;}const first=members[0],cx=first.x+members.reduce((sum,p)=>sum+delta(p.x,first.x,w),0)/members.length,cy=first.y+members.reduce((sum,p)=>sum+delta(p.y,first.y,h),0)/members.length;
 const t=wrap(phase,1)*m.cycles*m.direction+m.phase,s=Math.sin(t*Math.PI*2),c=Math.cos(t*Math.PI*2),angle=m.rock*s+m.spin*360*t,a=angle*Math.PI/180,scale=1-m.breathe/200*(1-c);
 for(const p of members){const x=delta(p.x,cx,w)*scale,y=delta(p.y,cy,h)*scale;changes.set(p,{...p,x:wrap(cx+x*Math.cos(a)-y*Math.sin(a)+m.swayX*s,w),y:wrap(cy+x*Math.sin(a)+y*Math.cos(a)+m.swayY*s,h),width:p.width*scale,height:p.height*scale,angle:p.angle+angle});}
 }
 return items.map(p=>changes.get(p)||p);
}
const api={defaults,validate,apply};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.JagoGroupMotion=api;
})(typeof globalThis!=='undefined'?globalThis:this);
