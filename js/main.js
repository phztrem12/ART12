import * as THREE from 'three';
import {Lobby} from './lobby.js';
import {Match} from './match.js';
const canvas=document.getElementById('c'),ui=document.getElementById('ui');
const r=new THREE.WebGLRenderer({canvas,antialias:true});r.setPixelRatio(Math.min(devicePixelRatio,1.5));r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;r.toneMapping=THREE.ACESFilmicToneMapping;
let cur,W=0,H=0;
function lobby(){cur?.dispose();ui.innerHTML='';cur=new Lobby(r,ui,play)}
function play(){cur.dispose();ui.innerHTML='';canvas.requestPointerLock();setTimeout(()=>{cur=new Match(r,ui,lobby)},0)}
let last=performance.now();
(function loop(now){requestAnimationFrame(loop);const dt=(now-last)/1000;last=now;
  if(innerWidth!==W||innerHeight!==H){W=innerWidth;H=innerHeight;r.setSize(W,H);if(cur)cur.cam.aspect=W/H,cur.cam.updateProjectionMatrix()}
  if(cur){cur.cam.aspect=W/H;cur.update(dt);cur.render()}})(last);
lobby();
