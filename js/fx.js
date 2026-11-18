import * as THREE from 'three';
export class FX{constructor(scene){this.s=scene;this.p=[];this.t=[];this.geo=new THREE.SphereGeometry(.05,4,4)}
  burst(pos,color,n=8,sp=3){for(let i=0;i<n;i++){const m=new THREE.Mesh(this.geo,new THREE.MeshBasicMaterial({color}));m.position.copy(pos);this.s.add(m);this.p.push({m,v:new THREE.Vector3((Math.random()-.5)*sp,Math.random()*sp,(Math.random()-.5)*sp),life:.5})}}
  tracer(a,b){const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]),new THREE.LineBasicMaterial({color:0xffe9a0,transparent:true}));this.s.add(l);this.t.push({l,life:.08})}
  update(dt){for(const q of this.p){q.life-=dt;q.v.y-=9*dt;q.m.position.addScaledVector(q.v,dt);if(q.life<=0){this.s.remove(q.m);q.m.material.dispose()}}this.p=this.p.filter(q=>q.life>0);
    for(const q of this.t){q.life-=dt;if(q.life<=0){this.s.remove(q.l);q.l.geometry.dispose()}}this.t=this.t.filter(q=>q.life>0)}}
