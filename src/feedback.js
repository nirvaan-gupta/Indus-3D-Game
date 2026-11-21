// Short landing pulses where the browser/device supports vibration. Desktop
// trackpads cannot be driven by the browser Vibration API.
export class MovementFeedback {
 constructor(){this.context=null;this.distance=0;this.last=null;this.wasGrounded=true;this.reduced=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;}
 start(){try{const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;if(Audio){this.context??=new Audio();this.context.resume().catch(()=>{});}}catch{}}
 pulse(ms){try{if(!this.reduced)navigator.vibrate?.(ms);}catch{}}
 footstep(strength=1){const c=this.context;if(!c||c.state!=='running')return;const source=c.createBufferSource(),buffer=c.createBuffer(1,Math.floor(c.sampleRate*.065),c.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.exp(-i/data.length*7);source.buffer=buffer;const filter=c.createBiquadFilter();filter.type='lowpass';filter.frequency.value=650;const gain=c.createGain();gain.gain.value=.075*strength;source.connect(filter).connect(gain).connect(c.destination);source.start();source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};}
 update(position,grounded,active){if(this.last&&active){const travelled=Math.hypot(position.x-this.last.x,position.z-this.last.z);if(grounded&&this.wasGrounded)this.distance+=Math.min(travelled,.9);if(this.distance>.95){this.distance%=.95;this.footstep();}if(grounded&&!this.wasGrounded){this.footstep(1.6);this.pulse(24);}}else this.distance=0;this.last={x:position.x,z:position.z};this.wasGrounded=grounded;}
}
