import { errorResponse, jsonResponse, requireStaff } from '@/lib/server/ai';
export async function POST(request:Request){
  try{const {supabase,user}=await requireStaff(request);const b=await request.json();const {data,error}=await supabase.from('ai_teacher_projects').insert({created_by:user.id,kind:String(b.kind||'draft'),title:String(b.title||'AI Teacher'),grade:b.grade||null,lesson_id:b.lesson_id||null,input:b.input||{},output:b.output||{},status:'draft'}).select().single();if(error)throw error;return jsonResponse({ok:true,project:data});}catch(e){return errorResponse(e)}}
