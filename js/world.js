import * as THREE from 'three';
export const R=400,TOWNS=[[90,80],[-110,60],[40,-120],[-60,-90],[0,0]];
const rnd=(a,b)=>a+Math.random()*(b-a);
export const boxes=[],grid=new Map(),loot=[];
const key=(x,z)=>Math.floor(x/16)+','+Math.floor(z/16);
function addBox(b){boxes.push(b);for(let x=b.x0;x<=b.x1+16;x+=16)for(let z=b.z0;z<=b.z1+16;z+=16){const k=key(x,z);(grid.get(k)??grid.set(k,[]).get(k)).push(b)}}
export function height(x,z){
  let h=Math.sin(x*.013)*Math.cos(z*.011)*4+Math.sin(x*.04+z*.03)*1.2;
  const r=Math.hypot(x,z);h+=Math.max(0,r-250)**1.5*.035;
  for(const[tx,tz]of TOWNS){const d=Math.hypot(x-tx,z-tz);if(d<45)h=h*Math.min(1,Math.max(0,(d-28)/17))}
  return h;
}
export function collide(p,rad,y){for(const b of grid.get(key(p.x,p.z))??[]){if(y>b.top||y+1.7<b.base)continue;
  const cx=Math.max(b.x0,Math.min(p.x,b.x1)),cz=Math.max(b.z0,Math.min(p.z,b.z1)),dx=p.x-cx,dz=p.z-cz,d=Math.hypot(dx,dz);
  if(d<rad){if(d>1e-4){p.x+=dx/d*(rad-d);p.z+=dz/d*(rad-d)}else p.x+=rad}}}
export function solidAt(x,y,z){for(const b of grid.get(key(x,z))??[])if(x>b.x0&&x<b.x1&&z>b.z0&&z<b.z1&&y<b.top&&y>b.base)return true;return false}
function noiseTex(c1,c2){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');
  for(let i=0;i<9000;i++){g.fillStyle=Math.random()<.5?c1:c2;g.globalAlpha=.35;g.fillRect(Math.random()*256,Math.random()*256,rnd(1,4),rnd(1,6))}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;return t}
