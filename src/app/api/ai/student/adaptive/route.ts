import { errorResponse, jsonResponse, requireUser } from '@/lib/server/ai';

function clamp(n:number,min=0,max=1){return Math.max(min,Math.min(max,n));}

export async function POST(){
  try{
    const {supabase,user}=await requireUser();
    const {data:attempts,error:ae}=await supabase.from('exam_attempts').select('id,exam_id,score,submitted_at,status').eq('user_id',user.id).eq('status','submitted').order('submitted_at',{ascending:false}).limit(30);
    if(ae) throw ae;
    if(!attempts?.length) return jsonResponse({ok:false,error:'NO_ATTEMPTS',message:'Chưa có bài thi đã nộp để xây dựng lộ trình.'},422);
    const examIds=[...new Set(attempts.map((a:any)=>a.exam_id).filter(Boolean))];
    const {data:examQs}=await supabase.from('exam_questions').select('exam_id,question_id,position,points_override').in('exam_id',examIds);
    const qids=[...new Set((examQs||[]).map((x:any)=>x.question_id))];
    const {data:questions}=qids.length?await supabase.from('question_bank').select('id,lesson_id,type,points,metadata').in('id',qids):{data:[]};
    const {data:curr}=await supabase.from('curriculum').select('id,grade,chapter_title,lesson_title').in('id',[...new Set((questions||[]).map((q:any)=>q.lesson_id).filter(Boolean))]);
    const cmap=new Map((curr||[]).map((x:any)=>[x.id,x]));
    const qmap=new Map((questions||[]).map((x:any)=>[x.id,x]));
    const attemptMap=new Map((attempts||[]).map((a:any)=>[a.id,a]));
    const byLesson=new Map<string,{attempts:number;earned:number;max:number;last:string|null;missed:number;answered:number}>();
    for(const eq of examQs||[]){
      const q=qmap.get(eq.question_id); if(!q?.lesson_id) continue;
      const a=[...attemptMap.values()].find((x:any)=>x.exam_id===eq.exam_id); if(!a) continue;
      const key=q.lesson_id; const cur=byLesson.get(key)||{attempts:0,earned:0,max:0,last:null,missed:0,answered:0};
      const points=Number(eq.points_override??q.points??0.25); cur.max+=points; cur.attempts+=1; cur.last=a.submitted_at;
      const ans=(a.answers||{})[q.id]; const correct=q.answer;
      let ok=false;
      if(q.type==='mcq'||q.type==='short') ok=String(ans??'').trim().toLowerCase()===String(correct??'').trim().toLowerCase();
      else if(q.type==='tf'&&Array.isArray(ans)&&Array.isArray(correct)) ok=ans.length===correct.length&&ans.every((v:any,i:number)=>String(v)===String(correct[i]));
      if(ok) cur.earned+=points; else cur.missed+=1;
      if(ans!==undefined&&ans!==null&&ans!=='') cur.answered+=1;
      byLesson.set(key,cur);
    }
    const mastery=[...byLesson.entries()].map(([lesson_id,x])=>{const score=x.max?clamp(x.earned/x.max):0;const lesson=cmap.get(lesson_id);const severity=score<0.5?'high':score<0.8?'medium':'low';return {lesson_id,lesson_title:lesson?.lesson_title||'Bài học',chapter_title:lesson?.chapter_title||'',grade:lesson?.grade||'',mastery:Math.round(score*100),severity,attempts:x.attempts,missed:x.missed,last:x.last};}).sort((a,b)=>a.mastery-b.mastery);
    const items=mastery.slice(0,8).map((m:any,i:number)=>({order:i+1,lesson_id:m.lesson_id,lesson_title:m.lesson_title,goal:m.mastery<50?'Ôn lại kiến thức nền và làm bài dễ':m.mastery<80?'Củng cố bằng bài tập mức độ vừa':'Luyện vận dụng để duy trì',difficulty:m.mastery<50?'easy':m.mastery<80?'medium':'hard',recommended_questions:m.mastery<50?8:6,estimated_minutes:m.mastery<50?20:15}));
    const summary={lessons:mastery.length,weak:mastery.filter((x:any)=>x.mastery<50).length,review:mastery.filter((x:any)=>x.mastery>=50&&x.mastery<80).length,mastered:mastery.filter((x:any)=>x.mastery>=80).length};
    const {data:plan,error:pe}=await supabase.from('adaptive_learning_plans').insert({user_id:user.id,horizon_days:7,items,summary}).select('id,generated_at,horizon_days,items,summary,status').single();
    if(pe) throw pe;
    await supabase.from('learning_events').insert({user_id:user.id,event_type:'adaptive_plan_generated',payload:{plan_id:plan.id,summary}});
    return jsonResponse({ok:true,plan,mastery});
  }catch(e){return errorResponse(e);}
}
