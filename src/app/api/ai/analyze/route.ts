import { callOpenAI, errorResponse, jsonResponse, logAi, requireUser } from '@/lib/server/ai';
export async function POST(request: Request) {
  try { const {supabase,user}=await requireUser(request); const body=await request.json();
    const result=await callOpenAI(JSON.stringify(body),'Bạn là AI phân tích học tập KHTN. Dựa trên kết quả được cung cấp, xác định chủ đề còn yếu, lỗi thường gặp, mức độ thành thạo và đề xuất 3 bước học tiếp theo. Không phán xét học sinh và không suy diễn ngoài dữ liệu.');
    await logAi(supabase,user.id,'analyze',{source:body.source || 'manual'}); return jsonResponse({ok:true,answer:result.text,model:result.model});
  } catch(e){return errorResponse(e)}
}
