import games from './content.json' with { type: 'json' };
const origin='https://thatyslpv-code.github.io';
const cors={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS','Content-Type':'application/json','Cache-Control':'no-store'};
const school=/^[^@\s]+@colegiointernacional\.edu\.mx$/;
const teacher='mlopezp@colegiointernacional.edu.mx';
const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:cors});
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response(null,{headers:cors});
 if(req.method!=='POST')return reply({error:'POST required.'},405);
 try{
  const base=Deno.env.get('SUPABASE_URL'),secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const authorization=req.headers.get('authorization')||'';
  if(!/^Bearer .+/i.test(authorization))return reply({error:'Sign in with your verified school email.'},401);
  const identity=await fetch(base+'/auth/v1/user',{headers:{apikey:secret,authorization}});
  if(!identity.ok)return reply({error:'Session expired. Sign in again.'},401);
  const user=await identity.json();const email=String(user.email||'').toLowerCase();
  if(!school.test(email)||!user.email_confirmed_at)return reply({error:'A verified @colegiointernacional.edu.mx account is required.'},403);
  const raw=await req.text();if(raw.length>24000)return reply({error:'Request too large.'},413);const b=JSON.parse(raw);
  const headers={apikey:secret,authorization:'Bearer '+secret,'Content-Type':'application/json',Prefer:'return=representation'};
  const endpoint=base+'/rest/v1/classroom_game_attempts';
  async function db(path,method='GET',body){const r=await fetch(endpoint+path,{method,headers,body:body?JSON.stringify(body):undefined});if(!r.ok)throw Error('Database temporarily unavailable.');return r.status===204?[]:await r.json()}
  const summary=row=>({id:row.id,student_name:row.student_name,student_group:row.student_group,student_email:row.student_email,game_id:row.game_id,score:row.score,max_score:40,grade:row.score/4,completed:row.completed,tasks:row.tasks,extras:row.extras,created_at:row.created_at,updated_at:row.updated_at});
  if(b.action==='whoami')return reply({email,teacher:email===teacher});
  if(b.action==='list'){
   if(email!==teacher)return reply({error:'Teacher access only.'},403);
   let filter=b.game_id&&games[b.game_id]?'&game_id=eq.'+encodeURIComponent(b.game_id):'';
   const rows=await db('?select=*&order=updated_at.desc&limit=1000'+filter);return reply({results:rows.map(summary)});
  }
  if(b.action==='start'){
   const game=games[b.game_id];if(!game||typeof b.name!=='string'||b.name.trim().length<3||b.name.trim().length>100)return reply({error:'Enter your full name and choose a valid game.'},400);
   let rows=await db('?user_id=eq.'+user.id+'&game_id=eq.'+b.game_id+'&completed=eq.false&order=created_at.desc&limit=1');
   if(!rows.length)rows=await db('','POST',{user_id:user.id,student_email:email,student_name:b.name.trim(),student_group:game.group,game_id:b.game_id});
   const tasks=game.tasks.map(q=>({prompt:q.prompt,options:q.options,parts:q.parts}));
   return reply({attempt:summary(rows[0]),game:{title:game.title,group:game.group,tasks,extras:game.extras.map(q=>({prompt:q.prompt}))}});
  }
  if(typeof b.attempt_id!=='string'||!/^[0-9a-f-]{36}$/.test(b.attempt_id))return reply({error:'Invalid attempt.'},400);
  const rows=await db('?id=eq.'+b.attempt_id+'&user_id=eq.'+user.id+'&limit=1');const row=rows[0];if(!row)return reply({error:'Attempt not found.'},404);
  const game=games[row.game_id];
  async function update(patch){const changed=await db('?id=eq.'+row.id+'&user_id=eq.'+user.id+'&version=eq.'+row.version,'PATCH',{...patch,version:row.version+1,updated_at:new Date().toISOString()});return changed[0]}
  if(b.action==='answer'){
   if(row.completed)return reply({error:'This attempt is already complete.'},409);
   const n=b.index;if(!Number.isInteger(n)||n<0||n>=20)return reply({error:'Invalid mission.'},400);
   const tasks=row.tasks;const current=tasks.findIndex(x=>!x.correct);const next=current<0?tasks.length:current;
   if(n!==next)return reply({error:'Complete the current mission first. Reopen the game to resume.'},409);
   if(typeof b.explanation!=='string'||b.explanation.trim().length<12||b.explanation.length>1200)return reply({error:'Explain your answer in a complete phrase.'},400);
   const q=game.tasks[n];let correct=false;
   if(q.options){if(!Number.isInteger(b.response)||b.response<0||b.response>=q.options.length)return reply({error:'Choose an answer.'},400);correct=b.response===q.answer}
   else {const order=b.response;if(!Array.isArray(order)||order.length!==q.parts.length||new Set(order).size!==q.parts.length||!order.every(k=>Number.isInteger(k)&&k>=0&&k<q.parts.length))return reply({error:'Use every block exactly once.'},400);correct=order[0]===0&&order[order.length-1]===q.parts.length-1}
   const old=tasks[n]||{attempts:0};tasks[n]={attempts:old.attempts+1,correct,points:correct?(old.attempts===0?2:1):0,response:b.response,explanation:b.explanation.trim()};
   const score=tasks.reduce((sum,x)=>sum+x.points,0);const changed=await update({tasks,score});if(!changed)return reply({error:'Another tab changed this attempt. Reopen to resume.'},409);
   return reply({correct,feedback:q.why,attempt:summary(changed)});
  }
  if(b.action==='finish'){
   if(row.tasks.length!==20||!row.tasks.every(x=>x.correct))return reply({error:'Complete all 20 missions before finishing.'},400);
   if(row.completed)return reply({saved:true,attempt:summary(row)});
   const changed=await update({completed:true});if(!changed)return reply({error:'Attempt changed. Retry finishing.'},409);return reply({saved:true,attempt:summary(changed)});
  }
  if(b.action==='extra'){
   if(!row.completed)return reply({error:'Finish the main missions first.'},400);
   if(!Number.isInteger(b.index)||b.index<0||b.index>=5||typeof b.writing!=='string'||b.writing.trim().length<12||b.writing.length>2000||typeof b.explanation!=='string'||b.explanation.trim().length<12||b.explanation.length>1200)return reply({error:'Write your answer and explanation.'},400);
   const extras=row.extras;extras[b.index]={writing:b.writing.trim(),explanation:b.explanation.trim()};const changed=await update({extras});if(!changed)return reply({error:'Attempt changed. Try again.'},409);
   return reply({saved:true,feedback:game.extras[b.index].why,model:game.extras[b.index].model,attempt:summary(changed)});
  }
  return reply({error:'Unknown action.'},400);
 }catch{return reply({error:'Could not process this request. Please try again.'},400)}
});
