import * as T from 'three';
export class ViewState{
 constructor(){this.thirdPerson=false;this.overhead=false;}
 togglePerspective(){this.thirdPerson=!this.thirdPerson;this.overhead=false;}
 toggleOverhead(){this.overhead=!this.overhead;}
}
export function walkingCamera(player,yaw,pitch,thirdPerson,isClear,groundHeight,ceiling=Infinity){
 const target=new T.Vector3(player.x,player.y+1.35,player.z);
 if(!thirdPerson){const eye=new T.Vector3(player.x,player.y+1.68,player.z);return {position:eye,target:eye.clone().add(new T.Vector3(-Math.sin(yaw)*Math.cos(pitch),-Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch)).multiplyScalar(10)),blocked:false};}
 const elevation=T.MathUtils.clamp(pitch+.13,-.15,.85),distance=4.4;
 const position=target.clone().add(new T.Vector3(Math.sin(yaw)*Math.cos(elevation)*distance,.25+Math.sin(elevation)*distance,Math.cos(yaw)*Math.cos(elevation)*distance));
 let blocked=false;const steps=Math.ceil(distance/.12);
 for(let i=1;i<=steps;i++){const t=i/steps,x=T.MathUtils.lerp(target.x,position.x,t),z=T.MathUtils.lerp(target.z,position.z,t);if(!isClear(x,z)){position.lerpVectors(target,position,Math.max(.05,(i-1)/steps));blocked=true;break;}}
 position.y=Math.min(ceiling-.2,Math.max(position.y,groundHeight(position.x,position.z)+.5));
 return {position,target,blocked};
}
