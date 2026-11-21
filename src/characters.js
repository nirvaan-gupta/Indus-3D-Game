import * as T from 'three';
export const characterNames=['Student','Teacher','General Ray','Staff member'];
export function createCharacter(index){
 const root=new T.Group();root.name=characterNames[index];
 const palette=[[0xe7e2d7,0x29394a],[0xa69286,0x363e48],[0x686d4b,0x484e34],[0x69858d,0x343f43]][index];
 const mat=c=>new T.MeshStandardMaterial({color:c,roughness:.86});const cloth=mat(palette[0]),trousers=mat(palette[1]),skin=mat(0xb88e73),hair=mat(index===2?0x727069:0x2d2824),shoe=mat(0x302d29),white=mat(0xd6d1bf),black=mat(0x292726),gold=mat(0xb79f62);
 const sphere=new T.SphereGeometry(1,20,16);
 function ell(parent,m,x,y,z,sx,sy,sz){const o=new T.Mesh(sphere,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;parent.add(o);return o}
 function box(parent,m,x,y,z,w,h,d){const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o}
 function segment(parent,m,a,b,r1,r2){const delta=new T.Vector3(...b).sub(new T.Vector3(...a));const o=new T.Mesh(new T.CylinderGeometry(r2,r1,delta.length(),14),m);o.position.copy(new T.Vector3(...a).add(new T.Vector3(...b)).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());o.castShadow=true;parent.add(o);return o}
 // Anatomical proportions: shoulders, shaped chest, waist, pelvis and neck.
 ell(root,cloth,0,1.3,0,.245,.30,.135);ell(root,cloth,0,1.08,0,.18,.17,.125);ell(root,trousers,0,.94,0,.19,.13,.13);
 segment(root,skin,[0,1.53,0],[0,1.65,0],.065,.07);
 const head=new T.Group();head.position.y=1.76;root.add(head);ell(head,skin,0,0,-.005,.106,.145,.105);ell(head,skin,0,-.065,-.04,.083,.07,.075);ell(head,hair,0,.069,.012,.109,.091,.103);
 for(const s of [-1,1]){ell(head,skin,s*.107,-.005,0,.023,.041,.018);ell(head,white,s*.041,.015,-.095,.025,.012,.012);ell(head,black,s*.041,.014,-.106,.01,.01,.005);box(head,hair,s*.04,.04,-.1,.046,.009,.007)}
 ell(head,skin,0,-.013,-.113,.018,.032,.023);box(head,mat(0x855e52),0,-.07,-.104,.043,.006,.006);
 const legs=[],knees=[],arms=[],elbows=[];
 for(const s of [-1,1]){
  const leg=new T.Group();leg.position.set(s*.105,.92,0);root.add(leg);legs.push(leg);segment(leg,trousers,[0,0,0],[0,-.41,0],.075,.065);const knee=new T.Group();knee.position.y=-.41;leg.add(knee);knees.push(knee);ell(knee,trousers,0,0,0,.067,.067,.067);segment(knee,trousers,[0,0,0],[0,-.39,.005],.058,.043);ell(knee,shoe,0,-.41,-.055,.063,.055,.13);box(knee,black,0,-.454,-.055,.125,.025,.245);
  const arm=new T.Group();arm.position.set(s*.235,1.47,0);root.add(arm);arms.push(arm);ell(arm,cloth,0,-.02,0,.078,.087,.084);segment(arm,cloth,[0,-.025,0],[s*.04,-.27,0],.066,.052);const elbow=new T.Group();elbow.position.set(s*.04,-.27,0);arm.add(elbow);elbows.push(elbow);segment(elbow,index===0?skin:cloth,[0,0,0],[0,-.25,-.015],.049,.035);ell(elbow,skin,0,-.29,-.018,.04,.07,.023);for(let i=0;i<4;i++)ell(elbow,skin,(i-1.5)*.014,-.342,-.021,.008,.027,.01);
 }
 // Seams, placket, buttons, belt, cuffs and role-specific accessories.
 box(root,cloth,0,1.29,-.135,.013,.37,.013);for(let i=0;i<5;i++)ell(root,white,0,1.45-i*.07,-.148,.009,.009,.004);box(root,shoe,0,1.0,0,.35,.032,.25);box(root,gold,0,1,-.135,.042,.037,.015);
 if(index===0){box(root,trousers,0,1.26,.145,.29,.37,.11);for(const s of [-1,1])box(root,trousers,s*.13,1.35,-.114,.025,.36,.02);box(root,mat(0x7d343a),0,1.42,-.16,.035,.25,.014)}
 if(index===1){box(arms[0],mat(0x446259),-.04,-.46,-.06,.08,.25,.18);box(root,gold,.12,1.4,-.13,.045,.065,.01)}
 if(index===2){ell(root,trousers,0,1.89,0,.125,.045,.12);box(root,trousers,0,1.88,-.09,.18,.02,.14);for(const s of [-1,1])box(root,gold,s*.2,1.51,0,.085,.025,.16);for(let i=0;i<3;i++)box(root,mat([0x9a504b,0xb8a773,0x52728a][i]),-.10+i*.035,1.38,-.132,.029,.035,.012);box(head,hair,0,-.047,-.108,.056,.015,.008)}
 if(index===3){box(root,white,.11,1.36,-.14,.075,.095,.01);box(root,black,.11,1.46,-.132,.013,.14,.01);box(arms[0],mat(0x8d7760),0,-.46,-.06,.06,.29,.19)}
 root.userData={appearance:'Original anatomically proportioned procedural human; not a scanned likeness',stylized:false};
 return {root,animate(moving,phase,airborne){const swing=moving&&!airborne?Math.sin(phase)*.48:0;for(let i=0;i<2;i++){const s=i===0?1:-1;legs[i].rotation.x=airborne?s*.25:swing*s;knees[i].rotation.x=airborne?.65:Math.max(0,-swing*s)*.8;arms[i].rotation.x=airborne?-.6:-swing*s;elbows[i].rotation.x=-.13-(moving?.15:0)}head.rotation.z=moving?Math.sin(phase*.5)*.015:0}};
}
