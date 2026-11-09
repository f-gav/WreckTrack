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
const styleParts=JSON.parse(fs.readFileSync(path.join(src,'style-parts.json'),'utf8'));
const css=styleParts.map(file=>fs.readFileSync(path.join(src,file),'utf8')).join('');
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
const archiveSource=path.join(root,'archive','index.html');
const sharedSwitcher=fs.readFileSync(path.join(src,'ui','project-switcher.js'),'utf8');
const sharedSwitcherCss=fs.readFileSync(path.join(src,'styles','170-project-switcher.css'),'utf8');
const sharedHeaderCss=fs.readFileSync(path.join(src,'styles','180-shared-header.css'),'utf8');
const archiveCss=fs.readFileSync(path.join(root,'archive','archive.css'),'utf8')+'\n'+sharedHeaderCss+'\n'+sharedSwitcherCss;
const archiveJs=fs.readFileSync(path.join(root,'archive','archive.js'),'utf8')+'\n'+sharedSwitcher;
const archiveHash=hashText(archiveCss+':'+archiveJs);
const archiveCssName='archive.'+hashText(archiveCss)+'.css';
const archiveJsName='archive.'+hashText(archiveJs)+'.js';
// Derive Archive's topbar directly from the canonical WreckTrack header.
const sourceHeader=template.match(/<header class="topbar">[\s\S]*?<\/header>/)?.[0];
if(!sourceHeader)throw new Error('Missing WreckTrack topbar template');
const archiveHeader=sourceHeader
  .replace(/<nav class="topnav"[^>]*>[\s\S]*?<\/nav>/,'')
  .replace('<header class="topbar">','<header class="topbar"><button id="mobile-menu" class="archive-menu-toggle" type="button" aria-label="Открыть боковое меню" aria-expanded="false">☰</button>')
  .replace('id="brand-home"','id="project-switch"')
  .replace('aria-label="На главный экран"','aria-label="Переключить приложение"')
  .replace('<span class="brand-name">WreckTrack</span>','<span class="brand-name">WreckArchive</span>')
  .replace('src="./icon64x64.png','src="../icon64x64.png')
  .replace('class="topbar-settings-button"','class="topbar-settings-button" id="settings-button"')
  .replace('title="Данные сохранены на этом устройстве"','title="Настройки оформления сохранены в этом браузере"')
  .replace('id="save-status-label">Сохранено','id="save-status-label">Настройки сохранены');
const archiveDist=path.join(dist,'archive');
fs.mkdirSync(archiveDist,{recursive:true});
const archiveHtml=fs.readFileSync(archiveSource,'utf8')
  .replace('{{WRECK_HEADER}}',archiveHeader)
  .replace('./archive.css','./'+archiveCssName)
  .replace('./archive.js','./'+archiveJsName)
  .replace('<head>','<head><meta name="wreckarchive-build" content="'+archiveHash+'">');
fs.writeFileSync(path.join(archiveDist,'index.html'),archiveHtml);
for(const file of fs.readdirSync(archiveDist)){
  if(/^archive\.[0-9a-f]{12}\.(css|js)$/.test(file))fs.rmSync(path.join(archiveDist,file));
}
fs.writeFileSync(path.join(archiveDist,archiveCssName),archiveCss);
fs.writeFileSync(path.join(archiveDist,archiveJsName),archiveJs);
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
