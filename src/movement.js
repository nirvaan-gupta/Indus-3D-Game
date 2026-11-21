export const JUMP_SPEED=6.5,GRAVITY=18;
export function startJump(state){if(state.height===0){state.velocity=JUMP_SPEED;return true}return false}
export function stepJump(state,dt){if(state.height>0||state.velocity>0){state.height+=state.velocity*dt-.5*GRAVITY*dt*dt;state.velocity-=GRAVITY*dt;if(state.height<=0){state.height=0;state.velocity=0}}}
