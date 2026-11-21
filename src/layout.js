export const LOCATION={latitude:12.8350171,longitude:77.7785936};
// Digitized reference points from the supplied 1946 × 1020 satellite screenshot.
// 0.22 m/pixel is an estimated scale; screenshot-up is not asserted geographic north.
export const fromImage=(x,y)=>({x:(x-900)*.22,z:(y-415)*.22});
export const buildings=[
 {name:'Secondary block',px:895,py:141,w:36,d:35,kind:'academic'},
 {name:'Primary block',px:634,py:482,w:34,d:39,kind:'academic'},
 {name:'Academy block',px:763,py:803,w:35,d:43,kind:'academic'},
 {name:'Central teaching block',px:1196,py:601,w:43,d:43,kind:'academic'},
 {name:'Canteen',px:1364,py:246,w:25,d:22,kind:'dining'},
 {name:'Sports hall',px:1580,py:405,w:37,d:37,kind:'hall'},
 {name:'Dean office',px:1220,py:62,w:22,d:19,kind:'office'},
 {name:'South block',px:1039,py:956,w:31,d:20,kind:'academic'},
 {name:'South-east service block',px:1334,py:882,w:15,d:22,kind:'office'},
 {name:'Pool pavilion',px:1857,py:817,w:18,d:17,kind:'office'},
 {name:'Pool annex',px:1775,py:606,w:19,d:10,kind:'office'},
 {name:'Pool changing rooms',px:1499,py:645,w:16,d:19,kind:'office'}
].map(b=>({...b,...fromImage(b.px,b.py),angle:-.50,floorHeight:b.kind==='academic'?.45:.30}));
export function buildingPoint(b,dx=0,dz=0){return {x:b.x+Math.cos(b.angle)*dx+Math.sin(b.angle)*dz,z:b.z-Math.sin(b.angle)*dx+Math.cos(b.angle)*dz}}
export const landmarks=[{name:'Administration',x:0,z:23},...buildings.filter(b=>['Secondary block','Primary block','Academy block','Central teaching block'].includes(b.name)).map(b=>({name:b.name,...buildingPoint(b,0,b.d/2+5)})),{name:'Tennis courts',...fromImage(1332,765)},{name:'Swimming pool',...fromImage(1630,760)}];
export const GATE=fromImage(510,305);
export const GATE_ANGLE=-Math.atan2(-GATE.z,-GATE.x);
export function gatePoint(dx,dz){return buildingPoint({...GATE,angle:GATE_ANGLE},dx,dz)}
export const SPAWN=gatePoint(-17,0);
export const SPAWN_YAW=GATE_ANGLE-Math.PI/2;
