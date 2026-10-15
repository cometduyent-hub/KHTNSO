'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowDownRight, ArrowUpRight, BookOpen, Check, ChevronRight, Circle, Download,
  Eraser, FlaskConical, Hand, Minus, MousePointer2, Pencil, Printer, Redo2,
  RotateCcw, Save, Square, Trash2, Type, Undo2, ZoomIn, Zap,
} from 'lucide-react';

type Point = { x: number; y: number };
type Tool = 'select' | 'pen' | 'eraser' | 'line' | 'arrow' | 'text';
type Diagram = 'convex-lens' | 'concave-lens' | 'prism' | 'dispersion' | 'mirror' | 'circuit' | 'force-vector' | 'refraction' | 'graph-st' | 'graph-vt' | 'graph-uv' | 'harmonic' | 'unit-circle' | 'battery' | 'resistor' | 'lamp' | 'switch' | 'ammeter' | 'voltmeter' | 'wire';
type BoardItem =
  | { id: string; kind: 'path'; points: Point[]; color: string; width: number; erase?: boolean }
  | { id: string; kind: 'line' | 'arrow'; from: Point; to: Point; color: string; width: number }
  | { id: string; kind: 'text'; at: Point; text: string; color: string; size: number }
  | { id: string; kind: 'diagram'; diagram: Diagram; at: Point; scale: number };

