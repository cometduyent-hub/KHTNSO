'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  ArrowDownRight, ArrowUpRight, BookOpen, Check, ChevronRight, Circle, Download,
  Eraser, FlaskConical, Hand, Minus, MousePointer2, Pencil, Printer, Redo2,
  RotateCcw, Save, Square, Trash2, Type, Undo2, ZoomIn, Zap, Maximize2, Copy, ChevronLeft, Plus,
} from 'lucide-react';

type Point = { x: number; y: number };
type Tool = 'select' | 'pen' | 'eraser' | 'line' | 'arrow' | 'dashed-line' | 'circle' | 'ellipse' | 'triangle' | 'rectangle' | 'cube' | 'cuboid' | 'pyramid' | 'cylinder' | 'cone' | 'sphere' | 'text' | 'graph';
type Diagram = 'convex-lens' | 'concave-lens' | 'prism' | 'dispersion' | 'mirror' | 'circuit' | 'force-vector' | 'refraction' | 'graph-st' | 'graph-vt' | 'graph-at' | 'graph-uv' | 'graph-function' | 'harmonic' | 'unit-circle' | 'battery' | 'resistor' | 'lamp' | 'switch' | 'ammeter' | 'voltmeter' | 'wire';
type BoardItem =
  | { id: string; kind: 'path'; points: Point[]; color: string; width: number; erase?: boolean; graph?: boolean }
  | { id: string; kind: 'line' | 'arrow'; from: Point; to: Point; color: string; width: number }
  | { id: string; kind: 'shape'; shape: 'dashed-line' | 'circle' | 'ellipse' | 'triangle' | 'rectangle' | 'cube' | 'cuboid' | 'pyramid' | 'cylinder' | 'cone' | 'sphere'; from: Point; to: Point; color: string; width: number }
  | { id: string; kind: 'text'; at: Point; text: string; color: string; size: number; graphSourceId?: string }
  | { id: string; kind: 'diagram'; diagram: Diagram; at: Point; scale: number; rotation?: number; equation?: string; switchClosed?: boolean; graphPoints?: Point[] };

type Formula = { group: string; name: string; expression: string; note: string };
type BoardCatalogEntry = { id: string; entry_type: 'formula' | 'template'; subject_code: string; grade: number; title: string; content: string; description: string; status: string; sort_order: number };
type BoardPage = { id: string; title: string; items: BoardItem[] };
const boardSubjects = [{code:'NGUVAN',name:'Ngữ văn'},{code:'TOAN',name:'Toán'},{code:'TIENGANH',name:'Tiếng Anh'},{code:'GDCD',name:'Giáo dục công dân'},{code:'LS_DIA',name:'Lịch sử và Địa lí'},{code:'KHTN',name:'Khoa học tự nhiên'},{code:'CONGNGHE',name:'Công nghệ'},{code:'TINHOC',name:'Tin học'},{code:'GDTC',name:'Giáo dục thể chất'},{code:'AMNHAC',name:'Nghệ thuật – Âm nhạc'},{code:'MITHUAT',name:'Nghệ thuật – Mĩ thuật'},{code:'HDTN_HN',name:'Hoạt động trải nghiệm, hướng nghiệp'},{code:'DIA_PHUONG',name:'Nội dung giáo dục địa phương'}];
const W = 1200, H = 700;
const formulas: Formula[] = [
  { group: 'Lớp 6–7 · Đo lường và chuyển động', name: 'Tốc độ', expression: 'v = s / t', note: 'Công thức gốc: v là tốc độ; s là quãng đường; t là thời gian' },
  { group: 'Lớp 6–7 · Đo lường và chuyển động', name: 'Quãng đường (suy ra từ v = s / t)', expression: 's = v · t', note: 'Biến đổi công thức gốc v = s / t để tìm quãng đường' },
  { group: 'Lớp 6–7 · Đo lường và chuyển động', name: 'Thời gian (suy ra từ v = s / t)', expression: 't = s / v', note: 'Biến đổi công thức gốc v = s / t để tìm thời gian' },
  { group: 'Lớp 6–7 · Đo lường và chuyển động', name: 'Khối lượng riêng', expression: 'D = m / V', note: 'D: khối lượng riêng; m: khối lượng; V: thể tích' },
  { group: 'Lớp 8 · Lực và áp suất', name: 'Áp suất', expression: 'p = F / S', note: 'Công thức gốc; F vuông góc với diện tích S' },
  { group: 'Lớp 8 · Lực và áp suất', name: 'Áp lực (suy ra từ p = F / S)', expression: 'F = p · S', note: 'Biến đổi công thức gốc p = F / S để tìm áp lực' },
  { group: 'Lớp 8 · Lực và áp suất', name: 'Diện tích bị ép (suy ra từ p = F / S)', expression: 'S = F / p', note: 'Biến đổi công thức gốc p = F / S để tìm diện tích bị ép' },
  { group: 'Lớp 8 · Lực và áp suất', name: 'Lực đẩy Archimedes', expression: 'Fₐ = d · V', note: 'V là thể tích phần chất lỏng bị vật chiếm chỗ' },
  { group: 'Lớp 8–9 · Năng lượng', name: 'Công cơ học', expression: 'A = F · s', note: 'Khi lực cùng hướng chuyển dời' },
  { group: 'Lớp 8–9 · Năng lượng', name: 'Công suất', expression: 'P = A / t', note: 'Công thức gốc: A là công; t là thời gian thực hiện công' },
  { group: 'Lớp 8–9 · Năng lượng', name: 'Công (suy ra từ P = A / t)', expression: 'A = P · t', note: 'Biến đổi công thức gốc P = A / t để tìm công' },
  { group: 'Lớp 8–9 · Năng lượng', name: 'Thời gian (suy ra từ P = A / t)', expression: 't = A / P', note: 'Biến đổi công thức gốc P = A / t để tìm thời gian' },
  { group: 'Lớp 7–9 · Điện học', name: 'Định luật Ôm', expression: 'I = U / R', note: 'Công thức gốc: I là cường độ dòng điện; U là hiệu điện thế; R là điện trở' },
  { group: 'Lớp 7–9 · Điện học', name: 'Hiệu điện thế (suy ra từ I = U / R)', expression: 'U = I · R', note: 'Biến đổi công thức gốc I = U / R để tìm hiệu điện thế' },
  { group: 'Lớp 7–9 · Điện học', name: 'Điện trở (suy ra từ I = U / R)', expression: 'R = U / I', note: 'Biến đổi công thức gốc I = U / R để tìm điện trở' },
  { group: 'Lớp 7–9 · Quang học', name: 'Định luật phản xạ', expression: 'i = i′', note: 'Góc tới bằng góc phản xạ' },
  { group: 'Lớp 9–12 · Quang học', name: 'Thấu kính mỏng', expression: '1/f = 1/d + 1/d′', note: 'Cần thống nhất quy ước dấu trong bài học' },
  { group: 'Lớp 10–12 · Cơ học', name: 'Định luật II Newton', expression: 'ΣF⃗ = m · a⃗', note: 'Gia tốc cùng hướng với hợp lực' },
  { group: 'Lớp 10–12 · Dao động', name: 'Dao động điều hòa', expression: 'x = A cos(ωt + φ)', note: 'A: biên độ; ω: tần số góc; φ: pha ban đầu' },
  { group: 'Lớp 10–12 · Lượng giác', name: 'Hàm sin', expression: 'y = A sin(ωx + φ)', note: 'Đồ thị hình sin; góc trong sin tính bằng radian khi vẽ hàm' },
  { group: 'Lớp 10–12 · Lượng giác', name: 'Hàm cos', expression: 'y = A cos(ωx + φ)', note: 'Đồ thị hình cos; góc trong cos tính bằng radian khi vẽ hàm' },
  { group: 'Lớp 10–12 · Lượng giác', name: 'Hệ thức lượng giác cơ bản', expression: 'sin²α + cos²α = 1', note: 'Đúng với mọi góc α' },
  { group: 'Lớp 10–12 · Lượng giác', name: 'Tang của góc', expression: 'tan α = sin α / cos α', note: 'Xác định khi cos α ≠ 0' },
  { group: 'Lớp 10–12 · Sóng', name: 'Tốc độ truyền sóng', expression: 'v = λf', note: 'λ: bước sóng; f: tần số' },
  { group: 'Lớp 10–12 · Điện từ', name: 'Cảm ứng điện từ', expression: 'e = −ΔΦ / Δt', note: 'Suất điện động cảm ứng theo định luật Faraday–Lenz' },
  { group: 'Lớp 6 · Lực', name: 'Trọng lượng (gần đúng)', expression: 'P = 10 · m', note: 'P tính bằng niutơn (N), m tính bằng kilôgam (kg); dùng gần đúng g ≈ 10 N/kg' },
  { group: 'Lớp 7 · Tốc độ', name: 'Quãng đường theo quy tắc 3 giây', expression: 'd = 3 · v', note: 'Trong 3 giây chuyển động đều, quãng đường d = v·t = 3v (v tính bằng m/s, d bằng m)' },
  { group: 'Lớp 8 · Áp suất chất lỏng', name: 'Áp suất chất lỏng', expression: 'p = d · h', note: 'd là trọng lượng riêng của chất lỏng (N/m³), h là độ sâu (m), p tính bằng Pa' },
  { group: 'Lớp 8 · Áp suất chất lỏng', name: 'Bình thông nhau', expression: 'h₁ = h₂  (cùng chất lỏng, cân bằng)', note: 'Ở trạng thái cân bằng, các mặt thoáng của cùng một chất lỏng đứng yên trong các nhánh hở nằm trên cùng độ cao' },
  { group: 'Lớp 8 · Áp suất chất lỏng', name: 'Máy nén thủy lực (định luật Pascal)', expression: 'f / s = F / S', note: 'Áp suất truyền nguyên vẹn trong chất lỏng kín: f, F là lực tác dụng; s, S là diện tích các pít-tông tương ứng.' },
  { group: 'Lớp 9 · Điện học', name: 'Điện trở dây dẫn', expression: 'R = ρ · l / S', note: 'ρ là điện trở suất, l là chiều dài dây, S là tiết diện dây dẫn đồng chất' },
];
const rooms = [
  { title: 'Thư viện', desc: 'Mở tài liệu và video theo bài học', href: '/library', icon: BookOpen },
  { title: 'Thực hành', desc: 'Dụng cụ đo và báo cáo thực hành', href: '/practice', icon: Zap },
  { title: 'Phòng thí nghiệm', desc: 'Mở mô phỏng và hoạt động đã tích hợp', href: '/simulations', icon: FlaskConical },
  { title: 'Sáng tạo', desc: 'Đồ thị và công cụ học tập', href: '/creative', icon: ArrowUpRight },
];
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function arrow(ctx: CanvasRenderingContext2D, a: Point, b: Point, color: string, width = 3, head = 13) {
  const angle = Math.atan2(b.y - a.y, b.x - a.x);
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(b.x, b.y);
  ctx.lineTo(b.x - head * Math.cos(angle - Math.PI / 6), b.y - head * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(b.x - head * Math.cos(angle + Math.PI / 6), b.y - head * Math.sin(angle + Math.PI / 6));
  ctx.closePath(); ctx.fill();
}
function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color = '#0f172a', size = 20) {
  ctx.fillStyle = color; ctx.font = `600 ${size}px system-ui, sans-serif`; ctx.fillText(text, x, y);
}
type BoardSettings = { focalLength:number; objectDistance:number; prismAngle:number; incidentAngle:number; refractiveIndex:number; refractionDirection:string; objectHeight:number; graphXMax:number; graphYMax:number; graphStep:number; graphMode:string; amplitude:number; omega:number; phase:number; prismRayColor:string };
function drawGeometryShape(ctx: CanvasRenderingContext2D, shape: Extract<BoardItem,{kind:'shape'}>['shape'], from:Point, to:Point, color:string, width:number, preview=false) {
  const left=Math.min(from.x,to.x), top=Math.min(from.y,to.y), w=Math.max(8,Math.abs(to.x-from.x)), h=Math.max(8,Math.abs(to.y-from.y));
  const cx=left+w/2, cy=top+h/2, dx=w*0.28, dy=h*0.22;
  ctx.save(); ctx.strokeStyle=color; ctx.lineWidth=width; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.setLineDash(shape==='dashed-line'?[9,7]:[]); ctx.beginPath();
  if(shape==='dashed-line'){ctx.moveTo(from.x,from.y);ctx.lineTo(to.x,to.y);}
  else if(shape==='circle'||shape==='ellipse'){const rx=w/2,ry=h/2;ctx.ellipse(cx,cy,shape==='circle'?Math.max(rx,ry):rx,shape==='circle'?Math.max(rx,ry):ry,0,0,Math.PI*2);}
  else if(shape==='triangle'){ctx.moveTo(cx,top);ctx.lineTo(left+w,top+h);ctx.lineTo(left,top+h);ctx.closePath();}
  else if(shape==='rectangle'){ctx.rect(left,top,w,h);}
  else if(shape==='cube'||shape==='cuboid'){
    ctx.moveTo(left,top+dy);ctx.lineTo(left+w-dx,top+dy);ctx.lineTo(left+w-dx,top+h);ctx.lineTo(left,top+h);ctx.closePath();
    ctx.moveTo(left,top+dy);ctx.lineTo(left+dx,top);ctx.lineTo(left+w,top);ctx.lineTo(left+w-dx,top+dy);
    ctx.moveTo(left+w,top);ctx.lineTo(left+w,top+h-dy);ctx.lineTo(left+w-dx,top+h);
    ctx.moveTo(left+dx,top);ctx.lineTo(left+dx,top+h-dy);ctx.lineTo(left,top+h);
    ctx.save();ctx.setLineDash([6,5]);ctx.moveTo(left+dx,top+h-dy);ctx.lineTo(left+w,top+h-dy);ctx.moveTo(left+dx,top+h-dy);ctx.lineTo(left+w-dx,top+h);ctx.stroke();ctx.restore();
  }
  else if(shape==='pyramid'){
    ctx.moveTo(cx,top);ctx.lineTo(left+w,top+h-dy);ctx.lineTo(cx,top+h);ctx.lineTo(left,top+h-dy);ctx.closePath();
    ctx.moveTo(cx,top);ctx.lineTo(cx,top+h);ctx.moveTo(cx,top);ctx.lineTo(left+w,top+h-dy);ctx.moveTo(cx,top);ctx.lineTo(left,top+h-dy);
    ctx.save();ctx.setLineDash([6,5]);ctx.moveTo(left,top+h-dy);ctx.lineTo(left+w,top+h-dy);ctx.stroke();ctx.restore();
  }
  else if(shape==='cylinder'){
    // Bán trục elip phụ thuộc đường kính, không phụ thuộc riêng chiều cao hình vẽ.
    const ry=Math.max(5,Math.min(w*0.16,h*0.18));
    ctx.ellipse(cx,top+ry,w/2,ry,0,0,Math.PI*2);
    ctx.moveTo(left,top+ry);ctx.lineTo(left,top+h-ry);ctx.moveTo(left+w,top+ry);ctx.lineTo(left+w,top+h-ry);
    ctx.ellipse(cx,top+h-ry,w/2,ry,0,0,Math.PI);
    ctx.save();ctx.setLineDash([6,5]);ctx.beginPath();ctx.ellipse(cx,top+h-ry,w/2,ry,0,Math.PI,Math.PI*2);ctx.stroke();ctx.restore();
  }
  else if(shape==='cone'){
    const ry=Math.max(5,Math.min(w*0.16,h*0.18));
    ctx.moveTo(cx,top);ctx.lineTo(left+w,top+h-ry);ctx.ellipse(cx,top+h-ry,w/2,ry,0,0,Math.PI);ctx.moveTo(cx,top);ctx.lineTo(left,top+h-ry);
    ctx.save();ctx.setLineDash([6,5]);ctx.beginPath();ctx.ellipse(cx,top+h-ry,w/2,ry,0,Math.PI,Math.PI*2);ctx.stroke();ctx.restore();
  }
  else if(shape==='sphere'){
    // Hình cầu biểu diễn trên mặt phẳng: đường bao tròn + xích đạo thấy/khuất.
    // Không vẽ thêm kinh tuyến kín gây hiểu nhầm thành các đường giao nhau trên mặt cầu.
    const r=Math.min(w,h)/2, equatorRy=r*0.19;
    ctx.arc(cx,cy,r,0,Math.PI*2);
    ctx.moveTo(cx-r,cy);ctx.ellipse(cx,cy,r,equatorRy,0,0,Math.PI);
    ctx.save();ctx.setLineDash([6,5]);ctx.beginPath();ctx.ellipse(cx,cy,r,equatorRy,0,Math.PI,Math.PI*2);ctx.stroke();ctx.restore();
  }
  ctx.stroke(); ctx.restore();
}

