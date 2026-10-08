import { callOpenAI, errorResponse, jsonResponse, logAi, requireUser, parseJsonLoose } from '@/lib/server/ai';

function eqAnswer(type:string, given:any, correct:any) {
  if (type === 'mcq') return String(given ?? '').trim().toLowerCase() === String(correct ?? '').trim().toLowerCase();
  if (type === 'short') return String(given ?? '').trim().toLowerCase() === String(correct ?? '').trim().toLowerCase();
  if (type === 'tf') {
    if (!Array.isArray(given) || !Array.isArray(correct)) return false;
    return given.length === correct.length && given.every((v,i)=>v === correct[i]);
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireUser(request);
    const body = await request.json().catch(()=>({}));
    const requestedAttemptId = body.attemptId ? String(body.attemptId) : null;
    let query = supabase.from('exam_attempts').select('id,exam_id,answers,work,score,submitted_at,status,violations').eq('user_id', user.id).eq('status','submitted').order('submitted_at',{ascending:false}).limit(8);
    if (requestedAttemptId) query = query.eq('id', requestedAttemptId).limit(1);
    const {data: attempts,error: ae} = await query;
    if (ae) throw ae;
    if (!attempts?.length) return jsonResponse({ok:false,error:'NO_SUBMITTED_ATTEMPT'},404);

    const examIds = [...new Set(attempts.map((a:any)=>a.exam_id))];
    const {data: exams,error: ee} = await supabase.from('exams').select('id,title,grade,matrix').in('id',examIds);
    if (ee) throw ee;
    const examMap = new Map((exams||[]).map((x:any)=>[x.id,x]));

    const questionIds = [...new Set(attempts.flatMap((a:any)=>Array.isArray(a.question_order)?a.question_order:Object.keys(a.answers||{})))];
    const {data: questions,error: qe} = await supabase.from('question_bank').select('id,lesson_id,type,prompt,options,answer,points').in('id',questionIds);
    if (qe) throw qe;
    const lessonIds = [...new Set((questions||[]).map((q:any)=>q.lesson_id).filter(Boolean))];
    const {data: lessons} = lessonIds.length ? await supabase.from('curriculum').select('id,grade,chapter_code,chapter_title,lesson_no,lesson_title').in('id',lessonIds) : {data:[]};
    const lessonMap = new Map((lessons||[]).map((x:any)=>[x.id,x]));
    const qMap = new Map((questions||[]).map((q:any)=>[q.id,q]));

    const items:any[] = [];
    for (const a of attempts) {
      const order = Array.isArray(a.question_order) ? a.question_order : Object.keys(a.answers||{});
      for (const id of order) {
        const q:any = qMap.get(id); if (!q) continue;
        const given = (a.answers||{})[id];
        const correctness = eqAnswer(q.type,given,q.answer);
        const lesson:any = q.lesson_id ? lessonMap.get(q.lesson_id) : null;
        items.push({attempt_id:a.id,exam_title:examMap.get(a.exam_id)?.title||'',grade:examMap.get(a.exam_id)?.grade||lesson?.grade||'',lesson_id:q.lesson_id,lesson_title:lesson?.lesson_title||'Chưa phân loại',chapter:lesson?.chapter_title||'',question_id:q.id,type:q.type,prompt:q.prompt,student_answer:given,correctness,points:q.points,score:a.score});
      }
    }
    if (!items.length) return jsonResponse({ok:false,error:'NO_QUESTION_DATA'},422);

    const objective = items.filter(x=>x.correctness !== null);
    const wrong = objective.filter(x=>x.correctness===false);
    const byLesson = new Map<string,any>();
    for (const x of objective) {
      const key=x.lesson_id||'unknown'; const row=byLesson.get(key)||{lesson_id:x.lesson_id,lesson_title:x.lesson_title,chapter:x.chapter,total:0,wrong:0}; row.total++; if(!x.correctness) row.wrong++; byLesson.set(key,row);
    }
    const lessonStats=[...byLesson.values()].map(x=>({...x,accuracy:x.total?Math.round((x.total-x.wrong)/x.total*100):0})).sort((a,b)=>b.wrong-a.wrong);
    const payload={student_id:user.id,attempts:attempts.map((a:any)=>({id:a.id,exam_id:a.exam_id,title:examMap.get(a.exam_id)?.title,grade:examMap.get(a.exam_id)?.grade,score:a.score,submitted_at:a.submitted_at,violations:a.violations})),lesson_stats:lessonStats,wrong_questions:wrong.slice(0,30).map(x=>({lesson_id:x.lesson_id,lesson_title:x.lesson_title,chapter:x.chapter,prompt:x.prompt,student_answer:x.student_answer,type:x.type}))};
    const ai=await callOpenAI(JSON.stringify(payload),'Bạn là AI phân tích học tập của nền tảng KHTN SỐ. Hãy phân tích dữ liệu bài làm THẬT của học sinh, không bịa điểm số. Trả về JSON thuần gồm: summary (string), strengths (mảng {lesson_id,lesson_title,reason}), gaps (mảng {lesson_id,lesson_title,severity:"cao"|"vừa"|"thấp",evidence,recommendation}), next_steps (mảng string), practice_focus (mảng {lesson_id,lesson_title,count}). Ưu tiên lỗ hổng có bằng chứng từ câu sai; nếu câu tự luận chưa có điểm tự động thì ghi rõ chưa đủ dữ liệu.');
    const report=parseJsonLoose(ai.text);
    const profile={user_id:user.id,strengths:report.strengths||[],gaps:report.gaps||[],recommendations:report.next_steps||[],updated_at:new Date().toISOString()};
    await supabase.from('student_learning_profile').upsert(profile,{onConflict:'user_id'});
    await supabase.from('learning_events').insert({user_id:user.id,event_type:'ai_gap_analysis',payload:{attempt_ids:attempts.map((a:any)=>a.id),lesson_stats:lessonStats,gaps:report.gaps||[]}});
    await logAi(supabase,user.id,'student_gap_analysis',{attempts:attempts.length,wrong:wrong.length,lessons:lessonStats.length});
    return jsonResponse({ok:true,report,lessonStats,attempts:payload.attempts,model:ai.model});
  } catch(e){return errorResponse(e);}
}
