import fs from 'node:fs';

export function loadAppSource(){
  const template=fs.readFileSync(new URL('../src/index.html',import.meta.url),'utf8');
  const css=fs.readFileSync(new URL('../src/styles/app.css',import.meta.url),'utf8');
  const parts=JSON.parse(fs.readFileSync(new URL('../src/app-parts.json',import.meta.url),'utf8'));
  const js=parts.map(file=>fs.readFileSync(new URL('../src/'+file,import.meta.url),'utf8')).join('\n');
  return template+'\n<style>'+css+'</style>\n<script>'+js+'</script>';
}
