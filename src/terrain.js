import {buildings,fromImage} from './layout.js';
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
export function baseHeight(x,z){return .009*(x+100)+.004*(z+25)+.28*Math.sin(x*.025)*Math.cos(z*.022)}
const pads=[...buildings,{x:0,z:0,w:39,d:39,angle:0}, {...fromImage(1744,699),w:42,d:35,angle:-.5},{...fromImage(1368,748),w:33,d:46,angle:-.5},{...fromImage(1660,150),w:110,d:77,angle:-.5}];
function influence(b,x,z){const c=Math.cos(b.angle),s=Math.sin(b.angle),dx=x-b.x,dz=z-b.z;const outside=Math.max(Math.abs(c*dx-s*dz)-b.w/2-2,Math.abs(s*dx+c*dz)-b.d/2-2,0);return 1-smooth(outside/7)}
export function terrainHeight(x,z){const h=baseHeight(x,z);let numerator=h,denominator=1;let buildingWeight=0;for(const b of buildings)buildingWeight=Math.max(buildingWeight,influence(b,x,z));for(const b of pads){let t=influence(b,x,z);if(!buildings.includes(b))t*=1-buildingWeight;if(t>=.999999)return baseHeight(b.x,b.z)+.25;if(t>0){const w=t/(1-t);numerator+=(baseHeight(b.x,b.z)+.25)*w;denominator+=w;}}return numerator/denominator;}

export function walkHeight(x,z){let height=terrainHeight(x,z);for(const b of buildings){const dx=x-b.x,dz=z-b.z,c=Math.cos(b.angle),s=Math.sin(b.angle),lx=c*dx-s*dz,lz=s*dx+c*dz;const base=terrainHeight(b.x,b.z),rise=b.floorHeight||0;if(Math.abs(lx)<=b.w/2&&Math.abs(lz)<=b.d/2){height=Math.max(height,base+rise+.04);}else if(Math.abs(lx)<2.1){const outside=Math.abs(lz)-b.d/2;if(outside>=0&&outside<1.05){const step=Math.min(3,Math.max(1,Math.ceil((1.05-outside)/.35)));height=Math.max(height,base+rise*step/3);}}}return height;}
