import { callOpenAI, errorResponse, jsonResponse, logAi, requireStaff } from '@/lib/server/ai';
export async function POST(request: Request) {
  try { const {supabase,user}=await requireStaff(request); const body=await request.json();
    const result=await callOpenAI(JSON.stringify(body),'Bạn là chuyên gia xây dựng đề KHTN. Phân tích yêu cầu, đề xuất ma trận theo chủ đề/mức độ và cấu trúc đề. Nếu được yêu cầu tạo đề, trả JSON thuần gồm title,matrix,questions. Không bịa nội dung ngoài dữ liệu được cung cấp.');
    await logAi(supabase,user.id,'exam',{grade:body.grade}); return jsonResponse({ok:true,answer:result.text,model:result.model});
  } catch(e){return errorResponse(e)}
}
