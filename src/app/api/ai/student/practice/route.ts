import { callOpenAI, errorResponse, jsonResponse, logAi, requireUser, parseJsonLoose } from '@/lib/server/ai';

export async function POST(request: Request) {
  try {
    const {supabase,user}=await requireUser(request);
    const body=await request.json().catch(()=>({}));
    const count=Math.min(Math.max(Number(body.count||10),3),20);
    const {data:profile}=await supabase.from('student_learning_profile').select('gaps,recommendations').eq('user_id',user.id).maybeSingle();
    const gaps=Array.isArray(profile?.gaps)?profile.gaps:[];
    if(!gaps.length) return jsonResponse({ok:false,error:'NO_LEARNING_PROFILE',message:'Hãy phân tích ít nhất một bài thi trước khi tạo bài luyện cá nhân hóa.'},422);
    const lessonIds=gaps.map((g:any)=>g.lesson_id).filter(Boolean);
    const {data:lessons}=lessonIds.length?await supabase.from('curriculum').select('id,grade,chapter_title,lesson_title').in('id',lessonIds):{data:[]};
    const lessonMap=new Map((lessons||[]).map((x:any)=>[x.id,x]));
    const context=gaps.map((g:any)=>({...g,lesson:lessonMap.get(g.lesson_id)||null}));
    const {data:bank}=await supabase.from('question_bank').select('id,lesson_id,type,prompt,options,answer,points').in('lesson_id',lessonIds).eq('status','published').limit(60);
    const existing=(bank||[]).slice(0,30).map((q:any)=>({id:q.id,lesson_id:q.lesson_id,type:q.type,prompt:q.prompt,options:q.options,points:q.points}));
    const ai=await callOpenAI(JSON.stringify({count,gaps:context,existing_questions:existing}),'Bạn là AI thiết kế bài luyện cá nhân hóa KHTN SỐ. Dựa trên lỗ hổng có bằng chứng, tạo JSON gồm title, instructions, questions. Mỗi question có type (mcq/tf/short), lesson_id, prompt, options (nếu có), answer, explanation, points. Không sao chép nguyên văn existing_questions; tăng dần từ dễ đến vừa. Chỉ dùng lesson_id được cung cấp. Trả JSON thuần.');
    const set=parseJsonLoose(ai.text);
    const questions=Array.isArray(set.questions)?set.questions.slice(0,count):[];
    if(!questions.length) throw new Error('AI_INVALID_JSON');
    const {data:saved,error:se}=await supabase.from('personalized_practice_sets').insert({user_id:user.id,title:set.title||'Bài luyện cá nhân hóa',instructions:set.instructions||'',questions,source_gaps:gaps,status:'ready'}).select('id,title,instructions,questions,created_at').single();
    if(se) throw se;
    await supabase.from('learning_events').insert({user_id:user.id,event_type:'personalized_practice_created',payload:{set_id:saved.id,count:questions.length,lesson_ids:lessonIds}});
    await logAi(supabase,user.id,'personalized_practice',{count:questions.length,lesson_ids:lessonIds});
    return jsonResponse({ok:true,set:saved,model:ai.model});
  }catch(e){return errorResponse(e);}
}
