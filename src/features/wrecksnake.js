/* WreckSnake — independent mini-game; never mutates the WreckTrack archive. */
const SNAKE_COLORS={violet:'#b995ff',mint:'#74e5bd',cyan:'#78d8ff',coral:'#ff8d9d',amber:'#ffcc79'};
const SNAKE_COLOR_KEY='wrecksnake-color-v1',SNAKE_BEST_KEY='wrecksnake-best-v1';
const snakeSize=20,snakeCell=19;
let snakeBody=[],snakeFood=null,snakeDirection=[1,0],snakeNextDirection=[1,0],snakeScore=0,
    snakeStatus='ready',snakeTimer=null,snakeColor='violet',snakeBest=0,snakeStartedAt=0,snakeMoves=[],snakeSeed=null,snakeSessionId=null,snakePreparing=false;
function snakeStorage(key,fallback){try{return localStorage.getItem(key)||fallback}catch(_){return fallback}}
function snakePersist(key,value){try{localStorage.setItem(key,value)}catch(_){}}
function snakeRandomFood(){const free=[];for(let y=0;y<snakeSize;y++)for(let x=0;x<snakeSize;x++)if(!snakeBody.some(p=>p.x===x&&p.y===y))free.push({x,y});if(snakeSeed!==null){snakeSeed=(Math.imul(snakeSeed,1664525)+1013904223)>>>0;return free.length?free[snakeSeed%free.length]:null}return free.length?free[Math.floor(Math.random()*free.length)]:null}
function snakeReset(){
  snakeBody=[{x:7,y:10},{x:6,y:10},{x:5,y:10}];snakeDirection=[1,0];snakeNextDirection=[1,0];
  snakeSeed=null;snakeSessionId=null;snakeFood=snakeRandomFood();snakeScore=0;snakeMoves=[];snakeStartedAt=0;snakeStatus='ready';
  snakeStop();snakeUpdateDisplay();snakeDraw();
}
function snakeStop(){if(snakeTimer!==null){clearInterval(snakeTimer);snakeTimer=null}}
async function snakeStart(){
  if(snakePreparing||snakeStatus==='playing')return;
  if(snakeStatus==='over'||snakeStatus==='won')snakeReset();
  if(snakeStatus==='ready'&&authSession?.user&&authClient?.functions){
    snakePreparing=true;const label=el('snake-hint');if(label)label.textContent='Подключаем рейтинговую партию…';
    try{
      const {data,error}=await authClient.functions.invoke('wrecksnake',{body:{action:'start'}});
      if(!error&&data?.sessionId&&Number.isInteger(Number(data.seed))){
        snakeSeed=Number(data.seed)>>>0;snakeSessionId=data.sessionId;snakeFood=snakeRandomFood();
      }else if(label)label.textContent='Рейтинг недоступен — играем локально';
    }catch(_){if(label)label.textContent='Нет связи — играем локально'}
    finally{snakePreparing=false}
  }
  if(!el('snake-dialog')?.open&&typeof document!=='undefined')return;
  snakeStatus='playing';if(!snakeStartedAt)snakeStartedAt=Date.now();
  snakeStop();snakeTimer=setInterval(snakeTick,115);snakeUpdateDisplay();snakeDraw();
}
function snakePause(){if(snakeStatus==='playing'){snakeStatus='paused';snakeStop()}else if(snakeStatus==='paused'){snakeStart()}snakeUpdateDisplay();snakeDraw()}
function snakeSetDirection(dx,dy){
  if(snakeStatus!=='playing'&&snakeStatus!=='ready')return;
  if(dx===-snakeDirection[0]&&dy===-snakeDirection[1])return;
  snakeNextDirection=[dx,dy];
}
function snakeTick(){
  if(snakeStatus!=='playing')return;
  snakeDirection=snakeNextDirection;
  if(snakeSessionId)snakeMoves.push(snakeDirection[0]===1?0:snakeDirection[1]===1?1:snakeDirection[0]===-1?2:3);
  const head={x:snakeBody[0].x+snakeDirection[0],y:snakeBody[0].y+snakeDirection[1]};
  const ate=snakeFood&&head.x===snakeFood.x&&head.y===snakeFood.y;
  const collisionCells=ate?snakeBody:snakeBody.slice(0,-1);
  if(head.x<0||head.y<0||head.x>=snakeSize||head.y>=snakeSize||collisionCells.some(p=>p.x===head.x&&p.y===head.y)){snakeEnd('over');return}
  snakeBody.unshift(head);if(ate){snakeScore+=10;snakeFood=snakeRandomFood();if(!snakeFood){snakeEnd('won');return}}else snakeBody.pop();
  snakeUpdateDisplay();snakeDraw();
}
function snakeEnd(result){
  snakeStatus=result;snakeStop();const newBest=snakeScore>snakeBest;
  if(newBest){snakeBest=snakeScore;snakePersist(SNAKE_BEST_KEY,String(snakeBest))}
  snakeUpdateDisplay();snakeDraw();snakeOnGameOver(snakeScore,Date.now()-snakeStartedAt,snakeSessionId,[...snakeMoves]);
}
function snakeUpdateDisplay(){
  const score=el('snake-score'),best=el('snake-best'),start=el('snake-start'),hint=el('snake-hint');
  if(score)score.textContent=String(snakeScore);if(best)best.textContent=String(snakeBest);
  if(start)start.textContent=snakeStatus==='playing'?'Пауза':snakeStatus==='paused'?'Продолжить':snakeStatus==='over'||snakeStatus==='won'?'Ещё раз':'Играть';
  if(hint)hint.textContent={ready:'Нажмите «Играть», чтобы начать',playing:'Собирайте светящиеся точки',paused:'Пауза',over:'Игра окончена · результат '+snakeScore,won:'Поле заполнено! Победа'}[snakeStatus];
}
function snakeDraw(){
  const canvas=el('snake-canvas');if(!canvas)return;
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const size=snakeSize*snakeCell,light=SNAKE_COLORS[snakeColor]||SNAKE_COLORS.violet;
  ctx.clearRect(0,0,size,size);ctx.fillStyle='#0d1016';ctx.fillRect(0,0,size,size);
  ctx.strokeStyle='rgba(177,187,214,.075)';ctx.lineWidth=1;
  for(let n=1;n<snakeSize;n++){ctx.beginPath();ctx.moveTo(n*snakeCell+.5,0);ctx.lineTo(n*snakeCell+.5,size);ctx.moveTo(0,n*snakeCell+.5);ctx.lineTo(size,n*snakeCell+.5);ctx.stroke()}
  if(snakeFood){const fx=snakeFood.x*snakeCell+snakeCell/2,fy=snakeFood.y*snakeCell+snakeCell/2;ctx.shadowColor='#ffe3a8';ctx.shadowBlur=17;ctx.fillStyle='#ffce81';ctx.beginPath();ctx.arc(fx,fy,5.5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0}
  ctx.shadowColor=light;ctx.shadowBlur=12;snakeBody.forEach((part,i)=>{ctx.globalAlpha=i===0?1:Math.max(.46,1-i*.027);ctx.fillStyle=light;ctx.beginPath();ctx.roundRect(part.x*snakeCell+2,part.y*snakeCell+2,snakeCell-4,snakeCell-4,5);ctx.fill()});
  ctx.globalAlpha=1;ctx.shadowBlur=0;
  if(snakeStatus!=='playing'){ctx.fillStyle='rgba(9,11,17,.52)';ctx.fillRect(0,0,size,size);ctx.textAlign='center';ctx.fillStyle='#f2eff8';ctx.font='600 17px system-ui';ctx.fillText(({ready:'WRECKSNAKE',paused:'ПАУЗА',over:'КОНЕЦ ИГРЫ',won:'ПОБЕДА'})[snakeStatus],size/2,size/2)}
}
function snakeOpen(){
  const dialog=el('snake-dialog');if(!dialog)return;
  if(el('auth-dialog')?.open)el('auth-dialog').close();
  snakeColor=snakeStorage(SNAKE_COLOR_KEY,'violet');if(!SNAKE_COLORS[snakeColor])snakeColor='violet';
  snakeBest=Math.max(0,Number(snakeStorage(SNAKE_BEST_KEY,'0'))||0);
  snakeReset();snakeRenderColors();snakeRefreshLeaderboard();dialog.showModal();
}
function snakeClose(){snakeStop();el('snake-dialog')?.close()}
function snakeRenderColors(){
  const buttons=el('snake-colors');if(!buttons)return;
  buttons.innerHTML=Object.entries(SNAKE_COLORS).map(([id,color])=>'<button type="button" class="snake-color'+(id===snakeColor?' current':'')+'" data-snake-color="'+id+'" style="--snake-choice:'+color+'" aria-label="Цвет змейки: '+id+'" aria-pressed="'+(id===snakeColor)+'"></button>').join('');
  snakeDraw();
}
function registerSnakeEvents(){
  document.addEventListener('click',e=>{
    if(e.target.closest('#open-snake')){snakeOpen();return}
    if(e.target.closest('#snake-close')){snakeClose();return}
    if(e.target.closest('#snake-start')){if(snakeStatus==='playing'||snakeStatus==='paused')snakePause();else snakeStart();return}
    if(e.target.closest('#snake-restart')){snakeReset();snakeStart();return}
    const color=e.target.closest('[data-snake-color]');if(color){snakeColor=color.dataset.snakeColor;snakePersist(SNAKE_COLOR_KEY,snakeColor);snakeRenderColors();return}
    const move=e.target.closest('[data-snake-direction]');if(move){const dir={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[move.dataset.snakeDirection];if(dir)snakeSetDirection(...dir)}
  });
  document.addEventListener('keydown',e=>{
    if(!el('snake-dialog')?.open||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
    const directions={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],KeyW:[0,-1],KeyS:[0,1],KeyA:[-1,0],KeyD:[1,0]};
    const dir=directions[e.code];if(dir){e.preventDefault();snakeSetDirection(...dir);return}
    if(e.code==='Space'){e.preventDefault();if(snakeStatus==='ready'||snakeStatus==='over')snakeStart();else snakePause()}
  });
  let touch=null;const canvas=el('snake-canvas');
  canvas?.addEventListener('touchstart',e=>{const p=e.changedTouches[0];touch={x:p.clientX,y:p.clientY}},{passive:true});
  canvas?.addEventListener('touchend',e=>{if(!touch)return;const p=e.changedTouches[0],dx=p.clientX-touch.x,dy=p.clientY-touch.y;touch=null;if(Math.max(Math.abs(dx),Math.abs(dy))<22)return;if(Math.abs(dx)>Math.abs(dy))snakeSetDirection(Math.sign(dx),0);else snakeSetDirection(0,Math.sign(dy))},{passive:true});
  el('snake-dialog')?.addEventListener('close',snakeStop);
}
async function snakeOnGameOver(score,duration,sessionId,moves){
  if(!sessionId||!authClient?.functions)return;
  const node=el('snake-leaderboard');if(node)node.textContent='Проверяем результат на сервере…';
  try{
    const {data,error}=await authClient.functions.invoke('wrecksnake',{body:{action:'finish',sessionId,moves}});
    if(error||!data?.ok){if(node)node.textContent='Не удалось записать результат. Личный локальный рекорд сохранён.';return}
    await snakeRefreshLeaderboard();
  }catch(_){if(node)node.textContent='Нет связи с рейтингом. Личный рекорд сохранён локально.'}
}
async function snakeRefreshLeaderboard(){
  const node=el('snake-leaderboard');if(!node)return;
  if(!authSession?.user||!authClient?.functions){node.textContent='Войдите через Google для участия в общем рейтинге.';return}
  node.textContent='Загружаем общий рейтинг…';
  try{
    const {data,error}=await authClient.functions.invoke('wrecksnake',{body:{action:'leaderboard'}});
    if(error||!Array.isArray(data?.leaders)){node.textContent='Рейтинг временно недоступен';return}
    const rows=data.leaders.slice(0,20);node.replaceChildren();
    if(!rows.length){node.textContent='Рейтинг пока пуст — станьте первым!';return}
    const list=document.createElement('ol');list.className='snake-rank-list';
    for(const item of rows){const li=document.createElement('li');const name=document.createElement('span');const points=document.createElement('strong');name.textContent=item.name;points.textContent=String(item.score);li.append(name,points);list.append(li)}
    node.append(list);
  }catch(_){node.textContent='Рейтинг временно недоступен'}
}
