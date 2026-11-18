import * as THREE from 'three';
export const GUNS={
  pistol:{name:'Pistola',dmg:22,rate:.3,mag:12,rel:1.4,spread:.012,range:90,pel:1,auto:false,len:.25,pow:.7},
  smg:{name:'Submetralhadora',dmg:13,rate:.075,mag:30,rel:1.8,spread:.035,range:70,pel:1,auto:true,len:.4,pow:.8},
  rifle:{name:'Fuzil de assalto',dmg:25,rate:.1,mag:30,rel:2.1,spread:.016,range:160,pel:1,auto:true,len:.75,pow:1.2},
  sniper:{name:'Sniper',dmg:95,rate:1.4,mag:5,rel:3,spread:.001,range:320,pel:1,auto:false,len:1.1,pow:1.6,zoom:25},
  shotgun:{name:'Espingarda',dmg:11,rate:.85,mag:6,rel:2.4,spread:.08,range:35,pel:8,auto:false,len:.7,pow:1.5}
};
const mat=new THREE.MeshStandardMaterial({color:0x1b1d1f,metalness:.6,roughness:.4});
export function gunMesh(id){const g=GUNS[id],m=new THREE.Group(),add=(w,h,l,y,z)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,l),mat);b.position.set(0,y,z);b.castShadow=true;m.add(b)};
  add(.06,.1,g.len,0,g.len/2);add(.05,.14,.07,-.1,.05);if(id!=='pistol')add(.05,.1,.25,-.02,-.12);if(id==='sniper')add(.05,.05,.3,.08,.4);m.rotation.x=1.45-0;return m}
export class Gun{constructor(id){this.id=id;this.d=GUNS[id];this.mag=this.d.mag;this.res=this.d.mag*2;this.cd=0;this.rl=0}
  reload(){if(this.rl>0||this.mag===this.d.mag||this.res<=0)return;this.rl=this.d.rel}
  tick(dt){this.cd-=dt;if(this.rl>0){this.rl-=dt;if(this.rl<=0){const n=Math.min(this.d.mag-this.mag,this.res);this.mag+=n;this.res-=n}}}
  canFire(){return this.cd<=0&&this.rl<=0&&this.mag>0}}
export const pickupMesh=id=>{const g=gunMesh(id);g.rotation.set(0,0,0);g.scale.setScalar(1.6);const w=new THREE.Group();w.add(g);const r=new THREE.Mesh(new THREE.RingGeometry(.5,.62,24),new THREE.MeshBasicMaterial({color:0xe8b931,side:2,transparent:true,opacity:.7}));r.rotation.x=-Math.PI/2;w.add(r);return w};
