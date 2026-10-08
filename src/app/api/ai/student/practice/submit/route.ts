import { errorResponse, jsonResponse, requireUser } from '@/lib/server/ai';
export async function POST(request:Request){
 try{
  const {supabase,user}=await requireUser(); const body=await request.json(); const setId=String(body.set_id||''); const answers=body.answers||{};
  const {data:set,error}=await supabase.from('personalized_practice_sets').select('id,questions,status').eq('id',setId).eq('user_id',user.id).single(); if(error) throw error;
  if(set.status==='completed') return jsonResponse({ok:false,error:'ALREADY_COMPLETED',message:'Bài luyện này đã được hoàn thành.'},409);
  const qs=Array.isArray(set.questions)?set.questions:[]; let earned=0,total=0; const details:any[]=[];
  for(let i=0;i<qs.length;i++){const q=qs[i],points=Number(q.points||0.25);total+=points;const a=answers[String(i)];let ok=false;if(q.type==='tf'&&Array.isArray(a)&&Array.isArray(q.answer))ok=a.length===q.answer.length&&a.every((v:any,j:number)=>String(v)===String(q.answer[j]));else ok=String(a??'').trim().toLowerCase()===String(q.answer??'').trim().toLowerCase();if(ok)earned+=points;details.push({index:i,correct:ok,lesson_id:q.lesson_id});}
  const result={score:earned,max_score:total,percent:total?Math.round(earned/total*100):0,details}; const {error:ue}=await supabase.from('personalized_practice_sets').update({status:'completed',completed_at:new Date().toISOString(),result}).eq('id',setId).eq('user_id',user.id);if(ue)throw ue;
  await supabase.from('learning_events').insert({user_id:user.id,event_type:'personalized_practice_completed',payload:{set_id:setId,result}});
  return jsonResponse({ok:true,result});
 }catch(e){return errorResponse(e);}
}
