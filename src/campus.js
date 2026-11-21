import * as T from 'three';
import {LOCATION,buildings,buildingPoint,fromImage,landmarks,SPAWN,GATE,GATE_ANGLE,gatePoint} from './layout.js';
import {terrainHeight} from './terrain.js';
export * from './layout.js';
export function createCampus(){
 const root=new T.Group();root.name='Indus campus — satellite-guided reconstruction';const colliders=[],roofs=[],interiors=[],batches=new Map();
 const colors={ivory:0xd8d5c9,trim:0xe8e7df,glass:0x6d9296,frame:0xb5b9b1,roof:0xbab8ac,grass:0x536849,path:0xb3a58c,road:0x696d65,hedge:0x354d29,trunk:0x695749,leaf:0x29442e,leaf2:0x415c34,red:0x9b6558,gold:0xab9658,water:0x4e9caf,clay:0x9c8b6e,white:0xdce0cf,wood:0x99734c,metal:0x48524d,board:0x284b43,tile:0xd0ccbd,bus:0xd4aa32,busTrim:0x234b3c,rubber:0x202322,seat:0x272b2b,curtain:0x304b75,laminate:0xe1d9c5,notice:0x934b45};
 const materials=Object.fromEntries(Object.entries(colors).map(([k,color])=>[k,new T.MeshStandardMaterial({color,roughness:k==='glass'?.18:k==='water'?.12:.9,metalness:k==='metal'?.65:0,transparent:k==='glass',opacity:k==='glass'?.32:1})]));
 for(const [name,m] of Object.entries(materials))m.name=name;
 materials.glazing=new T.MeshPhysicalMaterial({color:0x243b3e,roughness:.18,metalness:.12,clearcoat:.5,envMapIntensity:.9});
 materials.glazing.name='glazing';
 materials.pathSurface=materials.path.clone();materials.pathSurface.name='path';materials.pathSurface.depthWrite=false;materials.pathSurface.polygonOffset=true;materials.pathSurface.polygonOffsetFactor=-1;materials.pathSurface.polygonOffsetUnits=-1;
 materials.roadSurface=materials.road.clone();materials.roadSurface.name='road';materials.roadSurface.depthWrite=false;materials.roadSurface.polygonOffset=true;materials.roadSurface.polygonOffsetFactor=-1;materials.roadSurface.polygonOffsetUnits=-1;
 let active=null;function point(x,z){if(!active)return {x,z};return buildingPoint(active,x-active.x,z-active.z)}
 const geos={box:new T.BoxGeometry(1,1,1),cyl:new T.CylinderGeometry(1,1,1,24),wheel:new T.CylinderGeometry(1,1,1,20).rotateZ(Math.PI/2),ball:new T.SphereGeometry(1,20,16)};
 // Individual leaf blades replace solid canopy balls. Shared geometry is GPU-instanced.
 const leafPositions=[],leafUV=[],leafColors=[];let leafSeed=819;const leafRandom=()=>{leafSeed=(leafSeed*1664525+1013904223)>>>0;return leafSeed/4294967296};const outline=[[0,.13],[-.055,.045],[-.05,-.05],[0,-.13],[.05,-.05],[.055,.045]];
 for(let n=0;n<140;n++){const angle=leafRandom()*Math.PI*2,v=leafRandom()*2-1,r=Math.cbrt(leafRandom()),rr=Math.sqrt(1-v*v);const center=new T.Vector3(Math.cos(angle)*rr*r,v*r,Math.sin(angle)*rr*r),q=new T.Quaternion().setFromEuler(new T.Euler(leafRandom()*Math.PI,leafRandom()*Math.PI,leafRandom()*Math.PI));const shade=.7+leafRandom()*.3;for(let t=1;t<5;t++)for(const k of [0,t,t+1]){const p=new T.Vector3(outline[k][0],outline[k][1],0).applyQuaternion(q).add(center);leafPositions.push(p.x,p.y,p.z);leafUV.push(outline[k][0]*5+.5,outline[k][1]*3+.5);leafColors.push(shade,shade,shade)}}
 const leafGeo=new T.BufferGeometry();leafGeo.setAttribute('position',new T.Float32BufferAttribute(leafPositions,3));leafGeo.setAttribute('uv',new T.Float32BufferAttribute(leafUV,2));leafGeo.setAttribute('color',new T.Float32BufferAttribute(leafColors,3));leafGeo.computeVertexNormals();for(const name of ['leaf','leaf2']){materials[name].side=T.DoubleSide;materials[name].vertexColors=true;}

 function baseAt(x,z){return active?.baseHeight??(active?.kind?terrainHeight(active.x,active.z)+(active.floorHeight||0):terrainHeight(x,z));}
 function item(shape,mat,x,y,z,w,h,d,ry=0){const p=point(x,z);x=p.x;z=p.z;y+=baseAt(x,z);ry+=active?.angle||0;const key=shape+mat;if(!batches.has(key))batches.set(key,{geo:(mat==='leaf'||mat==='leaf2')?leafGeo:geos[shape],mat:materials[mat],list:[]});batches.get(key).list.push(new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(0,ry,0)),new T.Vector3(w,h,d)))}
 const box=(m,x,y,z,w,h,d,r=0)=>item('box',m,x,y,z,w,h,d,r),cyl=(m,x,y,z,r,h)=>item('cyl',m,x,y,z,r,h,r),ball=(m,x,y,z,r,h=r)=>item('ball',m,x,y,z,r,h,r);
 function solid(x,z,w,d){colliders.push({...point(x,z),w,d,angle:active?.angle||0})}
 function wall(x,z,w,d,h=3.6){box('ivory',x,h/2,z,w,h,d);solid(x,z,w,d);box('trim',x,.14,z,w+.03,.22,d+.03)}
 function sign(text,x,y,z){const o=new T.Object3D();o.name='SIGN: '+text;const p=point(x,z);o.position.set(p.x,y+baseAt(p.x,p.z),p.z);o.rotation.y=active?.angle||0;root.add(o)}
 function path(points,width=3,mat='path'){const vertices=[],indices=[],uv=[];for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],dx=b.x-a.x,dz=b.z-a.z,length=Math.hypot(dx,dz),n=Math.max(1,Math.ceil(length)),across=Math.max(2,Math.ceil(width));const base=vertices.length/3;for(let j=0;j<=n;j++)for(let k=0;k<=across;k++){const side=(k/across-.5)*width,x=a.x+dx*j/n+dz/length*side,z=a.z+dz*j/n-dx/length*side;vertices.push(x,terrainHeight(x,z)+.07,z);uv.push(k/across*width/.8,j/n*length/.8)}for(let j=0;j<n;j++)for(let k=0;k<across;k++){const q=base+j*(across+1)+k;indices.push(q,q+across+1,q+1,q+1,q+across+1,q+across+2)}}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();const mesh=new T.Mesh(geo,mat==='road'?materials.roadSurface:materials.pathSurface);mesh.renderOrder=mat==='road'?1:2;mesh.receiveShadow=true;mesh.material.side=T.DoubleSide;root.add(mesh);const saved=active;active=null;for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz),n=Math.ceil(len/1.8);for(const side of [-1,1])for(let j=0;j<n;j++){const t=(j+.5)/n,x=a.x+dx*t+dz/len*width/2*side,z=a.z+dz*t-dx/len*width/2*side;box('trim',x,.12,z,.15,.24,len/n+.02,Math.atan2(dx,dz));}}active=saved;}

 const route=(pixels,w,m)=>path(pixels.map(p=>fromImage(...p)),w,m);
 const terrainGeo=new T.PlaneGeometry(455,300,228,150);terrainGeo.rotateX(-Math.PI/2);const positions=terrainGeo.getAttribute('position');for(let i=0;i<positions.count;i++){const x=positions.getX(i)+20,z=positions.getZ(i)+10;positions.setXYZ(i,x,terrainHeight(x,z)-.025,z)}terrainGeo.computeVertexNormals();const terrain=new T.Mesh(terrainGeo,materials.grass);terrain.name='Estimated graded terrain';terrain.receiveShadow=true;root.add(terrain);
 // Road and pedestrian network traced from screenshot, rather than a symmetric template.
 route([[720,0],[692,105],[668,218],[581,301],[520,318],[446,367]],7,'road');
 route([[705,160],[715,245],[750,289],[813,329],[852,375]],5,'path');
 route([[450,359],[497,453],[546,542],[600,650],[664,760],[715,893],[766,1020]],5,'road');
 route([[1035,123],[1165,180],[1320,258],[1455,332],[1510,490],[1445,527],[1368,531],[1300,593],[1260,721],[1210,836],[1195,942],[1215,1020]],5,'path');
 route([[780,295],[833,265],[907,283],[964,329]],2.6);route([[826,477],[920,525],[1008,573],[1078,638],[1174,722],[1259,735]],3);
 route([[665,641],[800,642],[937,697],[1060,715],[1156,779]],3);
 route([[1380,658],[1460,587],[1560,559],[1702,624],[1760,785],[1840,880]],3);
 route([[833,335],[731,390],[686,456]],3);route([[887,496],[845,628],[785,718]],3);
 function dome(x,y,z,r){const group=new T.Group();const p=point(x,z);group.position.set(p.x,y+baseAt(p.x,p.z),p.z);const shell=new T.Mesh(new T.SphereGeometry(r,32,16,0,Math.PI*2,0,Math.PI/2),materials.roof);shell.castShadow=true;group.add(shell);for(let k=0;k<12;k++){const angle=k/12*Math.PI*2,pts=[];for(let j=0;j<=18;j++){const t=j/18*Math.PI/2;pts.push(new T.Vector3(Math.cos(angle)*Math.cos(t)*(r+.025),Math.sin(t)*(r+.025),Math.sin(angle)*Math.cos(t)*(r+.025)))}group.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),18,.035,4,false),materials.trim));}const drum=new T.Mesh(new T.CylinderGeometry(r*1.03,r*1.03,.22,32),materials.trim);group.add(drum);root.add(group);return group;}

 function roof(x,z,w,d,h=11.2){const g=new T.Group();const p=point(x,z);g.position.set(p.x,h+baseAt(p.x,p.z),p.z);g.rotation.y=active?.angle||0;if(active?.name==='Secondary block'){for(const side of [-1,1]){const a=new T.Mesh(new T.BoxGeometry((w-8)/2,.25,d),materials.roof);a.position.x=side*(w+8)/4;g.add(a);const b=new T.Mesh(new T.BoxGeometry(8,.25,(d-8)/2),materials.roof);b.position.z=side*(d+8)/4;g.add(b)}}else {const slab=new T.Mesh(new T.BoxGeometry(w,.25,d),materials.roof);g.add(slab);}for(const s of [-1,1]){const e=new T.Mesh(new T.BoxGeometry(w,.65,.3),materials.trim);e.position.set(0,.3,s*d/2);g.add(e);const f=new T.Mesh(new T.BoxGeometry(.3,.65,d),materials.trim);f.position.set(s*w/2,.3,0);g.add(f)}root.add(g);roofs.push({object:g,...p,w,d});return g}
 function exteriorWindow(x,z,w,ry=0){box('glass',x,1.9,z,w,1.7,.09,ry);for(const dx of [-w/2,0,w/2])box('frame',x+Math.cos(ry)*dx,1.9,z-Math.sin(ry)*dx,.05,1.8,.13,ry);for(const dy of [-.85,0,.85])box('frame',x,1.9+dy,z,w,.05,.14,ry)}
 function classroom(cx,cz,w,d,id){
  // Furniture style observed in the supplied tour (~234s and ~389s).
  // The room footprints / connectivity still need a supplied floor plan.
  box('board',cx,1.8,cz-d/2+.3,w*.65,1.25,.1);box('trim',cx,1.15,cz-d/2+.33,w*.7,.05,.2);
  function chair(x,z,back=1){box('seat',x,.43,z,.48,.065,.46);box('seat',x,.72,z+back*.2,.48,.54,.045);for(const sx of [-.19,.19])for(const sz of [-.17,.17])box('metal',x+sx,.21,z+sz,.028,.42,.028)}
  function table(x,z,teacher=false){const ww=teacher?1.6:2.1,dd=teacher?.7:1.35;box('laminate',x,.75,z,ww,.055,dd);box('wood',x,.71,z,ww+.025,.04,dd+.025);for(const sx of [-1,1])for(const sz of [-1,1])box('metal',x+sx*(ww/2-.10),.36,z+sz*(dd/2-.1),.035,.72,.035);solid(x,z,ww,dd);if(teacher)chair(x,z-.6,-1);else for(const side of [-1,1])for(const dx of [-.55,.55])chair(x+dx,z+side*1.04,side);for(const dx of [-.5,.5]){box('white',x+dx,.79,z,.28,.008,.2);box('notice',x+dx+.2,.8,z+.2,.07,.035,.12)}}
  table(cx,cz-d/2+1.4,true);for(const dx of [-w*.23,w*.23])for(const dz of [-d*.13,d*.24])table(cx+dx,cz+dz);
  const side=Math.sign(cx-active.x)||1;box('notice',cx,1.9,cz+d/2-.18,w*.55,1.1,.08);for(let i=0;i<6;i++)box('white',cx+(i%3-1)*.65,1.9+(i<3?.25:-.25),cz+d/2-.24,.45,.34,.015);
  const outer=cx+side*(w/2-.24);for(let zz=cz-d/2+2;zz<cz+d/2-1;zz+=4){for(const edge of [-1,1]){box('curtain',outer,1.85,zz+edge*1.1,.1,2.1,.45);for(let k=0;k<4;k++)box('curtain',outer-.05,1.85,zz+edge*1.1+(k-1.5)*.1,.13,2.1,.04)}}
  box('white',cx,3.42,cz,1.5,.07,.6);box('white',cx,3.42,cz+d*.25,1.5,.07,.6);
 }

 function block(b){active=b;const {x,z,w,d}=b;const h=b.kind==='hall'?9:b.kind==='academic'?10.8:4.3;interiors.push({name:b.name,x,z,w,d,angle:b.angle});box('path',x,-b.floorHeight/2,z,w,b.floorHeight,d);box('tile',x,0,z,w,.08,d);box('ivory',x,3.65,z,w,.16,d);
  // Exterior ground walls have real openings, not solid building collision boxes.
  for(const s of [-1,1]){solid(x+s*w/2,z,.3,d);box('ivory',x+s*w/2,.45,z,.3,.9,d);box('ivory',x+s*w/2,3.2,z,.3,1,d);for(let zz=z-d/2;zz<z+d/2;zz+=4)box('ivory',x+s*w/2,1.8,zz,.3,1.8,1.7);for(const t of [-1,1])wall(x+t*(w/4+.8),z+s*d/2,w/2-1.6,.3,3.7);box('wood',x+1.6,1.35,z+s*d/2,.14,2.7,.35);box('wood',x-1.6,1.35,z+s*d/2,.14,2.7,.35);box('trim',x,3,z+s*d/2,3.2,.6,.35)}
  // Upper facade bands and windows; shell stays outside the walkable ground floor.
  for(const s of [-1,1]){box('ivory',x+s*w/2,(h+3.7)/2,z,.3,h-3.7,d);box('ivory',x,(h+3.7)/2,z+s*d/2,w,h-3.7,.3);for(let k=0;k<Math.floor(w/4);k++){const wx=x-w/2+2+k*4;for(const y of [5.3,8.9].filter(y=>y+1.1<h)){box('glazing',wx,y,z+s*(d/2+.18),2,2.1,.08);for(const dx of [-1,0,1])box('frame',wx+dx,y,z+s*(d/2+.23),.06,2.2,.08)}}}
  for(const y of [3.7,7.2,10.8].filter(y=>y<=h)){box('trim',x,y,z+d/2,w+.5,.2,.6);box('trim',x,y,z-d/2,w+.5,.2,.6)}
  for(const side of [-1,1]){for(let xx=x-w/2+2;xx<x+w/2;xx+=4){box('trim',xx,3.05,z+side*(d/2+.25),2.4,.14,.5);for(const y of [5.3,8.9].filter(y=>y+1.1<h)){box('trim',xx,y-1.2,z+side*(d/2+.24),2.35,.16,.48);box('trim',xx,y+1.2,z+side*(d/2+.2),2.35,.15,.35)}}for(const corner of [-1,1]){box('trim',x+corner*(w/2-.35),h/2,z+side*(d/2+.16),.7,h,.35);for(let yy=.4;yy<h;yy+=.7)box('ivory',x+corner*(w/2-.35),yy,z+side*(d/2+.38),.8,.06,.12)}}
  for(const side of [-1,1]){for(const dx of [-2.1,2.1]){cyl('trim',x+dx,1.65,z+side*(d/2+1),.14,3.3);box('trim',x+dx,.15,z+side*(d/2+1),.45,.3,.45)}box('trim',x,3.5,z+side*(d/2+.8),5,.22,2.5);for(let j=0;j<3;j++){const rise=b.floorHeight*(j+1)/3;box('path',x,rise/2-b.floorHeight,z+side*(d/2+1.05-(j+.5)*.35),4.2,rise,.35);}}
  for(const side of [-1,1]){for(const edge of [-1,1]){cyl('frame',x+edge*(w/2-.5),5.3,z+side*(d/2+.38),.055,10.6);box('metal',x+edge*(w/2-.5),.08,z+side*(d/2+1),.4,.12,.8);for(let k=0;k<7;k++)box('frame',x+edge*(w/2-.5)+(k-3)*.05,.15,z+side*(d/2+1),.02,.02,.72);}}
  // Roof vents, water tanks and service details are invented decorative fittings.
  for(const dx of [-w*.28,w*.28]){box('metal',x+dx,h+.55,z-d*.25,1.5,1.1,1);for(let l=0;l<5;l++)box('frame',x+dx,h+.25+l*.14,z-d*.25+.52,1.3,.035,.035)}
  roof(x,z,w+.7,d+.7,h);sign(b.name.toUpperCase(),x,3.35,z+d/2+.3);
  if(b.kind==='academic'){
   const roomD=(d-2)/3;for(const side of [-1,1]){const xx=x+side*2.1;for(let r=0;r<3;r++){let zz=z-d/2+1+roomD*(r+.5); // room doors face central corridor
     wall(xx,zz-roomD*.25,.18,roomD*.5-2);wall(xx,zz+roomD*.25+1,.18,roomD*.5-2);for(const edge of [-1,1])wall(x+side*(w/4+1),zz+edge*roomD/2,w/2-2,.18);classroom(x+side*(w/4+1),zz,w/2-2,roomD,`${b.name} · ${side<0?'A':'B'}${r+1}`);
    }}
  }else if(b.kind==='dining'){for(let dx=-w/2+4;dx<w/2-2;dx+=5)for(let dz=-d/2+4;dz<d/2-2;dz+=5){box('wood',x+dx,.78,z+dz,3,.1,1);solid(x+dx,z+dz,3,1);for(const s of [-1,1])box('wood',x+dx,.43,z+dz+s,3,.15,.45)}}else if(b.kind==='office'){box('wood',x+4,.8,z-3,3,.12,1.2);solid(x+4,z-3,3,1.2);box('seat',x+4,.6,z-4,1,1.2,.7)}
  // Recessed windows and interior ceiling lights.
  for(const side of [-1,1])for(let zz=z-d/2+3;zz<z+d/2-1;zz+=4){exteriorWindow(x+side*(w/2+.18),zz,2,Math.PI/2);for(const y of [5.3,8.9].filter(y=>y+1.1<h)){box('glazing',x+side*(w/2+.18),y,zz,.08,2.2,2);for(const dz of [-1,0,1])box('frame',x+side*(w/2+.24),y,zz+dz,.08,2.3,.065);for(const dy of [-1.1,0,1.1])box('frame',x+side*(w/2+.24),y+dy,zz,.08,.065,2.1);box('trim',x+side*(w/2+.23),y-1.23,zz,.5,.16,2.35);}}
  for(let zz=z-d/2+3;zz<z+d/2;zz+=5)box('white',x,3.45,zz,1,.08,2);
 active=null;}
 buildings.forEach(block);
 // Academic front towers: double-height grid windows, columns, cornices and domed drums.
 for(const b of buildings.filter(b=>b.kind==='academic')){active=b;for(const side of [-1,1]){const xx=b.x+side*(b.w/2+3);box('path',xx,-b.floorHeight/2,b.z-3,6,b.floorHeight,9);box('ivory',xx,5,b.z-3,6,10,9);solid(xx,b.z-3,6,9);roof(xx,b.z-3,6.5,9.5,10.2);for(const yy of [1.8,5.3,8.7]){box('glazing',xx,yy,b.z+1.65,3.6,2.4,.08);for(let k=-2;k<=2;k++)box('frame',xx+k*.72,yy,b.z+1.71,.065,2.4,.08);for(const dy of [-1.2,0,1.2])box('frame',xx,yy+dy,b.z+1.71,3.7,.06,.08)}}
 const front=b.z+b.d/2;for(const side of [-1,1]){box('ivory',b.x+side*3.5,5.8,front+.5,2,11.6,2);cyl('trim',b.x+side*4.2,5.7,front+1.6,.3,11.4);box('trim',b.x+side*4.2,.2,front+1.6,.9,.4,.9);box('trim',b.x+side*4.2,11.3,front+1.6,.8,.3,.8)}
 box('glazing',b.x,7.2,front+.3,4.5,7,.12);for(let k=-3;k<=3;k++)box('frame',b.x+k*.72,7.2,front+.4,.075,7,.12);for(let yy=3.7;yy<=10.7;yy+=.7)box('frame',b.x,yy,front+.4,4.6,.065,.12);box('trim',b.x,11.8,front+.9,10.5,.6,3.2);
 // Small triangular pediment over the central glazed bay.
 const tri=new T.Shape();tri.moveTo(-5,0);tri.lineTo(0,1.35);tri.lineTo(5,0);tri.closePath();const pediment=new T.Mesh(new T.ExtrudeGeometry(tri,{depth:.32,bevelEnabled:false}),materials.trim);const pp=point(b.x,front+2.15);pediment.position.set(pp.x,12.1+baseAt(pp.x,pp.z),pp.z);pediment.rotation.y=b.angle;root.add(pediment);
 cyl('trim',b.x,12,front-3,3,.9);const cap=dome(b.x,12.45,front-3,2.8);roofs.push({object:cap,x:b.x,z:b.z,w:b.w,d:b.d});active=null;}
 const hall=buildings.find(b=>b.kind==='hall');active=hall;const roofVertices=[],roofIndices=[];for(let i=0;i<=24;i++){const xx=-hall.w/2+hall.w*i/24,yy=9+Math.sin(i/24*Math.PI)*3.4;for(const zz of [-hall.d/2,hall.d/2])roofVertices.push(xx,yy,zz);if(i<24){const q=i*2;roofIndices.push(q,q+1,q+2,q+1,q+3,q+2)}}const shellGeo=new T.BufferGeometry();shellGeo.setAttribute('position',new T.Float32BufferAttribute(roofVertices,3));shellGeo.setIndex(roofIndices);shellGeo.computeVertexNormals();const shell=new T.Mesh(shellGeo,materials.roof);shell.material.side=T.DoubleSide;shell.position.set(hall.x,terrainHeight(hall.x,hall.z)+hall.floorHeight,hall.z);shell.rotation.y=hall.angle;root.add(shell);for(let j=0;j<=24;j++){const xx=hall.x-hall.w/2+hall.w*j/24;box('trim',xx,9+Math.sin(j/24*Math.PI)*3.4+.04,hall.z,.075,.075,hall.d);}active=null;
 const dining=buildings.find(b=>b.kind==='dining');active=dining;for(let i=0;i<12;i++){box('red',dining.x-dining.w/2+i*dining.w/12,3.3,dining.z+dining.d/2+2,dining.w/12+.03,.18,4);cyl('trim',dining.x-dining.w/2+i*dining.w/12,1.6,dining.z+dining.d/2+3.7,.08,3.2);}active=null;
 // Circular administration lobby, with open north and south entrances.
 const radius=17,frontAngle=Math.atan2(GATE.x,GATE.z);
 for(let i=0;i<16;i++){const a=frontAngle+i/16*Math.PI*2,x=Math.sin(a)*radius,z=Math.cos(a)*radius,span=6.7;const entrance=i===0||i===8;
  if(entrance){for(const side of [-1,1]){const offset=side*2.45,xx=x+Math.cos(a)*offset,zz=z-Math.sin(a)*offset;box('ivory',xx,1.7,zz,1.8,3.4,.45,a);colliders.push({x:xx,z:zz,w:1.8,d:.45,angle:a});}box('ivory',x,7.1,z,span,7.4,.45,a);}else{box('ivory',x,5.4,z,span,10.8,.45,a);colliders.push({x,z,w:span,d:.45,angle:a});}
  const pane=(yy,ww,hh)=>{const wx=Math.sin(a)*17.28,wz=Math.cos(a)*17.28;box('glazing',wx,yy,wz,ww,hh,.08,a);for(let dx=-ww/2;dx<=ww/2+.01;dx+=.48)box('frame',wx+Math.cos(a)*dx,yy,wz-Math.sin(a)*dx,.06,hh+.12,.13,a);for(let dy=-hh/2;dy<=hh/2+.01;dy+=.55)box('frame',wx,yy+dy,wz,ww+.13,.06,.13,a);};
  if(i%3===1)pane(7.1,2.7,6.7);else{pane(5.3,1.8,2.0);pane(8.9,1.8,2.0);}if(!entrance)pane(1.8,2.5,2.2);
  for(const yy of [.25,3.6,10.7])box('trim',x,yy,z,span+.15,.18,.6,a);
  const ca=a+Math.PI/16,xx=Math.sin(ca)*18,zz=Math.cos(ca)*18;cyl('trim',xx,5.4,zz,.38,10.8);for(const yy of [.15,.35,10.6]){cyl('trim',xx,yy,zz,.57,.22);}for(let k=0;k<10;k++){const t=k/10*Math.PI*2;cyl('ivory',xx+Math.sin(t)*.37,5.4,zz+Math.cos(t)*.37,.022,10.1);}
 }
 for(let i=0;i<96;i++){const a=i/96*Math.PI*2;cyl('trim',Math.sin(a)*17.8,11.75,Math.cos(a)*17.8,.055,.7);}for(const yy of [11.4,12.1]){const ring=new T.Mesh(new T.TorusGeometry(17.8,.10,8,96),materials.trim);ring.rotation.x=Math.PI/2;ring.position.y=yy+terrainHeight(0,0);root.add(ring)}cyl('tile',0,-.025,0,17,.05);const roundRoof=new T.Mesh(new T.CylinderGeometry(18.5,18.5,.4,64),materials.roof);roundRoof.position.y=11.2+terrainHeight(0,0);root.add(roundRoof);roofs.push({object:roundRoof,x:0,z:0,w:38,d:38});const cap=dome(0,11.5,0,5);roofs.push({object:cap,x:0,z:0,w:38,d:38});const adminSign=new T.Object3D();adminSign.name='SIGN: ADMINISTRATION';adminSign.position.set(-Math.cos(GATE_ANGLE)*18,3.3+terrainHeight(0,0),Math.sin(GATE_ANGLE)*18);adminSign.rotation.y=GATE_ANGLE-Math.PI/2;root.add(adminSign);box('wood',0,.65,-7,8,1.3,1.4);solid(0,-7,8,1.4);for(const x of [-9,9]){box('seat',x,.4,6,1,.8,4);solid(x,6,1,4)}
 // Sports ground occupies the screenshot's upper right; pool and twin courts lower right.
 const field=fromImage(1660,150);active={...field,angle:-.5};box('clay',field.x,.015,field.z,105,.03,72);box('grass',field.x,.04,field.z,84,.03,55);
 for(const x of [-42,42])box('white',field.x+x,.10,field.z,.14,.02,55);for(const z of [-27.5,0,27.5])box('white',field.x,.10,field.z+z,84,.02,.14);
 active=null;const pool=fromImage(1744,699);active={...pool,angle:-.5};box('red',pool.x,.03,pool.z,40,.06,33);box('trim',pool.x,.06,pool.z,31,.08,23);box('water',pool.x,.11,pool.z,29,.04,21);solid(pool.x,pool.z,29,21);for(let i=-2;i<=2;i++)box('white',pool.x+i*5,.14,pool.z,.06,.02,20);
 active=null;const court=fromImage(1368,748);active={...court,angle:-.5};for(const dz of [-11,11]){box('seat',court.x,.025,court.z+dz,28,.05,20);for(const x of [-12,12])box('white',court.x+x,.07,court.z+dz,.07,.025,17);for(const z of [-8.5,8.5])box('white',court.x,.07,court.z+dz+z,24,.025,.07);box('metal',court.x, .6,court.z+dz,25,1.2,.045)}
 active=null;const amph=fromImage(976,704);for(let i=0;i<5;i++){const g=new T.Mesh(new T.CylinderGeometry(7+i,7+i,.18,8,1,false,0,Math.PI*1.6),materials.path);g.position.set(amph.x,terrainHeight(amph.x,amph.z)+.1+i*.1,amph.z);root.add(g)}
 // Pool deck details: lanes, starting blocks, ladders and coping.
 active={...pool,angle:-.5};for(const side of [-1,1]){for(let k=-2;k<=2;k++){box('trim',pool.x+k*5,.55,pool.z+side*12,1.1,.8,.9);box('seat',pool.x+k*5,1.0,pool.z+side*12,1.2,.12,1);}for(let j=-15;j<=15;j++)box('path',pool.x+j*1.1,.14,pool.z+side*15,1.04,.08,1.6);for(const dx of [-14,14]){for(let r=0;r<5;r++)box('metal',pool.x+dx,.2-r*.25,pool.z+side*9,.6,.055,.055);for(const offset of [-.35,.35]){const curve=new T.CatmullRomCurve3([new T.Vector3(pool.x+dx+offset,.1,pool.z+side*8.6),new T.Vector3(pool.x+dx+offset,.8,pool.z+side*9.7),new T.Vector3(pool.x+dx+offset,.65,pool.z+side*11)]);const rail=new T.Mesh(new T.TubeGeometry(curve,12,.035,6,false),materials.metal);const origin=point(0,0);rail.position.set(origin.x,terrainHeight(pool.x,pool.z),origin.z);rail.rotation.y=-.5;root.add(rail)}}}
 active=null;
 // Courts: full playing lines, net mesh and perimeter posts.
 active={...court,angle:-.5};for(const dz of [-11,11]){for(const x of [-8.7,8.7])box('white',court.x+x,.095,court.z+dz,.07,.02,17);for(const z of [-6.4,6.4])box('white',court.x,.095,court.z+dz+z,17.4,.02,.07);box('white',court.x,.095,court.z+dz,.06,.02,12.8);for(let k=-12;k<=12;k++)box('frame',court.x+k,.6,court.z+dz,.018,1.05,.018);for(let y=.15;y<1.2;y+=.16)box('frame',court.x,y,court.z+dz,24,.018,.018)}for(const side of [-1,1]){for(let z=-23;z<=23;z+=3)cyl('metal',court.x+side*16,1.8,court.z+z,.035,3.6);for(let y=.4;y<3.5;y+=.45)box('metal',court.x+side*16,y,court.z,.018,.018,46);}active=null;
 // Football goals and fine goal netting.
 active={...field,angle:-.5};for(const side of [-1,1]){const xx=field.x+side*42;for(const z of [-3.65,3.65]){cyl('white',xx,1.22,field.z+z,.06,2.44);cyl('white',xx+side*1.8,1.22,field.z+z,.04,2.44);}box('white',xx,2.44,field.z,.12,.12,7.4);for(let z=-3.6;z<3.7;z+=.3)box('frame',xx+side*1.8,1.2,field.z+z,.02,2.4,.02);for(let y=.2;y<2.5;y+=.3)box('frame',xx+side*1.8,y,field.z,.02,.02,7.3);}active=null;
 active={...pool,angle:-.5};for(const side of [-1,1]){if(side<0){box('ivory',pool.x-12.5,1.6,pool.z-16.5,15,3.2,.25);solid(pool.x-12.5,pool.z-16.5,15,.25);}else{box('ivory',pool.x,1.6,pool.z+16.5,40,3.2,.25);solid(pool.x,pool.z+16.5,40,.25);}for(let k=-18;k<=18;k+=1.2)box('glazing',pool.x+k,2.85,pool.z+side*16.65,.35,.35,.03);for(const s of [-1,1]){box('ivory',pool.x+side*19.5,1.6,pool.z+s*9,.25,3.2,14.5);solid(pool.x+side*19.5,pool.z+s*9,.25,14.5);}}
 item('cyl','trim',pool.x+8,.10,pool.z-13.5,3.5,.12,1.9);item('cyl','water',pool.x+8,.18,pool.z-13.5,3.2,.05,1.6);solid(pool.x+8,pool.z-13.5,6.4,3.2);
 for(let k=0;k<24;k++){const xx=pool.x-17+k*1.45;box(k%4===0?'notice':k%4===1?'gold':k%4===2?'curtain':'busTrim',xx,2.8,pool.z,.55,.55,.025);}
 active=null;
 // Mature irregular canopies follow dense tree belts, leaving paths and entrances clear.
 let seed=119;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 function branch(x,z,h,a){const start=new T.Vector3(x,terrainHeight(x,z)+h*.38,z),end=new T.Vector3(x+Math.sin(a)*2.2,terrainHeight(x,z)+h*.75,z+Math.cos(a)*2.2),delta=end.clone().sub(start),key='cyltrunk';if(!batches.has(key))batches.set(key,{geo:geos.cyl,mat:materials.trunk,list:[]});batches.get(key).list.push(new T.Matrix4().compose(start.add(end).multiplyScalar(.5),new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),delta.clone().normalize()),new T.Vector3(.08,delta.length(),.08)))}
 function blocked(x,z){const dx=x-GATE.x,dz=z-GATE.z,along=Math.cos(GATE_ANGLE)*dx-Math.sin(GATE_ANGLE)*dz,across=Math.sin(GATE_ANGLE)*dx+Math.cos(GATE_ANGLE)*dz;if((Math.abs(across)<36&&along>-32&&along<95)||Math.hypot(x,z)<24)return true;return buildings.some(b=>Math.abs(x-b.x)<b.w/2+5&&Math.abs(z-b.z)<b.d/2+7)||landmarks.some(p=>Math.hypot(x-p.x,z-p.z)<8)||Math.hypot(x-SPAWN.x,z-SPAWN.z)<7||(x>35&&x<205&&z<-25)||(x>85&&x<205&&z>39&&z<91)}
 for(let i=0;i<440;i++){let x=rand()*340-120,z=rand()*230-87;if(blocked(x,z))continue;const h=6+rand()*7;cyl('trunk',x,h*.36,z,.22,h*.72);cyl('trim',x,.34,z,.225,.68);for(let n=0;n<5;n++)branch(x,z,h,n/5*Math.PI*2);for(let k=0;k<5;k++){let a=rand()*Math.PI*2,r=rand()*2.4;ball(k%2?'leaf':'leaf2',x+Math.sin(a)*r,h*.72+rand()*1.4,z+Math.cos(a)*r,2.4+rand()*1.6,1.8+rand()*1.5)}colliders.push({x,z,r:.4})}
 // Three openings described by the user, viewed from outside facing administration.
 const gx=GATE.x,gz=GATE.z;active={...GATE,angle:GATE_ANGLE};
 path([gatePoint(-25,5),gatePoint(28,5)],38,'road');
 const gateEdges=[-14,-8,8,24];
 for(const offset of gateEdges){const zz=gz+offset;box('ivory',gx,2.4,zz,1.5,4.8,1.5);solid(gx,zz,1.5,1.5);box('path',gx,.25,zz,1.9,.5,1.9);box('trim',gx,4.9,zz,1.9,.22,1.9);ball('gold',gx,5.15,zz,.16);}
 const openings=[{a:-14,b:-8,name:'EXIT',height:2.7},{a:-8,b:8,name:'ENTRANCE',height:3.8},{a:8,b:24,name:'ENTRANCE',height:3.8}];
 for(const g of openings){const length=(g.b-g.a)/2-.85;
  for(const edge of [g.a+.85,g.b-.85]){const zz=gz+edge;for(let j=0;j<=length/.22;j++)box('metal',gx+j*.22,g.height/2,zz,.055,g.height,.07);for(const y of [.2,g.height*.45,g.height-.15])box('metal',gx+length/2,y,zz,length,.075,.09);solid(gx+length/2,zz,length,.12);}
 }
 for(const [lo,hi] of [[-55,-14],[24,54]]){for(let z=lo;z<hi;z+=2){box('ivory',gx,.5,gz+z,.5,1,2);for(let j=0;j<6;j++)box('metal',gx,1.65,gz+z+j*.3,.055,2.3,.055);}solid(gx,gz+(lo+hi)/2,.6,hi-lo);}
 const gateSign=new T.Object3D();gateSign.name='SIGN: INDUS INTERNATIONAL SCHOOL';const sp=gatePoint(-.4,30);gateSign.position.set(sp.x,terrainHeight(sp.x,sp.z)+2.6,sp.z);gateSign.rotation.y=GATE_ANGLE-Math.PI/2;root.add(gateSign);box('ivory',gx,1.7,gz+30,1,3.4,9);
 // Security pavilion sits beyond the smaller exit, clear of all three lanes.
 box('ivory',gx+7,1.5,gz-19,4.5,3,4);solid(gx+7,gz-19,4.5,4);box('roof',gx+7,3.2,gz-19,5.2,.3,4.8);
 for(const zz of [gz-21.03,gz-16.97])box('glazing',gx+7,1.8,zz,3.3,1.3,.06);
 for(const xx of [-12,12])for(const zz of [-16,26]){cyl('metal',gx+xx,3.2,gz+zz,.075,6.4);box('metal',gx+xx,6.4,gz+zz,.5,.12,1.2);}
 // Flags stand behind the interlocking coach row, rather than along the main walk.
 for(let n=0;n<10;n++){const xx=28+n*.65,zz=-9-n*2; cyl('frame',gx+xx,4.7,gz+zz,.055,9.4);ball('gold',gx+xx,9.45,gz+zz,.09);box('trim',gx+xx,.2,gz+zz,.65,.4,.65);
  for(let stripe=0;stripe<3;stripe++)box(['notice','white','busTrim'][(stripe+n)%3],gx+xx,8.8-stripe*.35,gz+zz+.85,.035,.35,1.7);
 }
 active=null;
 // Formal crescent garden and flanking paved walks observed in the main-front footage.
 active={x:0,z:0,angle:GATE_ANGLE-Math.PI/2};const local=(x,z)=>buildingPoint(active,x,z);
 path([local(0,20),local(-9,26),local(-13,35),local(-10,44),local(0,53)],3,'path');path([local(0,20),local(9,26),local(13,35),local(10,44),local(0,53)],3,'path');path([local(0,19),local(0,27)],3,'path');
 for(const side of [-1,1]){for(let i=0;i<28;i++){const t=i/27*Math.PI;const xx=side*(2+Math.sin(t)*8),zz=35+Math.cos(t)*9;box(i%3===0?'notice':i%3===1?'gold':'hedge',xx,.35,zz,.75,.7,.75);}for(let z=25;z<53;z+=6){const xx=side*17;cyl('trunk',xx,1.4,z,.12,2.8);cyl('trim',xx,.35,z,.125,.7);for(let k=0;k<5;k++)ball('leaf2',xx+Math.sin(k)*.6,2.8,z+Math.cos(k)*.6,1.5,1.3);for(let k=0;k<8;k++)ball('trim',xx+Math.sin(k)*1.2,2.9+Math.sin(k*3)*.15,z+Math.cos(k)*1.2,.07,.07);}}
 active=null;
 // Yellow school coaches seen in the recent tour. Parking locations are interpreted.
 for(let n=0;n<6;n++){const pos=gatePoint(18+n*.65,-10-n*3.8);active={...pos,angle:GATE_ANGLE+.55,baseHeight:terrainHeight(pos.x,pos.z)};const x=pos.x,z=pos.z;
 box('bus',x,1.65,z,2.4,2.4,8.2);box('busTrim',x,.6,z,2.4,.38,8.3);box('trim',x,2.91,z,2.35,.12,8.2);box('glazing',x,2.05,z-4.12,2.15,1.3,.04);box('metal',x,.9,z-4.16,1.2,.35,.06);for(const side of [-1,1]){for(let w=0;w<7;w++){box('glazing',x+side*1.22,2.18,z-2.9+w*.91,.04,1.05,.78);box('busTrim',x+side*1.235,1.56,z-2.9+w*.91,.035,.08,.89);}for(const dz of [-2.7,2.7])item('wheel','rubber',x+side*1.14,.55,z+dz,.28,.48,.48);for(const dz of [-2.7,2.7])item('wheel','frame',x+side*1.3,.55,z+dz,.025,.22,.22);box('white',x+side*.8,.96,z-4.18,.4,.28,.04);box('notice',x+side*.8,1.1,z+4.13,.25,.4,.04);box('metal',x+side*1.45,2.25,z-3.6,.15,.4,.2);}solid(x,z,2.5,8.3);active=null;}
 // Gardens, paving joints, benches, drain gratings and bollards give the walk scale.
 for(const b of buildings){active=b;for(const side of [-1,1]){for(let j=-2;j<=2;j++){box('path',b.x+j*.75,.09,b.z+side*(b.d/2+4),.7,.16,2.5);if(Math.abs(j)===2){cyl('metal',b.x+j*1.8,.5,b.z+side*(b.d/2+4),.08,1);}}for(const dx of [-6,6]){box('wood',b.x+dx,.48,b.z+side*(b.d/2+4),2.4,.12,.55);box('wood',b.x+dx,.82,b.z+side*(b.d/2+4.3),2.4,.6,.08);for(const sx of [-.8,.8])box('metal',b.x+dx+sx,.24,b.z+side*(b.d/2+4),.08,.48,.6);}}active=null;}
 for(const b of batches.values()){const mesh=new T.InstancedMesh(b.geo,b.mat,b.list.length);b.list.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.castShadow=!['grass','path','road','water','tile','white'].some(k=>materials[k]===b.mat);mesh.receiveShadow=true;mesh.name='Campus '+b.mat.color.getHexString();root.add(mesh)}
 root.userData={location:LOCATION,fidelity:'Building centres traced from user satellite screenshot; scale, elevations and interiors estimated.',units:'estimated metres'};
 return {root,colliders,roofs,interiors};
}
export function canOccupy(x,z,colliders,r=.4){if(x<-195||x>230||z<-92||z>145)return false;return !colliders.some(b=>b.r!==undefined?Math.hypot(x-b.x,z-b.z)<b.r+r:Math.abs(Math.cos(b.angle||0)*(x-b.x)-Math.sin(b.angle||0)*(z-b.z))<b.w/2+r&&Math.abs(Math.sin(b.angle||0)*(x-b.x)+Math.cos(b.angle||0)*(z-b.z))<b.d/2+r)}
