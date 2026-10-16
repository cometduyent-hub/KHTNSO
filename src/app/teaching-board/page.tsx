'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowDownRight, ArrowUpRight, BookOpen, Check, ChevronRight, Circle, Download,
  Eraser, FlaskConical, Hand, Minus, MousePointer2, Pencil, Printer, Redo2,
  RotateCcw, Save, Square, Trash2, Type, Undo2, ZoomIn, Zap,
} from 'lucide-react';

type Point = { x: number; y: number };
type Tool = 'select' | 'pen' | 'eraser' | 'line' | 'arrow' | 'text' | 'graph';
type Diagram = 'convex-lens' | 'concave-lens' | 'prism' | 'dispersion' | 'mirror' | 'circuit' | 'force-vector' | 'refraction' | 'graph-st' | 'graph-vt' | 'graph-uv' | 'graph-function' | 'harmonic' | 'unit-circle' | 'battery' | 'resistor' | 'lamp' | 'switch' | 'ammeter' | 'voltmeter' | 'wire';
type BoardItem =
  | { id: string; kind: 'path'; points: Point[]; color: string; width: number; erase?: boolean; graph?: boolean }
  | { id: string; kind: 'line' | 'arrow'; from: Point; to: Point; color: string; width: number }
  | { id: string; kind: 'text'; at: Point; text: string; color: string; size: number; graphSourceId?: string }
  | { id: string; kind: 'diagram'; diagram: Diagram; at: Point; scale: number; rotation?: number; equation?: string; switchClosed?: boolean; graphPoints?: Point[] };

