import {TOWNS} from './world.js';
export class HUD{
  constructor(root){root.innerHTML=`<div id="hud"><div class="top"><span id="alive"></span> vivos &nbsp;|&nbsp; <span id="zt"></span></div>
  <canvas id="mm" width="170" height="170"></canvas><div class="xh" id="xh"></div><div class="tip" id="tip"></div>
  <div class="hp"><div id="hpt">100</div><div class="bar"><i id="hpb"></i></div></div><div class="ammo"><small id="wn"></small><span id="am">--</span></div></div>`;
    this.$=id=>document.getElementById(id);this.g=this.$('mm').getContext('2d')}
  hit(){const x=this.$('xh');x.classList.add('hit');setTimeout(()=>x.classList.remove('hit'),90)}
  update(m){const p=m.player,g=p.gun,$=this.$;
    $('alive').textContent=m.aliveCount;$('zt').textContent=`Zona ${m.zone.phase}: ${m.zone.shrinking?'fechando':'fecha em'} ${Math.ceil(m.zone.timeLeft)}s`+(m.zone.inside(p.actor.pos.x,p.actor.pos.z)?'':'  (fora da zona!)');
    $('hpb').style.width=Math.max(0,p.actor.hp)+'%';$('hpt').textContent=Math.ceil(Math.max(0,p.actor.hp));
    $('wn').textContent=g?g.d.name+(g.rl>0?' (recarregando)':''):'Desarmado';$('am').textContent=g?`${g.mag} / ${g.res}`:'--';
    $('tip').textContent=m.nearPickup?`E: pegar ${m.nearPickup.name}`:'';
    const c=this.g,k=85/330;c.clearRect(0,0,170,170);c.save();c.beginPath();c.arc(85,85,84,0,7);c.clip();
    c.fillStyle='#1d3a25';c.fillRect(0,0,170,170);c.fillStyle='#caa';for(const[x,z]of TOWNS)c.fillRect(85+x*k-3,85+z*k-3,6,6);
    c.strokeStyle='#fff';c.lineWidth=1.5;c.beginPath();c.arc(85+m.zone.c.x*k,85+m.zone.c.y*k,m.zone.r*k,0,7);c.stroke();
    c.translate(85+p.actor.pos.x*k,85+p.actor.pos.z*k);c.rotate(-p.yaw);c.fillStyle='#e8b931';c.beginPath();c.moveTo(0,-6);c.lineTo(4,5);c.lineTo(-4,5);c.fill();c.restore()}
}