function drawDiagram(ctx: CanvasRenderingContext2D, item: Extract<BoardItem, {kind:'diagram'}>, settings:BoardSettings) {
  ctx.save(); ctx.translate(item.at.x, item.at.y); ctx.rotate((item.rotation||0)*Math.PI/180); ctx.scale(item.scale, item.scale);
  const blue = '#2563eb', red = '#dc2626', purple = '#7c3aed', gray = '#475569', green = '#059669';
  ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (item.diagram === 'convex-lens' || item.diagram === 'concave-lens') {
    const convex=item.diagram==='convex-lens';
    // Cross-section: convex is thick at the centre and thin at the rim; concave is the reverse.
    ctx.strokeStyle=blue; ctx.fillStyle='rgba(125,211,252,.22)'; ctx.beginPath();
    if (convex) { ctx.moveTo(0,-95); ctx.bezierCurveTo(34,-62,34,62,0,95); ctx.bezierCurveTo(-34,62,-34,-62,0,-95); }
    else { ctx.moveTo(-18,-95); ctx.bezierCurveTo(-5,-55,-5,55,-18,95); ctx.lineTo(18,95); ctx.bezierCurveTo(5,55,5,-55,18,-95); ctx.closePath(); }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle=gray;ctx.setLineDash([6,5]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-270,0);ctx.lineTo(270,0);ctx.stroke();ctx.setLineDash([]);
    ctx.strokeStyle=blue;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(0,-95);ctx.lineTo(0,95);ctx.stroke();
    if(convex){arrow(ctx,{x:-13,y:-62},{x:0,y:-82},blue,2,8);arrow(ctx,{x:13,y:62},{x:0,y:82},blue,2,8);}
    else{arrow(ctx,{x:0,y:-82},{x:-13,y:-62},blue,2,8);arrow(ctx,{x:0,y:82},{x:13,y:62},blue,2,8);}
    label(ctx,convex?'Hội tụ: giữa dày, rìa mỏng':'Phân kỳ: giữa mỏng, rìa dày',-155,-112,blue,14);
    const pxPerCm=0.72, f=Math.max(25,Math.min(150,settings.focalLength)), d=Math.max(30,Math.min(240,settings.objectDistance));
    const objX=-Math.min(235,d*pxPerCm), objH=Math.max(20,Math.min(100,settings.objectHeight));
    const fPx=f*pxPerCm;
    const imageDistance=convex?(Math.abs(d-f)<0.8?Infinity:(d*f/(d-f))):-(d*f/(d+f));
    const imageX=Number.isFinite(imageDistance)?imageDistance*pxPerCm:245;
    const magnification=Number.isFinite(imageDistance)?-imageDistance/d:(convex?-4:0);
    const imageY=-magnification*objH;
    const tip={x:objX,y:-objH};
    // Vật và ảnh: ảnh thật ngược chiều; ảnh ảo cùng chiều. Giới hạn phần hiển thị nhưng giữ đúng dấu.
    arrow(ctx,{x:objX,y:0},{x:objX,y:-objH},red,3,10);label(ctx,'Vật',objX-20,-objH-10,red,14);
    if(Number.isFinite(imageDistance) && Math.abs(imageX)<255){
      const iy=Math.max(-125,Math.min(125,imageY));
      arrow(ctx,{x:imageX,y:0},{x:imageX,y:iy},green,3,10);
      label(ctx,convex&&d>f?'Ảnh thật':'Ảnh ảo',imageX-24,iy+(iy<0?-10:22),green,13);
    } else if(convex && Math.abs(d-f)<0.8) label(ctx,'Ảnh ở vô cực (d = f)',72,-32,green,13);

    // Tia 1: qua quang tâm O truyền thẳng.
    const centralEnd={x:245,y:tip.y*245/objX};
    arrow(ctx,tip,{x:0,y:0},red,2.4,8);ctx.strokeStyle=red;ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(centralEnd.x,centralEnd.y);ctx.stroke();

    // Tia 2: tới song song trục chính. TK hội tụ: tia ló qua F'; TK phân kỳ: tia ló có đường kéo dài đi qua F.
    ctx.strokeStyle=green;ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(tip.x,tip.y);ctx.lineTo(0,tip.y);ctx.stroke();
    if(convex){
      ctx.beginPath();ctx.moveTo(0,tip.y);ctx.lineTo(245,tip.y+(0-tip.y)*(245/fPx));ctx.stroke();
      // Tia kéo dài nét đứt về phía vật chỉ dùng khi dựng ảnh ảo (d < f).
      if(d<f){ctx.save();ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(-245,tip.y+(0-tip.y)*(-245/fPx));ctx.lineTo(0,tip.y);ctx.stroke();ctx.restore();}
    } else {
      ctx.beginPath();ctx.moveTo(0,tip.y);ctx.lineTo(245,tip.y+(tip.y/fPx)*245);ctx.stroke();
      ctx.save();ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(-fPx,0);ctx.lineTo(0,tip.y);ctx.stroke();ctx.restore();
    }

    // Tia 3: qua tiêu điểm vật F (TK hội tụ) / hướng tới tiêu điểm ảnh F' (TK phân kỳ), sau kính song song trục.
    ctx.strokeStyle=purple;ctx.lineWidth=2.1;ctx.beginPath();
    if(convex){const yAtLens=tip.y*fPx/(objX+fPx);ctx.moveTo(tip.x,tip.y);ctx.lineTo(-fPx,0);ctx.lineTo(0,yAtLens);ctx.lineTo(245,yAtLens);}
    else {const yAtLens=tip.y*fPx/(fPx-objX);ctx.moveTo(tip.x,tip.y);ctx.lineTo(fPx,0);ctx.lineTo(0,yAtLens);ctx.lineTo(245,yAtLens);}
    ctx.stroke();

    ctx.fillStyle=gray;[-fPx,fPx].forEach((x)=>{ctx.beginPath();ctx.arc(x,0,4,0,Math.PI*2);ctx.fill();});
    label(ctx,'F',-fPx-7,20,gray,14);label(ctx,"F′",fPx-8,20,gray,14);label(ctx,'O',7,20,gray,14);
    label(ctx,`${convex?'Thấu kính hội tụ':'Thấu kính phân kỳ'} · f=${settings.focalLength} cm · d=${settings.objectDistance} cm`,-235,142,blue,14);
    label(ctx,convex?(d>f?'d > f: ảnh thật, ngược chiều':d<f?'d < f: ảnh ảo, cùng chiều':'d = f: ảnh ở vô cực'):'Ảnh ảo, cùng chiều, nhỏ hơn vật',-235,162,gray,12);
  } else if (item.diagram === 'prism' || item.diagram === 'dispersion') {
    ctx.rotate(settings.prismAngle*Math.PI/180);
    ctx.strokeStyle = purple; ctx.fillStyle = 'rgba(196,181,253,.24)'; ctx.beginPath(); ctx.moveTo(0,-88); ctx.lineTo(-82,65); ctx.lineTo(82,65); ctx.closePath(); ctx.fill(); ctx.stroke();
    // Rays enter the left sloping face and exit the right sloping face. The emergent ray bends toward the prism base.
    const entry={x:-47,y:0}, exit={x:48,y:20}, inner={x:8,y:15};
    const prismInputColor=item.diagram==='dispersion'?'#334155':settings.prismRayColor;
    arrow(ctx,{x:-235,y:0},entry,prismInputColor,3,11);
    ctx.strokeStyle=prismInputColor;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(entry.x,entry.y);ctx.lineTo(inner.x,inner.y);ctx.lineTo(exit.x,exit.y);ctx.stroke();
    if(item.diagram==='prism') {
      arrow(ctx,exit,{x:220,y:88+settings.prismAngle*1.2},settings.prismRayColor,3,11);
      label(ctx,'Ánh sáng đơn sắc',-225,120,settings.prismRayColor,13);
    } else {
      // White light is white before the prism; dispersion separates wavelengths only after emerging.
      const colors=['#dc2626','#f97316','#eab308','#16a34a','#2563eb','#4f46e5','#9333ea'];
      const offsets=[-17,-10,-4,2,8,14,20];
      colors.forEach((c,i)=>arrow(ctx,exit,{x:220,y:48+offsets[i]+settings.prismAngle*1.2},c,2.5,9));
      label(ctx,'Ánh sáng trắng',-225,-22,'#334155',13);label(ctx,'Đỏ: lệch ít',225,22,colors[0],12);label(ctx,'Tím: lệch nhiều',225,105,colors[6],12);
    }
    label(ctx,'Tia tới',-195,-22,prismInputColor,12);label(ctx,'Tia trong lăng kính',-40,45,prismInputColor,11);label(ctx,'Tia ló',112,66,settings.prismRayColor,12);
    label(ctx,`Lăng kính · xoay ${settings.prismAngle}°`,-220,145,gray,15);
  } else if (item.diagram === 'mirror' || item.diagram === 'refraction') {
    ctx.strokeStyle = gray; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0,-105); ctx.lineTo(0,105); ctx.stroke();
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2; ctx.setLineDash([5,5]); ctx.beginPath(); ctx.moveTo(-220,0); ctx.lineTo(220,0); ctx.stroke(); ctx.setLineDash([]);
    if (item.diagram === 'mirror') {
      arrow(ctx,{x:-145,y:-95},{x:0,y:0},red,3,12); arrow(ctx,{x:0,y:0},{x:-145,y:95},green,3,12);
      // Vertical mirror: the normal is horizontal; both angles are measured from the normal, not from the mirror.
      ctx.strokeStyle=gray;ctx.setLineDash([5,5]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-205,0);ctx.lineTo(205,0);ctx.stroke();ctx.setLineDash([]);
      ctx.strokeStyle=red;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,42,Math.PI,Math.PI+Math.atan2(-95,-145)-Math.PI);ctx.stroke();
      ctx.strokeStyle=green;ctx.beginPath();ctx.arc(0,0,52,Math.PI+Math.atan2(95,-145)-Math.PI,Math.PI);ctx.stroke();
      label(ctx,'i',-77,-22,red,17);label(ctx,'i′',-80,39,green,17);label(ctx,'i = i′',-35,75,blue,15);label(ctx,'Pháp tuyến',75,15,gray,12);label(ctx,'Gương phẳng',15,-85,gray,16);
    }
    else {
      const waterToAir=settings.refractionDirection==='water-air';
      const nAir=1.0003,nWater=settings.refractiveIndex;
      const n1=waterToAir?nWater:nAir,n2=waterToAir?nAir:nWater;
      ctx.fillStyle='rgba(125,211,252,.22)';ctx.fillRect(-220,0,440,120);
      label(ctx,waterToAir?'Nước (n₁)':'Không khí (n₁)',-205,-82,gray,16);label(ctx,waterToAir?'Không khí (n₂)':'Nước (n₂)',-205,105,gray,16);
      const i=settings.incidentAngle*Math.PI/180;const ratio=n1*Math.sin(i)/n2;const tir=Math.abs(ratio)>1;const r=tir?i:Math.asin(Math.max(-1,Math.min(1,ratio)));
      // Incident ray approaches the horizontal interface from the upper medium; normal is vertical.
      arrow(ctx,{x:-180*Math.sin(i),y:-180*Math.cos(i)},{x:0,y:0},settings.prismRayColor||red,3,12);
      if(tir){arrow(ctx,{x:0,y:0},{x:180*Math.sin(i),y:-180*Math.cos(i)},settings.prismRayColor||green,3,12);label(ctx,'Phản xạ toàn phần',18,-35,green,14);}
      else arrow(ctx,{x:0,y:0},{x:180*Math.sin(r),y:180*Math.cos(r)},settings.prismRayColor||green,3,12);
      ctx.strokeStyle=gray;ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(0,-120);ctx.lineTo(0,120);ctx.stroke();ctx.setLineDash([]);
      // Draw clear angle arcs measured from the normal.
      ctx.strokeStyle=red;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,34,-Math.PI/2-i,-Math.PI/2);ctx.stroke();
      ctx.strokeStyle=green;ctx.beginPath();ctx.arc(0,0,43,Math.PI/2,Math.PI/2+r);ctx.stroke();
      label(ctx,`i = ${settings.incidentAngle}°`,-92,-45,red,14);label(ctx,`r = ${(r*180/Math.PI).toFixed(1)}°`,15,58,green,14);
      label(ctx,`Tia: ${waterToAir?'nước → không khí':'không khí → nước'} · màu không đổi`,-205,145,gray,13);label(ctx,`n₁=${n1.toFixed(2)} · n₂=${n2.toFixed(2)}`,-205,165,gray,14);
    }
  } else if (item.diagram === 'circuit') {
    // Mạch nối tiếp đúng quy ước: nguồn, điện trở và bóng đèn nằm trên cùng một vòng kín.
    ctx.strokeStyle=gray;ctx.lineWidth=3;ctx.beginPath();
    ctx.moveTo(-150,-65);ctx.lineTo(-48,-65);ctx.moveTo(48,-65);ctx.lineTo(150,-65);
    ctx.moveTo(150,-65);ctx.lineTo(150,-24);ctx.moveTo(150,24);ctx.lineTo(150,65);
    ctx.lineTo(-150,65);ctx.moveTo(-150,65);ctx.lineTo(-150,18);ctx.moveTo(-150,-18);ctx.lineTo(-150,-65);ctx.stroke();
    // Điện trở kí hiệu hình chữ nhật theo IEC, mắc nối tiếp trên nhánh trên.
    ctx.strokeStyle=blue;ctx.lineWidth=3;ctx.strokeRect(-48,-80,96,30);label(ctx,'R',-7,-59,blue,16);
    // Bóng đèn mắc nối tiếp ở nhánh phải.
    ctx.strokeStyle=gray;ctx.beginPath();ctx.arc(150,0,24,0,Math.PI*2);ctx.moveTo(133,-17);ctx.lineTo(167,17);ctx.moveTo(167,-17);ctx.lineTo(133,17);ctx.stroke();
    // Nguồn điện: bản cực dài (+) và ngắn (-), không nối tắt bằng dây qua hai cực.
    ctx.strokeStyle=red;ctx.lineWidth=3.5;ctx.beginPath();ctx.moveTo(-171,-18);ctx.lineTo(-129,-18);ctx.moveTo(-162,18);ctx.lineTo(-138,18);ctx.stroke();
    label(ctx,'+',-124,-22,red,15);label(ctx,'−',-124,24,blue,15);
    label(ctx,'Nguồn',-210,108,red,14);label(ctx,'Đèn',174,6,gray,14);label(ctx,'Mạch nối tiếp: nguồn – R – đèn',-112,132,blue,15);
  } else if (item.diagram.startsWith('graph-')) {
    const left=-220,top=-115,w=430,h=220;ctx.strokeStyle='#cbd5e1';ctx.lineWidth=1;
    // Align graph grid lines to the same 32 px board grid, including when the diagram is moved/scaled.
    const boardGrid=32, scale=Math.max(0.01,item.scale||1);
    const firstGlobalX=Math.ceil((item.at.x+left*scale)/boardGrid)*boardGrid;
    for(let gx=firstGlobalX;gx<=item.at.x+(left+w)*scale;gx+=boardGrid){const x=(gx-item.at.x)/scale;if(x>=left&&x<=left+w){ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x,top+h);ctx.stroke();}}
    const firstGlobalY=Math.ceil((item.at.y+top*scale)/boardGrid)*boardGrid;
    for(let gy=firstGlobalY;gy<=item.at.y+(top+h)*scale;gy+=boardGrid){const y=(gy-item.at.y)/scale;if(y>=top&&y<=top+h){ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(left+w,y);ctx.stroke();}}
    const functionGraph=item.diagram==='graph-function';const axisY=functionGraph?top+h/2:top+h;
    const xmax=settings.graphXMax,ymax=settings.graphYMax;
    // Lưới tọa độ có vạch chia và nhãn số rõ ràng, không phụ thuộc lưới trang trí của bảng.
    ctx.save();ctx.strokeStyle='#dbe4ee';ctx.lineWidth=1;ctx.fillStyle=gray;ctx.font='11px system-ui, sans-serif';
    for(let i=0;i<=5;i++){const x=left+w*i/5;ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x,top+h);ctx.stroke();ctx.fillText(String(Number((xmax*i/5).toFixed(2))),x-8,axisY+16);}
    for(let i=0;i<=5;i++){const y=top+h-h*i/5;ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(left+w,y);ctx.stroke();if(!functionGraph)ctx.fillText(String(Number((ymax*i/5).toFixed(2))),left-28,y+4);}
    ctx.restore();
    arrow(ctx,{x:left,y:axisY},{x:left+w+15,y:axisY},gray,2,9);arrow(ctx,{x:left,y:top+h},{x:left,y:top-18},gray,2,9);
    ctx.fillStyle=gray;ctx.font='12px system-ui, sans-serif';ctx.fillText('0',left-14,axisY+16);
    ctx.strokeStyle=blue;ctx.lineWidth=3;ctx.beginPath();
    const safeFunction=(x:number)=>{let expr=(item.equation||'2*x+1').replace(/\^/g,'**').replace(/\b(sin|cos|tan)\s*\(/gi,(_,fn:string)=>`Math.${fn.toLowerCase()}(`).replace(/\bX\b/g,'x');if(!/^[0-9x+*/().,\s^\-Mathsincota]+$/.test(expr)||/Math\.(?!sin|cos|tan)/.test(expr))return NaN;try{return Function('x',`'use strict'; return (${expr});`)(x) as number;}catch{return NaN;}};
    const plotPoints=item.graphPoints?.length?item.graphPoints:null;
    if(plotPoints){plotPoints.forEach((pt,i)=>{const px=left+(pt.x/xmax)*w,py=top+h-(pt.y/ymax)*h;if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);});ctx.stroke();
      // Dashed projection guides from each plotted point to both axes.
      ctx.save();ctx.strokeStyle='#64748b';ctx.lineWidth=1.4;ctx.setLineDash([5,4]);
      plotPoints.forEach((pt)=>{const px=left+(pt.x/xmax)*w,py=top+h-(pt.y/ymax)*h;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px,top+h);ctx.moveTo(px,py);ctx.lineTo(left,py);ctx.stroke();});ctx.restore();
      ctx.fillStyle=red;plotPoints.forEach((pt)=>{const px=left+(pt.x/xmax)*w,py=top+h-(pt.y/ymax)*h;ctx.beginPath();ctx.arc(px,py,5,0,Math.PI*2);ctx.fill();label(ctx,`(${pt.x}, ${pt.y})`,px+7,py-7,red,11);});} 
    else {for(let px=0;px<=w;px++){const x=px/w*xmax;let y=0;if(item.diagram==='graph-st')y=(x/xmax)*(x/xmax)*ymax*0.82;else if(item.diagram==='graph-vt')y=(x/xmax)*ymax*0.82;else if(item.diagram==='graph-at')y=ymax*0.42;else if(item.diagram==='graph-uv')y=Math.min(ymax,Math.max(0,x*0.7));else y=safeFunction(x);const py=functionGraph?top+h/2-(y/ymax)*(h/2):top+h-(y/ymax)*h;if(!Number.isFinite(y)||Math.abs(y)>ymax*4){ctx.moveTo(left+px,top+h);continue;}if(px===0)ctx.moveTo(left+px,py);else ctx.lineTo(left+px,py);}ctx.stroke();}
    label(ctx,item.diagram==='graph-st'?'Đồ thị s–t':item.diagram==='graph-vt'?'Đồ thị v–t':item.diagram==='graph-at'?'Đồ thị a–t':item.diagram==='graph-uv'?'Đồ thị U–I':`y = ${item.equation||'2*x+1'}`,-150,-135,blue,17);label(ctx,item.diagram==='graph-st'?'s (m)':item.diagram==='graph-vt'?'v (m/s)':item.diagram==='graph-at'?'a (m/s²)':item.diagram==='graph-uv'?'U (V)':'y',left-5,top-24,gray,13);label(ctx,item.diagram==='graph-uv'?'I (A)':functionGraph?'x':'t (s)',left+w-75,top+h+25,gray,13);
    label(ctx,`Trục x: 0–${xmax} · trục y: 0–${ymax}`,-130,145,gray,13);
  } else if (item.diagram==='harmonic' || item.diagram==='unit-circle') {
    if(item.diagram==='unit-circle'){ctx.strokeStyle=gray;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,100,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='#cbd5e1';ctx.beginPath();ctx.moveTo(-125,0);ctx.lineTo(125,0);ctx.moveTo(0,-125);ctx.lineTo(0,125);ctx.stroke();const a=settings.phase*Math.PI/180;arrow(ctx,{x:0,y:0},{x:100*Math.cos(a),y:-100*Math.sin(a)},blue,4,12);label(ctx,`φ=${settings.phase}°`,20,-115,blue,16);label(ctx,'cos φ',35,18,red,14);label(ctx,'sin φ',-60,-55,green,14);}
    else {ctx.strokeStyle=gray;ctx.beginPath();ctx.moveTo(-220,0);ctx.lineTo(220,0);ctx.moveTo(-210,-95);ctx.lineTo(-210,95);ctx.stroke();ctx.strokeStyle=blue;ctx.lineWidth=3;ctx.beginPath();for(let x=0;x<=420;x++){const t=x/420*2*Math.PI;const y=-settings.amplitude*25*Math.cos(settings.omega*t+settings.phase*Math.PI/180);if(x===0)ctx.moveTo(-210+x,y);else ctx.lineTo(-210+x,y);}ctx.stroke();label(ctx,`x = A cos(ωt + φ) · A=${settings.amplitude}, ω=${settings.omega}, φ=${settings.phase}°`,-215,130,blue,15);}
  } else if (['battery','resistor','lamp','switch','ammeter','voltmeter','wire'].includes(item.diagram)) {
    ctx.strokeStyle=gray;ctx.fillStyle='#ffffff';ctx.lineWidth=3;
    if(item.diagram==='battery'){ctx.beginPath();ctx.moveTo(-55,0);ctx.lineTo(-12,0);ctx.moveTo(-12,-28);ctx.lineTo(-12,28);ctx.moveTo(12,-16);ctx.lineTo(12,16);ctx.moveTo(12,0);ctx.lineTo(55,0);ctx.stroke();label(ctx,'+',-5,-36,red,18);label(ctx,'−',-25,35,blue,18);label(ctx,'Nguồn điện',-60,58,gray,14);}
    else if(item.diagram==='resistor'){ctx.beginPath();ctx.moveTo(-75,0);ctx.lineTo(-35,0);ctx.rect(-35,-16,70,32);ctx.moveTo(35,0);ctx.lineTo(75,0);ctx.stroke();label(ctx,'R',-5,6,gray,16);}
    else if(item.diagram==='lamp'){ctx.beginPath();ctx.arc(0,0,28,0,Math.PI*2);ctx.moveTo(-20,-20);ctx.lineTo(20,20);ctx.moveTo(20,-20);ctx.lineTo(-20,20);ctx.stroke();label(ctx,'Đèn',-22,52,gray,14);}
    else if(item.diagram==='switch'){const closed=!!item.switchClosed;ctx.beginPath();ctx.moveTo(-65,0);ctx.lineTo(-15,0);ctx.moveTo(15,0);ctx.lineTo(65,0);ctx.moveTo(-15,0);ctx.lineTo(closed?15:48,closed?0:-35);ctx.stroke();label(ctx,closed?'K đóng':'K mở',-30,42,gray,14);}
    else if(item.diagram==='ammeter'||item.diagram==='voltmeter'){ctx.beginPath();ctx.arc(0,0,32,0,Math.PI*2);ctx.stroke();label(ctx,item.diagram==='ammeter'?'A':'V',-8,7,blue,20);label(ctx,item.diagram==='ammeter'?'Ampe kế':'Vôn kế',-38,55,gray,14);}
    else {ctx.beginPath();ctx.moveTo(-90,0);ctx.lineTo(90,0);ctx.stroke();label(ctx,'Dây nối',-30,25,gray,14);}
  } else if (item.diagram === 'force-vector') {
    ctx.strokeStyle='#94a3b8';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-220,80);ctx.lineTo(220,80);ctx.moveTo(0,120);ctx.lineTo(0,-130);ctx.stroke();
    arrow(ctx,{x:0,y:0},{x:145,y:-70},blue,4,15);arrow(ctx,{x:0,y:0},{x:-90,y:-95},red,4,15);arrow(ctx,{x:0,y:0},{x:40,y:100},green,4,15);
    label(ctx,'F₁',150,-72,blue,19);label(ctx,'F₂',-120,-100,red,19);label(ctx,'P',48,115,green,19);label(ctx,'Các véc tơ lực',-80,155,gray,18);
  }
  ctx.restore();
}