type Formula = { group: string; name: string; expression: string; note: string };
const W = 1200, H = 700;
const formulas: Formula[] = [
  { group: 'Lớp 6–7 · Đo lường và chuyển động', name: 'Tốc độ', expression: 'v = s / t', note: 'v: tốc độ; s: quãng đường; t: thời gian' },
  { group: 'Lớp 6–7 · Đo lường và chuyển động', name: 'Khối lượng riêng', expression: 'D = m / V', note: 'D: khối lượng riêng; m: khối lượng; V: thể tích' },
  { group: 'Lớp 8 · Lực và áp suất', name: 'Áp suất', expression: 'p = F / S', note: 'F vuông góc với diện tích S' },
  { group: 'Lớp 8 · Lực và áp suất', name: 'Lực đẩy Archimedes', expression: 'Fₐ = d · V', note: 'V là thể tích phần chất lỏng bị vật chiếm chỗ' },
  { group: 'Lớp 8–9 · Năng lượng', name: 'Công cơ học', expression: 'A = F · s', note: 'Khi lực cùng hướng chuyển dời' },
  { group: 'Lớp 8–9 · Năng lượng', name: 'Công suất', expression: 'P = A / t', note: 'A: công; t: thời gian thực hiện công' },
  { group: 'Lớp 7–9 · Điện học', name: 'Định luật Ôm', expression: 'I = U / R', note: 'I: cường độ dòng điện; U: hiệu điện thế; R: điện trở' },
  { group: 'Lớp 7–9 · Quang học', name: 'Định luật phản xạ', expression: 'i = i′', note: 'Góc tới bằng góc phản xạ' },
  { group: 'Lớp 9–12 · Quang học', name: 'Thấu kính mỏng', expression: '1/f = 1/d + 1/d′', note: 'Cần thống nhất quy ước dấu trong bài học' },
  { group: 'Lớp 10–12 · Cơ học', name: 'Định luật II Newton', expression: 'ΣF⃗ = m · a⃗', note: 'Gia tốc cùng hướng với hợp lực' },
  { group: 'Lớp 10–12 · Dao động', name: 'Dao động điều hòa', expression: 'x = A cos(ωt + φ)', note: 'A: biên độ; ω: tần số góc; φ: pha ban đầu' },
  { group: 'Lớp 10–12 · Sóng', name: 'Tốc độ truyền sóng', expression: 'v = λf', note: 'λ: bước sóng; f: tần số' },
  { group: 'Lớp 10–12 · Điện từ', name: 'Cảm ứng điện từ', expression: 'e = −ΔΦ / Δt', note: 'Suất điện động cảm ứng theo định luật Faraday–Lenz' },
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
type BoardSettings = { focalLength:number; objectDistance:number; prismAngle:number; incidentAngle:number; refractiveIndex:number; refractionDirection:string; objectHeight:number; graphXMax:number; graphYMax:number; graphStep:number; graphMode:string; amplitude:number; omega:number; phase:number };
function drawDiagram(ctx: CanvasRenderingContext2D, item: Extract<BoardItem, {kind:'diagram'}>, settings:BoardSettings) {
  ctx.save(); ctx.translate(item.at.x, item.at.y); ctx.scale(item.scale, item.scale);
  const blue = '#2563eb', red = '#dc2626', purple = '#7c3aed', gray = '#475569', green = '#059669';
  ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (item.diagram === 'convex-lens' || item.diagram === 'concave-lens') {
    const convex=item.diagram==='convex-lens';
    ctx.strokeStyle = blue; ctx.fillStyle = 'rgba(125,211,252,.2)'; ctx.beginPath();
    if (convex) { ctx.moveTo(0,-95); ctx.bezierCurveTo(36,-58,36,58,0,95); ctx.bezierCurveTo(-36,58,-36,-58,0,-95); }
    else { ctx.moveTo(0,-95); ctx.bezierCurveTo(-15,-55,-15,55,0,95); ctx.bezierCurveTo(15,55,15,-55,0,-95); }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = gray; ctx.setLineDash([6,5]); ctx.beginPath(); ctx.moveTo(-260,0); ctx.lineTo(260,0); ctx.stroke(); ctx.setLineDash([]);
    const f=Math.max(25,Math.min(150,settings.focalLength)); const d=Math.max(30,Math.min(240,settings.objectDistance));
    const objectX=-Math.min(230,d*0.72), objectH=-Math.max(20,Math.min(100,settings.objectHeight)), imageD=convex?(Math.abs(d-f)<3?180:(d*f/(d-f))):-(d*f/(d+f));
    const imageX=convex?Math.max(20,Math.min(235,imageD*0.72)):Math.max(20,Math.min(220,Math.abs(imageD)*0.72));
    // Object and image arrows
    arrow(ctx,{x:objectX,y:0},{x:objectX,y:objectH},red,3,10); label(ctx,'Vật',objectX-20,objectH-10,red,15);
    if(convex && d>f+3){const hi=objectH*(imageD/d);arrow(ctx,{x:imageX,y:0},{x:imageX,y:Math.max(-120,Math.min(120,-hi))},green,3,10);label(ctx,'Ảnh thật',imageX-22,Math.max(-120,Math.min(120,-hi))-10,green,14);}
    else if(!convex || d<f-3){const hi=convex?objectH*Math.abs(imageD/d):objectH*Math.abs(imageD/d);arrow(ctx,{x:-imageX,y:0},{x:-imageX,y:Math.max(-110,hi)},green,3,10);label(ctx,'Ảnh ảo',-imageX-22,Math.max(-110,hi)+22,green,14);}
    // principal rays from object tip
    const tip={x:objectX,y:objectH};
    ctx.strokeStyle=red;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(tip.x,tip.y);ctx.lineTo(0,tip.y);ctx.lineTo(230,convex?tip.y*(1-230/Math.max(40,f*0.72)):tip.y+230*0.2);ctx.stroke();
    ctx.strokeStyle=green;ctx.beginPath();ctx.moveTo(tip.x,tip.y);ctx.lineTo(0,0);ctx.lineTo(230,tip.y*(230/Math.max(40,f*0.72)));ctx.stroke();
    ctx.fillStyle=gray;ctx.beginPath();ctx.arc(-f*0.72,0,4,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(f*0.72,0,4,0,Math.PI*2);ctx.fill();
    label(ctx,'F',-f*0.72-7,20,gray,15);label(ctx,'F′',f*0.72-7,20,gray,15);label(ctx,'O',7,20,gray,15);
    label(ctx,`${convex?'Hội tụ':'Phân kỳ'} · f=${settings.focalLength} cm · d=${settings.objectDistance} cm`,-235,135,blue,15);
  } else if (item.diagram === 'prism' || item.diagram === 'dispersion') {
    ctx.rotate(settings.prismAngle*Math.PI/180);
    ctx.strokeStyle = purple; ctx.fillStyle = 'rgba(196,181,253,.24)'; ctx.beginPath(); ctx.moveTo(-70,-70); ctx.lineTo(70,-70); ctx.lineTo(0,75); ctx.closePath(); ctx.fill(); ctx.stroke();
    // Incident beam enters the left face; emergent rays bend toward the prism base.
    arrow(ctx,{x:-235,y:-28},{x:-65,y:-28},red,3,11);
    ctx.strokeStyle=red;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-65,-28);ctx.lineTo(0,12);ctx.stroke();
    if(item.diagram==='prism') arrow(ctx,{x:0,y:12},{x:220,y:82},red,3,11);
    else {
      const colors=['#dc2626','#f97316','#eab308','#16a34a','#2563eb','#4f46e5','#9333ea'];
      colors.forEach((c,i)=>{const y=36+i*12;arrow(ctx,{x:0,y:12},{x:220,y},c,2.5,9);});
      label(ctx,'Đỏ · lệch ít',225,36,colors[0],13);label(ctx,'Tím · lệch nhiều',225,118,colors[6],13);
    }
    label(ctx,`Lăng kính · xoay ${settings.prismAngle}°`,-220,145,gray,15);
  } else if (item.diagram === 'mirror' || item.diagram === 'refraction') {
    ctx.strokeStyle = gray; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0,-105); ctx.lineTo(0,105); ctx.stroke();
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2; ctx.setLineDash([5,5]); ctx.beginPath(); ctx.moveTo(-220,0); ctx.lineTo(220,0); ctx.stroke(); ctx.setLineDash([]);
    if (item.diagram === 'mirror') { arrow(ctx,{x:-145,y:-95},{x:0,y:0},red,3,12); arrow(ctx,{x:0,y:0},{x:-145,y:95},green,3,12); label(ctx,'i',-92,-42,red,17); label(ctx,'i′',-90,58,green,17); label(ctx,'Gương phẳng',15,-85,gray,16); }
    else { ctx.fillStyle='rgba(125,211,252,.18)';ctx.fillRect(-220,0,440,120); const i=settings.incidentAngle*Math.PI/180; const n1=settings.refractionDirection==='water-air'?settings.refractiveIndex:1,n2=settings.refractionDirection==='water-air'?1:settings.refractiveIndex; const ratio=n1*Math.sin(i)/n2; const tir=Math.abs(ratio)>1; const r=tir?i:Math.asin(Math.max(-.999,Math.min(.999,ratio))); const endX=180*Math.sin(r),endY=180*Math.cos(r); arrow(ctx,{x:-180*Math.sin(i),y:-180*Math.cos(i)},{x:0,y:0},red,3,12); if(tir){arrow(ctx,{x:0,y:0},{x:180*Math.sin(i),y:-180*Math.cos(i)},green,3,12);label(ctx,'Phản xạ toàn phần',18,-35,green,14);}else arrow(ctx,{x:0,y:0},{x:endX,y:endY},green,3,12); ctx.strokeStyle=gray;ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(0,-120);ctx.lineTo(0,120);ctx.stroke();ctx.setLineDash([]);label(ctx,`i=${settings.incidentAngle}°`, -145,-90,red,15);label(ctx,`r≈${(r*180/Math.PI).toFixed(1)}°`,15,55,green,15);label(ctx,'Không khí',-205,-72,gray,16);label(ctx,settings.refractionDirection==='water-air'?'Nước → không khí':'Không khí → nước',-205,95,gray,14);label(ctx,`n₂=${n2.toFixed(2)}`,-205,115,gray,14); }
  } else if (item.diagram === 'circuit') {
    ctx.strokeStyle = gray; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-150,-65);ctx.lineTo(150,-65);ctx.lineTo(150,65);ctx.lineTo(-150,65);ctx.lineTo(-150,-65);ctx.stroke();
    // Cell symbol
    ctx.strokeStyle=red;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-168,-23);ctx.lineTo(-132,-23);ctx.moveTo(-160,-43);ctx.lineTo(-160,-3);ctx.moveTo(-145,-35);ctx.lineTo(-145,-11);ctx.stroke();
    // Resistor and lamp symbol
    ctx.strokeStyle=gray;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(15,-65);ctx.lineTo(15,-85);ctx.lineTo(70,-85);ctx.lineTo(70,-45);ctx.lineTo(15,-45);ctx.lineTo(15,-65);ctx.stroke();
    ctx.beginPath();ctx.arc(150,0,20,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(136,-14);ctx.lineTo(164,14);ctx.moveTo(164,-14);ctx.lineTo(136,14);ctx.stroke();
    label(ctx,'Nguồn',-205,105,red,16);label(ctx,'R',34,-93,gray,16);label(ctx,'Đèn',175,7,gray,16);label(ctx,'Sơ đồ mạch điện kín',-85,130,blue,17);
  } else if (item.diagram.startsWith('graph-')) {
    const left=-220,top=-115,w=430,h=220;ctx.strokeStyle='#cbd5e1';ctx.lineWidth=1;
    for(let x=0;x<=w;x+=Math.max(10,settings.graphStep*10)){ctx.beginPath();ctx.moveTo(left+x,top);ctx.lineTo(left+x,top+h);ctx.stroke();}
    for(let y=0;y<=h;y+=Math.max(10,settings.graphStep*10)){ctx.beginPath();ctx.moveTo(left,top+y);ctx.lineTo(left+w,top+y);ctx.stroke();}
    arrow(ctx,{x:left,y:top+h},{x:left+w+15,y:top+h},gray,2,9);arrow(ctx,{x:left,y:top+h},{x:left,y:top-18},gray,2,9);
    const xmax=settings.graphXMax,ymax=settings.graphYMax;ctx.strokeStyle=blue;ctx.lineWidth=3;ctx.beginPath();
    for(let px=0;px<=w;px++){const x=px/w*xmax;let y=0;if(item.diagram==='graph-st')y=x*(ymax/xmax)*0.72;else if(item.diagram==='graph-vt')y=(x/xmax<.38?ymax*.72:x/xmax<.62?ymax*.72:Math.min(ymax,x/xmax*ymax*.8));else y=Math.min(ymax,Math.max(0,x*0.7));const py=top+h-(y/ymax)*h;if(px===0)ctx.moveTo(left+px,py);else ctx.lineTo(left+px,py);}ctx.stroke();
    label(ctx,item.diagram==='graph-st'?'Đồ thị s–t':item.diagram==='graph-vt'?'Đồ thị v–t':'Đồ thị U–I',-150,-135,blue,17);label(ctx,item.diagram==='graph-st'?'s (m)':item.diagram==='graph-vt'?'v (m/s)':'U (V)',left-5,top-24,gray,13);label(ctx,'t (s) / I (A)',left+w-75,top+h+25,gray,13);
    label(ctx,`Trục x: 0–${xmax} · trục y: 0–${ymax}`,-130,145,gray,13);
  } else if (item.diagram==='harmonic' || item.diagram==='unit-circle') {
    if(item.diagram==='unit-circle'){ctx.strokeStyle=gray;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,100,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='#cbd5e1';ctx.beginPath();ctx.moveTo(-125,0);ctx.lineTo(125,0);ctx.moveTo(0,-125);ctx.lineTo(0,125);ctx.stroke();const a=settings.phase*Math.PI/180;arrow(ctx,{x:0,y:0},{x:100*Math.cos(a),y:-100*Math.sin(a)},blue,4,12);label(ctx,`φ=${settings.phase}°`,20,-115,blue,16);label(ctx,'cos φ',35,18,red,14);label(ctx,'sin φ',-60,-55,green,14);}
    else {ctx.strokeStyle=gray;ctx.beginPath();ctx.moveTo(-220,0);ctx.lineTo(220,0);ctx.moveTo(-210,-95);ctx.lineTo(-210,95);ctx.stroke();ctx.strokeStyle=blue;ctx.lineWidth=3;ctx.beginPath();for(let x=0;x<=420;x++){const t=x/420*2*Math.PI;const y=-settings.amplitude*25*Math.cos(settings.omega*t+settings.phase*Math.PI/180);if(x===0)ctx.moveTo(-210+x,y);else ctx.lineTo(-210+x,y);}ctx.stroke();label(ctx,`x = A cos(ωt + φ) · A=${settings.amplitude}, ω=${settings.omega}, φ=${settings.phase}°`,-215,130,blue,15);}
  } else if (['battery','resistor','lamp','switch','ammeter','voltmeter','wire'].includes(item.diagram)) {
    ctx.strokeStyle=gray;ctx.fillStyle='#ffffff';ctx.lineWidth=3;
    if(item.diagram==='battery'){ctx.beginPath();ctx.moveTo(-55,0);ctx.lineTo(-12,0);ctx.moveTo(-12,-28);ctx.lineTo(-12,28);ctx.moveTo(12,-16);ctx.lineTo(12,16);ctx.moveTo(12,0);ctx.lineTo(55,0);ctx.stroke();label(ctx,'+',-5,-36,red,18);label(ctx,'−',-25,35,blue,18);label(ctx,'Nguồn điện',-60,58,gray,14);}
    else if(item.diagram==='resistor'){ctx.beginPath();ctx.moveTo(-75,0);ctx.lineTo(-35,0);ctx.rect(-35,-16,70,32);ctx.moveTo(35,0);ctx.lineTo(75,0);ctx.stroke();label(ctx,'R',-5,6,gray,16);}
    else if(item.diagram==='lamp'){ctx.beginPath();ctx.arc(0,0,28,0,Math.PI*2);ctx.moveTo(-20,-20);ctx.lineTo(20,20);ctx.moveTo(20,-20);ctx.lineTo(-20,20);ctx.stroke();label(ctx,'Đèn',-22,52,gray,14);}
    else if(item.diagram==='switch'){ctx.beginPath();ctx.moveTo(-65,0);ctx.lineTo(-15,0);ctx.arc(0,0,15,Math.PI,0,true);ctx.moveTo(0,-15);ctx.lineTo(48,-35);ctx.moveTo(48,-35);ctx.lineTo(65,-35);ctx.stroke();label(ctx,'Khóa K',-30,42,gray,14);}
    else if(item.diagram==='ammeter'||item.diagram==='voltmeter'){ctx.beginPath();ctx.arc(0,0,32,0,Math.PI*2);ctx.stroke();label(ctx,item.diagram==='ammeter'?'A':'V',-8,7,blue,20);label(ctx,item.diagram==='ammeter'?'Ampe kế':'Vôn kế',-38,55,gray,14);}
    else {ctx.beginPath();ctx.moveTo(-90,0);ctx.lineTo(90,0);ctx.stroke();label(ctx,'Dây nối',-30,25,gray,14);}
  } else if (item.diagram === 'force-vector') {
    ctx.strokeStyle='#94a3b8';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-220,80);ctx.lineTo(220,80);ctx.moveTo(0,120);ctx.lineTo(0,-130);ctx.stroke();
    arrow(ctx,{x:0,y:0},{x:145,y:-70},blue,4,15);arrow(ctx,{x:0,y:0},{x:-90,y:-95},red,4,15);arrow(ctx,{x:0,y:0},{x:40,y:100},green,4,15);
    label(ctx,'F₁',150,-72,blue,19);label(ctx,'F₂',-120,-100,red,19);label(ctx,'P',48,115,green,19);label(ctx,'Các véc tơ lực',-80,155,gray,18);
  }
  ctx.restore();
}

