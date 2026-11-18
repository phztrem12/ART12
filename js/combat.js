import * as THREE from 'three';
import {solidAt,height} from './world.js';
const t=new THREE.Vector3(),P=new THREE.Vector3();
export function fire(ctx,shooter,o,dir,gun,mul=1){
  const d=gun.d,spread=d.spread+(gun.extra||0);let end=o.clone();
  const cand=ctx.actors.filter(a=>{if(a===shooter||!a.alive)return false;t.set(a.pos.x-o.x,a.pos.y+1-o.y,a.pos.z-o.z);const k=t.dot(dir);return k>0&&k<d.range+2&&t.lengthSq()-k*k<9});
  for(let i=0;i<d.pel;i++){
    t.set(dir.x+(Math.random()-.5)*spread*2,dir.y+(Math.random()-.5)*spread*2,dir.z+(Math.random()-.5)*spread*2).normalize();
    let hit=null;
    for(let s=1;s<d.range/.4;s++){P.copy(o).addScaledVector(t,s*.4);
      if(P.y<height(P.x,P.z)||solidAt(P.x,P.y,P.z))break;
      hit=cand.find(a=>Math.abs(a.pos.x-P.x)<.42&&Math.abs(a.pos.z-P.z)<.42&&P.y>a.pos.y&&P.y<a.pos.y+(a.crouch?1.4:1.85));
      if(hit){const head=P.y>hit.pos.y+(hit.crouch?1.15:1.55);ctx.damage(hit,d.dmg*mul*(head?2:1),shooter,head);break}}
    end=P.clone();ctx.impact(P.clone(),!!hit);
  }
  return end;
}