function pointSegmentDistance(p:Point,a:Point,b:Point){const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy||1,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/l));return Math.hypot(p.x-(a.x+t*dx),p.y-(a.y+t*dy));}

export default function TeachingBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boardStageRef = useRef<HTMLElement>(null);
  const activeRef = useRef<Point[] | null>(null);
  const pointerDownRef = useRef(false);
  const dragRef = useRef<{id:string;offset:Point;mode?:'move'|'endpoint'|'vertex'|'curve';endpoint?:'from'|'to';index?:number}|null>(null);
  const [selectedId,setSelectedId] = useState<string|null>(null);
  const [items, setItems] = useState<BoardItem[]>([]);
  const [pages, setPages] = useState<BoardPage[]>([{id:uid(),title:'Trang 1',items:[]}]);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [redoItems, setRedoItems] = useState<BoardItem[][]>([]);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#172554');
  const [lineWidth, setLineWidth] = useState(4);
  const [grid, setGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [angleAssist, setAngleAssist] = useState(true);
  const [smartInk, setSmartInk] = useState(true);
  const [paper, setPaper] = useState<'white'|'dark'|'green'>('white');
  const [formulaSearch, setFormulaSearch] = useState('');
  const [subjectCode, setSubjectCode] = useState('KHTN');
  const [catalogEntries, setCatalogEntries] = useState<BoardCatalogEntry[]>([]);
  const [equationInput, setEquationInput] = useState('2*x+1');
  const [graphCoordinates, setGraphCoordinates] = useState('0,0; 2,20; 4,40; 6,60; 8,80; 10,100');
  const [classFilter, setClassFilter] = useState('Tất cả');
  const [message, setMessage] = useState('Trang bảng trống — bắt đầu viết, vẽ hoặc chọn hình mẫu.');
  const [showLibrary, setShowLibrary] = useState(true);
  const [lessonTitle, setLessonTitle] = useState('Bài học hôm nay');
  const [loaded, setLoaded] = useState(false);
  const [settings,setSettings] = useState<BoardSettings>({focalLength:60,objectDistance:120,objectHeight:58,prismAngle:0,incidentAngle:40,refractiveIndex:1.33,refractionDirection:'air-water',graphXMax:10,graphYMax:100,graphStep:1,graphMode:'graph-st',amplitude:3,omega:1,phase:0,prismRayColor:'#dc2626'});
  const updateSetting=(key:keyof BoardSettings,value:number|string)=>setSettings(old=>({...old,[key]:value}));

  const drawScene = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(W*dpr); canvas.height = Math.round(H*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const bg = paper === 'dark' ? '#111827' : paper === 'green' ? '#0f5132' : '#ffffff';
    ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);
    if (grid) {
      ctx.strokeStyle = paper === 'dark' ? '#334155' : paper === 'green' ? '#28734e' : '#e2e8f0'; ctx.lineWidth=1;
      for(let x=0;x<=W;x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
      for(let y=0;y<=H;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    }
    items.forEach(item=>{
      if(item.kind==='path'){
        if(item.points.length<1)return;
        ctx.save();ctx.strokeStyle=item.erase?bg:item.color;ctx.lineWidth=item.erase?Math.max(22,item.width*4):item.width;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(item.points[0].x,item.points[0].y);item.points.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));if(item.points.length===1)ctx.lineTo(item.points[0].x+.1,item.points[0].y+.1);ctx.stroke();ctx.restore();
      } else if(item.kind==='line'){
        ctx.strokeStyle=item.color;ctx.lineWidth=item.width;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(item.from.x,item.from.y);ctx.lineTo(item.to.x,item.to.y);ctx.stroke();
      } else if(item.kind==='shape'){
        drawGeometryShape(ctx,item.shape,item.from,item.to,item.color,item.width);
      } else if(item.kind==='arrow') arrow(ctx,item.from,item.to,item.color,item.width,Math.max(9,item.width*3.5));
      else if(item.kind==='text'){ctx.fillStyle=item.color;ctx.font=`600 ${item.size}px system-ui, sans-serif`;item.text.split(/\\n|\n/).forEach((line,index)=>ctx.fillText(line,item.at.x,item.at.y+index*(item.size+7)));}
      else drawDiagram(ctx,item,settings);
      if(item.id===selectedId && 'at' in item){ctx.save();ctx.strokeStyle='#7c3aed';ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.strokeRect(item.at.x-115,item.at.y-105,230,210);ctx.restore();}
    });
    const active=activeRef.current;
    if(active?.length){
      if(['dashed-line','circle','ellipse','triangle','rectangle','cube','cuboid','pyramid','cylinder','cone','sphere'].includes(tool)&&active.length){const a=active[0],b=active[active.length-1];drawGeometryShape(ctx,tool as Extract<BoardItem,{kind:'shape'}>['shape'],a,b,color,lineWidth,true);}
      else {ctx.strokeStyle=tool==='eraser'?bg:color;ctx.lineWidth=tool==='eraser'?Math.max(22,lineWidth*4):lineWidth;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(active[0].x,active[0].y);active.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));ctx.stroke();}
    }
  },[items,grid,paper,tool,color,lineWidth,settings,selectedId]);
  useEffect(()=>{drawScene();},[drawScene]);
  useEffect(()=>{
    const graphs=items.filter((it):it is Extract<BoardItem,{kind:'path'}>=>it.kind==='path'&&!!it.graph);
    if(!graphs.length)return;
    setItems(current=>{let changed=false;const next=current.map(it=>{if(it.kind!=='text'||!it.graphSourceId)return it;const g=graphs.find(x=>x.id===it.graphSourceId);if(!g)return it;const eq=g.points.slice(1).map((q,i)=>{const a=g.points[i],dx=q.x-a.x,dy=q.y-a.y;if(Math.abs(dx)<8)return `đoạn ${i+1}: đứng`;const m=-dy/dx,b=-a.y-m*a.x;const trend=Math.abs(m)<0.08?'ngang':m>0?'xiên tăng':'xiên giảm';return `đoạn ${i+1} (${trend}): y≈${m.toFixed(2)}x${b>=0?'+':'−'}${Math.abs(b).toFixed(1)}`;}).join(' ; ');const text=`Đồ thị vẽ tay — ${eq}`;if(it.text!==text){changed=true;return {...it,text};}return it;});return changed?next:current;});
  },[items]);

  useEffect(()=>{
    try {
      const raw=localStorage.getItem('khtnso-teaching-board-v2');
      if(raw){
        const parsed=JSON.parse(raw) as {items?:BoardItem[];pages?:BoardPage[];activePageIndex?:number;lessonTitle?:string;settings?:Partial<BoardSettings>};
        if(Array.isArray(parsed.pages)&&parsed.pages.length){
          const safePages=parsed.pages.filter(pg=>pg&&typeof pg.id==='string'&&Array.isArray(pg.items)).map((pg,i)=>({...pg,title:pg.title||`Trang ${i+1}`}));
          if(safePages.length){setPages(safePages);const index=Math.max(0,Math.min(safePages.length-1,parsed.activePageIndex||0));setActivePageIndex(index);setItems(safePages[index].items);}
        } else if(Array.isArray(parsed.items)) {
          // Tương thích dữ liệu bảng một trang từ các phiên bản trước.
          setItems(parsed.items);setPages([{id:uid(),title:'Trang 1',items:parsed.items}]);
        }
        if(parsed.lessonTitle)setLessonTitle(parsed.lessonTitle);
        if(parsed.settings)setSettings(old=>({...old,...parsed.settings}));
      }
    } catch { /* ignore old or invalid local save */ }
    setLoaded(true);
  },[]);
  useEffect(()=>{
    if(!loaded)return;
    setPages(old=>{
      const current=old[activePageIndex];
      if(!current||current.items===items)return old;
      return old.map((pg,i)=>i===activePageIndex?{...pg,items}:pg);
    });
  },[items,activePageIndex,loaded]);
  useEffect(()=>{if(loaded){try{localStorage.setItem('khtnso-teaching-board-v2',JSON.stringify({items,pages:pages.map((pg,i)=>i===activePageIndex?{...pg,items}:pg),activePageIndex,lessonTitle,settings}));}catch{/* storage may be full */}}},[items,pages,activePageIndex,lessonTitle,settings,loaded]);
  useEffect(()=>{
    let active=true;
    async function loadCatalog(){ if(!supabase)return; const {data}=await supabase.from('board_catalog').select('id,entry_type,subject_code,grade,title,content,description,status,sort_order').eq('status','published').order('sort_order').limit(500); if(active&&data)setCatalogEntries(data as BoardCatalogEntry[]); }
    void loadCatalog(); return()=>{active=false;};
  },[]);

  useEffect(()=>{const resize=()=>drawScene();window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize);},[drawScene]);

  const pointFromEvent = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const r=e.currentTarget.getBoundingClientRect();
    let x=Math.max(0,Math.min(W,(e.clientX-r.left)*W/r.width)), y=Math.max(0,Math.min(H,(e.clientY-r.top)*H/r.height));
    if(snapToGrid){x=Math.round(x/32)*32;y=Math.round(y/32)*32;}
    return {x,y};
  };
  const graphLocalPoint=(item:Extract<BoardItem,{kind:'diagram'}>,p:Point)=>({x:(p.x-item.at.x)/(item.scale||1),y:(p.y-item.at.y)/(item.scale||1)});
  const graphPointPixel=(pt:Point)=>({x:-220+(pt.x/settings.graphXMax)*430,y:-115+220-(pt.y/settings.graphYMax)*220});
  const applyGraphCoordinates=()=>{
    const parsed=graphCoordinates.split(';').map(part=>part.trim()).filter(Boolean).map(part=>part.split(/[ ,]+/).map(Number));
    if(parsed.length<2||parsed.some(pair=>pair.length!==2||!pair.every(Number.isFinite))){setMessage('Tọa độ chưa đúng. Nhập dạng (t,s): 0,0; 2,20; 4,40. Cần ít nhất hai điểm.');return;}
    const selected=items.find(it=>it.id===selectedId&&it.kind==='diagram'&&['graph-st','graph-vt','graph-at','graph-uv'].includes(it.diagram));
    const target=selected&&selected.kind==='diagram'?selected:items.find(it=>it.kind==='diagram'&&['graph-st','graph-vt','graph-at','graph-uv'].includes(it.diagram));
    if(!target||target.kind!=='diagram'){setMessage('Hãy chèn hoặc chọn một đồ thị s–t, v–t, a–t hoặc U–I trước.');return;}
    const points=parsed.map(([x,y])=>({x,y}));
    if(points.some(pt=>pt.x<0||pt.x>settings.graphXMax||pt.y<0||pt.y>settings.graphYMax)){setMessage(`Tọa độ phải nằm trong khoảng x: 0–${settings.graphXMax}, y: 0–${settings.graphYMax}. Có thể chỉnh giới hạn trục trước khi áp dụng.`);return;}
    setItems(old=>old.map(it=>it.id===target.id&&it.kind==='diagram'?{...it,graphPoints:points}:it));setSelectedId(target.id);setRedoItems([]);setMessage(`Đã vẽ đường biểu diễn qua ${points.length} điểm tọa độ. Kéo điểm đỏ để sửa riêng từng tọa độ hoặc kéo đoạn xanh để dịch đường.`);
  };
  const pointerDown=(e:React.PointerEvent<HTMLCanvasElement>)=>{
    const p=pointFromEvent(e);
    if(tool==='select'){
      let hit:{item:BoardItem;mode:'move'|'endpoint'|'vertex'|'curve';endpoint?:'from'|'to';index?:number}|null=null;
      // Prefer handles and individual graph vertices over selecting the whole object.
      for(const it of [...items].reverse()){
        if(it.kind==='diagram'&&it.graphPoints?.length&&['graph-st','graph-vt','graph-at','graph-uv'].includes(it.diagram)){
          const local=graphLocalPoint(it,p);const px=graphPointPixel(local);
          const vertex=it.graphPoints.findIndex(pt=>{const q=graphPointPixel(pt);return Math.hypot(q.x-local.x,q.y-local.y)<14/(it.scale||1);});
          if(vertex>=0){hit={item:it,mode:'vertex',index:vertex};break;}
          const pixels=it.graphPoints.map(graphPointPixel);if(pixels.slice(1).some((q,i)=>pointSegmentDistance(local,pixels[i],q)<12/(it.scale||1))){hit={item:it,mode:'curve'};break;}
        }
        if(it.kind==='line'||it.kind==='arrow'){
          if(Math.hypot(p.x-it.from.x,p.y-it.from.y)<14){hit={item:it,mode:'endpoint',endpoint:'from'};break;}
          if(Math.hypot(p.x-it.to.x,p.y-it.to.y)<14){hit={item:it,mode:'endpoint',endpoint:'to'};break;}
        }
        if(it.kind==='path'){
          const idx=it.points.findIndex(q=>Math.hypot(q.x-p.x,q.y-p.y)<13);
          if(idx>=0){hit={item:it,mode:'vertex',index:idx};break;}
        }
      }
      if(!hit){
        const found=[...items].reverse().find(it=>{
          if('at' in it)return Math.abs(it.at.x-p.x)<190&&Math.abs(it.at.y-p.y)<165;
          if(it.kind==='line'||it.kind==='arrow')return pointSegmentDistance(p,it.from,it.to)<18;
          if(it.kind==='shape'){const cx=(it.from.x+it.to.x)/2,cy=(it.from.y+it.to.y)/2,rx=Math.max(1,Math.abs(it.to.x-it.from.x)/2),ry=Math.max(1,Math.abs(it.to.y-it.from.y)/2);return it.shape==='dashed-line'?pointSegmentDistance(p,it.from,it.to)<18:Math.abs(Math.hypot((p.x-cx)/rx,(p.y-cy)/ry)-1)<0.22;}
          if(it.kind==='path')return it.points.some((q,i)=>i===0?Math.hypot(q.x-p.x,q.y-p.y)<18:i>0&&pointSegmentDistance(p,it.points[i-1],q)<12);
          return false;
        });
        if(found)hit={item:found,mode:'move'};
      }
      if(hit){const found=hit.item;setSelectedId(found.id);dragRef.current={id:found.id,offset:hit.mode==='move'&&'at' in found?{x:p.x-found.at.x,y:p.y-found.at.y}:p,mode:hit.mode,endpoint:hit.endpoint,index:hit.index};e.currentTarget.setPointerCapture(e.pointerId);pointerDownRef.current=true;setMessage(hit.mode==='endpoint'?'Kéo đầu dây để thay đổi chiều dài hoặc hướng.':hit.mode==='vertex'?'Kéo điểm nút để chỉnh riêng đường biểu diễn.':hit.mode==='curve'?'Kéo đoạn đường biểu diễn để dịch riêng đường, không di chuyển hệ trục.':'Đang di chuyển đối tượng; kéo để đặt lại vị trí.');}
      else{setSelectedId(null);setMessage('Chọn gần hình, đường, điểm nút hoặc đầu dây.');}return;
    }
    if(tool==='text'){const p=pointFromEvent(e);const value=window.prompt('Nhập nội dung cần ghi lên bảng:');if(value?.trim()){setItems(old=>[...old,{id:uid(),kind:'text',at:p,text:value.trim(),color,size:26}]);setRedoItems([]);setMessage('Đã thêm chữ lên bảng.');}return;}
    e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);pointerDownRef.current=true;activeRef.current=[p];drawScene();
  };
  const pointerMove=(e:React.PointerEvent<HTMLCanvasElement>)=>{
    if(!pointerDownRef.current)return;const p=pointFromEvent(e);
    if(dragRef.current){const d=dragRef.current;setItems(old=>old.map(it=>{
      if(it.id!==d.id)return it;
      if(d.mode==='endpoint'&&(it.kind==='line'||it.kind==='arrow'))return {...it,[d.endpoint||'to']:p};
      if(d.mode==='vertex'&&it.kind==='path'&&d.index!==undefined){const points=it.points.map((q,i)=>i===d.index?p:q);if(it.graph){const eq=points.slice(1).map((q,i)=>{const a=points[i],dx=q.x-a.x,dy=q.y-a.y;if(Math.abs(dx)<8)return `đoạn ${i+1}: đứng`;const m=-dy/dx,b=-a.y-m*a.x;const trend=Math.abs(m)<0.08?'ngang':m>0?'xiên tăng':'xiên giảm';return `đoạn ${i+1} (${trend}): y≈${m.toFixed(2)}x${b>=0?'+':'−'}${Math.abs(b).toFixed(1)}`;}).join(' ; ');return {...it,points};}return {...it,points};}
      if(d.mode==='vertex'&&it.kind==='diagram'&&it.graphPoints&&d.index!==undefined){const local=graphLocalPoint(it,p);const px=local.x+220,py=local.y+115;const point={x:Math.max(0,Math.min(settings.graphXMax,px/430*settings.graphXMax)),y:Math.max(0,Math.min(settings.graphYMax,(220-py)/220*settings.graphYMax))};return {...it,graphPoints:it.graphPoints.map((q,i)=>i===d.index?point:q)};}
      if(d.mode==='curve'&&it.kind==='diagram'&&it.graphPoints){const dx=p.x-d.offset.x,dy=p.y-d.offset.y;const dataDx=dx/(it.scale||1)/430*settings.graphXMax,dataDy=-dy/(it.scale||1)/220*settings.graphYMax;dragRef.current={...d,offset:p};return {...it,graphPoints:it.graphPoints.map(q=>({x:Math.max(0,Math.min(settings.graphXMax,q.x+dataDx)),y:Math.max(0,Math.min(settings.graphYMax,q.y+dataDy))}))};}
      if('at' in it)return {...it,at:{x:p.x-d.offset.x,y:p.y-d.offset.y}} as BoardItem;
      const dx=p.x-d.offset.x,dy=p.y-d.offset.y;
      if(it.kind==='line'||it.kind==='arrow'||it.kind==='shape')return {...it,from:{x:it.from.x+dx,y:it.from.y+dy},to:{x:it.to.x+dx,y:it.to.y+dy}};
      if(it.kind==='path')return {...it,points:it.points.map(q=>({x:q.x+dx,y:q.y+dy}))};return it;
    }));
    if(d.mode==='move'&&!('at' in (items.find(it=>it.id===d.id)||{} as BoardItem)))dragRef.current={...d,offset:p};
    return;}
    if(activeRef.current)activeRef.current=[...activeRef.current,p];drawScene();
  };
  const pointerUp=(e:React.PointerEvent<HTMLCanvasElement>)=>{
    if(!pointerDownRef.current)return;pointerDownRef.current=false;if(dragRef.current){dragRef.current=null;setRedoItems([]);return;}const p=pointFromEvent(e);const pts=activeRef.current||[];activeRef.current=null;if(!pts.length)return;
    if(tool==='pen'||tool==='eraser'){
      const all=[...pts,p];
      // Nhận dạng nét hình học cơ bản hoàn toàn tại trình duyệt; không gửi nét vẽ lên máy chủ.
      if(tool==='pen'&&smartInk&&all.length>=8){
        const xs=all.map(q=>q.x),ys=all.map(q=>q.y),left=Math.min(...xs),right=Math.max(...xs),top=Math.min(...ys),bottom=Math.max(...ys);
        const w=right-left,h=bottom-top,diag=Math.hypot(w,h),first=all[0],last=all[all.length-1];
        const closed=diag>18&&Math.hypot(first.x-last.x,first.y-last.y)<diag*0.22;
        const pathLength=all.slice(1).reduce((sum,q,i)=>sum+Math.hypot(q.x-all[i].x,q.y-all[i].y),0);
        const straightness=pathLength>0?Math.hypot(last.x-first.x,last.y-first.y)/pathLength:0;
        if(!closed&&straightness>0.94){
          setItems(old=>[...old,{id:uid(),kind:'line',from:first,to:last,color,width:lineWidth}]);
          setMessage('Đã nhận dạng nét thẳng và chuyển thành đoạn thẳng có thể chỉnh sửa.');
        }else if(closed&&w>16&&h>16){
          const cx=(left+right)/2,cy=(top+bottom)/2,rx=w/2,ry=h/2;
          const radial=all.slice(0,-1).map(q=>Math.hypot((q.x-cx)/rx,(q.y-cy)/ry));
          const mean=radial.reduce((a,b)=>a+b,0)/radial.length;
          const variance=radial.reduce((a,b)=>a+(b-mean)**2,0)/radial.length;
          const radialCv=mean>0?Math.sqrt(variance)/mean:1;
          if(radialCv<0.24){
            const shape:Extract<BoardItem,{kind:'shape'}>['shape']=Math.abs(w-h)/Math.max(w,h)<0.16?'circle':'ellipse';
            setItems(old=>[...old,{id:uid(),kind:'shape',shape,from:{x:left,y:top},to:{x:right,y:bottom},color,width:lineWidth}]);
            setMessage(shape==='circle'?'Đã nhận dạng nét vẽ thành hình tròn chuẩn.':'Đã nhận dạng nét vẽ thành hình elip chuẩn.');
          }else setItems(old=>[...old,{id:uid(),kind:'path',points:all,color,width:lineWidth}]);
        }else setItems(old=>[...old,{id:uid(),kind:'path',points:all,color,width:lineWidth}]);
      }else setItems(old=>[...old,{id:uid(),kind:'path',points:all,color,width:lineWidth,erase:tool==='eraser'}]);
    }
    else if(tool==='graph'){const all=[...pts,p];const simplified=all.filter((q,i)=>i===0||i===all.length-1||i%Math.max(1,Math.floor(all.length/4))===0);const unique=simplified.length>=2?simplified:[all[0],p];const eq=unique.slice(1).map((q,i)=>{const a=unique[i],dx=q.x-a.x,dy=q.y-a.y;if(Math.abs(dx)<8)return `đoạn ${i+1}: t ≈ ${((a.x+q.x)/2).toFixed(0)} (đứng)`;const m=-dy/dx,b=a.y*-1-m*a.x;const trend=Math.abs(m)<0.08?'ngang':m>0?'xiên tăng':'xiên giảm';return `đoạn ${i+1} (${trend}): s ≈ ${m.toFixed(2)}t ${b>=0?'+':'−'} ${Math.abs(b).toFixed(1)}`;}).join(' ; ');const graphId=uid();setItems(old=>[...old,{id:graphId,kind:'path',points:all,color,width:Math.max(3,lineWidth),erase:false,graph:true},{id:uid(),kind:'text',at:{x:Math.min(...all.map(q=>q.x)),y:Math.min(H-25,Math.max(...all.map(q=>q.y))+28)},text:`Đồ thị vẽ tay — ${eq}`,color,size:16,graphSourceId:graphId}]);setMessage('Đã tạo đồ thị vẽ tay và phương trình xấp xỉ từng đoạn theo tọa độ bảng. Đây là phương trình xấp xỉ trên bảng, chưa tự quy đổi theo thang số vật lý.');}
    else if(tool==='line'||tool==='arrow'){const start=pts[0];let end=p;if(angleAssist){const dx=p.x-start.x,dy=p.y-start.y,len=Math.hypot(dx,dy),angle=Math.atan2(dy,dx),step=Math.PI/4, snapped=Math.round(angle/step)*step; if(Math.abs(angle-snapped)<Math.PI/18)end={x:start.x+Math.cos(snapped)*len,y:start.y+Math.sin(snapped)*len};}setItems(old=>[...old,{id:uid(),kind:tool,from:start,to:end,color,width:lineWidth}]);}
    else if(['dashed-line','circle','ellipse','triangle','rectangle','cube','cuboid','pyramid','cylinder','cone','sphere'].includes(tool)){const start=pts[0];setItems(old=>[...old,{id:uid(),kind:'shape',shape:tool as Extract<BoardItem,{kind:'shape'}>['shape'],from:start,to:p,color,width:lineWidth}]);}
    setRedoItems([]);setMessage(tool==='eraser'?'Đã tẩy nét.':'Đã ghi lên bảng.');
  };
  const addDiagram=(diagram:Diagram)=>{setItems(old=>[...old,{id:uid(),kind:'diagram',diagram,at:{x:W/2,y:H/2},scale:1}]);setRedoItems([]);setMessage('Đã thêm hình mẫu. Có thể tiếp tục vẽ, ghi chú hoặc xóa bằng công cụ tẩy.');};
  const addComponent=(diagram:Diagram)=>{if(diagram==='wire'){setItems(old=>[...old,{id:uid(),kind:'line',from:{x:W/2-90,y:H/2},to:{x:W/2+90,y:H/2},color,width:Math.max(3,lineWidth)}]);setRedoItems([]);setMessage('Đã thêm dây nối. Chọn / di chuyển rồi kéo một đầu dây để đổi độ dài hoặc hướng.');return;}setItems(old=>[...old,{id:uid(),kind:'diagram',diagram,at:{x:W/2,y:H/2},scale:1}]);setRedoItems([]);setMessage('Đã chèn dụng cụ riêng lẻ; có thể xoay, thay đổi kích thước và lắp mạch.');};
  const addMotionGraphSet=()=>{const common={kind:'diagram' as const,scale:0.62};const y=H/2;setItems(old=>[...old,{...common,id:uid(),diagram:'graph-st',at:{x:245,y}},{...common,id:uid(),diagram:'graph-vt',at:{x:600,y}},{...common,id:uid(),diagram:'graph-at',at:{x:955,y}}]);setRedoItems([]);setMessage('Đã chèn bộ đồ thị chuyển động biến đổi đều: s–t dạng parabol, v–t là đường thẳng, a–t nằm ngang. Có thể chọn từng đồ thị để di chuyển.');};
  const addFunctionGraph=()=>{const expr=equationInput.trim();const normalized=expr.replace(/\b(sin|cos|tan)\s*\(/gi,'').replace(/[xX]/g,'');if(!expr||!/^[0-9+*/().,\s^\-]*$/.test(normalized)||/[a-wyzA-WYZ]/.test(expr.replace(/\b(sin|cos|tan)\b/gi,'').replace(/[xX]/g,''))){setMessage('Có thể dùng x, số, + − * /, ngoặc, lũy thừa ^ và các hàm sin(x), cos(x), tan(x). Ví dụ: sin(x), cos(2*x), 3*sin(x)+1, x^2-4. Góc được tính theo radian.');return;}setItems(old=>[...old,{id:uid(),kind:'diagram',diagram:'graph-function',at:{x:W/2,y:H/2},scale:1,equation:expr}]);setRedoItems([]);setMessage(`Đã tạo đồ thị y = ${expr}. Hàm lượng giác dùng radian. Chọn / di chuyển để kéo đồ thị đến vị trí mong muốn.`);};
  const combineVectors=()=>{const vectors=items.filter((it):it is Extract<BoardItem,{kind:'arrow'}>=>it.kind==='arrow');if(vectors.length<2){setMessage('Hãy dùng công cụ Véc tơ / mũi tên để vẽ ít nhất hai véc tơ, sau đó nhấn Tổng hợp véc tơ.');return;}const dx=vectors.reduce((sum,v)=>sum+v.to.x-v.from.x,0),dy=vectors.reduce((sum,v)=>sum+v.to.y-v.from.y,0);const origin={x:120,y:H-110};const end={x:Math.max(15,Math.min(W-15,origin.x+dx)),y:Math.max(15,Math.min(H-15,origin.y+dy))};setItems(old=>[...old,{id:uid(),kind:'arrow',from:origin,to:end,color:'#059669',width:5},{id:uid(),kind:'text',at:{x:origin.x+10,y:origin.y+28},text:`R = Σv (${vectors.length} véc tơ)`,color:'#059669',size:20}]);setRedoItems([]);setMessage(`Đã tổng hợp ${vectors.length} véc tơ bằng cách cộng các thành phần tọa độ; véc tơ hợp lực màu xanh lá được đặt gần góc dưới bên trái.`);};
  const addFormula=(f:Formula)=>{setItems(old=>[...old,{id:uid(),kind:'text',at:{x:55,y:90+old.filter(i=>i.kind==='text').length*38},text:`${f.name}: ${f.expression}`,color,size:27}]);setRedoItems([]);setMessage(`Đã ghi công thức ${f.name} lên bảng.`);};
  const undo=()=>{setItems(old=>{if(!old.length)return old;setRedoItems(r=>[...r,old]);setMessage('Đã hoàn tác thao tác gần nhất.');return old.slice(0,-1);});};
  const redo=()=>{setRedoItems(old=>{if(!old.length)return old;const next=old[old.length-1];setItems(cur=>[...cur,next[next.length-1]]);setMessage('Đã làm lại thao tác.');return old.slice(0,-1);});};

  useEffect(()=>{
    const onKeyDown=(event:KeyboardEvent)=>{
      const target=event.target as HTMLElement|null;
      if(target&&(['INPUT','TEXTAREA','SELECT'].includes(target.tagName)||target.isContentEditable))return;
      if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'){event.preventDefault();if(event.shiftKey)redo();else undo();}
      else if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='y'){event.preventDefault();redo();}
      else if((event.key==='Delete'||event.key==='Backspace')&&selectedId){event.preventDefault();setItems(old=>old.filter(it=>it.id!==selectedId));setSelectedId(null);setRedoItems([]);setMessage('Đã xóa đối tượng đang chọn.');}
      else if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='d'&&selectedId){event.preventDefault();duplicateSelected();}
      else if(event.key.toLowerCase()==='v')setTool('select');
      else if(event.key.toLowerCase()==='p')setTool('pen');
      else if(event.key.toLowerCase()==='l')setTool('line');
      else if(event.key.toLowerCase()==='a')setTool('arrow');
      else if(event.key.toLowerCase()==='t')setTool('text');
      else if(event.key==='Escape')setTool('select');
    };
    window.addEventListener('keydown',onKeyDown);return()=>window.removeEventListener('keydown',onKeyDown);
  },[selectedId,redoItems,items]);

  const clearBoard=()=>{if(!items.length)return;if(window.confirm('Xóa toàn bộ nội dung trên trang bảng hiện tại?')){setItems([]);setRedoItems([]);setSelectedId(null);setMessage('Đã xóa nội dung trang hiện tại. Các trang khác được giữ nguyên.');}};
  const switchBoardPage=(index:number)=>{if(index<0||index>=pages.length||index===activePageIndex)return;const target=pages[index];setItems(target.items);setActivePageIndex(index);setSelectedId(null);setRedoItems([]);setMessage(`Đã chuyển đến ${target.title}.`);};
  const addBoardPage=()=>{const next:BoardPage={id:uid(),title:`Trang ${pages.length+1}`,items:[]};setPages(old=>[...old.map((pg,i)=>i===activePageIndex?{...pg,items}:pg),next]);setItems([]);setActivePageIndex(pages.length);setSelectedId(null);setRedoItems([]);setMessage('Đã thêm trang bảng mới.');};
  const deleteBoardPage=()=>{if(pages.length<=1){setMessage('Bảng cần giữ ít nhất một trang.');return;}if(!window.confirm(`Xóa ${pages[activePageIndex]?.title||'trang hiện tại'}?`))return;const nextPages=pages.filter((_,i)=>i!==activePageIndex);const nextIndex=Math.max(0,Math.min(activePageIndex-1,nextPages.length-1));setPages(nextPages);setActivePageIndex(nextIndex);setItems(nextPages[nextIndex].items);setSelectedId(null);setRedoItems([]);setMessage('Đã xóa trang bảng được chọn.');};
  const duplicateBoardPage=()=>{const copies=items.map(it=>{const copy={...it,id:uid()} as BoardItem;if('at' in copy)copy.at={x:Math.min(W-80,copy.at.x+24),y:Math.min(H-60,copy.at.y+24)};else if(copy.kind==='line'||copy.kind==='arrow'||copy.kind==='shape'){copy.from={x:copy.from.x+24,y:copy.from.y+24};copy.to={x:copy.to.x+24,y:copy.to.y+24};}else if(copy.kind==='path')copy.points=copy.points.map(pt=>({x:pt.x+24,y:pt.y+24}));return copy;});const next:BoardPage={id:uid(),title:`${pages[activePageIndex]?.title||'Trang'} (bản sao)`,items:copies};setPages(old=>[...old.map((pg,i)=>i===activePageIndex?{...pg,items}:pg),next]);setItems(copies);setActivePageIndex(pages.length);setSelectedId(null);setRedoItems([]);setMessage('Đã nhân bản trang hiện tại để tạo một phiên bản chỉnh sửa riêng.');};
  const renameActivePage=(title:string)=>setPages(old=>old.map((pg,i)=>i===activePageIndex?{...pg,title:title||`Trang ${i+1}`}:pg));
  const deleteSelected=()=>{if(!selectedId)return;setItems(old=>old.filter(it=>it.id!==selectedId));setSelectedId(null);setRedoItems([]);setMessage('Đã xóa đối tượng đang chọn.');};
  const duplicateSelected=()=>{const selected=items.find(it=>it.id===selectedId);if(!selected)return;let copy={...selected,id:uid()} as BoardItem;if('at' in copy)copy.at={x:Math.min(W-60,copy.at.x+28),y:Math.min(H-50,copy.at.y+28)};else if(copy.kind==='line'||copy.kind==='arrow'||copy.kind==='shape'){copy.from={x:copy.from.x+28,y:copy.from.y+28};copy.to={x:copy.to.x+28,y:copy.to.y+28};}else if(copy.kind==='path')copy.points=copy.points.map(pt=>({x:pt.x+28,y:pt.y+28}));setItems(old=>[...old,copy]);setSelectedId(copy.id);setRedoItems([]);setMessage('Đã nhân bản đối tượng.');};
  const toggleFullscreen=()=>{const el=boardStageRef.current as (HTMLElement&{requestFullscreen?:()=>Promise<void>})|null;if(!el)return;if(document.fullscreenElement){void document.exitFullscreen();}else if(el.requestFullscreen){void el.requestFullscreen();}};
  const saveBoard=()=>{try{const allPages=pages.map((pg,i)=>i===activePageIndex?{...pg,items}:pg);localStorage.setItem('khtnso-teaching-board-v2',JSON.stringify({items,pages:allPages,activePageIndex,lessonTitle,settings}));setPages(allPages);setMessage(`Đã lưu ${allPages.length} trang bảng trên trình duyệt này.`);}catch{setMessage('Không thể lưu vào trình duyệt; hãy xuất PNG để lưu bản vẽ.');}};
  const exportPng=()=>{const canvas=canvasRef.current;if(!canvas)return;const a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download=`${(pages[activePageIndex]?.title||lessonTitle).trim().replace(/[^\p{L}\p{N}-]+/gu,'-')||'bang-day-hoc'}-trang-${activePageIndex+1}.png`;a.click();setMessage('Đã xuất ảnh PNG của trang hiện tại.');};
  const exportLesson=()=>{const allPages=pages.map((pg,i)=>i===activePageIndex?{...pg,items}:pg);const blob=new Blob([JSON.stringify({format:'KHTNSO-BOARD',version:3,lessonTitle,settings,pages:allPages,activePageIndex},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`${lessonTitle.trim().replace(/[^\p{L}\p{N}-]+/gu,'-')||'bai-giang'}-bang-tuong-tac.json`;a.click();URL.revokeObjectURL(url);setMessage('Đã xuất tệp bài giảng để sao lưu hoặc chuyển sang máy khác.');};
  const importLesson=async(event:React.ChangeEvent<HTMLInputElement>)=>{const file=event.target.files?.[0];if(!file)return;try{const data=JSON.parse(await file.text()) as {format?:string;pages?:BoardPage[];activePageIndex?:number;lessonTitle?:string;settings?:Partial<BoardSettings>};if(data.format!=='KHTNSO-BOARD'||!Array.isArray(data.pages)||!data.pages.length||data.pages.some(pg=>!pg||!Array.isArray(pg.items)))throw new Error('invalid');const imported=data.pages.map((pg,i)=>({...pg,id:typeof pg.id==='string'?pg.id:uid(),title:typeof pg.title==='string'?pg.title:`Trang ${i+1}`}));const index=Math.max(0,Math.min(imported.length-1,data.activePageIndex||0));setPages(imported);setActivePageIndex(index);setItems(imported[index].items);setSelectedId(null);setRedoItems([]);if(data.lessonTitle)setLessonTitle(data.lessonTitle);if(data.settings)setSettings(old=>({...old,...data.settings}));setMessage(`Đã nhập bài giảng gồm ${imported.length} trang.`);}catch{setMessage('Tệp không đúng định dạng bài giảng bảng tương tác KHTN SỐ.');}finally{event.target.value='';}};
  const filteredFormulas=subjectCode==='KHTN' ? formulas.filter(f=>(classFilter==='Tất cả'||f.group.startsWith(classFilter))&&`${f.name} ${f.expression} ${f.group}`.toLowerCase().includes(formulaSearch.toLowerCase())) : []; 
  const selectedCatalog = catalogEntries.filter(e=>e.subject_code===subjectCode && (e.grade===0 || classFilter==='Tất cả' || e.grade===Number(classFilter.replace('Lớp ',''))));
  const customFormulas = selectedCatalog.filter(e=>e.entry_type==='formula' && `${e.title} ${e.content} ${e.description}`.toLowerCase().includes(formulaSearch.toLowerCase()));
  const customTemplates = selectedCatalog.filter(e=>e.entry_type==='template' && `${e.title} ${e.content} ${e.description}`.toLowerCase().includes(formulaSearch.toLowerCase()));
  const toolBtn=(id:Tool,labelText:string,Icon:typeof Pencil)=><button key={id} onClick={()=>setTool(id)} title={labelText} aria-pressed={tool===id} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold border transition ${tool===id?'border-blue-600 bg-blue-600 text-white shadow':'border-slate-200 bg-white text-slate-700 hover:bg-sky-50'}`}><Icon size={17}/><span className="hidden sm:inline">{labelText}</span></button>;

  return <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-violet-50 text-slate-800">
    <div className="mx-auto max-w-[1600px] px-3 py-4 sm:px-5 sm:py-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-indigo-700 via-blue-600 to-cyan-500 p-5 text-white shadow-xl sm:p-7">
        <div className="min-w-0"><p className="text-xs font-black tracking-[.2em] text-cyan-100">KHTN SỐ · BẢNG DẠY HỌC SỐ</p><h1 className="mt-2 text-2xl font-black sm:text-4xl">Bảng tương tác đa môn</h1><p className="mt-2 max-w-3xl text-sm text-white/90 sm:text-base">Viết, vẽ, giải bài và xây dựng tiến trình bài giảng trực tiếp — không phải trình chiếu slide.</p></div>
        <div className="flex flex-wrap gap-2"><button onClick={saveBoard} className="rounded-xl border border-white/30 bg-white/15 px-3 py-2 text-sm font-bold hover:bg-white/25"><Save className="mr-1 inline" size={16}/>Lưu bảng</button><button onClick={exportPng} className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-blue-700 hover:bg-cyan-50"><Download className="mr-1 inline" size={16}/>Xuất PNG</button><button onClick={exportLesson} className="rounded-xl border border-white/30 bg-white/15 px-3 py-2 text-sm font-bold hover:bg-white/25"><Download className="mr-1 inline" size={16}/>Sao lưu bài giảng</button><label className="cursor-pointer rounded-xl border border-white/30 bg-white/15 px-3 py-2 text-sm font-bold hover:bg-white/25"><RotateCcw className="mr-1 inline" size={16}/>Nhập bài giảng<input type="file" accept="application/json,.json" onChange={importLesson} className="hidden"/></label></div>
      </header>
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <label className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm sm:col-span-2"><span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Tên bài học / tiết dạy</span><input value={lessonTitle} onChange={e=>setLessonTitle(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-lg font-bold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Nhập tên bài học…"/></label>
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-sky-100 bg-white p-3 shadow-sm"><span className="mr-1 text-xs font-bold uppercase tracking-wide text-slate-500">Nền bảng</span><button onClick={()=>setPaper('white')} className={`rounded-lg border px-3 py-2 text-sm font-bold ${paper==='white'?'border-blue-600 bg-blue-50':'border-slate-200'}`}>Trắng</button><button onClick={()=>setPaper('green')} className={`rounded-lg border px-3 py-2 text-sm font-bold ${paper==='green'?'border-emerald-600 bg-emerald-50':'border-slate-200'}`}>Xanh</button><button onClick={()=>setPaper('dark')} className={`rounded-lg border px-3 py-2 text-sm font-bold ${paper==='dark'?'border-slate-700 bg-slate-200':'border-slate-200'}`}>Tối</button></div>
      </div>
      <section className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm"><label className="text-sm font-black text-slate-700" htmlFor="board-subject">Môn học đang dạy</label><select id="board-subject" value={subjectCode} onChange={e=>setSubjectCode(e.target.value)} className="min-w-[240px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold">{boardSubjects.map(s=><option key={s.code} value={s.code}>{s.name}</option>)}</select><span className="text-xs text-slate-500">Công thức và mẫu do Admin xuất bản sẽ lọc theo môn đã chọn.</span><a href="/admin/board-config" className="ml-auto rounded-xl border border-blue-200 px-3 py-2 text-sm font-bold text-blue-800 hover:bg-blue-50">CMS mẫu bảng ↗</a></section>
            <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section ref={boardStageRef} className="min-w-0 overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-lg">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 p-3 sm:p-4">
            {toolBtn('select','Chọn / di chuyển',Hand)}{toolBtn('pen','Bút viết',Pencil)}{toolBtn('eraser','Tẩy',Eraser)}{toolBtn('line','Đoạn thẳng',Minus)}{toolBtn('dashed-line','Nét đứt',Minus)}{toolBtn('circle','Hình tròn',Circle)}{toolBtn('ellipse','Hình elip',Circle)}{toolBtn('triangle','Tam giác',Square)}{toolBtn('rectangle','Hình chữ nhật',Square)}<details className="relative z-20"><summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-black text-violet-800 hover:bg-violet-100">Hình không gian ▾</summary><div className="absolute left-0 top-full mt-2 grid min-w-[210px] grid-cols-2 gap-2 rounded-2xl border border-violet-200 bg-white p-3 shadow-xl">{(['cube','cuboid','pyramid','cylinder','cone','sphere'] as Tool[]).map((shape)=>{const names:Record<string,string>={cube:'Lập phương',cuboid:'Hộp chữ nhật',pyramid:'Hình chóp',cylinder:'Hình trụ',cone:'Hình nón',sphere:'Hình cầu'};return <button key={shape} onClick={()=>setTool(shape)} aria-pressed={tool===shape} className={`rounded-lg border px-3 py-2 text-left text-xs font-bold ${tool===shape?'border-violet-600 bg-violet-100 text-violet-900':'border-slate-200 bg-white text-slate-700 hover:bg-violet-50'}`}>{names[shape]}</button>;})}</div></details>{toolBtn('arrow','Véc tơ / mũi tên',ArrowUpRight)}<button onClick={combineVectors} className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100" title="Cộng các véc tơ đã vẽ theo thành phần tọa độ">Tổng hợp véc tơ</button>{toolBtn('text','Chữ',Type)}{toolBtn('graph','Đồ thị tay',Pencil)}
            <div className="mx-1 hidden h-8 w-px bg-slate-200 sm:block"/><label title="Màu nét" className="flex items-center gap-2 rounded-xl border border-slate-200 px-2 py-1.5 text-xs font-bold">Màu <input type="color" value={color} onChange={e=>setColor(e.target.value)} className="h-7 w-8 cursor-pointer border-0 bg-transparent"/></label>
            <label className="flex min-w-28 items-center gap-2 rounded-xl border border-slate-200 px-2 py-1.5 text-xs font-bold">Nét <input aria-label="Độ dày nét" type="range" min="1" max="14" value={lineWidth} onChange={e=>setLineWidth(Number(e.target.value))} className="w-16 accent-blue-600"/>{lineWidth}</label>
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold"><input type="checkbox" checked={grid} onChange={e=>setGrid(e.target.checked)} className="accent-blue-600"/>Lưới</label><label title="Hút điểm vẽ vào giao điểm lưới" className="flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-bold text-sky-900"><input type="checkbox" checked={snapToGrid} onChange={e=>setSnapToGrid(e.target.checked)} className="accent-blue-600"/>Bắt điểm</label><label title="Tự căn véc tơ theo các góc 45° gần nhất" className="flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-900"><input type="checkbox" checked={angleAssist} onChange={e=>setAngleAssist(e.target.checked)} className="accent-violet-600"/>Căn góc</label><label title="Tự chuyển nét thẳng, hình tròn và elip vẽ tay thành hình chuẩn" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-900"><input type="checkbox" checked={smartInk} onChange={e=>setSmartInk(e.target.checked)} className="accent-emerald-600"/>Nét thông minh</label>
            <div className="ml-auto flex gap-2"><button onClick={undo} disabled={!items.length} title="Hoàn tác" className="rounded-xl border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-40"><Undo2 size={18}/></button><button onClick={redo} disabled={!redoItems.length} title="Làm lại" className="rounded-xl border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-40"><Redo2 size={18}/></button><button onClick={clearBoard} title="Xóa toàn bảng" className="rounded-xl border border-rose-200 p-2 text-rose-600 hover:bg-rose-50"><Trash2 size={18}/></button></div>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2">
            <span className="text-xs font-black uppercase tracking-wide text-slate-500">Trang bài giảng</span>
            <button onClick={()=>switchBoardPage(activePageIndex-1)} disabled={activePageIndex===0} className="rounded-lg border bg-white p-2 disabled:opacity-40" title="Trang trước"><ChevronLeft size={16}/></button>
            <div className="flex min-w-0 flex-1 flex-wrap gap-1">{pages.map((pg,i)=><button key={pg.id} onClick={()=>switchBoardPage(i)} className={`max-w-36 truncate rounded-lg border px-3 py-2 text-xs font-bold ${i===activePageIndex?'border-blue-600 bg-blue-600 text-white':'border-slate-200 bg-white text-slate-700 hover:bg-blue-50'}`} title={pg.title}>{i+1}. {pg.title}</button>)}</div>
            <button onClick={addBoardPage} className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50"><Plus size={14} className="mr-1 inline"/>Trang mới</button>
            <button onClick={duplicateBoardPage} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold hover:bg-slate-100" title="Nhân bản toàn bộ trang"><Copy size={14} className="mr-1 inline"/>Nhân bản trang</button><button onClick={deleteBoardPage} disabled={pages.length<=1} className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-40" title="Xóa trang hiện tại"><Trash2 size={14} className="mr-1 inline"/>Xóa trang</button>
            <button onClick={()=>switchBoardPage(activePageIndex+1)} disabled={activePageIndex>=pages.length-1} className="rounded-lg border bg-white p-2 disabled:opacity-40" title="Trang sau"><ChevronRight size={16}/></button>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-3 py-2">
            <label className="min-w-40 flex-1 text-xs font-semibold text-slate-600">Tên trang<input value={pages[activePageIndex]?.title||''} onChange={e=>renameActivePage(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm font-bold text-slate-800" /></label>
            {selectedId&&<><button onClick={duplicateSelected} className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-800"><Copy size={14} className="mr-1 inline"/>Nhân bản đối tượng</button><button onClick={deleteSelected} className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700"><Trash2 size={14} className="mr-1 inline"/>Xóa đối tượng</button></>}
            <button onClick={toggleFullscreen} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold hover:bg-slate-100"><Maximize2 size={14} className="mr-1 inline"/>Toàn màn hình</button>
          </div>
          <div className="relative touch-none bg-white" style={{touchAction:'none'}}><canvas ref={canvasRef} width={W} height={H} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} className="block h-auto w-full cursor-crosshair touch-none" style={{aspectRatio:`${W}/${H}`,touchAction:'none'}} aria-label="Bảng viết tương tác, dùng chuột, ngón tay hoặc bút cảm ứng để vẽ"/><div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-white/85 px-2 py-1 text-xs text-slate-500 shadow">Chuột · cảm ứng · bút cảm ứng · V chọn · P bút · L đoạn thẳng · A véc tơ · T chữ · Ctrl+D nhân bản · Ctrl+Z hoàn tác · Nét thông minh nhận dạng đường/tròn/elip</div></div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-4 py-3"><p aria-live="polite" className="text-sm text-slate-600">{message}</p><div className="flex items-center gap-2"><span className="hidden text-xs text-slate-500 sm:inline">Trang {activePageIndex+1}/{pages.length} · {items.length} đối tượng · Tự lưu trên thiết bị</span><button onClick={()=>window.print()} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold hover:bg-slate-50"><Printer className="mr-1 inline" size={15}/>In bảng</button><button onClick={saveBoard} className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700"><Save className="mr-1 inline" size={15}/>Lưu tiến trình</button></div></div>
        </section>
        <aside className="space-y-4">
          <section className="rounded-3xl border border-cyan-100 bg-white p-4 shadow-lg"><h2 className="text-lg font-black">Điều khiển mô phỏng</h2>
            {selectedId && items.some(it=>it.id===selectedId&&it.kind==='diagram') && <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-3"><h3 className="text-sm font-black text-blue-900">Xoay / chỉnh đối tượng đang chọn</h3><label className="mt-2 block text-xs font-bold">Góc xoay: {Math.round((items.find(it=>it.id===selectedId&&it.kind==='diagram') as Extract<BoardItem,{kind:'diagram'}>)?.rotation||0)}°<input className="w-full accent-blue-600" type="range" min="0" max="360" value={Math.round((items.find(it=>it.id===selectedId&&it.kind==='diagram') as Extract<BoardItem,{kind:'diagram'}>)?.rotation||0)} onChange={e=>setItems(old=>old.map(it=>it.id===selectedId&&it.kind==='diagram'?{...it,rotation:Number(e.target.value)}:it))}/></label><label className="mt-2 block text-xs font-bold">Kích thước: {Math.round(((items.find(it=>it.id===selectedId&&it.kind==='diagram') as Extract<BoardItem,{kind:'diagram'}>)?.scale||1)*100)}%<input className="w-full accent-blue-600" type="range" min="0.35" max="2.5" step="0.05" value={(items.find(it=>it.id===selectedId&&it.kind==='diagram') as Extract<BoardItem,{kind:'diagram'}>)?.scale||1} onChange={e=>setItems(old=>old.map(it=>it.id===selectedId&&it.kind==='diagram'?{...it,scale:Number(e.target.value)}:it))}/></label><div className="mt-2 flex gap-2"><button onClick={()=>setItems(old=>old.map(it=>it.id===selectedId&&it.kind==='diagram'?{...it,rotation:((it.rotation||0)+15)%360}:it))} className="rounded-lg border bg-white px-3 py-1 text-xs font-bold">+15°</button><button onClick={()=>setItems(old=>old.map(it=>it.id===selectedId&&it.kind==='diagram'?{...it,rotation:0}:it))} className="rounded-lg border bg-white px-3 py-1 text-xs font-bold">Đặt lại 0°</button>{items.some(it=>it.id===selectedId&&it.kind==='diagram'&&it.diagram==='switch')&&<button onClick={()=>setItems(old=>old.map(it=>it.id===selectedId&&it.kind==='diagram'?{...it,switchClosed:!it.switchClosed}:it))} className="rounded-lg border bg-white px-3 py-1 text-xs font-bold">Đổi K mở/đóng</button>}</div></div>}<p className="mt-1 text-xs text-slate-500">Thay đổi tham số rồi chèn hình tương ứng để minh họa theo ý giáo viên.</p>
            <label className="mt-3 block text-sm font-semibold">Tiêu cự thấu kính: {settings.focalLength} cm<input className="w-full accent-blue-600" type="range" min="25" max="150" value={settings.focalLength} onChange={e=>updateSetting('focalLength',Number(e.target.value))}/></label>
            <label className="mt-3 block text-sm font-semibold">Khoảng cách vật: {settings.objectDistance} cm<input className="w-full accent-blue-600" type="range" min="30" max="240" value={settings.objectDistance} onChange={e=>updateSetting('objectDistance',Number(e.target.value))}/></label>
            <label className="mt-3 block text-sm font-semibold">Chiều cao vật: {settings.objectHeight} cm<input className="w-full accent-blue-600" type="range" min="20" max="100" value={settings.objectHeight} onChange={e=>updateSetting('objectHeight',Number(e.target.value))}/></label>
            <label className="mt-3 block text-sm font-semibold">Góc điều chỉnh tia trong mô phỏng: {settings.prismAngle}°<input className="w-full accent-blue-600" type="range" min="-35" max="35" value={settings.prismAngle} onChange={e=>updateSetting('prismAngle',Number(e.target.value))}/></label><label className="mt-3 flex items-center justify-between gap-3 text-sm font-semibold">Màu tia đơn sắc<input type="color" value={settings.prismRayColor||'#dc2626'} onChange={e=>updateSetting('prismRayColor',e.target.value)} className="h-9 w-12 cursor-pointer rounded border"/></label>
            <label className="mt-3 block text-sm font-semibold">Góc tới: {settings.incidentAngle}°<input className="w-full accent-blue-600" type="range" min="5" max="80" value={settings.incidentAngle} onChange={e=>updateSetting('incidentAngle',Number(e.target.value))}/></label>
            <label className="mt-3 block text-sm font-semibold">Chiết suất môi trường: {settings.refractiveIndex.toFixed(2)}<input className="w-full accent-blue-600" type="range" min="1.00" max="1.60" step="0.01" value={settings.refractiveIndex} onChange={e=>updateSetting('refractiveIndex',Number(e.target.value))}/></label>
            <label className="mt-3 block text-sm font-semibold">Chiều truyền ánh sáng<select className="mt-1 w-full rounded-lg border p-2" value={settings.refractionDirection} onChange={e=>updateSetting('refractionDirection',e.target.value)}><option value="air-water">Không khí → nước</option><option value="water-air">Nước → không khí</option></select></label>
            <label className="mt-3 block text-sm font-semibold">Biên độ dao động A: {settings.amplitude}<input className="w-full accent-blue-600" type="range" min="1" max="5" value={settings.amplitude} onChange={e=>updateSetting('amplitude',Number(e.target.value))}/></label>
            <label className="mt-3 block text-sm font-semibold">Tần số góc ω: {settings.omega}<input className="w-full accent-blue-600" type="range" min="0.5" max="3" step="0.1" value={settings.omega} onChange={e=>updateSetting('omega',Number(e.target.value))}/></label>
            <label className="mt-3 block text-sm font-semibold">Pha ban đầu φ: {settings.phase}°<input className="w-full accent-blue-600" type="range" min="-180" max="180" value={settings.phase} onChange={e=>updateSetting('phase',Number(e.target.value))}/></label>
            <div className="mt-4 grid grid-cols-2 gap-2">{[['graph-st','Đồ thị s–t'],['graph-vt','Đồ thị v–t'],['graph-at','Đồ thị a–t'],['graph-uv','Đồ thị U–I'],['graph-function','Đồ thị phương trình'],['harmonic','Dao động điều hòa'],['unit-circle','Vòng tròn lượng giác']].map(([d,t])=><button key={d} onClick={()=>addComponent(d as Diagram)} className="rounded-xl border border-slate-200 p-2 text-left text-xs font-bold hover:border-blue-400 hover:bg-blue-50">{t}</button>)}</div><button onClick={addMotionGraphSet} className="mt-2 w-full rounded-xl border border-cyan-300 bg-cyan-50 p-2 text-xs font-black text-cyan-900 hover:bg-cyan-100">+ Chèn bộ 3 đồ thị chuyển động biến đổi đều (s–t, v–t, a–t)</button>
            <div className="mt-3 grid grid-cols-2 gap-2">{[['battery','Nguồn điện'],['resistor','Điện trở R'],['lamp','Bóng đèn'],['switch','Khóa K'],['ammeter','Ampe kế'],['voltmeter','Vôn kế'],['wire','Dây nối']].map(([d,t])=><button key={d} onClick={()=>addComponent(d as Diagram)} className="rounded-xl border border-slate-200 p-2 text-left text-xs font-bold hover:border-emerald-400 hover:bg-emerald-50">+ {t}</button>)}</div>
            <div className="mt-4 rounded-2xl border border-violet-200 bg-violet-50 p-3"><h3 className="font-black text-violet-900">Vẽ đồ thị từ phương trình</h3><p className="mt-1 text-xs text-violet-800">Dùng x làm biến. Hỗ trợ sin(x), cos(x), tan(x), 2*x+1, x^2-4. Dùng dấu * để nhân, ^ để lũy thừa; góc lượng giác tính bằng radian.</p><label className="mt-2 block text-xs font-bold">y = f(x)<input value={equationInput} onChange={e=>setEquationInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')addFunctionGraph();}} placeholder="Ví dụ: sin(x), cos(2*x), x^2-4" className="mt-1 w-full rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm" /></label><button onClick={addFunctionGraph} className="mt-2 w-full rounded-xl bg-violet-700 px-3 py-2 text-sm font-black text-white hover:bg-violet-800">+ Tạo đồ thị có thể kéo</button></div>
            <div className="mt-3 grid grid-cols-2 gap-2"><label className="text-xs font-semibold">Trục x tối đa<input className="mt-1 w-full rounded-lg border p-2" type="number" min="1" max="1000" value={settings.graphXMax} onChange={e=>updateSetting('graphXMax',Math.max(1,Number(e.target.value)||1))}/></label><label className="text-xs font-semibold">Trục y tối đa<input className="mt-1 w-full rounded-lg border p-2" type="number" min="1" max="1000" value={settings.graphYMax} onChange={e=>updateSetting('graphYMax',Math.max(1,Number(e.target.value)||1))}/></label></div>
            <div className="mt-3 rounded-2xl border border-blue-200 bg-blue-50 p-3"><h3 className="font-black text-blue-900">Vẽ đồ thị theo tọa độ điểm</h3><p className="mt-1 text-xs text-blue-800">Nhập các cặp (x,y), cách nhau bằng dấu chấm phẩy. Ví dụ: 0,0; 2,20; 4,40. Với s–t, x là t và y là s; với v–t, x là t và y là v; với a–t, x là t và y là a.</p><textarea value={graphCoordinates} onChange={e=>setGraphCoordinates(e.target.value)} rows={3} className="mt-2 w-full rounded-lg border border-blue-200 bg-white p-2 text-sm" aria-label="Danh sách tọa độ điểm đồ thị"/><button onClick={applyGraphCoordinates} className="mt-2 w-full rounded-xl bg-blue-700 px-3 py-2 text-sm font-black text-white hover:bg-blue-800">Vẽ / cập nhật đường biểu diễn</button><p className="mt-2 text-xs text-blue-800">Sau khi vẽ: kéo điểm đỏ để sửa một điểm; kéo đoạn xanh để di chuyển riêng đường biểu diễn.</p></div>
            <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">Lưu ý: tham số điều khiển tác động lên các hình mẫu được vẽ lại; đây là công cụ minh họa giảng dạy, chưa thay thế phần mềm mô phỏng quang học/điện học định lượng chuyên dụng.</p>
          </section>
          <section className="rounded-3xl border border-violet-100 bg-white p-4 shadow-lg"><div className="flex items-center justify-between gap-2"><div><h2 className="text-lg font-black">Hình mẫu KHTN</h2><p className="mt-1 text-xs text-slate-500">Hình khối được vẽ trực tiếp trên cùng mặt bảng 2D theo quy ước nét thấy–nét khuất; chọn / di chuyển để kéo hình. Dùng Đoạn thẳng hoặc Véc tơ để nối linh kiện.</p></div><button onClick={()=>setShowLibrary(v=>!v)} className="rounded-lg border p-2" title="Thu gọn/mở rộng thư viện">{showLibrary?<ChevronRight size={18} className="rotate-90"/>:<ChevronRight size={18}/>}</button></div>
            {showLibrary&&<div className="mt-4 grid grid-cols-2 gap-2">{[
              ['convex-lens','Thấu kính hội tụ'],['concave-lens','Thấu kính phân kỳ'],['prism','Lăng kính'],['dispersion','Tán sắc ánh sáng'],['mirror','Phản xạ ánh sáng'],['refraction','Khúc xạ ánh sáng'],['circuit','Mạch điện mẫu'],['force-vector','Các véc tơ lực'],['graph-st','Đồ thị s–t'],['graph-vt','Đồ thị v–t'],['graph-at','Đồ thị a–t'],['graph-uv','Đồ thị U–I'],['graph-function','Đồ thị phương trình'],['harmonic','Dao động điều hòa'],['unit-circle','Vòng tròn lượng giác'],
            ].map(([d,t])=><button key={d} onClick={()=>addDiagram(d as Diagram)} className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-sky-50 p-3 text-left text-sm font-bold transition hover:border-blue-400 hover:shadow-sm"><span className="mb-2 grid h-8 w-8 place-items-center rounded-lg bg-blue-100 text-blue-700">{d==='circuit'?<Zap size={17}/>:d.includes('lens')||d==='prism'||d==='dispersion'||d==='refraction'||d==='mirror'?<Circle size={17}/>:<ArrowUpRight size={17}/>}</span>{t}<span className="mt-1 block text-xs font-normal text-slate-500">Chèn vào bảng</span></button>)}</div>}
            <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">Hình mẫu là sơ đồ giảng dạy có thể ghi chú thêm bằng bút. Với thí nghiệm định lượng, hãy đối chiếu số liệu và quy ước dấu của bài học.</p>
          </section>
          <section className="rounded-3xl border border-emerald-100 bg-white p-4 shadow-lg"><div className="flex items-center justify-between gap-2"><div><h2 className="text-lg font-black">Mẫu nội dung đa môn</h2><p className="mt-1 text-xs text-slate-500">Mẫu được Admin xuất bản cho môn đang chọn.</p></div><BookOpen className="text-emerald-600" size={22}/></div><div className="mt-3 space-y-2">{customTemplates.map(t=><button key={t.id} onClick={()=>{setItems(old=>[...old,{id:uid(),kind:'text',at:{x:55,y:90+old.filter(i=>i.kind==='text').length*38},text:`${t.title}\n${t.content}`,color,size:19}]);setRedoItems([]);setMessage(`Đã chèn mẫu “${t.title}” lên bảng.`);}} className="w-full rounded-xl border border-slate-200 p-3 text-left hover:border-emerald-300 hover:bg-emerald-50"><span className="block font-bold">{t.title}</span><span className="mt-1 block whitespace-pre-line text-xs text-slate-600">{t.content}</span></button>)}{!customTemplates.length&&<p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">Chưa có mẫu xuất bản cho môn này. Admin có thể thêm trong CMS bảng tương tác.</p>}</div></section>
          <section className="rounded-3xl border border-sky-100 bg-white p-4 shadow-lg"><div className="flex items-center justify-between gap-2"><div><h2 className="text-lg font-black">Công thức nhanh</h2><p className="mt-1 text-xs text-slate-500">Nhấn để ghi công thức lên bảng.</p></div><BookOpen className="text-sky-600" size={22}/></div>
            <input value={formulaSearch} onChange={e=>setFormulaSearch(e.target.value)} placeholder="Tìm công thức…" className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"/>
            <select value={classFilter} onChange={e=>setClassFilter(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"><option>Tất cả</option><option>Lớp 6</option><option>Lớp 7</option><option>Lớp 8</option><option>Lớp 9</option><option>Lớp 10</option><option>Lớp 11</option><option>Lớp 12</option></select>
            <div className="mt-3 max-h-[410px] space-y-2 overflow-y-auto pr-1">{filteredFormulas.map(f=><button key={f.name} onClick={()=>addFormula(f)} className="w-full rounded-xl border border-slate-200 p-3 text-left transition hover:border-violet-300 hover:bg-violet-50"><span className="block text-xs font-semibold text-slate-500">{f.group}</span><span className="mt-1 block font-bold">{f.name}</span><span className="mt-1 block text-lg font-black text-violet-700">{f.expression}</span><span className="mt-1 block text-xs leading-relaxed text-slate-500">{f.note}</span></button>)}{customFormulas.map(f=><button key={f.id} onClick={()=>addFormula({group:`${boardSubjects.find(s=>s.code===f.subject_code)?.name||f.subject_code}${f.grade?` · Lớp ${f.grade}`:''}`,name:f.title,expression:f.content,note:f.description})} className="w-full rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 text-left transition hover:border-violet-300 hover:bg-violet-50"><span className="block text-xs font-semibold text-slate-500">{boardSubjects.find(s=>s.code===f.subject_code)?.name||f.subject_code}{f.grade?` · Lớp ${f.grade}`:''} · CMS</span><span className="mt-1 block font-bold">{f.title}</span><span className="mt-1 block whitespace-pre-wrap text-lg font-black text-violet-700">{f.content}</span><span className="mt-1 block text-xs leading-relaxed text-slate-500">{f.description}</span></button>)}{!filteredFormulas.length&&!customFormulas.length&&<p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">Không tìm thấy công thức phù hợp.</p>}</div>
          </section>
        </aside>
      </div>
      <section className="mt-5 rounded-3xl border border-sky-100 bg-white p-4 shadow-sm sm:p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-black">Mở nhanh các phòng học</h2><p className="mt-1 text-sm text-slate-500">Giữ nguyên các đường dẫn phòng học hiện có của website.</p></div><MousePointer2 className="text-blue-600" size={25}/></div><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{rooms.map(r=>{const Icon=r.icon;return <a href={r.href} key={r.href} className="group rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"><span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-400 text-white"><Icon size={21}/></span><h3 className="mt-3 font-black">{r.title}</h3><p className="mt-1 text-sm text-slate-500">{r.desc}</p><span className="mt-3 inline-flex items-center text-sm font-bold text-blue-700">Mở phòng <ChevronRight size={16}/></span></a>})}</div></section>
      <p className="mt-4 text-xs leading-relaxed text-slate-500">Bảng được lưu cục bộ trên trình duyệt của thiết bị này; nút Xuất PNG giúp lưu ảnh bài giảng. Các hình khối, sơ đồ quang học và đồ thị được vẽ trực tiếp trên cùng mặt bảng; mô phỏng định lượng chuyên sâu vẫn cần mô-đun vật lí riêng theo từng bài học.</p>
    </div>
  </main>;
}
