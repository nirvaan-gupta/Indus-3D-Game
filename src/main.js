import * as T from 'three';
import {createCampus,canOccupy,SPAWN,SPAWN_YAW,GATE} from './campus.js';
import './style.css';
import {Escort} from './escort.js';
import {createRenderPipeline} from './render-pipeline.js';
import {terrainHeight,walkHeight} from './terrain.js';
import {Sky} from 'three/addons/objects/Sky.js';
import {applyArchitecturalTextures,applyPhotographicExteriors,addWaterSurface} from './materials.js';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {createCharacter,characterNames} from './characters.js';
import {ViewState,walkingCamera} from './camera-controller.js';
import {PlayerController} from './player-controller.js';
import {MovementFeedback} from './feedback.js';
const feedback=new MovementFeedback();
const $=id=>document.getElementById(id);
let renderer;
try{renderer=new T.WebGLRenderer({canvas:$('world'),antialias:true,powerPreference:'high-performance'});}catch(e){$('error').hidden=false;$('error').textContent='WebGL could not start. Open this game in a browser with hardware acceleration enabled.';throw e;}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.85;
const scene=new T.Scene();scene.background=new T.Color(0xb9ced0);scene.fog=new T.Fog(0xb9ced0,110,360);
const camera=new T.PerspectiveCamera(64,1,.15,650);
scene.add(new T.HemisphereLight(0xe4eff7,0x687b43,1.8));const sun=new T.DirectionalLight(0xffefd1,2.4);sun.position.set(-75,110,65);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-125,right:125,top:125,bottom:-125,near:1,far:300});sun.shadow.bias=-.0008;sun.shadow.normalBias=.08;scene.add(sun);
const sky=new Sky();sky.scale.setScalar(450);sky.material.uniforms.turbidity.value=3.5;sky.material.uniforms.rayleigh.value=1.5;sky.material.uniforms.mieCoefficient.value=.004;sky.material.uniforms.mieDirectionalG.value=.82;sky.material.uniforms.sunPosition.value.copy(sun.position);scene.add(sky);
const {root,colliders,interiors}=createCampus();scene.add(root);applyArchitecturalTextures(root,renderer);applyPhotographicExteriors(root,renderer);const updateWater=addWaterSurface(root);
const pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(new RoomEnvironment(),.04).texture;pmrem.dispose();scene.environmentIntensity=.45;new RGBELoader().load('/textures/daylight.hdr',texture=>{const generator=new T.PMREMGenerator(renderer);const environment=generator.fromEquirectangular(texture);scene.environment=environment.texture;texture.dispose();generator.dispose();});
const composer=createRenderPipeline(renderer,scene,camera,innerWidth,innerHeight);
// Architectural signs, generated locally rather than fetched textures.
function sign(text,pos,rotation=0){const c=document.createElement('canvas');c.width=1024;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#344941';ctx.font='500 45px sans-serif';ctx.textAlign='center';ctx.fillText(text,512,76);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const m=new T.Mesh(new T.PlaneGeometry(text.length*.28,1.3),new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}));m.position.copy(pos);m.rotation.y=rotation;scene.add(m);}
root.traverse(o=>{if(o.name.startsWith('SIGN: '))sign(o.name.slice(6),o.position,o.rotation.y)});
// All four avatars are stylized role representations.
const avatar=new T.Group();scene.add(avatar);let character=createCharacter(0);avatar.add(character.root);
const escort=new Escort(scene,colliders);let selectedCharacter=0;
function selectCharacter(index){selectedCharacter=index;escort.clear();avatar.remove(character.root);character.root.traverse(o=>{o.geometry?.dispose();if(o.material)o.material.dispose()});character=createCharacter(index);avatar.add(character.root);$('character').value=String(index);$('character-name').textContent=characterNames[index];if(index===2)escort.enable(player,yaw);clearKeys()}
$('character').onchange=e=>selectCharacter(Number(e.target.value));
const views=new ViewState();const controller=new PlayerController(SPAWN,colliders);
function jumpNow(){if(started&&!views.overhead)controller.jump()}

let started=false,snapCamera=true,yaw=SPAWN_YAW,pitch=.14,walkingTime=0;const keys=new Set();const player=new T.Vector3().copy(controller.position);avatar.position.copy(player);avatar.rotation.y=SPAWN_YAW;const clock=new T.Clock();const desired=new T.Vector3();let dragging=false,lastX=0,lastY=0;
function clearKeys(){keys.clear();dragging=false}window.addEventListener('blur',clearKeys);document.addEventListener('visibilitychange',clearKeys);
function begin(){feedback.start();started=true;snapCamera=true;$('welcome').hidden=true;$('hud').hidden=false;camera.position.set(player.x+Math.sin(yaw)*7,player.y+4.8,player.z+Math.cos(yaw)*7);$('world').requestPointerLock?.()?.catch?.(()=>{});}
$('start').onclick=begin;
function updateViewButtons(){$('perspective').firstChild.textContent=views.thirdPerson?'First person ':'Third person ';$('view').firstChild.textContent=views.overhead?'Return to walkthrough ':'3D top view ';$('view').setAttribute('aria-pressed',String(views.overhead));snapCamera=true;clearKeys();document.activeElement?.blur?.();}
function mapToggle(){if(!started){started=true;$('welcome').hidden=true;$('hud').hidden=false;}views.toggleOverhead();updateViewButtons();if(views.overhead)document.exitPointerLock?.();}
function perspective(){views.togglePerspective();updateViewButtons();}
function reset(){controller.reset(SPAWN);player.copy(controller.position);yaw=SPAWN_YAW;avatar.rotation.y=yaw;pitch=.08;views.overhead=false;if(selectedCharacter===2)escort.enable(player,yaw);updateViewButtons();}
$('view').onclick=mapToggle;$('perspective').onclick=perspective;$('reset').onclick=reset;

window.addEventListener('keydown',e=>{if(['SELECT','INPUT','TEXTAREA'].includes(e.target.tagName))return;if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();if(e.repeat)return;keys.add(e.code);if(e.code==='Space')jumpNow();if(/^Digit[1-4]$/.test(e.code))selectCharacter(Number(e.code.slice(-1))-1);if(e.code==='KeyM')mapToggle();if(e.code==='KeyV')perspective();if(e.code==='KeyR')reset();});window.addEventListener('keyup',e=>keys.delete(e.code));
const canvas=$('world');canvas.addEventListener('click',()=>{if(started&&!views.overhead&&matchMedia('(pointer:fine)').matches)canvas.requestPointerLock?.()?.catch?.(()=>{})});
document.addEventListener('pointerlockchange',()=>{clearKeys()});
function look(dx,dy){yaw-=dx*.0025;pitch=T.MathUtils.clamp(pitch+dy*.002,-.55,.8)}
document.addEventListener('mousemove',e=>{if(started&&document.pointerLockElement===canvas&&!views.overhead)look(e.movementX,e.movementY)});
canvas.addEventListener('pointerdown',e=>{if(document.pointerLockElement!==canvas){dragging=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId)}});canvas.addEventListener('pointermove',e=>{if(dragging&&started&&!views.overhead){look(e.clientX-lastX,e.clientY-lastY);lastX=e.clientX;lastY=e.clientY}});canvas.addEventListener('pointerup',()=>dragging=false);canvas.addEventListener('pointercancel',clearKeys);
document.querySelectorAll('[data-key]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.key)});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>keys.delete(b.dataset.key))});
function resize(){snapCamera=true;camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight)}window.addEventListener('resize',resize);resize();
function currentInterior(){return interiors.find(b=>Math.abs(Math.cos(b.angle)*(player.x-b.x)-Math.sin(b.angle)*(player.z-b.z))<b.w/2&&Math.abs(Math.sin(b.angle)*(player.x-b.x)+Math.cos(b.angle)*(player.z-b.z))<b.d/2);}
function animate(){requestAnimationFrame(animate);scene.fog.near=views.overhead?350:110;scene.fog.far=views.overhead?900:360;const dt=Math.min(clock.getDelta(),.15);updateWater(dt);let moving=false;
 if(started&&!views.overhead){controller.update({forward:Number(keys.has('KeyW')||keys.has('ArrowUp'))-Number(keys.has('KeyS')||keys.has('ArrowDown')),right:Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft')),run:keys.has('ShiftLeft')||keys.has('ShiftRight')},yaw,dt);player.copy(controller.position);moving=controller.moving;if(moving)avatar.rotation.y=controller.heading;escort.update(player,dt);}
 avatar.position.copy(player);avatar.visible=views.thirdPerson||views.overhead;feedback.update(player,controller.grounded,started&&!views.overhead);if(moving)walkingTime+=dt*(keys.has('ShiftLeft')||keys.has('ShiftRight')?11:8);character.animate(moving,walkingTime,!controller.grounded);
 if(views.overhead){camera.position.set(25,300,75);camera.lookAt(25,0,20);snapCamera=true;}else if(!started){desired.set(GATE.x-24,terrainHeight(GATE.x,GATE.z)+9,GATE.z+15);camera.position.lerp(desired,.03);camera.lookAt(GATE.x+8,terrainHeight(GATE.x,GATE.z)+2,GATE.z);}else{const view=walkingCamera(player,yaw,pitch,views.thirdPerson,(x,z)=>canOccupy(x,z,colliders,.2),walkHeight,currentInterior()?walkHeight(player.x,player.z)+3.45:Infinity);if(snapCamera||view.blocked){camera.position.copy(view.position);}else if(views.thirdPerson){camera.position.lerp(view.position,1-Math.exp(-dt*14));}else{camera.position.x=view.position.x;camera.position.z=view.position.z;camera.position.y=T.MathUtils.damp(camera.position.y,view.position.y,24,dt);}camera.lookAt(view.target);if(views.thirdPerson&&Math.hypot(camera.position.x-player.x,camera.position.z-player.z)<.65)avatar.visible=false;snapCamera=false;}

 if(started){const inside=currentInterior();$('place').textContent=Math.hypot(player.x-GATE.x,player.z-GATE.z)<24?'Main gate':inside?inside.name:Math.hypot(player.x,player.z)<23?'Administration':'Indus campus';}
 if(views.overhead)renderer.render(scene,camera);else composer.render();
}
$('perspective').firstChild.textContent='Third person ';
animate();
