import * as THREE from 'three';
import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import {clone} from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/utils/SkeletonUtils.js';

// Personagem humano rigado com animações Idle/Walk/Run. O fallback só aparece
// enquanto o modelo GLB carrega; todos os clones compartilham geometria e materiais.
const MODEL='https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/Soldier.glb';
const loader=new GLTFLoader();
let source=null,clips=[];
const waiting=new Set();
loader.load(MODEL,g=>{
  source=g.scene;clips=g.animations||[];
  for(const root of [...waiting])install(root);
},undefined,err=>console.warn('ART12: falha ao carregar soldado 3D',err));
const M=(c,rough=.85,metal=0)=>new THREE.MeshStandardMaterial({color:c,roughness:rough,metalness:metal});
function fallback(o){
  const cloth=M(o.cloth??0x4b5d3a),skin=M(o.skin??0xd9a67e),vest=M(o.vest??0x2f3a2a),dark=M(0x1d211c);
  const add=(geo,mat,x,y,z,p)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;p.add(m);return m};
  const body=new THREE.Group();o.root.add(body);
  add(new THREE.CapsuleGeometry(.22,.38,4,10),cloth,0,1.25,0,body);
  add(new THREE.BoxGeometry(.5,.46,.32),vest,0,1.3,0,body);
  add(new THREE.SphereGeometry(.15,14,10),skin,0,1.74,0,body);
  const limb=(x,y,len,r)=>{const p=new THREE.Group();p.position.set(x,y,0);add(new THREE.CapsuleGeometry(r,len,4,8),cloth,0,-len/2-r*.5,0,p);o.root.add(p);return p};
  o.armL=limb(-.33,1.5,.45,.07);o.armR=limb(.33,1.5,.45,.07);o.legL=limb(-.12,.92,.5,.095);o.legR=limb(.12,.92,.5,.095);
  const hand=new THREE.Group();hand.position.set(0,-.55,.05);o.armR.add(hand);o.hand=hand;o.body=body;
}
function install(root){
  if(!source||root.userData.realModel)return;
  const model=clone(source);model.scale.setScalar(1);model.position.set(0,0,0);
  const appearance=root.userData.appearance||{},materials=new Map();
  model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;
    const tint=(m)=>{if(!materials.has(m)){const n=m.clone(),name=(m.name+' '+o.name).toLowerCase();
      if(/uniform|cloth|shirt|pants|jacket|body/.test(name)&&appearance.cloth)n.color.lerp(new THREE.Color(appearance.cloth),.22);
      if(/vest|armor|gear|pack|helmet/.test(name)&&appearance.vest)n.color.lerp(new THREE.Color(appearance.vest),.2);
      if(/skin|face/.test(name)&&appearance.skin)n.color.lerp(new THREE.Color(appearance.skin),.15);
      n.roughness=Math.max(.55,n.roughness??.8);materials.set(m,n)}return materials.get(m)};
    o.material=Array.isArray(o.material)?o.material.map(tint):tint(o.material);
  }});
  root.add(model);root.userData.realModel=model;
  root.userData.mixer=new THREE.AnimationMixer(model);
  const find=(...names)=>clips.find(c=>names.some(n=>c.name.toLowerCase().includes(n.toLowerCase())));
  root.userData.actions={idle:find('idle'),walk:find('walk'),run:find('run')||find('walk')};
  const idle=root.userData.actions.idle||clips[0];if(idle){root.userData.current='idle';root.userData.mixer.clipAction(idle).play()}
  root.userData.hand=model.getObjectByName('mixamorigRightHand')||model.getObjectByName('RightHand')||model;
  root.userData.fallback.visible=false;
  if(root.userData.pendingGun)setGun(root,root.userData.pendingGun);
}
export function createHuman(o={}){
  const g=new THREE.Group();g.userData={mixer:null,actions:{},current:null,pendingGun:null,appearance:o};
  const fb=new THREE.Group();g.add(fb);g.userData.fallback=fb;fallback({...o,root:fb});
  if(source)install(g);else waiting.add(g);return g;
}
export function setGun(h,mesh){
  const u=h.userData;if(u.gun&&u.hand)u.hand.remove(u.gun);
  u.gun=mesh;u.pendingGun=mesh;
  if(mesh&&u.hand){u.hand.add(mesh);mesh.position.set(0,0,0);mesh.rotation.set(0,Math.PI/2,0);mesh.scale.setScalar(.8)}
}
export function animate(h,t,speed,crouch,aiming,dt=1/60){
  const u=h.userData;
  if(u.mixer){
    const target=speed>5?'run':speed>.2?'walk':'idle';
    const clip=u.actions[target]||u.actions.idle;
    if(clip&&u.current!==target){const next=u.mixer.clipAction(clip);next.reset().fadeIn(.2).play();if(u.actions[u.current])u.mixer.clipAction(u.actions[u.current]).fadeOut(.2);u.current=target}
    u.mixer.update(Math.min(dt,.05));
    if(crouch)u.realModel?.scale.set(1,.88,1);else u.realModel?.scale.set(1,1,1);
  }else{
    const s=Math.sin(t*(6+speed*.9))*Math.min(speed/4,1.2);
    u.legL.rotation.x=s;u.legR.rotation.x=-s;u.armL.rotation.x=aiming?-1.3:-s*.6;
    u.armR.rotation.x=aiming?-1.45:(u.gun?-.9+s*.1:s*.6);
    u.body.position.y=(crouch?-.3:0)+Math.sin(t*2)*.008;
  }
}
