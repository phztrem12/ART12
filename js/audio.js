import {state} from './state.js';
let ctx;
export function sfx(kind='shot',pow=1){
  ctx??=new AudioContext();const t=ctx.currentTime,len=.05+.12*pow,n=ctx.sampleRate*len;
  const b=ctx.createBuffer(1,n,ctx.sampleRate),a=b.getChannelData(0);
  for(let i=0;i<n;i++)a[i]=(Math.random()*2-1)*Math.pow(1-i/n,kind==='shot'?3:6);
  const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();
  f.frequency.value=kind==='shot'?1200/pow:3000;g.gain.value=state.vol*(kind==='shot'?.6:.25);
  s.buffer=b;s.connect(f).connect(g).connect(ctx.destination);s.start(t);
}
