import {canOccupy} from './campus.js';
import {walkHeight} from './terrain.js';
export class PlayerController{
 constructor(position,colliders){this.colliders=colliders;this.position={x:position.x,y:walkHeight(position.x,position.z),z:position.z};this.velocityY=0;this.grounded=true;this.moving=false;this.heading=0;}
 reset(position){this.position.x=position.x;this.position.z=position.z;this.position.y=walkHeight(position.x,position.z);this.velocityY=0;this.grounded=true;this.moving=false;}
 jump(){if(!this.grounded)return false;this.velocityY=6.3;this.grounded=false;return true;}
 update(input,yaw,dt){let remaining=Math.min(dt,.15);this.moving=false;while(remaining>1e-7){const step=Math.min(remaining,1/90);remaining-=step;this.step(input,yaw,step);}return this.position;}
 step(input,yaw,dt){let dx=-Math.sin(yaw)*input.forward+Math.cos(yaw)*input.right,dz=-Math.cos(yaw)*input.forward-Math.sin(yaw)*input.right;const magnitude=Math.hypot(dx,dz),p=this.position;
  if(magnitude){const amount=(input.run?6:3.2)*dt;dx=dx/magnitude*amount;dz=dz/magnitude*amount;const oldX=p.x,oldZ=p.z;
   const supported=(x,z)=>canOccupy(x,z,this.colliders,.36)&&(!this.grounded||walkHeight(x,z)-p.y<.32);
   if(supported(p.x+dx,p.z))p.x+=dx;if(supported(p.x,p.z+dz))p.z+=dz;
   if(Math.hypot(p.x-oldX,p.z-oldZ)>1e-6){this.moving=true;this.heading=Math.atan2(-(p.x-oldX),-(p.z-oldZ));}
  }
  const ground=walkHeight(p.x,p.z);
  if(this.grounded&&p.y-ground<.32){p.y=ground;this.velocityY=0;return;}
  this.grounded=false;p.y+=this.velocityY*dt-.5*18*dt*dt;this.velocityY-=18*dt;
  if(p.y<=ground&&this.velocityY<=0){p.y=ground;this.velocityY=0;this.grounded=true;}
 }
}
