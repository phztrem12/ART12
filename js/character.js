import * as THREE from 'three';
const M=(c)=>new THREE.MeshStandardMaterial({color:c,roughness:.85});
export function createHuman(o={}){
  const g=new THREE.Group(),cloth=M(o.cloth??0x4b5d3a),skin=M(o.skin??0xd9a67e),vest=M(o.vest??0x2f3a2a),dark=M(0x1d211c);
  const add=(geo,mat,x,y,z,p=g)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;p.add(m);return m};
  const body=new THREE.Group();g.add(body);
  add(new THREE.CapsuleGeometry(.22,.38,4,10),cloth,0,1.25,0,body);
  add(new THREE.BoxGeometry(.5,.46,.32),vest,0,1.3,0,body);
  add(new THREE.BoxGeometry(.4,.1,.34),dark,0,1.05,0,body);
  add(new THREE.BoxGeometry(.34,.46,.18),dark,0,1.3,-.26,body);
  add(new THREE.SphereGeometry(.15,14,10),skin,0,1.74,0,body);
  add(new THREE.SphereGeometry(.18,14,8,0,Math.PI*2,0,Math.PI/2),cloth,0,1.76,0,body);
  const limb=(x,y,len,r,mat)=>{const p=new THREE.Group();p.position.set(x,y,0);add(new THREE.CapsuleGeometry(r,len,4,8),mat,0,-len/2-r*.5,0,p);g.add(p);return p};
  const armL=limb(-.33,1.5,.45,.07,cloth),armR=limb(.33,1.5,.45,.07,cloth);
  const legL=limb(-.12,.92,.5,.095,cloth),legR=limb(.12,.92,.5,.095,cloth);
  add(new THREE.BoxGeometry(.14,.1,.26),dark,0,-.7,.04,legL);add(new THREE.BoxGeometry(.14,.1,.26),dark,0,-.7,.04,legR);
  const hand=new THREE.Group();hand.position.set(0,-.55,.05);armR.add(hand);
  g.userData={armL,armR,legL,legR,body,hand,gun:null};return g;
}
export function setGun(h,mesh){const u=h.userData;if(u.gun)u.hand.remove(u.gun);u.gun=mesh;if(mesh)u.hand.add(mesh)}
export function animate(h,t,speed,crouch,aiming){
  const u=h.userData,s=Math.sin(t*(6+speed*.9))*Math.min(speed/4,1.2);
  u.legL.rotation.x=s;u.legR.rotation.x=-s;u.armL.rotation.x=-s*.6;
  u.armR.rotation.x=aiming?-1.45:(u.gun?-.9+s*.1:s*.6);if(aiming)u.armL.rotation.x=-1.3;
  u.body.position.y=(crouch?-.3:0)+Math.sin(t*2)*.008;u.body.scale.y=1+Math.sin(t*1.6)*.01;
  u.legL.rotation.x*=crouch?.4:1;
}
