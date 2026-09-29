import fs from 'node:fs';

export function loadAppSource(){
  const template=fs.readFileSync(new URL('../src/index.html',import.meta.url),'utf8');
  const css=fs.readFileSync(new URL('../src/styles/app.css',import.meta.url),'utf8');
  const js=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
  return template+'\n<style>'+css+'</style>\n<script>'+js+'</script>';
}
