import * as THREE from 'three';
import {createHuman,animate,setGun} from './character.js';
import {Gun,gunMesh} from './weapons.js';
import {height,collide} from './world.js';
import {fire} from './combat.js';
import {state} from './state.js';
import {sfx} from './audio.js';
const F=new THREE.Vector3(),C=new THREE.Vector3();
export class Player{
  constructor(match,pos){this.m=match;this.yaw=0;this.pitch=0;this.vy=0;this.keys={};this.guns=[null,null,null];this.cur=0;this.fireHeld=false;this.click=false;this.aim=false;this.t=0;this.speed=0;
    const mesh=createHuman(state);match.scene.add(mesh);
    this.actor={pos,hp:100,alive:true,isPlayer:true,mesh,crouch:false};this.giveGun(state.start);this.giveGun(state.start);this.bind()}
  get gun(){return this.guns[this.cur]}
  giveGun(id){const have=this.guns.find(g=>g&&g.id===id);if(have){have.res+=have.d.mag;return}
    let i=this.guns.findIndex(g=>!g);if(i<0)i=this.cur;this.guns[i]=new Gun(id);this.equip(i)}
  equip(i){if(!this.guns[i])return;this.cur=i;setGun(this.actor.mesh,gunMesh(this.gun.id))}
  bind(){const L=this.m.listeners=[];const on=(t,f,el=document)=>{el.addEventListener(t,f);L.push([el,t,f])};
    on('keydown',e=>{this.keys[e.code]=true;if(e.code==='KeyR')this.gun?.reload();if(e.code==='KeyE')this.m.pickup();if(e.code.startsWith('Digit'))this.equip(+e.code[5]-1)});
    on('keyup',e=>this.keys[e.code]=false);
    on('mousemove',e=>{if(document.pointerLockElement){this.yaw-=e.movementX*.0022*state.sens;this.pitch=Math.max(-1.2,Math.min(1.2,this.pitch-e.movementY*.0022*state.sens))}});
    on('mousedown',e=>{if(!document.pointerLockElement){this.m.canvas.requestPointerLock();return}if(e.button===0){this.fireHeld=this.click=true}if(e.button===2)this.aim=true});
    on('mouseup',e=>{if(e.button===0)this.fireHeld=false;if(e.button===2)this.aim=false});on('contextmenu',e=>e.preventDefault())}
  update(dt,cam){const a=this.actor,k=this.keys;if(!a.alive)return;this.t+=dt;a.crouch=!!(k.ControlLeft||k.KeyC);const run=k.ShiftLeft&&!a.crouch&&!this.aim;
    const sp=(a.crouch?2.2:run?7.8:4.6)*(this.aim?.65:1),fw=(k.KeyW?1:0)-(k.KeyS?1:0),rt=(k.KeyD?1:0)-(k.KeyA?1:0);
    const sy=Math.sin(this.yaw),cy=Math.cos(this.yaw);let mx=-sy*fw+cy*rt,mz=-cy*fw-sy*rt;const l=Math.hypot(mx,mz);if(l>0){mx/=l;mz/=l}
    a.pos.x+=mx*sp*dt;a.pos.z+=mz*sp*dt;this.speed=l>0?sp:0;const g=height(a.pos.x,a.pos.z);this.vy-=22*dt;if(k.Space&&a.pos.y<=g+.05&&!a.crouch)this.vy=7.2;
    a.pos.y+=this.vy*dt;collide(a.pos,.35,a.pos.y);if(a.pos.y<=g){a.pos.y=g;this.vy=0}
    const R=395,r=Math.hypot(a.pos.x,a.pos.z);if(r>R){a.pos.x*=R/r;a.pos.z*=R/r}
    a.mesh.position.copy(a.pos);a.mesh.rotation.y=this.yaw+Math.PI;animate(a.mesh,this.t,this.speed,a.crouch,this.aim&&!!this.gun,dt);
    const gun=this.gun;if(gun){gun.tick(dt);gun.extra=(this.aim?0:.012)+(this.speed>0?.01:0);if(gun.mag<=0)gun.reload();if(gun.canFire()&&document.pointerLockElement&&(gun.d.auto?this.fireHeld:this.click))this.shoot(cam)}this.click=false;
    const d=this.aim?1.9:3.6,cp=Math.cos(this.pitch),sh=this.aim?.55:.7,eye=a.crouch?1.2:1.65;
    C.set(a.pos.x+cy*sh+sy*cp*d,a.pos.y+eye-Math.sin(this.pitch)*d+.25,a.pos.z-sy*sh+cy*cp*d);const gh=height(C.x,C.z)+.4;if(C.y<gh)C.y=gh;cam.position.lerp(C,Math.min(1,dt*25));
    F.set(-sy*cp,Math.sin(this.pitch),-cy*cp);cam.lookAt(cam.position.x+F.x,cam.position.y+F.y,cam.position.z+F.z);
    const fov=this.aim&&gun?.d.zoom?gun.d.zoom:this.aim?55:72;cam.fov+=(fov-cam.fov)*Math.min(1,dt*12);cam.updateProjectionMatrix()}
  shoot(cam){const g=this.gun;g.mag--;g.cd=g.d.rate;sfx('shot',g.d.pow);this.pitch+=.006*g.d.pow;this.yaw+=(Math.random()-.5)*.003;cam.getWorldDirection(F);const o=cam.position.clone().addScaledVector(F,2.5),end=fire(this.m,this.actor,o,F,g);
    const mz=new THREE.Vector3();this.actor.mesh.userData.hand.getWorldPosition(mz);mz.y+=.1;this.m.fx.tracer(mz,end);this.m.fx.burst(mz,0xffc060,4,2)}
}