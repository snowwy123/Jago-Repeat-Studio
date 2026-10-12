// SPDX-License-Identifier: MIT
(function(root){
const styles=['grid','brick','column','organic','balanced','mirror','diagonal','diamond'];
function random(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function variations(base,seed,locks={}){if(!Number.isInteger(seed)||seed<0||seed>999999)throw Error('Choose a seed between 0 and 999999.');const r=random(seed),pick=a=>a[Math.floor(r()*a.length)];return Array.from({length:6},(_,i)=>{const s={...base,mode:'pattern',seed:String((seed+i*7919)%1000000)};if(!locks.layout)s.layout=pick(styles);if(!locks.density){s.cols=String(pick([2,3,4,5,6]));s.rows=String(pick([2,3,4,5,6]))}if(!locks.density&&['brick','diamond'].includes(s.layout)&&+s.rows%2)s.rows=String(+s.rows+1);if(!locks.density&&['column','diamond'].includes(s.layout)&&+s.cols%2)s.cols=String(+s.cols+1);if(!locks.size){s.size=String(pick([45,60,75,90]));s.sizeJitter=String(pick([0,8,16,25]))}if(!locks.angle){s.rotation=String(pick([-30,-15,0,15,30]));s.rotJitter=String(pick([0,8,20,40]))}if(!locks.position)s.jitter=String(s.layout==='organic'?pick([25,40,60]):pick([0,8,20]));if(!locks.mix)s.mix=pick(['cycle','random']);return s})}
const api={styles,random,variations};if(typeof module!=='undefined')module.exports=api;root.RepeatVariation=api;
})(globalThis);