export default function TeachingBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef<Point[] | null>(null);
  const pointerDownRef = useRef(false);
  const dragRef = useRef<{id:string;offset:Point}|null>(null);
  const [selectedId,setSelectedId] = useState<string|null>(null);
  const [items, setItems] = useState<BoardItem[]>([]);
  const [redoItems, setRedoItems] = useState<BoardItem[][]>([]);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#172554');
  const [lineWidth, setLineWidth] = useState(4);
  const [grid, setGrid] = useState(false);
  const [paper, setPaper] = useState<'white'|'dark'|'green'>('white');
  const [formulaSearch, setFormulaSearch] = useState('');
  const [classFilter, setClassFilter] = useState('Tất cả');
  const [message, setMessage] = useState('Bảng trống — bắt đầu viết hoặc chọn hình mẫu.');
  const [showLibrary, setShowLibrary] = useState(true);
  const [lessonTitle, setLessonTitle] = useState('Bài học hôm nay');
  const [loaded, setLoaded] = useState(false);
  const [settings,setSettings] = useState<BoardSettings>({focalLength:60,objectDistance:120,objectHeight:58,prismAngle:0,incidentAngle:40,refractiveIndex:1.33,refractionDirection:'air-water',graphXMax:10,graphYMax:100,graphStep:1,graphMode:'graph-st',amplitude:3,omega:1,phase:0});
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
    try { const raw=localStorage.getItem('khtnso-teaching-board-v2'); if(raw){const parsed=JSON.parse(raw) as {items?:BoardItem[];lessonTitle?:string;settings?:Partial<BoardSettings>};if(Array.isArray(parsed.items))setItems(parsed.items);if(parsed.lessonTitle)setLessonTitle(parsed.lessonTitle);if(parsed.settings)setSettings(old=>({...old,...parsed.settings}));} } catch { /* ignore old or invalid local save */ }
    setLoaded(true);
  },[]);
  useEffect(()=>{if(loaded){try{localStorage.setItem('khtnso-teaching-board-v2',JSON.stringify({items,lessonTitle,settings}));}catch{/* storage may be full */}}},[items,lessonTitle,settings,loaded]);
  useEffect(()=>{const resize=()=>drawScene();window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize);},[drawScene]);

  const pointFromEvent = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const r=e.currentTarget.getBoundingClientRect(); return {x:Math.max(0,Math.min(W,(e.clientX-r.left)*W/r.width)),y:Math.max(0,Math.min(H,(e.clientY-r.top)*H/r.height))};
  };
  const pointerDown=(e:React.PointerEvent<HTMLCanvasElement>)=>{
    const p=pointFromEvent(e);
    if(tool==='select'){const found=[...items].reverse().find(it=>'at' in it && Math.hypot(it.at.x-p.x,it.at.y-p.y)<150);if(found){setSelectedId(found.id);if('at' in found)dragRef.current={id:found.id,offset:{x:p.x-found.at.x,y:p.y-found.at.y}};else dragRef.current={id:found.id,offset:{x:0,y:0}};e.currentTarget.setPointerCapture(e.pointerId);pointerDownRef.current=true;setMessage('Đang chọn/di chuyển hình. Kéo chuột hoặc ngón tay để đặt lại vị trí.');}else{setSelectedId(null);setMessage('Chọn một hình mẫu hoặc chữ trên bảng để di chuyển.');}return;}
    if(tool==='text'){const p=pointFromEvent(e);const value=window.prompt('Nhập nội dung cần ghi lên bảng:');if(value?.trim()){setItems(old=>[...old,{id:uid(),kind:'text',at:p,text:value.trim(),color,size:26}]);setRedoItems([]);setMessage('Đã thêm chữ lên bảng.');}return;}
    e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);pointerDownRef.current=true;activeRef.current=[p];drawScene();
  };
  const pointerMove=(e:React.PointerEvent<HTMLCanvasElement>)=>{if(!pointerDownRef.current)return;const p=pointFromEvent(e);if(dragRef.current){const {id,offset}=dragRef.current;setItems(old=>old.map(it=>it.id===id&&'at' in it?({...it,at:{x:p.x-offset.x,y:p.y-offset.y}} as BoardItem):it));return;}if(activeRef.current)activeRef.current=[...activeRef.current,p];drawScene();};
  const pointerUp=(e:React.PointerEvent<HTMLCanvasElement>)=>{
    if(!pointerDownRef.current)return;pointerDownRef.current=false;if(dragRef.current){dragRef.current=null;setRedoItems([]);return;}const p=pointFromEvent(e);const pts=activeRef.current||[];activeRef.current=null;if(!pts.length)return;
    if(tool==='pen'||tool==='eraser')setItems(old=>[...old,{id:uid(),kind:'path',points:[...pts,p],color,width:lineWidth,erase:tool==='eraser'}]);
    else if(tool==='line'||tool==='arrow'){const start=pts[0];setItems(old=>[...old,{id:uid(),kind:tool,from:start,to:p,color,width:lineWidth}]);}
    setRedoItems([]);setMessage(tool==='eraser'?'Đã tẩy nét.':'Đã ghi lên bảng.');
  };
  const addDiagram=(diagram:Diagram)=>{setItems(old=>[...old,{id:uid(),kind:'diagram',diagram,at:{x:W/2,y:H/2},scale:1}]);setRedoItems([]);setMessage('Đã thêm hình mẫu. Có thể tiếp tục vẽ, ghi chú hoặc xóa bằng công cụ tẩy.');};
  const addComponent=(diagram:Diagram)=>{setItems(old=>[...old,{id:uid(),kind:'diagram',diagram,at:{x:W/2,y:H/2},scale:1}]);setRedoItems([]);setMessage('Đã chèn dụng cụ riêng lẻ; tiếp tục chèn dây nối và các linh kiện để tự lắp mạch.');};
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
            {toolBtn('select','Chọn / di chuyển',Hand)}{toolBtn('pen','Bút viết',Pencil)}{toolBtn('eraser','Tẩy',Eraser)}{toolBtn('line','Đoạn thẳng',Minus)}{toolBtn('arrow','Véc tơ / mũi tên',ArrowUpRight)}{toolBtn('text','Chữ',Type)}
            <div className="mx-1 hidden h-8 w-px bg-slate-200 sm:block"/><label title="Màu nét" className="flex items-center gap-2 rounded-xl border border-slate-200 px-2 py-1.5 text-xs font-bold">Màu <input type="color" value={color} onChange={e=>setColor(e.target.value)} className="h-7 w-8 cursor-pointer border-0 bg-transparent"/></label>
            <label className="flex min-w-28 items-center gap-2 rounded-xl border border-slate-200 px-2 py-1.5 text-xs font-bold">Nét <input aria-label="Độ dày nét" type="range" min="1" max="14" value={lineWidth} onChange={e=>setLineWidth(Number(e.target.value))} className="w-16 accent-blue-600"/>{lineWidth}</label>
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold"><input type="checkbox" checked={grid} onChange={e=>setGrid(e.target.checked)} className="accent-blue-600"/>Lưới</label>
            <div className="ml-auto flex gap-2"><button onClick={undo} disabled={!items.length} title="Hoàn tác" className="rounded-xl border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-40"><Undo2 size={18}/></button><button onClick={redo} disabled={!redoItems.length} title="Làm lại" className="rounded-xl border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-40"><Redo2 size={18}/></button><button onClick={clearBoard} title="Xóa toàn bảng" className="rounded-xl border border-rose-200 p-2 text-rose-600 hover:bg-rose-50"><Trash2 size={18}/></button></div>
          </div>
          <div className="relative touch-none bg-white" style={{touchAction:'none'}}><canvas ref={canvasRef} width={W} height={H} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} className="block h-auto w-full cursor-crosshair touch-none" style={{aspectRatio:`${W}/${H}`,touchAction:'none'}} aria-label="Bảng viết tương tác, dùng chuột, ngón tay hoặc bút cảm ứng để vẽ"/><div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-white/85 px-2 py-1 text-xs text-slate-500 shadow">Chuột · cảm ứng · bút cảm ứng</div></div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-4 py-3"><p aria-live="polite" className="text-sm text-slate-600">{message}</p><div className="flex gap-2"><button onClick={()=>window.print()} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold hover:bg-slate-50"><Printer className="mr-1 inline" size={15}/>In bảng</button><button onClick={saveBoard} className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700"><Save className="mr-1 inline" size={15}/>Lưu tiến trình</button></div></div>
        </section>
        <aside className="space-y-4">
          <section className="rounded-3xl border border-cyan-100 bg-white p-4 shadow-lg"><h2 className="text-lg font-black">Điều khiển mô phỏng</h2><p className="mt-1 text-xs text-slate-500">Thay đổi tham số rồi chèn hình tương ứng để minh họa theo ý giáo viên.</p>
            <label className="mt-3 block text-sm font-semibold">Tiêu cự thấu kính: {settings.focalLength} cm<input className="w-full accent-blue-600" type="range" min="25" max="150" value={settings.focalLength} onChange={e=>updateSetting('focalLength',Number(e.target.value))}/></label>
            <label className="mt-3 block text-sm font-semibold">Khoảng cách vật: {settings.objectDistance} cm<input className="w-full accent-blue-600" type="range" min="30" max="240" value={settings.objectDistance} onChange={e=>updateSetting('objectDistance',Number(e.target.value))}/></label>
            <label className="mt-3 block text-sm font-semibold">Chiều cao vật: {settings.objectHeight} cm<input className="w-full accent-blue-600" type="range" min="20" max="100" value={settings.objectHeight} onChange={e=>updateSetting('objectHeight',Number(e.target.value))}/></label>
            <label className="mt-3 block text-sm font-semibold">Góc xoay lăng kính: {settings.prismAngle}°<input className="w-full accent-blue-600" type="range" min="-35" max="35" value={settings.prismAngle} onChange={e=>updateSetting('prismAngle',Number(e.target.value))}/></label>
            <label className="mt-3 block text-sm font-semibold">Góc tới: {settings.incidentAngle}°<input className="w-full accent-blue-600" type="range" min="5" max="80" value={settings.incidentAngle} onChange={e=>updateSetting('incidentAngle',Number(e.target.value))}/></label>
            <label className="mt-3 block text-sm font-semibold">Chiết suất môi trường: {settings.refractiveIndex.toFixed(2)}<input className="w-full accent-blue-600" type="range" min="1.00" max="1.60" step="0.01" value={settings.refractiveIndex} onChange={e=>updateSetting('refractiveIndex',Number(e.target.value))}/></label>
            <label className="mt-3 block text-sm font-semibold">Chiều truyền ánh sáng<select className="mt-1 w-full rounded-lg border p-2" value={settings.refractionDirection} onChange={e=>updateSetting('refractionDirection',e.target.value)}><option value="air-water">Không khí → nước</option><option value="water-air">Nước → không khí</option></select></label>
            <label className="mt-3 block text-sm font-semibold">Biên độ dao động A: {settings.amplitude}<input className="w-full accent-blue-600" type="range" min="1" max="5" value={settings.amplitude} onChange={e=>updateSetting('amplitude',Number(e.target.value))}/></label>
            <label className="mt-3 block text-sm font-semibold">Tần số góc ω: {settings.omega}<input className="w-full accent-blue-600" type="range" min="0.5" max="3" step="0.1" value={settings.omega} onChange={e=>updateSetting('omega',Number(e.target.value))}/></label>
            <label className="mt-3 block text-sm font-semibold">Pha ban đầu φ: {settings.phase}°<input className="w-full accent-blue-600" type="range" min="-180" max="180" value={settings.phase} onChange={e=>updateSetting('phase',Number(e.target.value))}/></label>
            <div className="mt-4 grid grid-cols-2 gap-2">{[['graph-st','Đồ thị s–t'],['graph-vt','Đồ thị v–t'],['graph-uv','Đồ thị U–I'],['harmonic','Dao động điều hòa'],['unit-circle','Vòng tròn lượng giác']].map(([d,t])=><button key={d} onClick={()=>addComponent(d as Diagram)} className="rounded-xl border border-slate-200 p-2 text-left text-xs font-bold hover:border-blue-400 hover:bg-blue-50">{t}</button>)}</div>
            <div className="mt-3 grid grid-cols-2 gap-2">{[['battery','Nguồn điện'],['resistor','Điện trở R'],['lamp','Bóng đèn'],['switch','Khóa K'],['ammeter','Ampe kế'],['voltmeter','Vôn kế'],['wire','Dây nối']].map(([d,t])=><button key={d} onClick={()=>addComponent(d as Diagram)} className="rounded-xl border border-slate-200 p-2 text-left text-xs font-bold hover:border-emerald-400 hover:bg-emerald-50">+ {t}</button>)}</div>
            <div className="mt-3 grid grid-cols-2 gap-2"><label className="text-xs font-semibold">Trục x tối đa<input className="mt-1 w-full rounded-lg border p-2" type="number" min="1" max="1000" value={settings.graphXMax} onChange={e=>updateSetting('graphXMax',Math.max(1,Number(e.target.value)||1))}/></label><label className="text-xs font-semibold">Trục y tối đa<input className="mt-1 w-full rounded-lg border p-2" type="number" min="1" max="1000" value={settings.graphYMax} onChange={e=>updateSetting('graphYMax',Math.max(1,Number(e.target.value)||1))}/></label></div>
            <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">Lưu ý: tham số điều khiển tác động lên các hình mẫu được vẽ lại; đây là công cụ minh họa giảng dạy, chưa thay thế phần mềm mô phỏng quang học/điện học định lượng chuyên dụng.</p>
          </section>
          <section className="rounded-3xl border border-violet-100 bg-white p-4 shadow-lg"><div className="flex items-center justify-between gap-2"><div><h2 className="text-lg font-black">Hình mẫu Vật lý</h2><p className="mt-1 text-xs text-slate-500">Chèn hình vào bảng rồi viết/vẽ bổ sung.</p></div><button onClick={()=>setShowLibrary(v=>!v)} className="rounded-lg border p-2" title="Thu gọn/mở rộng thư viện">{showLibrary?<ChevronRight size={18} className="rotate-90"/>:<ChevronRight size={18}/>}</button></div>
            {showLibrary&&<div className="mt-4 grid grid-cols-2 gap-2">{[
              ['convex-lens','Thấu kính hội tụ'],['concave-lens','Thấu kính phân kỳ'],['prism','Lăng kính'],['dispersion','Tán sắc ánh sáng'],['mirror','Phản xạ ánh sáng'],['refraction','Khúc xạ ánh sáng'],['circuit','Mạch điện mẫu'],['force-vector','Các véc tơ lực'],['graph-st','Đồ thị s–t'],['graph-vt','Đồ thị v–t'],['graph-uv','Đồ thị U–I'],['harmonic','Dao động điều hòa'],['unit-circle','Vòng tròn lượng giác'],
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
