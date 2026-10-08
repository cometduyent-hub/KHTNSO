import { callOpenAI, errorResponse, jsonResponse, logAi, parseJsonLoose, requireStaff } from '@/lib/server/ai';
import { createEmbedding } from '@/lib/server/embeddings';

async function getContext(supabase:any, body:any) {
  let context = '';
  if (body.lesson_id) {
    const { data: lesson } = await supabase.from('curriculum').select('grade,chapter_code,chapter_title,lesson_no,lesson_title').eq('id', body.lesson_id).maybeSingle();
    if (lesson) context += `\nBÀI HỌC: Lớp ${lesson.grade}; ${lesson.chapter_code} - ${lesson.chapter_title}; Bài ${lesson.lesson_no} - ${lesson.lesson_title}`;
    try {
      const embedding = await createEmbedding(String(body.request || body.topic || ''));
      const { data } = await supabase.rpc('match_knowledge_chunks', { query_embedding: embedding, match_threshold: 0.55, match_count: 8, filter_lesson_id: body.lesson_id });
      if (data?.length) context += '\nNGỮ LIỆU KHO KIẾN THỨC:\n' + data.map((x:any)=>x.content).join('\n---\n');
    } catch {}
  }
  return context;
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireStaff(request);
    const body = await request.json();
    const task = String(body.task || 'lesson_plan');
    const context = await getContext(supabase, body);
    const instructions = `Bạn là AI Teacher của KHTN SỐ dành cho giáo viên KHTN Việt Nam. Nhiệm vụ=${task}. Luôn bám chương trình/ngữ liệu được cung cấp; nếu thiếu dữ liệu phải nói rõ giả định. Ưu tiên đầu ra có thể chỉnh sửa trong Word. Với lesson_plan: tạo mục tiêu, thiết bị, tiến trình hoạt động, sản phẩm, đánh giá, nội dung ghi bảng. Với matrix: trả JSON có chủ đề, nhận biết, thông hiểu, vận dụng, số câu, điểm, tổng điểm. Với question_review: chỉ ra lỗi kiến thức, độ rõ, đáp án, mức độ, điểm và đề xuất sửa. Với activity: thiết kế hoạt động thực hành/PBL/STEM cụ thể.`;
    const result = await callOpenAI(JSON.stringify(body) + context, instructions);
    let structured:any = null;
    if (['matrix','question_review'].includes(task)) { try { structured = parseJsonLoose(result.text); } catch {} }
    await logAi(supabase, user.id, 'teacher_v6', { task, grade: body.grade, lesson_id: body.lesson_id });
    return jsonResponse({ ok:true, answer:result.text, structured, model:result.model });
  } catch (e) { return errorResponse(e); }
}
