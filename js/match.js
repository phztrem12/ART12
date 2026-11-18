import * as THREE from 'three';
import {buildWorld,loot,height,solidAt} from './world.js';
import {Player} from './player.js';
import {Bot} from './bots.js';
import {Zone} from './zone.js';
import {HUD} from './hud.js';
import {FX} from './fx.js';
import {GUNS,pickupMesh} from './weapons.js';
const IDS=['pistol','pistol','smg','smg','rifle','rifle','shotgun','sniper'];
export class Match{
  constructor(renderer,root,onExit){
    this.canvas=renderer.domElement;this.r=renderer;this.root=root;this.onExit=onExit;this.kills=0;this.over=false;this.nearPickup=null;
    const s=this.scene=new THREE.Scene();s.fog=new THREE.Fog(0xbfd3e3,140,560);
    this.cam=new THREE.PerspectiveCamera(72,innerWidth/innerHeight,.1,1500);
    const sg=new THREE.SphereGeometry(900,24,16),p=sg.attributes.position,col=[],c=new THREE.Color(),top=new THREE.Color(0x2f6fc4),hz=new THREE.Color(0xbfd3e3);
    for(let i=0;i<p.count;i++){c.copy(hz).lerp(top,Math.max(0,p.getY(i)/900)**.6);col.push(c.r,c.g,c.b)}
    sg.setAttribute('color',new THREE.Float32BufferAttribute(col,3));this.sky=new THREE.Mesh(sg,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide,fog:false}));s.add(this.sky);
    s.add(new THREE.HemisphereLight(0xcfe0ff,0x3a4a2a,1.1));
    const sun=this.sun=new THREE.DirectionalLight(0xfff1d6,2.6);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-50,right:50,top:50,bottom:-50,near:1,far:300});sun.shadow.bias=-.0004;s.add(sun,sun.target);
    buildWorld(s);this.fx=new FX(s);this.zone=new Zone(s);
    this.player=new Player(this,this.spawn());this.actors=[this.player.actor];this.bots=[];
    for(let i=0;i<49;i++){const b=new Bot(this,this.spawn());this.bots.push(b);this.actors.push(b.a)}
    this.pickups=[];const L=[...loot].sort(()=>Math.random()-.5).slice(0,120);
    for(const[x,y,z]of L){if(Math.random()<.3){const m=new THREE.Mesh(new THREE.BoxGeometry(.4,.22,.28),new THREE.MeshStandardMaterial({color:0x3f6b3a}));m.position.set(x,y,z);m.castShadow=true;s.add(m);this.pickups.push({ammo:1,name:'Munição',mesh:m})}
      else{const id=IDS[Math.random()*IDS.length|0],m=pickupMesh(id);m.position.set(x,y,z);s.add(m);this.pickups.push({id,name:GUNS[id].name,mesh:m})}}
    this.hud=new HUD(root);this.t=0;
  }
  spawn(){for(;;){const a=Math.random()*6.28,r=Math.sqrt(Math.random())*250,x=Math.cos(a)*r,z=Math.sin(a)*r,y=height(x,z);if(y<9&&!solidAt(x,y+1,z)&&!solidAt(x,y+.3,z))return new THREE.Vector3(x,y,z)}}
  get aliveCount(){return this.actors.filter(a=>a.alive).length}
  impact(p,hit){this.fx.burst(p,hit?0xaa2222:0xc8c090,hit?6:3)}
  damage(a,amt,by,head){if(!a.alive||this.over&&a.isPlayer)return;a.hp-=amt;if(by?.isPlayer)this.hud.hit();if(a.hp<=0)this.kill(a,by)}
  kill(a,by){a.alive=false;a.mesh.rotation.x=-Math.PI/2;a.mesh.position.y+=.25;if(by?.isPlayer)this.kills++;
    if(a.isPlayer)this.end(false);else if(this.aliveCount===1&&this.player.actor.alive)this.end(true)}
  pickup(){const n=this.nearPickup;if(!n)return;const p=this.player;if(n.ammo)p.guns.forEach(g=>g&&(g.res+=g.d.mag));else p.giveGun(n.id);this.scene.remove(n.mesh);this.pickups=this.pickups.filter(q=>q!==n);this.nearPickup=null}
  end(win){this.over=true;document.exitPointerLock();const e=document.createElement('div');e.className='end';
    e.innerHTML=`<h1>${win?'VITÓRIA':'ELIMINADO'}</h1><div style="font-size:28px">Posição #${win?1:this.aliveCount+1} de 50 &nbsp;|&nbsp; Eliminações: ${this.kills}</div><button id="back">Voltar ao lobby</button>`;this.root.appendChild(e);document.getElementById('back').onclick=()=>this.onExit()}
  update(dt){dt=Math.min(dt,.05);this.t+=dt;this.zone.update(dt);
    for(const a of this.actors)if(a.alive&&!this.zone.inside(a.pos.x,a.pos.z))this.damage(a,this.zone.dps*dt,null);
    if(!this.over)this.player.update(dt,this.cam);else if(this.player.actor.alive)this.player.update(dt,this.cam);
    for(const b of this.bots)b.update(dt);this.fx.update(dt);
    const pp=this.player.actor.pos;this.nearPickup=null;let bd=2.6;
    for(const q of this.pickups){q.mesh.rotation.y+=dt*1.5;const d=Math.hypot(q.mesh.position.x-pp.x,q.mesh.position.z-pp.z);if(d<bd){bd=d;this.nearPickup=q}}
    this.sun.position.set(pp.x+80,pp.y+120,pp.z+50);this.sun.target.position.copy(pp);this.sky.position.copy(this.cam.position);this.hud.update(this)}
  render(){this.r.render(this.scene,this.cam)}
  dispose(){for(const[el,t,f]of this.listeners)el.removeEventListener(t,f);document.exitPointerLock()}
}