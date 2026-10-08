import { errorResponse, jsonResponse, requireUser, callOpenAI, parseJsonLoose, logAi } from '@/lib/server/ai';

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireUser(request);
    const { data: plan } = await supabase.from('adaptive_learning_plans').select('*').eq('user_id', user.id).eq('status','active').order('generated_at',{ascending:false}).limit(1).maybeSingle();
    if (!plan) return jsonResponse({ok:false,error:'NO_PLAN',message:'Hãy tạo lộ trình thích ứng trước.'},422);
    const lessonIds=[...(plan.items||[])].map((x:any)=>x.lesson_id).filter(Boolean);
    const {data:lessons}=lessonIds.length?await supabase.from('curriculum').select('id,grade,chapter_code,chapter_title,lesson_no,lesson_title').in('id',lessonIds):{data:[]};
    const {data:resources}=lessonIds.length?await supabase.from('resources').select('id,title,grade,lesson_id,type,url,rights,metadata').in('lesson_id',lessonIds).eq('status','published'): {data:[]};
    const lessonMap=new Map((lessons||[]).map((x:any)=>[x.id,x]));
    const byLesson=new Map<string,any[]>();
    for(const r of resources||[]){const a=byLesson.get(r.lesson_id)||[];a.push(r);byLesson.set(r.lesson_id,a);}
    const base=(plan.items||[]).map((x:any)=>{const rs=(byLesson.get(x.lesson_id)||[]).slice(0,4); return {...x,resources:rs.map((r:any)=>({id:r.id,title:r.title,type:r.type,url:r.url,rights:r.rights,metadata:r.metadata||{}})),lesson:lessonMap.get(x.lesson_id)||null,completed:false};});
    let items=base;
    if(process.env.OPENAI_API_KEY && base.length){
      const ai=await callOpenAI(JSON.stringify({items:base.map((x:any)=>({order:x.order,lesson_title:x.lesson_title,mastery:x.mastery,difficulty:x.difficulty,resources:x.resources}))}), 'Bạn là cố vấn học tập KHTN. Hãy biến lộ trình thành learning path 7 ngày. Chỉ trả JSON {summary:string,items:[{order,goal,why,checklist:string[],resource_priority:string[]}]}. Không bịa tên tài liệu; chỉ dùng resource id có trong dữ liệu.');
      const parsed=parseJsonLoose(ai.text);
      items=base.map((x:any)=>({...x,...(parsed.items||[]).find((y:any)=>y.order===x.order)}));
      await logAi(supabase,user.id,'learning_path_v9',{plan_id:plan.id});
    }
    const {data:path,error}=await supabase.from('ai_learning_paths').insert({user_id:user.id,plan_id:plan.id,summary:{text:'Lộ trình học từ bài thi, học liệu và bài luyện.', ...(items.length?{}:{})},items,status:'active'}).select('id,created_at,plan_id,summary,items,status').single();
    if(error) throw error;
    await supabase.from('learning_events').insert({user_id:user.id,event_type:'learning_path_generated',payload:{path_id:path.id,plan_id:plan.id}});
    return jsonResponse({ok:true,path});
  } catch(e){return errorResponse(e);}
}
