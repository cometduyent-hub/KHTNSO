import { callOpenAI, errorResponse, jsonResponse, logAi, parseJsonLoose, requireStaff } from '@/lib/server/ai';
export async function POST(request:Request){
  try{
    const {supabase,user}=await requireStaff(request); const body=await request.json();
    const result=await callOpenAI(JSON.stringify(body),'Bạn là chuyên gia xây dựng ma trận đề KHTN. Trả JSON thuần gồm title,grade,duration,total_points,rows. rows là mảng các dòng có lesson/topic, nhận_biet, thong_hieu, van_dung, so_cau, diem. Kiểm tra tổng số câu và tổng điểm khớp yêu cầu. Không bịa nội dung ngoài dữ liệu được cung cấp.');
    const matrix=parseJsonLoose(result.text); await logAi(supabase,user.id,'exam_matrix_v6',{grade:body.grade});
    return jsonResponse({ok:true,matrix,model:result.model});
  }catch(e){return errorResponse(e)}
}
