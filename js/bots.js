import * as THREE from 'three';
import {createHuman,animate,setGun} from './character.js';
import {Gun,gunMesh} from './weapons.js';
import {height,collide,solidAt} from './world.js';
import {fire} from './combat.js';
import {sfx} from './audio.js';
const D=new THREE.Vector3(),O=new THREE.Vector3();
const PICK=['pistol','smg','smg','rifle','rifle','shotgun','sniper'];
export class Bot{
  constructor(match,pos){this.m=match;const pal=[[0x4b5d3a,0x2f3a2a],[0x5a5648,0x3b3a33],[0x3d4a55,0x262e36],[0x6b5a3c,0x40351f]][Math.random()*4|0];
    const mesh=createHuman({cloth:pal[0],vest:pal[1],skin:[0xd9a67e,0xa8744f,0xf0c8a0,0x7b5338][Math.random()*4|0]});match.scene.add(mesh);
    this.a={pos,hp:100,alive:true,isPlayer:false,mesh,crouch:false,bot:this};const id=PICK[Math.random()*PICK.length|0];this.gun=new Gun(id);this.gun.res=999;setGun(mesh,gunMesh(id));
    this.goal=null;this.target=null;this.scan=Math.random();this.react=0;this.t=Math.random()*9;this.yaw=0;this.vy=0;this.strafe=Math.random()<.5?1:-1}
  los(a,b){for(let s=1;s<30;s++){const k=s/30,x=a.x+(b.x-a.x)*k,z=a.z+(b.z-a.z)*k,y=a.y+1.5+(b.y-a.y)*k;if(solidAt(x,y,z))return false}return true}
  update(dt){const a=this.a,m=this.m,z=m.zone;if(!a.alive)return;this.t+=dt;this.scan-=dt;
    if(this.scan<=0){this.scan=.5+Math.random()*.3;let best=null,bd=60;for(const o of m.actors){if(o===a||!o.alive)continue;const d=Math.hypot(o.pos.x-a.pos.x,o.pos.z-a.pos.z);if(d<bd&&this.los(a.pos,o.pos)){bd=d;best=o}}
      if(best!==this.target)this.react=.5+Math.random()*.5;this.target=best}
    const out=!z.inside(a.pos.x,a.pos.z);let gx,gz,sp=4.2;
    if(out){gx=z.c.x;gz=z.c.y;sp=6.5}
    else if(this.target){const t=this.target.pos,d=Math.hypot(t.x-a.pos.x,t.z-a.pos.z);if(d>24){gx=t.x;gz=t.z}else{const ax=t.x-a.pos.x,az=t.z-a.pos.z;gx=a.pos.x-az*this.strafe;gz=a.pos.z+ax*this.strafe;sp=3}}
    else{if(!this.goal||Math.hypot(this.goal.x-a.pos.x,this.goal.z-a.pos.z)<4){const r=Math.sqrt(Math.random())*z.r*.8,an=Math.random()*6.28;this.goal={x:z.c.x+Math.cos(an)*r,z:z.c.y+Math.sin(an)*r}}gx=this.goal.x;gz=this.goal.z}
    D.set(gx-a.pos.x,0,gz-a.pos.z);const l=D.length();let sped=0;
    if(l>1){D.divideScalar(l);const px=a.pos.x,pz=a.pos.z;a.pos.x+=D.x*sp*dt;a.pos.z+=D.z*sp*dt;collide(a.pos,.35,a.pos.y);
      if(Math.hypot(a.pos.x-px,a.pos.z-pz)<sp*dt*.3){this.goal=null;this.strafe*=-1}sped=sp;this.yaw=this.target&&!out?Math.atan2(this.target.pos.x-a.pos.x,this.target.pos.z-a.pos.z):Math.atan2(D.x,D.z)}
    const g=height(a.pos.x,a.pos.z);a.pos.y+=(g-a.pos.y)*Math.min(1,dt*12);a.mesh.position.copy(a.pos);a.mesh.rotation.y=this.yaw;animate(a.mesh,this.t,sped,false,!!this.target,dt);
    const gun=this.gun;gun.tick(dt);if(gun.mag<=0)gun.reload();this.react-=dt;
    if(this.target&&this.react<=0&&gun.canFire()){const t=this.target.pos,dist=Math.hypot(t.x-a.pos.x,t.z-a.pos.z);
      if(dist<gun.d.range*.8){gun.mag--;gun.cd=gun.d.rate*(gun.d.auto?2.2:1.3);gun.extra=.02+dist*.0016;O.set(a.pos.x,a.pos.y+1.5,a.pos.z);D.set(t.x-O.x,t.y+1.2-O.y,t.z-O.z).normalize();
        const pd=Math.hypot(m.player.actor.pos.x-a.pos.x,m.player.actor.pos.z-a.pos.z);if(pd<80)sfx('shot',gun.d.pow*Math.max(.3,1-pd/80));
        const end=fire(m,a,O.clone(),D,gun,.6);if(pd<80)m.fx.tracer(O,end)}}}
}
