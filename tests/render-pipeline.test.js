import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createRenderPipeline} from '../src/render-pipeline.js';

test('first-person pipeline draws campus color without an uninitialized effect buffer and outputs that populated buffer',()=>{
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(64,16/9,.08,650);
 scene.add(new T.Mesh(new T.BoxGeometry(),new T.MeshStandardMaterial()));
 let target=null,clearColor=new T.Color(),clearAlpha=1;
 const calls=[],populated=new Set();
 const renderer={
  autoClear:true,outputColorSpace:T.SRGBColorSpace,toneMapping:T.ACESFilmicToneMapping,toneMappingExposure:.85,
  getPixelRatio:()=>1,getSize:v=>v.set(640,360),getRenderTarget:()=>target,
  setRenderTarget:t=>{target=t},getClearColor:c=>c.copy(clearColor),getClearAlpha:()=>clearAlpha,setClearAlpha:a=>{clearAlpha=a},
  setClearColor:(c,a)=>{clearColor.set(c);if(a!==undefined)clearAlpha=a},
  clear:()=>{},clearDepth:()=>{},
  render:(object)=>{if(object===scene){calls.push(scene.overrideMaterial?'normals':'campus');if(!scene.overrideMaterial)populated.add(target.texture)}else if(object.material?.name==='OutputShader'){
   assert.ok(populated.has(object.material.uniforms.tDiffuse.value),'Output must read the rendered campus, not an empty buffer');calls.push('output');
  }},
 };
 const pipeline=createRenderPipeline(renderer,scene,camera,640,360);
 pipeline.render(1/60);
 assert.deepEqual(calls,['campus','output']);
 assert.equal(target,null,'Render target restored after rendering');
 camera.aspect=4/3;camera.updateProjectionMatrix();pipeline.setSize(800,600);
 assert.equal(pipeline.readBuffer.width,800);assert.equal(pipeline.readBuffer.height,600);
 pipeline.dispose();pipeline.passes.forEach(pass=>pass.dispose?.());
});
