import {writeFile,mkdir} from 'node:fs/promises';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {createCampus} from '../src/campus.js';
// Three's exporter uses the browser FileReader API for binary buffers.
globalThis.FileReader=class {readAsArrayBuffer(blob){blob.arrayBuffer().then(result=>{this.result=result;this.onloadend?.()})}readAsDataURL(blob){blob.arrayBuffer().then(result=>{this.result=`data:${blob.type};base64,${Buffer.from(result).toString('base64')}`;this.onloadend?.()})}};
const {root}=createCampus();root.updateMatrixWorld(true);
const data=await new GLTFExporter().parseAsync(root,{binary:true,onlyVisible:true});
await mkdir('public/models',{recursive:true});await writeFile('public/models/indus-campus.glb',Buffer.from(data));
console.log(`Exported public/models/indus-campus.glb (${data.byteLength.toLocaleString()} bytes)`);
