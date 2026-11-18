import * as THREE from 'three';
import {createHuman,animate,setGun} from './character.js';
import {GUNS,gunMesh} from './weapons.js';
import {state,save} from './state.js';
const SW=[0x4b5d3a,0x5a5648,0x3d4a55,0x6b5a3c,0x2b2b2e,0x7a2f2a],SK=[0xf0c8a0,0xd9a67e,0xa8744f,0x7b5338];
const hex=n=>'#'+n.toString(16).padStart(6,'0');
export class Lobby{
  constructor(renderer,root,onPlay){this.r=renderer;this.root=root;this.t=0;this.rot=0;this.drag=false;
    const s=this.scene=new THREE.Scene();s.background=new THREE.Color(0x15231d);s.fog=new THREE.Fog(0x15231d,9,30);
    this.cam=new THREE.PerspectiveCamera(36,innerWidth/innerHeight,.1,100);this.cam.position.set(1.2,1.5,5.4);this.cam.lookAt(.5,1.05,0);
    s.add(new THREE.HemisphereLight(0xaac4d8,0x1a241a,.9));
    const key=new THREE.DirectionalLight(0xffe2b0,3);key.position.set(3,5,4);key.castShadow=true;key.shadow.mapSize.set(1024,1024);s.add(key);
    const rim=new THREE.DirectionalLight(0x6fa8ff,2.4);rim.position.set(-4,3,-5);s.add(rim);
    const fl=new THREE.Mesh(new THREE.CircleGeometry(14,48),new THREE.MeshStandardMaterial({color:0x26362a,roughness:1}));fl.rotation.x=-Math.PI/2;fl.receiveShadow=true;s.add(fl);
    const ring=new THREE.Mesh(new THREE.RingGeometry(1.5,1.58,48),new THREE.MeshBasicMaterial({color:0xe8b931}));ring.rotation.x=-Math.PI/2;ring.position.set(0,.01,0);s.add(ring);
    const tm=new THREE.MeshStandardMaterial({color:0x2b4a2a,roughness:1,flatShading:true}),rk=new THREE.MeshStandardMaterial({color:0x5b5f5c,flatShading:true});
    for(let i=0;i<46;i++){const a=Math.PI*(.15+Math.random()*1.7)+Math.PI/2,r=7+Math.random()*7,m=new THREE.Mesh(i%5?new THREE.ConeGeometry(1.2,4+Math.random()*3,6):new THREE.DodecahedronGeometry(1.3),i%5?tm:rk);m.position.set(Math.cos(a)*r,i%5?2.4:.6,Math.sin(a)*r-3);m.castShadow=true;s.add(m)}
    this.build();this.ui(onPlay);this.cv=renderer.domElement;
    this.L=[['mousedown',e=>{this.drag=true;this.lx=e.clientX}],['mouseup',()=>this.drag=false],['mousemove',e=>{if(this.drag){this.rot+=(e.clientX-this.lx)*.012;this.lx=e.clientX}}]];
    this.L.forEach(([t,f])=>(t==='mousedown'?this.cv:window).addEventListener(t,f));}
  build(){if(this.h)this.scene.remove(this.h);this.h=createHuman(state);setGun(this.h,gunMesh(state.start));this.h.position.set(.5,0,0);this.scene.add(this.h)}
  ui(onPlay){const r=this.root;r.innerHTML=`<div class="logo">ART12<small>BATTLE ROYALE</small></div><div class="prof" id="prof"></div>
  <div class="menu"><button data-p="cust">Personalizar</button><button data-p="char">Personagens</button><button data-p="guns">Armas</button><button data-p="inv">Inventário</button><button data-p="cfg">Configurações</button></div>
  <button class="play" id="play">JOGAR</button>`;this.prof();document.getElementById('play').onclick=onPlay;
    r.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>this.panel(b.dataset.p))}
  prof(){document.getElementById('prof').innerHTML=`${state.name}<br><b>Nível ${state.level}</b>`}
  panel(k){this.root.querySelector('.panel')?.remove();const p=document.createElement('div');p.className='panel';
    const sw=(arr,key)=>arr.map(c=>`<button class="sw" data-k="${key}" data-v="${c}" style="background:${hex(c)}" aria-label="cor"></button>`).join('');
    const T={cust:`<h2>Personalizar</h2><p>Roupa</p><div class="row">${sw(SW,'cloth')}</div><p>Colete</p><div class="row">${sw(SW,'vest')}</div><p>Pele</p><div class="row">${sw(SK,'skin')}</div>`,
      char:`<h2>Personagens</h2><div class="row"><button data-set='{"cloth":${SW[0]},"vest":${0x2f3a2a},"skin":${SK[1]}}'>Recruta</button><button data-set='{"cloth":${SW[3]},"vest":${0x40351f},"skin":${SK[2]}}'>Deserto</button><button data-set='{"cloth":${SW[2]},"vest":${0x262e36},"skin":${SK[0]}}'>Urbano</button><button data-set='{"cloth":${SW[4]},"vest":${0x111111},"skin":${SK[3]}}'>Noturno</button></div>`,
      guns:`<h2>Armas</h2>`+Object.values(GUNS).map(g=>`<p><b style="color:#eef2e6">${g.name}</b> — dano ${g.dmg}${g.pel>1?' x'+g.pel:''}, pente ${g.mag}, alcance ${g.range} m</p>`).join(''),
      inv:`<h2>Inventário</h2><p>Arma inicial da partida</p><div class="row">${Object.entries(GUNS).map(([id,g])=>`<button data-g="${id}" ${state.start===id?'style="border-left-color:#e8b931"':''}>${g.name}</button>`).join('')}</div>`,
      cfg:`<h2>Configurações</h2><p>Nome</p><input id="nm" maxlength="14" value="${state.name}" style="font:inherit;font-size:20px;width:100%;padding:6px"><p>Sensibilidade do mouse</p><input id="se" type="range" min=".3" max="2.5" step=".1" value="${state.sens}"><p>Volume</p><input id="vo" type="range" min="0" max="1" step=".05" value="${state.vol}"><p>WASD mover, Shift correr, Espaço pular, Ctrl agachar, botão direito mirar, botão esquerdo atirar, R recarregar, E pegar, 1-3 trocar arma.</p>`}[k];
    p.innerHTML=T;this.root.appendChild(p);
    p.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{state[b.dataset.k]=+b.dataset.v;save();this.build()});
    p.querySelectorAll('[data-set]').forEach(b=>b.onclick=()=>{Object.assign(state,JSON.parse(b.dataset.set));save();this.build()});
    p.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{state.start=b.dataset.g;save();this.build();this.panel('inv')});
    const g=id=>p.querySelector(id);if(g('#nm'))g('#nm').oninput=e=>{state.name=e.target.value||'Jogador';save();this.prof()};
    if(g('#se'))g('#se').oninput=e=>{state.sens=+e.target.value;save()};if(g('#vo'))g('#vo').oninput=e=>{state.vol=+e.target.value;save()}}
  update(dt){this.t+=dt;if(!this.drag)this.rot+=(Math.sin(this.t*.4)*.3-this.rot)*dt*.5;this.h.rotation.y=this.rot;animate(this.h,this.t,0,false,false)}
  render(){this.r.render(this.scene,this.cam)}
  dispose(){this.L.forEach(([t,f])=>(t==='mousedown'?this.cv:window).removeEventListener(t,f))}
}
