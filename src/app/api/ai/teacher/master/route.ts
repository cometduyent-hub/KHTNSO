import { requireStaff, jsonResponse, errorResponse, callOpenAI, parseJsonLoose, logAi } from '@/lib/server/ai';

export async function POST(request: Request) {
  try {
    const { supabase, user, profile } = await requireStaff(request);
    const body = await request.json().catch(() => ({}));
    const className = body.class_name || profile.class_name || null;
    const grade = body.grade || profile.grade || null;

    let pq = supabase.from('profiles').select('id,full_name,student_code,grade,class_name,active').eq('role','student').eq('active',true);
    if (className) pq = pq.eq('class_name', className);
    if (grade) pq = pq.eq('grade', grade);
    const { data: students, error: se } = await pq.order('full_name');
    if (se) throw se;
    const ids = (students || []).map((s:any)=>s.id);
    if (!ids.length) return jsonResponse({ok:true,report:{summary:{students:0},students:[],lessons:[],groups:[]},class_name:className,grade});

    const { data: attempts, error: ae } = await supabase.from('exam_attempts').select('id,user_id,exam_id,answers,score,submitted_at,status').in('user_id',ids).eq('status','submitted').order('submitted_at',{ascending:false}).limit(3000);
    if (ae) throw ae;
    const examIds = [...new Set((attempts||[]).map((a:any)=>a.exam_id))];
    const { data: exams } = examIds.length ? await supabase.from('exams').select('id,title,grade').in('id',examIds) : {data:[]};
    const { data: eqs } = examIds.length ? await supabase.from('exam_questions').select('exam_id,question_id,position,points_override').in('exam_id',examIds) : {data:[]};
    const qids = [...new Set((eqs||[]).map((x:any)=>x.question_id))];
    const { data: qs } = qids.length ? await supabase.from('question_bank').select('id,type,answer,lesson_id,points').in('id',qids) : {data:[]};
    const lessonIds = [...new Set((qs||[]).map((q:any)=>q.lesson_id).filter(Boolean))];
    const { data: lessons } = lessonIds.length ? await supabase.from('curriculum').select('id,grade,chapter_code,chapter_title,lesson_no,lesson_title').in('id',lessonIds) : {data:[]};

    const examMap = new Map((exams||[]).map((x:any)=>[x.id,x]));
    const qMap = new Map((qs||[]).map((x:any)=>[x.id,x]));
    const lMap = new Map((lessons||[]).map((x:any)=>[x.id,x]));
    const eqByExam = new Map<string,any[]>();
    for (const x of (eqs||[])) { if(!eqByExam.has(x.exam_id)) eqByExam.set(x.exam_id,[]); eqByExam.get(x.exam_id)!.push(x); }

    const studentStats = new Map<string,any>();
    for (const s of (students||[])) studentStats.set(s.id,{student_id:s.id,name:s.full_name||s.student_code||'Học sinh',student_code:s.student_code,attempts:0,scores:[],weak_lessons:{}});
    const lessonStats = new Map<string,any>();
    for (const a of (attempts||[])) {
      const st=studentStats.get(a.user_id); if(!st) continue; st.attempts++; if(a.score!=null) st.scores.push(Number(a.score));
      for(const eq of (eqByExam.get(a.exam_id)||[])){
        const q=qMap.get(eq.question_id); if(!q?.lesson_id) continue;
        const ans=a.answers?.[q.id]; let correct=false;
        if(q.type==='mcq'||q.type==='short') correct=String(ans??'').trim().toLowerCase()===String(q.answer??'').trim().toLowerCase();
        else if(q.type==='tf' && Array.isArray(ans) && Array.isArray(q.answer)) correct=ans.length===q.answer.length && ans.every((v:any,i:number)=>v===q.answer[i]);
        const l=lMap.get(q.lesson_id); const key=q.lesson_id;
        if(!lessonStats.has(key)) lessonStats.set(key,{lesson_id:key,lesson_title:l?.lesson_title||'Bài học',grade:l?.grade,attempted:0,correct:0,questions:0});
        const ls=lessonStats.get(key); ls.questions++; ls.attempted++; if(correct) ls.correct++;
        if(!correct){ st.weak_lessons[key]=(st.weak_lessons[key]||0)+1; }
      }
    }
    const studentsOut=(students||[]).map((s:any)=>{const st=studentStats.get(s.id); const avg=st.scores.length?Math.round(st.scores.reduce((x:number,y:number)=>x+y,0)/st.scores.length*100)/100:null; const weak=Object.entries(st.weak_lessons).sort((a:any,b:any)=>b[1]-a[1]).slice(0,3).map(([id,n])=>({lesson_id:id,lesson_title:lMap.get(id)?.lesson_title||'Bài học',errors:n})); return {...st,average_score:avg,weak_lessons:weak,needs_support:weak.length>0||((avg??100)<5)};});
    const lessonsOut=[...lessonStats.values()].map((x:any)=>({...x,mastery:x.questions?Math.round(x.correct/x.questions*100):0})).sort((a:any,b:any)=>a.mastery-b.mastery);
    const groups=[
      {key:'urgent',title:'Cần hỗ trợ ngay',student_ids:studentsOut.filter((s:any)=>s.needs_support&&((s.average_score??0)<5||s.weak_lessons.length>=2)).map((s:any)=>s.student_id)},
      {key:'reinforce',title:'Cần củng cố',student_ids:studentsOut.filter((s:any)=>s.needs_support&&!((s.average_score??0)<5||s.weak_lessons.length>=2)).map((s:any)=>s.student_id)},
      {key:'strong',title:'Có thể nâng cao',student_ids:studentsOut.filter((s:any)=>!s.needs_support&&((s.average_score??0)>=7)).map((s:any)=>s.student_id)}
    ];
    const payload={class_name:className,grade,summary:{students:studentsOut.length,submitted_attempts:(attempts||[]).length,average_score:studentsOut.filter((s:any)=>s.average_score!=null).length?Math.round(studentsOut.filter((s:any)=>s.average_score!=null).reduce((n:number,s:any)=>n+s.average_score,0)/studentsOut.filter((s:any)=>s.average_score!=null).length*100)/100:null},students:studentsOut,lessons:lessonsOut.slice(0,20),groups};
    let ai:any={recommendations:[]};
    if(studentsOut.length){ const out=await callOpenAI(JSON.stringify(payload),'Bạn là AI Master Teacher cho KHTN. Dựa CHỈ trên dữ liệu lớp được cung cấp, hãy đề xuất can thiệp sư phạm ngắn gọn. Trả JSON: {"summary":"...","recommendations":[{"priority":"cao|vừa|thấp","target":"cả lớp|nhóm|cá nhân","student_ids":[],"lesson_ids":[],"action":"...","reason":"...","duration_minutes":number}]} Không bịa học sinh, bài học hay điểm.'); try{ai=parseJsonLoose(out.text)}catch{ai={recommendations:[]};} }
    const report={...payload,ai};
    await supabase.from('teacher_master_reports').insert({created_by:user.id,class_name:className,grade,report});
    await logAi(supabase,user.id,'teacher_master_v10',{students:studentsOut.length,class_name:className,grade});
    return jsonResponse({ok:true,report});
  } catch(e){return errorResponse(e);}
}
