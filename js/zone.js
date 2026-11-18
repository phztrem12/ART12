import * as THREE from 'three';
const PH=[{w:45,s:30,r:200},{w:35,s:25,r:120},{w:30,s:25,r:60},{w:25,s:20,r:25},{w:20,s:15,r:4}];
export class Zone{
  constructor(scene){this.i=0;this.t=0;this.c=new THREE.Vector2();this.r=330;this.c0=this.c.clone();this.r0=330;this.plan();
    this.mesh=new THREE.Mesh(new THREE.CylinderGeometry(1,1,160,64,1,true),new THREE.MeshBasicMaterial({color:0x2f7bff,transparent:true,opacity:.22,side:2,depthWrite:false,fog:false}));this.mesh.position.y=40;scene.add(this.mesh)}
  plan(){const p=PH[this.i];if(!p)return;this.r1=p.r;const a=Math.random()*6.28,d=Math.random()*(this.r0-p.r);this.c1=new THREE.Vector2(this.c0.x+Math.cos(a)*d,this.c0.y+Math.sin(a)*d)}
  get phase(){return this.i+1}get shrinking(){const p=PH[this.i];return p&&this.t>p.w}
  get timeLeft(){const p=PH[this.i];return p?Math.max(0,(this.shrinking?p.w+p.s:p.w)-this.t):0}
  get dps(){return 1+this.i*1.6}
  inside(x,z){return Math.hypot(x-this.c.x,z-this.c.y)<this.r}
  update(dt){const p=PH[this.i];if(p){this.t+=dt;if(this.t>p.w+p.s){this.c.copy(this.c1);this.r=this.r1;this.c0.copy(this.c);this.r0=this.r;this.i++;this.t=0;this.plan()}
    else if(this.t>p.w){const k=(this.t-p.w)/p.s;this.c.lerpVectors(this.c0,this.c1,k);this.r=this.r0+(this.r1-this.r0)*k}}
    this.mesh.position.set(this.c.x,40,this.c.y);this.mesh.scale.set(this.r,1,this.r)}
}