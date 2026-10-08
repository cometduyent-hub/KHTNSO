import { callOpenAI, errorResponse, jsonResponse, logAi, requireStaff } from '@/lib/server/ai';
export async function POST(request: Request) {
  try { const {supabase,user}=await requireStaff(request); const body=await request.json();
    const title=String(body.title||'').trim(), content=String(body.content||'').trim(); if(!title||!content)return jsonResponse({ok:false,error:'TITLE_AND_CONTENT_REQUIRED'},400);
    const {data:doc,error:de}=await supabase.from('knowledge_documents').insert({title,grade:body.grade||null,subject:body.subject||'KHTN',chapter:body.chapter||null,lesson_id:body.lesson_id||null,source_type:body.source_type||'teacher',created_by:user.id}).select().single(); if(de)throw de;
    const chunks=content.match(/[\s\S]{1,3500}/g)||[];
    for(let i=0;i<chunks.length;i++){const emb=await fetch('https://api.openai.com/v1/embeddings',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${process.env.OPENAI_API_KEY}`},body:JSON.stringify({model:process.env.OPENAI_EMBEDDING_MODEL||'text-embedding-3-small',input:chunks[i]})}); const eraw=await emb.text(); if(!emb.ok)throw new Error(`OPENAI_HTTP_${emb.status}:${eraw.slice(0,300)}`); const ej=JSON.parse(eraw); const vector=ej.data?.[0]?.embedding; const {error:ce}=await supabase.from('knowledge_chunks').insert({document_id:doc.id,lesson_id:body.lesson_id||null,chunk_index:i,content:chunks[i],embedding:vector,metadata:{title}}); if(ce)throw ce;}
    await logAi(supabase,user.id,'document',{document_id:doc.id,chunks:chunks.length}); return jsonResponse({ok:true,document_id:doc.id,chunks:chunks.length});
  } catch(e){return errorResponse(e)}
}
