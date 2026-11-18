const d={name:'Jogador',level:1,sens:1,vol:.5,cloth:0x4b5d3a,vest:0x2f3a2a,skin:0xd9a67e,start:'pistol'};
export const state=Object.assign(d,JSON.parse(localStorage.getItem('art12')||'{}'));
export const save=()=>localStorage.setItem('art12',JSON.stringify(state));
