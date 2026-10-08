import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const src=path.join(root,'src');
const dist=path.join(root,'dist');
const assets=path.join(dist,'assets');

function hashText(value){
  let a=2166136261,b=2246822519;
  for(let i=0;i<value.length;i++){
    const c=value.charCodeAt(i);
    a=Math.imul(a^c,16777619);
    b=Math.imul(b^c,3266489917);
  }
  return (a>>>0).toString(16).padStart(8,'0')+(b>>>0).toString(16).padStart(8,'0').slice(0,4);
}

const template=fs.readFileSync(path.join(src,'index.html'),'utf8');
const css=fs.readFileSync(path.join(src,'styles','app.css'),'utf8');
const appParts=JSON.parse(fs.readFileSync(path.join(src,'app-parts.json'),'utf8'));
const js=appParts.map(file=>fs.readFileSync(path.join(src,file),'utf8')).join('\n');
const swTemplate=fs.readFileSync(path.join(src,'service-worker.js'),'utf8');
const manifest=fs.readFileSync(path.join(src,'manifest.webmanifest'),'utf8');

const cssHash=hashText(css);
const jsHash=hashText(js);
const buildId=hashText(cssHash+':'+jsHash);
const cssName='app.'+cssHash+'.css';
const jsName='app.'+jsHash+'.js';
const cssRel='./assets/'+cssName;
const jsRel='./assets/'+jsName;
const directRoutes=['rooms','bestiary','library','tokenator','settings'];

fs.mkdirSync(assets,{recursive:true});
const sourceFonts=path.join(src,'fonts');
const assetFonts=path.join(assets,'fonts');
fs.rmSync(assetFonts,{recursive:true,force:true});
fs.mkdirSync(assetFonts,{recursive:true});
for(const name of fs.readdirSync(sourceFonts)){
  fs.copyFileSync(path.join(sourceFonts,name),path.join(assetFonts,name));
}
fs.rmSync(path.join(dist,'fonts'),{recursive:true,force:true});
for(const name of fs.readdirSync(assets)){
  if(/^app\.[0-9a-f]{12}\.(?:css|js)$/.test(name))fs.rmSync(path.join(assets,name));
}
fs.writeFileSync(path.join(assets,cssName),css);
fs.writeFileSync(path.join(assets,jsName),js);

const outHtml=template.replaceAll('{{APP_CSS}}',cssRel).replaceAll('{{APP_JS}}',jsRel);
fs.writeFileSync(path.join(dist,'index.html'),outHtml);
fs.writeFileSync(path.join(dist,'manifest.webmanifest'),manifest);
for(const route of directRoutes){
  const routeDir=path.join(dist,route);
  fs.rmSync(routeDir,{recursive:true,force:true});
  fs.mkdirSync(routeDir,{recursive:true});
  const routeHtml=outHtml.replace('<head>','<head>\n  <base href="../">');
  fs.writeFileSync(path.join(routeDir,'index.html'),routeHtml);
}

const outSw=swTemplate
  .replaceAll('{{CACHE_NAME}}','wrecktrack-static-'+buildId)
  .replaceAll('{{APP_CSS}}',cssRel)
  .replaceAll('{{APP_JS}}',jsRel);
fs.writeFileSync(path.join(dist,'service-worker.js'),outSw);

console.log('Built WreckTrack', {buildId,css:cssName,js:jsName});