type Formula = { group: string; name: string; expression: string; note: string };
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
    const fPx=f*pxPerCm; const imageDistance=convex?(Math.abs(d-f)<0.8?Infinity:(d*f/(d-f))):-(d*f/(d+f));
    const imageX=Number.isFinite(imageDistance)?imageDistance*pxPerCm:(convex?245:0);
    const magnification=Number.isFinite(imageDistance)?-imageDistance/d:(convex?-4:0);
    const imageY=-magnification*objH; // Canvas y is positive downwards: real inverted images point down.
    arrow(ctx,{x:objX,y:0},{x:objX,y:-objH},red,3,10);label(ctx,'Vật',objX-20,-objH-10,red,14);
    // Two principal rays taught at school: (1) through optical centre O, undeviated;
    // (2) parallel to the principal axis, then through (or apparently from) the focal point.
    const tip={x:objX,y:-objH};
    if(Number.isFinite(imageDistance) && Math.abs(imageX)<255){
      const iy=Math.max(-125,Math.min(125,imageY));
      if(convex && d>f){arrow(ctx,{x:imageX,y:0},{x:imageX,y:iy},green,3,10);label(ctx,'Ảnh thật',imageX-22,iy+(iy<0?-10:22),green,13);}
      else {arrow(ctx,{x:imageX,y:0},{x:imageX,y:iy},green,3,10);label(ctx,'Ảnh ảo',imageX-22,iy+(iy<0?-10:22),green,13);}
    } else if(convex && Math.abs(d-f)<0.8){label(ctx,'Ảnh ở rất xa (d ≈ f)',80,-32,green,13);}
    // Ray 1: tip -> optical centre and continues straight on the other side.
    ctx.strokeStyle=red;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(tip.x,tip.y);ctx.lineTo(0,0);ctx.lineTo(245, -tip.y/Math.max(-tip.x,1)*245);ctx.stroke();
    // Ray 2: parallel to axis up to the lens. Convex refracts through F'; concave diverges
    // so that its backward extension passes through F on the object side.
    ctx.strokeStyle=green;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(tip.x,tip.y);ctx.lineTo(0,tip.y);ctx.stroke();
    if(convex){
      ctx.beginPath();ctx.moveTo(0,tip.y);ctx.lineTo(245, (-tip.y/fPx)*245);ctx.stroke();
    } else {
      const endX=245, slope=tip.y/fPx;
      ctx.beginPath();ctx.moveTo(0,tip.y);ctx.lineTo(endX,tip.y+slope*endX);ctx.stroke();
      ctx.save();ctx.setLineDash([6,5]);ctx.strokeStyle=green;ctx.beginPath();ctx.moveTo(0,tip.y);ctx.lineTo(-fPx,0);ctx.stroke();ctx.restore();
    }
    ctx.fillStyle=gray;[-fPx,fPx].forEach((x)=>{ctx.beginPath();ctx.arc(x,0,4,0,Math.PI*2);ctx.fill();});
    label(ctx,'F',-fPx-7,20,gray,14);label(ctx,'F′',fPx-7,20,gray,14);label(ctx,'O',7,20,gray,14);
    label(ctx,`${convex?'Hội tụ':'Phân kỳ'} · f=${settings.focalLength} cm · d=${settings.objectDistance} cm`,-235,142,blue,14);
  } else if (item.diagram === 'prism' || item.diagram === 'dispersion') {
    ctx.rotate(settings.prismAngle*Math.PI/180);
    ctx.strokeStyle = purple; ctx.fillStyle = 'rgba(196,181,253,.24)'; ctx.beginPath(); ctx.moveTo(0,-88); ctx.lineTo(-82,65); ctx.lineTo(82,65); ctx.closePath(); ctx.fill(); ctx.stroke();
    // Correct path through the triangular prism: enter the left face, refract inside,
    // exit the right face, then deviate toward the base (downward in this orientation).
    const entry={x:-43,y:-8}, exit={x:43,y:-8}, inner={x:0,y:18};
    arrow(ctx,{x:-235,y:-8},entry,settings.prismRayColor,3,11);
    ctx.strokeStyle=settings.prismRayColor;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(entry.x,entry.y);ctx.lineTo(inner.x,inner.y);ctx.lineTo(exit.x,exit.y);ctx.stroke();
    if(item.diagram==='prism') arrow(ctx,exit,{x:220,y:92+settings.prismAngle*1.2},settings.prismRayColor,3,11);
    else {
      const colors=['#dc2626','#f97316','#eab308','#16a34a','#2563eb','#4f46e5','#9333ea'];
      colors.forEach((c,i)=>{const y=48+i*8;arrow(ctx,exit,{x:220,y:y+25+settings.prismAngle*1.2},c,2.5,9);});
      label(ctx,'Đỏ · lệch ít',225,36,colors[0],13);label(ctx,'Tím · lệch nhiều',225,118,colors[6],13);
    }
    label(ctx,'Tia tới',-195,-22,settings.prismRayColor,12);label(ctx,'Tia khúc xạ trong lăng kính',-45,42,settings.prismRayColor,11);label(ctx,'Tia ló',115,65,settings.prismRayColor,12);
    label(ctx,`Lăng kính · xoay ${settings.prismAngle}°`,-220,145,gray,15);
  } else if (item.diagram === 'mirror' || item.diagram === 'refraction') {
    ctx.strokeStyle = gray; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0,-105); ctx.lineTo(0,105); ctx.stroke();
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2; ctx.setLineDash([5,5]); ctx.beginPath(); ctx.moveTo(-220,0); ctx.lineTo(220,0); ctx.stroke(); ctx.setLineDash([]);
    if (item.diagram === 'mirror') { arrow(ctx,{x:-145,y:-95},{x:0,y:0},red,3,12); arrow(ctx,{x:0,y:0},{x:-145,y:95},green,3,12); label(ctx,'i',-92,-42,red,17); label(ctx,'i′',-90,58,green,17); label(ctx,'Gương phẳng',15,-85,gray,16); }
    else {
      const waterToAir=settings.refractionDirection==='water-air';
      const nAir=1.0003,nWater=settings.refractiveIndex;
      const n1=waterToAir?nWater:nAir,n2=waterToAir?nAir:nWater;
      ctx.fillStyle='rgba(125,211,252,.22)';ctx.fillRect(-220,0,440,120);
      label(ctx,waterToAir?'Nước (n₁)':'Không khí (n₁)',-205,-82,gray,16);label(ctx,waterToAir?'Không khí (n₂)':'Nước (n₂)',-205,105,gray,16);
      const i=settings.incidentAngle*Math.PI/180;const ratio=n1*Math.sin(i)/n2;const tir=Math.abs(ratio)>1;const r=tir?i:Math.asin(Math.max(-1,Math.min(1,ratio)));
      // Incident ray approaches the horizontal interface from the upper medium; normal is vertical.
      arrow(ctx,{x:-180*Math.sin(i),y:-180*Math.cos(i)},{x:0,y:0},red,3,12);
      if(tir){arrow(ctx,{x:0,y:0},{x:180*Math.sin(i),y:-180*Math.cos(i)},green,3,12);label(ctx,'Phản xạ toàn phần',18,-35,green,14);}
      else arrow(ctx,{x:0,y:0},{x:180*Math.sin(r),y:180*Math.cos(r)},green,3,12);
      ctx.strokeStyle=gray;ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(0,-120);ctx.lineTo(0,120);ctx.stroke();ctx.setLineDash([]);
      // Draw clear angle arcs measured from the normal.
      ctx.strokeStyle=red;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,34,-Math.PI/2-i,-Math.PI/2);ctx.stroke();
      ctx.strokeStyle=green;ctx.beginPath();ctx.arc(0,0,43,Math.PI/2,Math.PI/2+r);ctx.stroke();
      label(ctx,`i = ${settings.incidentAngle}°`,-92,-45,red,14);label(ctx,`r = ${(r*180/Math.PI).toFixed(1)}°`,15,58,green,14);
      label(ctx,`Tia: ${waterToAir?'nước → không khí':'không khí → nước'}`,-205,145,gray,14);label(ctx,`n₁=${n1.toFixed(2)} · n₂=${n2.toFixed(2)}`,-205,165,gray,14);
    }
  } else if (item.diagram === 'circuit') {
    ctx.strokeStyle = gray; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-150,-65);ctx.lineTo(150,-65);ctx.lineTo(150,65);ctx.lineTo(-150,65);ctx.lineTo(-150,-65);ctx.stroke();
    // Cell symbol
    ctx.strokeStyle=red;ctx.lineWidth=3.5;ctx.beginPath();ctx.moveTo(-150,-65);ctx.lineTo(-150,-24);ctx.moveTo(-168,-24);ctx.lineTo(-132,-24);ctx.moveTo(-160,-4);ctx.lineTo(-140,-4);ctx.moveTo(-150,-4);ctx.lineTo(-150,65);ctx.stroke();
    // Resistor and lamp symbol
    ctx.strokeStyle=gray;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(15,-65);ctx.lineTo(15,-85);ctx.lineTo(70,-85);ctx.lineTo(70,-45);ctx.lineTo(15,-45);ctx.lineTo(15,-65);ctx.stroke();
    ctx.beginPath();ctx.arc(150,0,20,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(136,-14);ctx.lineTo(164,14);ctx.moveTo(164,-14);ctx.lineTo(136,14);ctx.stroke();
    label(ctx,'+',-177,-28,red,16);label(ctx,'−',-180,2,blue,16);label(ctx,'Nguồn',-205,105,red,16);label(ctx,'R',34,-93,gray,16);label(ctx,'Đèn',175,7,gray,16);label(ctx,'Sơ đồ mạch điện kín',-85,130,blue,17);
  } else if (item.diagram.startsWith('graph-')) {
    const left=-220,top=-115,w=430,h=220;ctx.strokeStyle='#cbd5e1';ctx.lineWidth=1;
    // Align graph grid lines to the same 32 px board grid, including when the diagram is moved/scaled.
    const boardGrid=32, scale=Math.max(0.01,item.scale||1);
    const firstGlobalX=Math.ceil((item.at.x+left*scale)/boardGrid)*boardGrid;
    for(let gx=firstGlobalX;gx<=item.at.x+(left+w)*scale;gx+=boardGrid){const x=(gx-item.at.x)/scale;if(x>=left&&x<=left+w){ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x,top+h);ctx.stroke();}}
    const firstGlobalY=Math.ceil((item.at.y+top*scale)/boardGrid)*boardGrid;
    for(let gy=firstGlobalY;gy<=item.at.y+(top+h)*scale;gy+=boardGrid){const y=(gy-item.at.y)/scale;if(y>=top&&y<=top+h){ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(left+w,y);ctx.stroke();}}
    const functionGraph=item.diagram==='graph-function';const axisY=functionGraph?top+h/2:top+h;
    arrow(ctx,{x:left,y:axisY},{x:left+w+15,y:axisY},gray,2,9);arrow(ctx,{x:left,y:top+h},{x:left,y:top-18},gray,2,9);
    const xmax=settings.graphXMax,ymax=settings.graphYMax;ctx.strokeStyle=blue;ctx.lineWidth=3;ctx.beginPath();
    const safeFunction=(x:number)=>{let expr=(item.equation||'2*x+1').replace(/\^/g,'**').replace(/\b(sin|cos|tan)\s*\(/gi,(_,fn:string)=>`Math.${fn.toLowerCase()}(`).replace(/\bX\b/g,'x');if(!/^[0-9x+*/().,\s^\-Mathsincota]+$/.test(expr)||/Math\.(?!sin|cos|tan)/.test(expr))return NaN;try{return Function('x',`'use strict'; return (${expr});`)(x) as number;}catch{return NaN;}};
    const plotPoints=item.graphPoints?.length?item.graphPoints:null;
    if(plotPoints){plotPoints.forEach((pt,i)=>{const px=left+(pt.x/xmax)*w,py=top+h-(pt.y/ymax)*h;if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);});ctx.stroke();
      // Dashed projection guides from each plotted point to both axes.
      ctx.save();ctx.strokeStyle='#64748b';ctx.lineWidth=1.4;ctx.setLineDash([5,4]);
      plotPoints.forEach((pt)=>{const px=left+(pt.x/xmax)*w,py=top+h-(pt.y/ymax)*h;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px,top+h);ctx.moveTo(px,py);ctx.lineTo(left,py);ctx.stroke();});ctx.restore();
      ctx.fillStyle=red;plotPoints.forEach((pt)=>{const px=left+(pt.x/xmax)*w,py=top+h-(pt.y/ymax)*h;ctx.beginPath();ctx.arc(px,py,5,0,Math.PI*2);ctx.fill();label(ctx,`(${pt.x}, ${pt.y})`,px+7,py-7,red,11);});} 
    else {for(let px=0;px<=w;px++){const x=px/w*xmax;let y=0;if(item.diagram==='graph-st')y=x*(ymax/xmax)*0.72;else if(item.diagram==='graph-vt')y=(x/xmax<.38?ymax*.72:x/xmax<.62?ymax*.72:Math.min(ymax,x/xmax*ymax*.8));else if(item.diagram==='graph-uv')y=Math.min(ymax,Math.max(0,x*0.7));else y=safeFunction(x);const py=functionGraph?top+h/2-(y/ymax)*(h/2):top+h-(y/ymax)*h;if(!Number.isFinite(y)||Math.abs(y)>ymax*4){ctx.moveTo(left+px,top+h);continue;}if(px===0)ctx.moveTo(left+px,py);else ctx.lineTo(left+px,py);}ctx.stroke();}
    label(ctx,item.diagram==='graph-st'?'Đồ thị s–t':item.diagram==='graph-vt'?'Đồ thị v–t':item.diagram==='graph-uv'?'Đồ thị U–I':`y = ${item.equation||'2*x+1'}`,-150,-135,blue,17);label(ctx,item.diagram==='graph-st'?'s (m)':item.diagram==='graph-vt'?'v (m/s)':item.diagram==='graph-uv'?'U (V)':'y',left-5,top-24,gray,13);label(ctx,item.diagram==='graph-uv'?'I (A)':'x / t',left+w-75,top+h+25,gray,13);
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
  const activeRef = useRef<Point[] | null>(null);
  const pointerDownRef = useRef(false);
  const dragRef = useRef<{id:string;offset:Point;mode?:'move'|'endpoint'|'vertex'|'curve';endpoint?:'from'|'to';index?:number}|null>(null);
  const [selectedId,setSelectedId] = useState<string|null>(null);
  const [items, setItems] = useState<BoardItem[]>([]);
  const [redoItems, setRedoItems] = useState<BoardItem[][]>([]);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#172554');
  const [lineWidth, setLineWidth] = useState(4);
  const [grid, setGrid] = useState(true);
  const [paper, setPaper] = useState<'white'|'dark'|'green'>('white');
  const [formulaSearch, setFormulaSearch] = useState('');
  const [equationInput, setEquationInput] = useState('2*x+1');
  const [graphCoordinates, setGraphCoordinates] = useState('0,0; 2,20; 4,40; 6,60; 8,80; 10,100');
  const [classFilter, setClassFilter] = useState('Tất cả');
  const [message, setMessage] = useState('Bảng trống — bắt đầu viết hoặc chọn hình mẫu.');
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
      } else if(item.kind==='arrow') arrow(ctx,item.from,item.to,item.color,item.width,Math.max(9,item.width*3.5));
      else if(item.kind==='text'){ctx.fillStyle=item.color;ctx.font=`600 ${item.size}px system-ui, sans-serif`;ctx.fillText(item.text,item.at.x,item.at.y);}
      else drawDiagram(ctx,item,settings);
      if(item.id===selectedId && 'at' in item){ctx.save();ctx.strokeStyle='#7c3aed';ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.strokeRect(item.at.x-115,item.at.y-105,230,210);ctx.restore();}
    });
    const active=activeRef.current;
    if(active?.length){ctx.strokeStyle=tool==='eraser'?bg:color;ctx.lineWidth=tool==='eraser'?Math.max(22,lineWidth*4):lineWidth;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(active[0].x,active[0].y);active.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));ctx.stroke();}
  },[items,grid,paper,tool,color,lineWidth,settings,selectedId]);
  useEffect(()=>{drawScene();},[drawScene]);
  useEffect(()=>{
    const graphs=items.filter((it):it is Extract<BoardItem,{kind:'path'}>=>it.kind==='path'&&!!it.graph);
    if(!graphs.length)return;
    setItems(current=>{let changed=false;const next=current.map(it=>{if(it.kind!=='text'||!it.graphSourceId)return it;const g=graphs.find(x=>x.id===it.graphSourceId);if(!g)return it;const eq=g.points.slice(1).map((q,i)=>{const a=g.points[i],dx=q.x-a.x,dy=q.y-a.y;if(Math.abs(dx)<8)return `đoạn ${i+1}: đứng`;const m=-dy/dx,b=-a.y-m*a.x;const trend=Math.abs(m)<0.08?'ngang':m>0?'xiên tăng':'xiên giảm';return `đoạn ${i+1} (${trend}): y≈${m.toFixed(2)}x${b>=0?'+':'−'}${Math.abs(b).toFixed(1)}`;}).join(' ; ');const text=`Đồ thị vẽ tay — ${eq}`;if(it.text!==text){changed=true;return {...it,text};}return it;});return changed?next:current;});
  },[items]);

  useEffect(()=>{
    try { const raw=localStorage.getItem('khtnso-teaching-board-v2'); if(raw){const parsed=JSON.parse(raw) as {items?:BoardItem[];lessonTitle?:string;settings?:Partial<BoardSettings>};if(Array.isArray(parsed.items))setItems(parsed.items);if(parsed.lessonTitle)setLessonTitle(parsed.lessonTitle);if(parsed.settings)setSettings(old=>({...old,...parsed.settings}));} } catch { /* ignore old or invalid local save */ }
    setLoaded(true);
  },[]);
  useEffect(()=>{if(loaded){try{localStorage.setItem('khtnso-teaching-board-v2',JSON.stringify({items,lessonTitle,settings}));}catch{/* storage may be full */}}},[items,lessonTitle,settings,loaded]);
  useEffect(()=>{const resize=()=>drawScene();window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize);},[drawScene]);

  const pointFromEvent = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const r=e.currentTarget.getBoundingClientRect(); return {x:Math.max(0,Math.min(W,(e.clientX-r.left)*W/r.width)),y:Math.max(0,Math.min(H,(e.clientY-r.top)*H/r.height))};
  };
  const graphLocalPoint=(item:Extract<BoardItem,{kind:'diagram'}>,p:Point)=>({x:(p.x-item.at.x)/(item.scale||1),y:(p.y-item.at.y)/(item.scale||1)});
  const graphPointPixel=(pt:Point)=>({x:-220+(pt.x/settings.graphXMax)*430,y:-115+220-(pt.y/settings.graphYMax)*220});
  const applyGraphCoordinates=()=>{
    const parsed=graphCoordinates.split(';').map(part=>part.trim()).filter(Boolean).map(part=>part.split(/[ ,]+/).map(Number));
    if(parsed.length<2||parsed.some(pair=>pair.length!==2||!pair.every(Number.isFinite))){setMessage('Tọa độ chưa đúng. Nhập dạng (t,s): 0,0; 2,20; 4,40. Cần ít nhất hai điểm.');return;}
    const selected=items.find(it=>it.id===selectedId&&it.kind==='diagram'&&['graph-st','graph-vt','graph-uv'].includes(it.diagram));
    const target=selected&&selected.kind==='diagram'?selected:items.find(it=>it.kind==='diagram'&&['graph-st','graph-vt','graph-uv'].includes(it.diagram));
    if(!target||target.kind!=='diagram'){setMessage('Hãy chèn hoặc chọn một đồ thị s–t, v–t hoặc U–I trước.');return;}
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
        if(it.kind==='diagram'&&it.graphPoints?.length&&['graph-st','graph-vt','graph-uv'].includes(it.diagram)){
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
      if(it.kind==='line'||it.kind==='arrow')return {...it,from:{x:it.from.x+dx,y:it.from.y+dy},to:{x:it.to.x+dx,y:it.to.y+dy}};
      if(it.kind==='path')return {...it,points:it.points.map(q=>({x:q.x+dx,y:q.y+dy}))};return it;
    }));
    if(d.mode==='move'&&!('at' in (items.find(it=>it.id===d.id)||{} as BoardItem)))dragRef.current={...d,offset:p};
    return;}
    if(activeRef.current)activeRef.current=[...activeRef.current,p];drawScene();
  };
  const pointerUp=(e:React.PointerEvent<HTMLCanvasElement>)=>{
    if(!pointerDownRef.current)return;pointerDownRef.current=false;if(dragRef.current){dragRef.current=null;setRedoItems([]);return;}const p=pointFromEvent(e);const pts=activeRef.current||[];activeRef.current=null;if(!pts.length)return;
    if(tool==='pen'||tool==='eraser')setItems(old=>[...old,{id:uid(),kind:'path',points:[...pts,p],color,width:lineWidth,erase:tool==='eraser'}]);
    else if(tool==='graph'){const all=[...pts,p];const simplified=all.filter((q,i)=>i===0||i===all.length-1||i%Math.max(1,Math.floor(all.length/4))===0);const unique=simplified.length>=2?simplified:[all[0],p];const eq=unique.slice(1).map((q,i)=>{const a=unique[i],dx=q.x-a.x,dy=q.y-a.y;if(Math.abs(dx)<8)return `đoạn ${i+1}: t ≈ ${((a.x+q.x)/2).toFixed(0)} (đứng)`;const m=-dy/dx,b=a.y*-1-m*a.x;const trend=Math.abs(m)<0.08?'ngang':m>0?'xiên tăng':'xiên giảm';return `đoạn ${i+1} (${trend}): s ≈ ${m.toFixed(2)}t ${b>=0?'+':'−'} ${Math.abs(b).toFixed(1)}`;}).join(' ; ');const graphId=uid();setItems(old=>[...old,{id:graphId,kind:'path',points:all,color,width:Math.max(3,lineWidth),erase:false,graph:true},{id:uid(),kind:'text',at:{x:Math.min(...all.map(q=>q.x)),y:Math.min(H-25,Math.max(...all.map(q=>q.y))+28)},text:`Đồ thị vẽ tay — ${eq}`,color,size:16,graphSourceId:graphId}]);setMessage('Đã tạo đồ thị vẽ tay và phương trình xấp xỉ từng đoạn theo tọa độ bảng. Đây là phương trình xấp xỉ trên bảng, chưa tự quy đổi theo thang số vật lý.');}
    else if(tool==='line'||tool==='arrow'){const start=pts[0];setItems(old=>[...old,{id:uid(),kind:tool,from:start,to:p,color,width:lineWidth}]);}
    setRedoItems([]);setMessage(tool==='eraser'?'Đã tẩy nét.':'Đã ghi lên bảng.');
  };
  const addDiagram=(diagram:Diagram)=>{setItems(old=>[...old,{id:uid(),kind:'diagram',diagram,at:{x:W/2,y:H/2},scale:1}]);setRedoItems([]);setMessage('Đã thêm hình mẫu. Có thể tiếp tục vẽ, ghi chú hoặc xóa bằng công cụ tẩy.');};
  const addComponent=(diagram:Diagram)=>{if(diagram==='wire'){setItems(old=>[...old,{id:uid(),kind:'line',from:{x:W/2-90,y:H/2},to:{x:W/2+90,y:H/2},color,width:Math.max(3,lineWidth)}]);setRedoItems([]);setMessage('Đã thêm dây nối. Chọn / di chuyển rồi kéo một đầu dây để đổi độ dài hoặc hướng.');return;}setItems(old=>[...old,{id:uid(),kind:'diagram',diagram,at:{x:W/2,y:H/2},scale:1}]);setRedoItems([]);setMessage('Đã chèn dụng cụ riêng lẻ; có thể xoay, thay đổi kích thước và lắp mạch.');};
  const addFunctionGraph=()=>{const expr=equationInput.trim();const normalized=expr.replace(/\b(sin|cos|tan)\s*\(/gi,'').replace(/[xX]/g,'');if(!expr||!/^[0-9+*/().,\s^\-]*$/.test(normalized)||/[a-wyzA-WYZ]/.test(expr.replace(/\b(sin|cos|tan)\b/gi,'').replace(/[xX]/g,''))){setMessage('Có thể dùng x, số, + − * /, ngoặc, lũy thừa ^ và các hàm sin(x), cos(x), tan(x). Ví dụ: sin(x), cos(2*x), 3*sin(x)+1, x^2-4. Góc được tính theo radian.');return;}setItems(old=>[...old,{id:uid(),kind:'diagram',diagram:'graph-function',at:{x:W/2,y:H/2},scale:1,equation:expr}]);setRedoItems([]);setMessage(`Đã tạo đồ thị y = ${expr}. Hàm lượng giác dùng radian. Chọn / di chuyển để kéo đồ thị đến vị trí mong muốn.`);};
  const addFormula=(f:Formula)=>{setItems(old=>[...old,{id:uid(),kind:'text',at:{x:55,y:90+old.filter(i=>i.kind==='text').length*38},text:`${f.name}: ${f.expression}`,color,size:27}]);setRedoItems([]);setMessage(`Đã ghi công thức ${f.name} lên bảng.`);};
  const undo=()=>{setItems(old=>{if(!old.length)return old;setRedoItems(r=>[...r,old]);setMessage('Đã hoàn tác thao tác gần nhất.');return old.slice(0,-1);});};
  const redo=()=>{setRedoItems(old=>{if(!old.length)return old;const next=old[old.length-1];setItems(cur=>[...cur,next[next.length-1]]);setMessage('Đã làm lại thao tác.');return old.slice(0,-1);});};
  const clearBoard=()=>{if(!items.length)return;if(window.confirm('Xóa toàn bộ nội dung trên bảng?')){setItems([]);setRedoItems([]);setMessage('Đã xóa bảng.');}};
  const saveBoard=()=>{try{localStorage.setItem('khtnso-teaching-board-v2',JSON.stringify({items,lessonTitle,settings}));setMessage('Đã lưu bảng trên trình duyệt này.');}catch{setMessage('Không thể lưu vào trình duyệt; hãy xuất PNG để lưu bản vẽ.');}};
  const exportPng=()=>{const canvas=canvasRef.current;if(!canvas)return;const a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download=`${lessonTitle.trim().replace(/[^\p{L}\p{N}-]+/gu,'-')||'bang-vat-ly'}.png`;a.click();setMessage('Đã xuất ảnh PNG.');};
  const filteredFormulas=formulas.filter(f=>(classFilter==='Tất cả'||f.group.startsWith(classFilter))&&`${f.name} ${f.expression} ${f.group}`.toLowerCase().includes(formulaSearch.toLowerCase()));
  const toolBtn=(id:Tool,labelText:string,Icon:typeof Pencil)=><button key={id} onClick={()=>setTool(id)} title={labelText} aria-pressed={tool===id} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold border transition ${tool===id?'border-blue-600 bg-blue-600 text-white shadow':'border-slate-200 bg-white text-slate-700 hover:bg-sky-50'}`}><Icon size={17}/><span className="hidden sm:inline">{labelText}</span></button>;

  return <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-violet-50 text-slate-800">
    <div className="mx-auto max-w-[1600px] px-3 py-4 sm:px-5 sm:py-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-indigo-700 via-blue-600 to-cyan-500 p-5 text-white shadow-xl sm:p-7">
        <div className="min-w-0"><p className="text-xs font-black tracking-[.2em] text-cyan-100">KHTN SỐ · BẢNG DẠY HỌC SỐ</p><h1 className="mt-2 text-2xl font-black sm:text-4xl">Bảng Vật lý tương tác</h1><p className="mt-2 max-w-3xl text-sm text-white/90 sm:text-base">Viết, vẽ, giải bài và xây dựng tiến trình bài giảng trực tiếp — không phải trình chiếu slide.</p></div>
        <div className="flex flex-wrap gap-2"><button onClick={saveBoard} className="rounded-xl border border-white/30 bg-white/15 px-3 py-2 text-sm font-bold hover:bg-white/25"><Save className="mr-1 inline" size={16}/>Lưu bảng</button><button onClick={exportPng} className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-blue-700 hover:bg-cyan-50"><Download className="mr-1 inline" size={16}/>Xuất PNG</button></div>
      </header>
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <label className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm sm:col-span-2"><span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Tên bài học / tiết dạy</span><input value={lessonTitle} onChange={e=>setLessonTitle(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-lg font-bold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Nhập tên bài học…"/></label>
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-sky-100 bg-white p-3 shadow-sm"><span className="mr-1 text-xs font-bold uppercase tracking-wide text-slate-500">Nền bảng</span><button onClick={()=>setPaper('white')} className={`rounded-lg border px-3 py-2 text-sm font-bold ${paper==='white'?'border-blue-600 bg-blue-50':'border-slate-200'}`}>Trắng</button><button onClick={()=>setPaper('green')} className={`rounded-lg border px-3 py-2 text-sm font-bold ${paper==='green'?'border-emerald-600 bg-emerald-50':'border-slate-200'}`}>Xanh</button><button onClick={()=>setPaper('dark')} className={`rounded-lg border px-3 py-2 text-sm font-bold ${paper==='dark'?'border-slate-700 bg-slate-200':'border-slate-200'}`}>Tối</button></div>
      </div>
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="min-w-0 overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-lg">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 p-3 sm:p-4">
            {toolBtn('select','Chọn / di chuyển',Hand)}{toolBtn('pen','Bút viết',Pencil)}{toolBtn('eraser','Tẩy',Eraser)}{toolBtn('line','Đoạn thẳng',Minus)}{toolBtn('arrow','Véc tơ / mũi tên',ArrowUpRight)}{toolBtn('text','Chữ',Type)}{toolBtn('graph','Đồ thị tay',Pencil)}
            <div className="mx-1 hidden h-8 w-px bg-slate-200 sm:block"/><label title="Màu nét" className="flex items-center gap-2 rounded-xl border border-slate-200 px-2 py-1.5 text-xs font-bold">Màu <input type="color" value={color} onChange={e=>setColor(e.target.value)} className="h-7 w-8 cursor-pointer border-0 bg-transparent"/></label>
            <label className="flex min-w-28 items-center gap-2 rounded-xl border border-slate-200 px-2 py-1.5 text-xs font-bold">Nét <input aria-label="Độ dày nét" type="range" min="1" max="14" value={lineWidth} onChange={e=>setLineWidth(Number(e.target.value))} className="w-16 accent-blue-600"/>{lineWidth}</label>
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold"><input type="checkbox" checked={grid} onChange={e=>setGrid(e.target.checked)} className="accent-blue-600"/>Lưới</label>
            <div className="ml-auto flex gap-2"><button onClick={undo} disabled={!items.length} title="Hoàn tác" className="rounded-xl border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-40"><Undo2 size={18}/></button><button onClick={redo} disabled={!redoItems.length} title="Làm lại" className="rounded-xl border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-40"><Redo2 size={18}/></button><button onClick={clearBoard} title="Xóa toàn bảng" className="rounded-xl border border-rose-200 p-2 text-rose-600 hover:bg-rose-50"><Trash2 size={18}/></button></div>
          </div>
          <div className="relative touch-none bg-white" style={{touchAction:'none'}}><canvas ref={canvasRef} width={W} height={H} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} className="block h-auto w-full cursor-crosshair touch-none" style={{aspectRatio:`${W}/${H}`,touchAction:'none'}} aria-label="Bảng viết tương tác, dùng chuột, ngón tay hoặc bút cảm ứng để vẽ"/><div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-white/85 px-2 py-1 text-xs text-slate-500 shadow">Chuột · cảm ứng · bút cảm ứng</div></div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-4 py-3"><p aria-live="polite" className="text-sm text-slate-600">{message}</p><div className="flex gap-2"><button onClick={()=>window.print()} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold hover:bg-slate-50"><Printer className="mr-1 inline" size={15}/>In bảng</button><button onClick={saveBoard} className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700"><Save className="mr-1 inline" size={15}/>Lưu tiến trình</button></div></div>
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
            <div className="mt-4 grid grid-cols-2 gap-2">{[['graph-st','Đồ thị s–t'],['graph-vt','Đồ thị v–t'],['graph-uv','Đồ thị U–I'],['graph-function','Đồ thị phương trình'],['harmonic','Dao động điều hòa'],['unit-circle','Vòng tròn lượng giác']].map(([d,t])=><button key={d} onClick={()=>addComponent(d as Diagram)} className="rounded-xl border border-slate-200 p-2 text-left text-xs font-bold hover:border-blue-400 hover:bg-blue-50">{t}</button>)}</div>
            <div className="mt-3 grid grid-cols-2 gap-2">{[['battery','Nguồn điện'],['resistor','Điện trở R'],['lamp','Bóng đèn'],['switch','Khóa K'],['ammeter','Ampe kế'],['voltmeter','Vôn kế'],['wire','Dây nối']].map(([d,t])=><button key={d} onClick={()=>addComponent(d as Diagram)} className="rounded-xl border border-slate-200 p-2 text-left text-xs font-bold hover:border-emerald-400 hover:bg-emerald-50">+ {t}</button>)}</div>
            <div className="mt-4 rounded-2xl border border-violet-200 bg-violet-50 p-3"><h3 className="font-black text-violet-900">Vẽ đồ thị từ phương trình</h3><p className="mt-1 text-xs text-violet-800">Dùng x làm biến. Hỗ trợ sin(x), cos(x), tan(x), 2*x+1, x^2-4. Dùng dấu * để nhân, ^ để lũy thừa; góc lượng giác tính bằng radian.</p><label className="mt-2 block text-xs font-bold">y = f(x)<input value={equationInput} onChange={e=>setEquationInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')addFunctionGraph();}} placeholder="Ví dụ: sin(x), cos(2*x), x^2-4" className="mt-1 w-full rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm" /></label><button onClick={addFunctionGraph} className="mt-2 w-full rounded-xl bg-violet-700 px-3 py-2 text-sm font-black text-white hover:bg-violet-800">+ Tạo đồ thị có thể kéo</button></div>
            <div className="mt-3 grid grid-cols-2 gap-2"><label className="text-xs font-semibold">Trục x tối đa<input className="mt-1 w-full rounded-lg border p-2" type="number" min="1" max="1000" value={settings.graphXMax} onChange={e=>updateSetting('graphXMax',Math.max(1,Number(e.target.value)||1))}/></label><label className="text-xs font-semibold">Trục y tối đa<input className="mt-1 w-full rounded-lg border p-2" type="number" min="1" max="1000" value={settings.graphYMax} onChange={e=>updateSetting('graphYMax',Math.max(1,Number(e.target.value)||1))}/></label></div>
            <div className="mt-3 rounded-2xl border border-blue-200 bg-blue-50 p-3"><h3 className="font-black text-blue-900">Vẽ đồ thị theo tọa độ điểm</h3><p className="mt-1 text-xs text-blue-800">Nhập các cặp (x,y), cách nhau bằng dấu chấm phẩy. Ví dụ: 0,0; 2,20; 4,40. Với s–t, x là t và y là s; với v–t, x là t và y là v.</p><textarea value={graphCoordinates} onChange={e=>setGraphCoordinates(e.target.value)} rows={3} className="mt-2 w-full rounded-lg border border-blue-200 bg-white p-2 text-sm" aria-label="Danh sách tọa độ điểm đồ thị"/><button onClick={applyGraphCoordinates} className="mt-2 w-full rounded-xl bg-blue-700 px-3 py-2 text-sm font-black text-white hover:bg-blue-800">Vẽ / cập nhật đường biểu diễn</button><p className="mt-2 text-xs text-blue-800">Sau khi vẽ: kéo điểm đỏ để sửa một điểm; kéo đoạn xanh để di chuyển riêng đường biểu diễn.</p></div>
            <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">Lưu ý: tham số điều khiển tác động lên các hình mẫu được vẽ lại; đây là công cụ minh họa giảng dạy, chưa thay thế phần mềm mô phỏng quang học/điện học định lượng chuyên dụng.</p>
          </section>
          <section className="rounded-3xl border border-violet-100 bg-white p-4 shadow-lg"><div className="flex items-center justify-between gap-2"><div><h2 className="text-lg font-black">Hình mẫu Vật lý</h2><p className="mt-1 text-xs text-slate-500">Chọn / di chuyển để kéo hình và nét; kéo nút ở hai đầu đoạn thẳng/dây để đổi chiều dài, kéo điểm trên nét đồ thị để sửa từng đoạn. Dùng Đoạn thẳng hoặc Véc tơ để nối linh kiện.</p></div><button onClick={()=>setShowLibrary(v=>!v)} className="rounded-lg border p-2" title="Thu gọn/mở rộng thư viện">{showLibrary?<ChevronRight size={18} className="rotate-90"/>:<ChevronRight size={18}/>}</button></div>
            {showLibrary&&<div className="mt-4 grid grid-cols-2 gap-2">{[
              ['convex-lens','Thấu kính hội tụ'],['concave-lens','Thấu kính phân kỳ'],['prism','Lăng kính'],['dispersion','Tán sắc ánh sáng'],['mirror','Phản xạ ánh sáng'],['refraction','Khúc xạ ánh sáng'],['circuit','Mạch điện mẫu'],['force-vector','Các véc tơ lực'],['graph-st','Đồ thị s–t'],['graph-vt','Đồ thị v–t'],['graph-uv','Đồ thị U–I'],['graph-function','Đồ thị phương trình'],['harmonic','Dao động điều hòa'],['unit-circle','Vòng tròn lượng giác'],
            ].map(([d,t])=><button key={d} onClick={()=>addDiagram(d as Diagram)} className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-sky-50 p-3 text-left text-sm font-bold transition hover:border-blue-400 hover:shadow-sm"><span className="mb-2 grid h-8 w-8 place-items-center rounded-lg bg-blue-100 text-blue-700">{d==='circuit'?<Zap size={17}/>:d.includes('lens')||d==='prism'||d==='dispersion'||d==='refraction'||d==='mirror'?<Circle size={17}/>:<ArrowUpRight size={17}/>}</span>{t}<span className="mt-1 block text-xs font-normal text-slate-500">Chèn vào bảng</span></button>)}</div>}
            <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">Hình mẫu là sơ đồ giảng dạy có thể ghi chú thêm bằng bút. Với thí nghiệm định lượng, hãy đối chiếu số liệu và quy ước dấu của bài học.</p>
          </section>
          <section className="rounded-3xl border border-sky-100 bg-white p-4 shadow-lg"><div className="flex items-center justify-between gap-2"><div><h2 className="text-lg font-black">Công thức nhanh</h2><p className="mt-1 text-xs text-slate-500">Nhấn để ghi công thức lên bảng.</p></div><BookOpen className="text-sky-600" size={22}/></div>
            <input value={formulaSearch} onChange={e=>setFormulaSearch(e.target.value)} placeholder="Tìm công thức…" className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"/>
            <select value={classFilter} onChange={e=>setClassFilter(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"><option>Tất cả</option><option>Lớp 6</option><option>Lớp 7</option><option>Lớp 8</option><option>Lớp 9</option><option>Lớp 10</option><option>Lớp 11</option><option>Lớp 12</option></select>
            <div className="mt-3 max-h-[410px] space-y-2 overflow-y-auto pr-1">{filteredFormulas.map(f=><button key={f.name} onClick={()=>addFormula(f)} className="w-full rounded-xl border border-slate-200 p-3 text-left transition hover:border-violet-300 hover:bg-violet-50"><span className="block text-xs font-semibold text-slate-500">{f.group}</span><span className="mt-1 block font-bold">{f.name}</span><span className="mt-1 block text-lg font-black text-violet-700">{f.expression}</span><span className="mt-1 block text-xs leading-relaxed text-slate-500">{f.note}</span></button>)}{!filteredFormulas.length&&<p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">Không tìm thấy công thức phù hợp.</p>}</div>
          </section>
        </aside>
      </div>
      <section className="mt-5 rounded-3xl border border-sky-100 bg-white p-4 shadow-sm sm:p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-black">Mở nhanh các phòng học</h2><p className="mt-1 text-sm text-slate-500">Giữ nguyên các đường dẫn phòng học hiện có của website.</p></div><MousePointer2 className="text-blue-600" size={25}/></div><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{rooms.map(r=>{const Icon=r.icon;return <a href={r.href} key={r.href} className="group rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"><span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-400 text-white"><Icon size={21}/></span><h3 className="mt-3 font-black">{r.title}</h3><p className="mt-1 text-sm text-slate-500">{r.desc}</p><span className="mt-3 inline-flex items-center text-sm font-bold text-blue-700">Mở phòng <ChevronRight size={16}/></span></a>})}</div></section>
      <p className="mt-4 text-xs leading-relaxed text-slate-500">Bảng được lưu cục bộ trên trình duyệt của thiết bị này; nút Xuất PNG giúp lưu ảnh bài giảng. Phiên bản này hỗ trợ thao tác bút/chuột/cảm ứng và các hình mẫu minh họa; các mô phỏng vật lý động chuyên sâu cần được tích hợp riêng theo từng bài học.</p>
    </div>
  </main>;
}
