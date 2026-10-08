import { callOpenAI, errorResponse, jsonResponse, logAi, parseJsonLoose, requireStaff } from '@/lib/server/ai';
import { createEmbedding } from '@/lib/server/embeddings';

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireStaff(request);
    const body = await request.json();
    const count = Math.min(Math.max(Number(body.count || 1), 1), 20);
    const payload = { ...body, count };
    let context = '';
    if (body.lesson_id) {
      const { data: lesson } = await supabase.from('curriculum').select('grade,chapter_code,chapter_title,lesson_no,lesson_title').eq('id', body.lesson_id).maybeSingle();
      if (lesson) context += `\nBÀI NGUỒN: Lớp ${lesson.grade}; ${lesson.chapter_code} - ${lesson.chapter_title}; Bài ${lesson.lesson_no} - ${lesson.lesson_title}`;
      if (body.topic) {
        try {
          const embedding = await createEmbedding(String(body.topic));
          const { data } = await supabase.rpc('match_knowledge_chunks', { query_embedding: embedding, match_threshold: 0.55, match_count: 6, filter_lesson_id: body.lesson_id });
          context += '\nNGỮ LIỆU RAG:\n' + (data || []).map((x: any) => x.content).join('\n---\n');
        } catch {}
      }
    }
    const result = await callOpenAI(JSON.stringify(payload) + context, `Bạn là chuyên gia biên soạn câu hỏi KHTN Việt Nam. Tạo đúng ${count} câu hỏi, bám dữ liệu nguồn. Không bịa tên bài hay kiến thức ngoài phạm vi. Trả về JSON thuần là một mảng. Mỗi phần tử có type,prompt,options,answer,points,explanation. type chỉ mcq/tf/short/essay. mcq: options là mảng 4 chuỗi, answer A/B/C/D. tf: prompt phải chứa 4 ý, answer là mảng 4 boolean. short: answer là chuỗi đáp án chấp nhận được. essay: answer có thể là tiêu chí/chấm điểm. Điểm mặc định mcq 0.25, mỗi tf 1 điểm nếu đủ 4 ý, short 0.5, essay 1.0.`);
    const questions = parseJsonLoose(result.text);
    if (!Array.isArray(questions)) throw new Error('AI_INVALID_JSON');
    await logAi(supabase, user.id, 'question_v6', { count, grade: body.grade, lesson_id: body.lesson_id });
    return jsonResponse({ ok: true, questions, model: result.model });
  } catch (e) { return errorResponse(e); }
}