export function buildWorld(scene){
  const geo=new THREE.PlaneGeometry(R*2,R*2,200,200);geo.rotateX(-Math.PI/2);const p=geo.attributes.position,col=new Float32Array(p.count*3),c=new THREE.Color();
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),h=height(x,z);p.setY(i,h);c.setHSL(h>16?.08:.27,h>16?.05:.45,h>16?.4+h*.003:.3+Math.sin(x*.1)*Math.cos(z*.1)*.04);col.set([c.r,c.g,c.b],i*3)}
  geo.setAttribute('color',new THREE.BufferAttribute(col,3));geo.computeVertexNormals();const tex=noiseTex('#2c4a22','#587a38');tex.repeat.set(160,160);
  const ground=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,map:tex,roughness:1}));ground.receiveShadow=true;scene.add(ground);
  const rm=new THREE.MeshStandardMaterial({color:0x3a3a3c,roughness:.95,polygonOffset:true,polygonOffsetFactor:-2});
  for(let i=0;i<TOWNS.length-1;i++){const[a,b]=[TOWNS[i],TOWNS[(i+1)%TOWNS.length]],pts=[],N=50;
    for(let k=0;k<=N;k++){const x=a[0]+(b[0]-a[0])*k/N,z=a[1]+(b[1]-a[1])*k/N,dx=b[1]-a[1],dz=a[0]-b[0],l=Math.hypot(dx,dz)||1;for(const s of[-1,1])pts.push(x+dx/l*3.2*s,height(x,z)+.12,z+dz/l*3.2*s)}
    const g=new THREE.BufferGeometry(),idx=[];for(let k=0;k<N;k++){const j=k*2;idx.push(j,j+1,j+2,j+1,j+3,j+2)}g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));g.setIndex(idx);g.computeVertexNormals();const m=new THREE.Mesh(g,rm);m.receiveShadow=true;scene.add(m)}
  const wall=new THREE.MeshStandardMaterial({color:0xb8aa90,map:noiseTex('#9a8c72','#cbbd9f'),roughness:.9}),roof=new THREE.MeshStandardMaterial({color:0x6b2f26,roughness:.8}),shed=new THREE.MeshStandardMaterial({color:0x7d8588,metalness:.4,roughness:.5});
  function building(x,z,w,d,hgt,mat,rmat){const y=height(x,z),T=.3,door=2.4,g=new THREE.Group();
    const seg=(x0,x1,z0,z1,top=y+hgt,base=y)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,top-base,z1-z0),mat);m.position.set((x0+x1)/2,(top+base)/2,(z0+z1)/2);m.castShadow=m.receiveShadow=true;g.add(m);addBox({x0,x1,z0,z1,top,base})};
    seg(x-w/2,x+w/2,z-d/2,z-d/2+T);seg(x-w/2,x-w/2+T,z-d/2,z+d/2);seg(x+w/2-T,x+w/2,z-d/2,z+d/2);
    seg(x-w/2,x-door/2,z+d/2-T,z+d/2);seg(x+door/2,x+w/2,z+d/2-T,z+d/2);seg(x-door/2,x+door/2,z+d/2-T,z+d/2,y+hgt,y+2.3);
    const r=new THREE.Mesh(new THREE.BoxGeometry(w+.6,.4,d+.6),rmat);r.position.set(x,y+hgt+.2,z);r.castShadow=true;g.add(r);
    const f=new THREE.Mesh(new THREE.BoxGeometry(w,.2,d),mat);f.position.set(x,y+.05,z);f.receiveShadow=true;g.add(f);scene.add(g);loot.push([x,y+.3,z],[x+w/4,y+.3,z-d/4])}
  for(const[tx,tz]of TOWNS){const n=tx===0&&tz===0?2:5;for(let i=0;i<n;i++){const a=i/n*6.28+rnd(0,.5),r=i?rnd(14,27):0,x=tx+Math.cos(a)*r,z=tz+Math.sin(a)*r;if(i===n-1&&n>2)building(x,z,16,12,5,shed,shed);else building(x,z,rnd(7,10),rnd(7,9),3.2,wall,roof)}}
  const N=900,trunk=new THREE.InstancedMesh(new THREE.CylinderGeometry(.18,.28,3,6),new THREE.MeshStandardMaterial({color:0x5a3d28}),N),leaf=new THREE.InstancedMesh(new THREE.ConeGeometry(1.6,5,7),new THREE.MeshStandardMaterial({color:0x2f5b2a,roughness:1}),N),leaf2=new THREE.InstancedMesh(new THREE.ConeGeometry(1.2,4,7),leaf.material,N),d=new THREE.Object3D();
  let n=0;while(n<N){const x=rnd(-R+20,R-20),z=rnd(-R+20,R-20),r=Math.hypot(x,z),h=height(x,z);if(r>300||h>14||TOWNS.some(t=>Math.hypot(x-t[0],z-t[1])<46))continue;if(Math.sin(x*.02)*Math.sin(z*.025)<-.1)continue;
    const s=rnd(.8,1.5);d.scale.setScalar(s);d.position.set(x,h+1.5*s,z);d.updateMatrix();trunk.setMatrixAt(n,d.matrix);d.position.y=h+4.2*s;d.updateMatrix();leaf.setMatrixAt(n,d.matrix);d.position.y=h+6.2*s;d.updateMatrix();leaf2.setMatrixAt(n,d.matrix);addBox({x0:x-.3,x1:x+.3,z0:z-.3,z1:z+.3,top:h+8,base:h-1});n++}
  for(const m of[trunk,leaf,leaf2]){m.castShadow=true;scene.add(m)}
  const rock=new THREE.MeshStandardMaterial({color:0x777a78,roughness:1,flatShading:true});
  for(let i=0;i<140;i++){const x=rnd(-300,300),z=rnd(-300,300);if(TOWNS.some(t=>Math.hypot(x-t[0],z-t[1])<40))continue;const s=rnd(.8,3.2),m=new THREE.Mesh(new THREE.IcosahedronGeometry(s,0),rock);m.position.set(x,height(x,z)+s*.3,z);m.scale.y=.7;m.rotation.set(rnd(0,3),rnd(0,3),0);m.castShadow=m.receiveShadow=true;scene.add(m);addBox({x0:x-s*.8,x1:x+s*.8,z0:z-s*.8,z1:z+s*.8,top:height(x,z)+s*.9,base:-5})}
  for(let i=0;i<40;i++){const x=rnd(-280,280),z=rnd(-280,280);if(!TOWNS.some(t=>Math.hypot(x-t[0],z-t[1])<45))loot.push([x,height(x,z)+.3,z])}
}