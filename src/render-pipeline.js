import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';

export function createRenderPipeline(renderer,scene,camera,width,height){
 const composer=new EffectComposer(renderer);
 // One color render followed by color conversion. Avoid the extra full-scene AO pass.
 composer.addPass(new RenderPass(scene,camera));
 composer.addPass(new OutputPass());
 return composer;
}
