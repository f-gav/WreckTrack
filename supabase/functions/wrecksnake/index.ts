import { createClient } from "jsr:@supabase/supabase-js@2";

const url=Deno.env.get("SUPABASE_URL")||"";
const serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
const db=createClient(url,serviceKey,{auth:{autoRefreshToken:false,persistSession:false}});
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization,apikey,content-type,x-client-info","Access-Control-Allow-Methods":"POST,OPTIONS","Content-Type":"application/json"};
const send=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:cors});
const WIDTH=20,MAX_TICKS=4000,MAX_SCORE=4000;
type Pt={x:number,y:number};
function nextRandom(seed:number){return (Math.imul(seed,1664525)+1013904223)>>>0}
function foodPlacement(body:Pt[],seed:number):{food:Pt|null,seed:number}{
  const free:Pt[]=[];for(let y=0;y<WIDTH;y++)for(let x=0;x<WIDTH;x++)if(!body.some(p=>p.x===x&&p.y===y))free.push({x,y});
  seed=nextRandom(seed);return{food:free.length?free[seed%free.length]:null,seed};
}
function validateGame(seed:number,moves:number[]):{valid:boolean,score:number,ended:boolean}{
  if(!Array.isArray(moves)||moves.length<1||moves.length>MAX_TICKS)return{valid:false,score:0,ended:false};
  let body:Pt[]=[{x:7,y:10},{x:6,y:10},{x:5,y:10}],direction=0,score=0,ended=false;
  let state=foodPlacement(body,seed);
  const vectors=[[1,0],[0,1],[-1,0],[0,-1]];
  for(let i=0;i<moves.length;i++){
    const requested=moves[i];
    if(!Number.isInteger(requested)||requested<0||requested>3)return{valid:false,score,ended:false};
    if(requested!==direction&&(requested+2)%4===direction)return{valid:false,score,ended:false};
    direction=requested;
    const head={x:(body[0].x+vectors[direction][0]+WIDTH)%WIDTH,y:(body[0].y+vectors[direction][1]+WIDTH)%WIDTH};
    const ate=Boolean(state.food&&head.x===state.food.x&&head.y===state.food.y);
    const collisions=ate?body:body.slice(0,-1);
    if(collisions.some(p=>p.x===head.x&&p.y===head.y)){
      ended=true;break;
    }
    body.unshift(head);
    if(ate){score+=1;state=foodPlacement(body,state.seed);if(!state.food){ended=true;break}}
    else body.pop();
  }
  return{valid:ended,score,ended};
}
Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors});
  if(req.method!=="POST")return send({error:"Method not allowed"},405);
  try{
    const jwt=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");
    if(!jwt)return send({error:"Sign in required"},401);
    const auth=await db.auth.getUser(jwt);const user=auth.data.user;
    if(!user||auth.error)return send({error:"Invalid session"},401);
    const body=await req.json();const action=String(body?.action||"");
    if(action==="leaderboard"){
      const {data,error}=await db.from("wrecksnake_scores").select("nickname,best_score,games_played").order("best_score",{ascending:false}).order("updated_at",{ascending:true}).limit(20);
      if(error)return send({error:"Leaderboard unavailable"},503);
      const {data:mine}=await db.from("wrecksnake_scores").select("best_score,games_played").eq("user_id",user.id).maybeSingle();
      return send({leaders:(data||[]).map((r,i)=>({rank:i+1,name:r.nickname,score:r.best_score,games:r.games_played})),mine:mine||null});
    }
    if(action==="start"){
      // Limit unfinished challenges to avoid unbounded writes and rapid scripted resets.
      const cutoff=new Date(Date.now()-60000).toISOString();
      const {count}=await db.from("wrecksnake_sessions").select("id",{head:true,count:"exact"}).eq("user_id",user.id).gte("created_at",cutoff);
      if((count||0)>=8)return send({error:"Слишком много новых партий. Подождите минуту."},429);
      const seed=crypto.getRandomValues(new Uint32Array(1))[0];
      const {data,error}=await db.from("wrecksnake_sessions").insert({user_id:user.id,seed}).select("id,seed").single();
      if(error||!data)return send({error:"Не удалось начать рейтинговую игру"},503);
      return send({sessionId:data.id,seed:data.seed});
    }
    if(action==="finish"){
      const sessionId=String(body?.sessionId||"");
      if(!/^[0-9a-f-]{36}$/i.test(sessionId))return send({error:"Invalid session ID"},400);
      const moves=body?.moves;
      if(!Array.isArray(moves)||moves.length>MAX_TICKS)return send({error:"Invalid replay"},400);
      const {data:session,error}=await db.from("wrecksnake_sessions").select("id,seed,created_at,completed_at").eq("id",sessionId).eq("user_id",user.id).maybeSingle();
      if(error||!session||session.completed_at)return send({error:"Session expired or already completed"},409);
      const elapsed=Date.now()-Date.parse(session.created_at);
      if(elapsed>1000*60*30||elapsed<Math.max(0,moves.length*70-2000))return send({error:"Invalid game timing"},400);
      const result=validateGame(Number(session.seed),moves);
      if(!result.valid||result.score>MAX_SCORE)return send({error:"Replay did not describe a finished game"},400);
      const nickname="Игрок "+user.id.slice(0,8);
      const {data:stored,error:saveError}=await db.rpc("record_wrecksnake_score",{p_session:sessionId,p_user:user.id,p_score:result.score,p_ticks:moves.length,p_nickname:nickname});
      if(saveError||stored!==true)return send({error:"Не удалось сохранить результат"},503);
      return send({ok:true,score:result.score});
    }
    return send({error:"Unknown action"},400);
  }catch(_){return send({error:"Game service unavailable"},500)}
});
