import { callOpenAI, errorResponse, jsonResponse, logAi, requireUser } from '@/lib/server/ai';
import { createEmbedding } from '@/lib/server/embeddings';
export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireUser(request);
    const body = await request.json();
    const question = String(body.question || '').trim();
    if (!question) return jsonResponse({ ok:false, error:'QUESTION_REQUIRED' },400);
    const grade = String(body.grade || ''); const lesson = String(body.lesson || '');
    const history = Array.isArray(body.history) ? body.history.slice(-8) : [];
    let context = '';
    try {
      const vector = await createEmbedding(question);
      const { data } = await supabase.rpc('match_knowledge_chunks', { query_embedding: vector, match_threshold: 0.62, match_count: 6, filter_lesson_id: body.lessonId || null });
      context = (data || []).map((x:any)=>`[Độ phù hợp ${Number(x.similarity||0).toFixed(3)}]\n${x.content}`).join('\n---\n');
    } catch (_) {
      const { data } = await supabase.from('knowledge_chunks').select('content,metadata').limit(6);
      context = (data || []).map((x:any)=>x.content).join('\n---\n');
    }
    const result = await callOpenAI(
      JSON.stringify({ grade, lesson, context, history, question }),
      'Bạn là AI Tutor của KHTN SỐ cho học sinh Việt Nam. Trả lời bằng tiếng Việt, phù hợp lứa tuổi. Không chỉ đưa đáp án: giải thích ngắn gọn, dùng gợi ý từng bước khi phù hợp. Nếu câu hỏi thiếu dữ kiện, nói rõ dữ kiện cần bổ sung. Ưu tiên kiến thức Khoa học Tự nhiên/Vật lí/Hóa học/Sinh học theo chương trình được cung cấp.'
    );
    let conversationId = body.conversationId as string | undefined;
    if (!conversationId) {
      const { data: conv } = await supabase.from('ai_conversations').insert({ user_id:user.id, title:question.slice(0,120), grade, lesson_id:body.lessonId||null, mode:'tutor' }).select('id').single();
      conversationId = conv?.id;
    }
    if (conversationId) {
      await supabase.from('ai_messages').insert([{conversation_id:conversationId,user_id:user.id,role:'user',content:question},{conversation_id:conversationId,user_id:user.id,role:'assistant',content:result.text,metadata:{model:result.model}}]);
    }
    await logAi(supabase,user.id,'tutor',{grade,lesson,conversationId});
    return jsonResponse({ok:true,answer:result.text,model:result.model,conversationId});
  } catch (e) { return errorResponse(e); }
}
