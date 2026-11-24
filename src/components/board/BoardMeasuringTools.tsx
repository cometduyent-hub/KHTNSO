"use client";
import {useMemo,useRef,useState} from "react";

type P={x:number;y:number};
type ToolKind="ruler"|"set-square"|"protractor"|"compass";
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
export default function BoardMeasuringTools({onClose}:{onClose:()=>void}){
 const [kind,setKind]=useState<ToolKind>("ruler"),[pos,setPos]=useState<P>({x:330,y:300}),[angle,setAngle]=useState(0),[scale,setScale]=useState(1),[cmPx,setCmPx]=useState(96),[measure,setMeasure]=useState<{a:P;b:P}|null>(null),[start,setStart]=useState<P|null>(null);
 const drag=useRef<{mode:"move"|"measure";last:P}|null>(null);
 const point=(e:React.PointerEvent<SVGSVGElement>):P=>{const r=e.currentTarget.getBoundingClientRect();return{x:(e.clientX-r.left)*1200/r.width,y:(e.clientY-r.top)*700/r.height};};
 const local=(p:P)=>{const a=-angle*Math.PI/180,dx=p.x-pos.x,dy=p.y-pos.y;return{x:(dx*Math.cos(a)-dy*Math.sin(a))/scale,y:(dx*Math.sin(a)+dy*Math.cos(a))/scale};};
 const measured=measure?Math.hypot(measure.b.x-measure.a.x,measure.b.y-measure.a.y)/cmPx:0;
 const down=(e:React.PointerEvent<SVGSVGElement>)=>{const p=point(e);const el=e.target as Element;if(el.closest("[data-tool-body]")){drag.current={mode:"move",last:p};}else{drag.current={mode:"measure",last:p};setStart(p);setMeasure({a:p,b:p});}e.currentTarget.setPointerCapture(e.pointerId);};
 const move=(e:React.PointerEvent<SVGSVGElement>)=>{if(!drag.current)return;const p=point(e);if(drag.current.mode==="move"){const d=drag.current;setPos(v=>({x:v.x+p.x-d.last.x,y:v.y+p.y-d.last.y}));drag.current.last=p;}else if(start)setMeasure({a:start,b:p});};
 const up=()=>{if(kind==="compass"&&measure){setCircle({c:measure.a,r:Math.hypot(measure.b.x-measure.a.x,measure.b.y-measure.a.y)});}drag.current=null;setStart(null);};
 const rotate=(d:number)=>setAngle(v=>(v+d+360)%360);
 return <div className="absolute inset-0 z-30" style={{touchAction:"none"}}>
  <div className="absolute left-2 top-2 z-40 flex max-w-[calc(100%-1rem)] flex-wrap items-center gap-1 rounded-xl border border-amber-300 bg-white/95 p-2 shadow-xl">
   {([["ruler","Thước thẳng"],["set-square","Ê-ke"],["protractor","Thước đo góc"],["compass","Compa"]] as [ToolKind,string][]).map(([k,n])=><button key={k} onClick={()=>{setKind(k);setMeasure(null);setCircle(null)}} className={`rounded-lg px-2 py-1.5 text-xs font-black ${kind===k?"bg-amber-500 text-white":"bg-slate-100 text-slate-700"}`}>{n}</button>)}
   <button onClick={()=>rotate(-5)} className="rounded-lg bg-slate-100 px-2 py-1.5 text-xs font-bold">↶ 5°</button><button onClick={()=>rotate(5)} className="rounded-lg bg-slate-100 px-2 py-1.5 text-xs font-bold">↷ 5°</button>
   <label className="flex items-center gap-1 text-xs">Kích thước <input type="range" min=".55" max="1.8" step=".05" value={scale} onChange={e=>setScale(+e.target.value)} className="w-16"/></label>
   <label className="flex items-center gap-1 text-xs">px/cm <input type="number" min="5" max="200" value={cmPx} onChange={e=>setCmPx(clamp(+e.target.value||32,5,200))} className="w-14 rounded border px-1 py-1"/></label>
   <button onClick={()=>{setMeasure(null);setCircle(null);setPos({x:330,y:300});setAngle(0);setScale(1)}} className="rounded-lg bg-slate-100 px-2 py-1.5 text-xs">Đặt lại</button>
   <button onClick={onClose} className="rounded-lg bg-rose-600 px-2 py-1.5 text-xs font-bold text-white">Đóng dụng cụ</button>
  </div>
  <svg viewBox="0 0 1200 700" preserveAspectRatio="none" className="h-full w-full" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
   <g transform={`translate(${pos.x} ${pos.y}) rotate(${angle}) scale(${scale})`} data-tool-body style={{cursor:"move"}}>
    {kind==="ruler"&&<g data-tool-body><rect x="-250" y="-25" width="500" height="50" rx="5" fill="#fef3c7" fillOpacity=".88" stroke="#b45309" strokeWidth="2"/>{Array.from({length:51},(_,i)=><g key={i}><line x1={-240+i*9.6} x2={-240+i*9.6} y1="-25" y2={i%10===0?12:i%5===0?3:-9} stroke="#78350f" strokeWidth={i%10===0?2:1}/>{i%10===0&&<text x={-240+i*9.6+2} y="22" fontSize="11" fill="#78350f">{i/10}</text>}</g>)}</g>}
    {kind==="set-square"&&<g data-tool-body><path d="M-180 150 L-180 -150 L180 150 Z" fill="#bae6fd" fillOpacity=".72" stroke="#0369a1" strokeWidth="3"/><path d="M-145 110 L-145 -90 L95 110 Z" fill="none" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="5 4"/><path d="M-180 115 L-145 115 L-145 150" fill="none" stroke="#075985" strokeWidth="2"/></g>}
    {kind==="protractor"&&<g data-tool-body><path d="M-190 0 A190 190 0 0 0 190 0 L-190 0Z" fill="#fce7f3" fillOpacity=".78" stroke="#be185d" strokeWidth="3"/><line x1="-190" y1="0" x2="190" y2="0" stroke="#9d174d" strokeWidth="2"/>{Array.from({length:181},(_,i)=>{const a=Math.PI-i*Math.PI/180,r= i%10===0?190:i%5===0?180:184;return <line key={i} x1={190*Math.cos(a)} y1={-190*Math.sin(a)} x2={r*Math.cos(a)} y2={-r*Math.sin(a)} stroke="#9d174d" strokeWidth={i%10===0?2:1}/>})}{Array.from({length:19},(_,i)=><text key={i} x={-170+i*18.9} y="-12" fontSize="10" fill="#831843">{i*10}</text>)}</g>}
    {kind==="compass"&&<g data-tool-body><circle cx="0" cy="-115" r="9" fill="#334155"/><path d="M0 -115 L-65 135 M0 -115 L85 135" stroke="#475569" strokeWidth="8" strokeLinecap="round"/><path d="M-65 135 L-78 170 M85 135 L98 170" stroke="#0f172a" strokeWidth="3"/><path d="M-30 -45 L35 -45" stroke="#64748b" strokeWidth="12" strokeLinecap="round"/><circle cx="0" cy="-115" r="16" fill="none" stroke="#94a3b8" strokeWidth="3"/></g>}
    <circle data-tool-body cx="0" cy="0" r="8" fill="#f97316" stroke="white" strokeWidth="2"/>
   </g>
   {measure&&kind==="compass"&&<circle cx={measure.a.x} cy={measure.a.y} r={Math.hypot(measure.b.x-measure.a.x,measure.b.y-measure.a.y)} fill="none" stroke="#0f766e" strokeWidth="2" strokeDasharray="6 4"/>}{circle&&<g><circle cx={circle.c.x} cy={circle.c.y} r={circle.r} fill="none" stroke="#0f766e" strokeWidth="3"/><line x1={circle.c.x} y1={circle.c.y} x2={circle.c.x+circle.r} y2={circle.c.y} stroke="#0f766e" strokeWidth="2" strokeDasharray="5 4"/><circle cx={circle.c.x} cy={circle.c.y} r="5" fill="#0f766e"/><text x={circle.c.x+circle.r/2} y={circle.c.y-10} fontSize="14" fill="#115e59" fontWeight="bold">r = {(circle.r/cmPx).toFixed(2)} cm</text></g>}{measure&&<g><line x1={measure.a.x} y1={measure.a.y} x2={measure.b.x} y2={measure.b.y} stroke="#dc2626" strokeWidth="3" strokeDasharray="8 5"/><circle cx={measure.a.x} cy={measure.a.y} r="5" fill="#dc2626"/><circle cx={measure.b.x} cy={measure.b.y} r="5" fill="#dc2626"/><rect x={(measure.a.x+measure.b.x)/2-62} y={(measure.a.y+measure.b.y)/2-28} width="124" height="24" rx="6" fill="white" stroke="#dc2626"/><text x={(measure.a.x+measure.b.x)/2} y={(measure.a.y+measure.b.y)/2-11} fontSize="15" fontWeight="bold" textAnchor="middle" fill="#991b1b">{measured.toFixed(2)} cm</text></g>}
  </svg>
  <div className="absolute bottom-2 left-2 rounded-lg bg-white/95 px-3 py-2 text-xs text-slate-700 shadow">Kéo dụng cụ để đặt lên hình vẽ. Kéo trên vùng trống để đo đoạn thẳng; chọn Compa rồi kéo để vẽ đường tròn. Dụng cụ có thể xoay và đổi kích thước.</div>
 </div>;
}

function parsePoints(value:string):P[]{return value.split(";").map(s=>s.trim()).filter(Boolean).map(s=>s.split(/[,\s]+/).map(Number)).filter(a=>a.length===2&&a.every(Number.isFinite)).map(a=>({x:a[0],y:a[1]}));}
function slope(a:P,b:P){return Math.abs(b.x-a.x)<1e-9?null:(b.y-a.y)/(b.x-a.x);}
export function BoardGraphAnalysis(){
 const [raw,setRaw]=useState("0,0; 2,3; 4,6"),[raw2,setRaw2]=useState("0,4; 4,0");
 const a=useMemo(()=>parsePoints(raw),[raw]),b=useMemo(()=>parsePoints(raw2),[raw2]);
 const m=slope(a[0]||{x:0,y:0},a[1]||{x:0,y:0});
 const area=useMemo(()=>a.length<3?0:Math.abs(a.reduce((s,p,i)=>{const q=a[(i+1)%a.length];return s+p.x*q.y-q.x*p.y;},0))/2,[a]);
 const intersection=useMemo(()=>{if(a.length<2||b.length<2)return null;const [p,p2]=[a[0],a[1]],[q,q2]=[b[0],b[1]];const d=(p2.x-p.x)*(q2.y-q.y)-(p2.y-p.y)*(q2.x-q.x);if(Math.abs(d)<1e-9)return null;const t=((q.x-p.x)*(q2.y-q.y)-(q.y-p.y)*(q2.x-q.x))/d;return{x:p.x+t*(p2.x-p.x),y:p.y+t*(p2.y-p.y)};},[a,b]);
 const valid=a.length>=2;
 return <section className="mt-4 rounded-2xl border border-violet-200 bg-white p-4 shadow-sm">
  <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-xs font-black tracking-widest text-violet-700">TOÁN HỌC TRÊN BẢNG</p><h3 className="text-lg font-black">Phân tích đồ thị: hệ số góc · diện tích · giao điểm</h3></div><span className="rounded-lg bg-violet-50 px-3 py-1 text-xs font-bold text-violet-800">Tọa độ (x, y)</span></div>
  <div className="mt-3 grid gap-3 lg:grid-cols-2"><label className="text-xs font-bold text-slate-600">Dãy điểm đường 1<input value={raw} onChange={e=>setRaw(e.target.value)} className="mt-1 w-full rounded-lg border p-2 text-sm font-medium" placeholder="0,0; 2,3; 4,6"/></label><label className="text-xs font-bold text-slate-600">Dãy điểm đường 2<input value={raw2} onChange={e=>setRaw2(e.target.value)} className="mt-1 w-full rounded-lg border p-2 text-sm font-medium" placeholder="0,4; 4,0"/></label></div>
  <div className="mt-3 grid gap-2 sm:grid-cols-3"><div className="rounded-xl bg-sky-50 p-3"><p className="text-xs text-sky-800">Hệ số góc đoạn đầu</p><b className="text-xl">{valid?(m===null?"Không xác định":m.toFixed(4)):"Cần ≥ 2 điểm"}</b></div><div className="rounded-xl bg-emerald-50 p-3"><p className="text-xs text-emerald-800">Diện tích đa giác qua dãy điểm 1</p><b className="text-xl">{a.length>=3?area.toFixed(3):"Cần ≥ 3 điểm"}</b><p className="text-xs">Đơn vị diện tích theo bình phương đơn vị trục</p></div><div className="rounded-xl bg-amber-50 p-3"><p className="text-xs text-amber-800">Giao điểm hai đường thẳng đầu</p><b className="text-xl">{intersection?`(${intersection.x.toFixed(3)}; ${intersection.y.toFixed(3)})`:"Song song / thiếu điểm"}</b></div></div>
  <p className="mt-2 text-xs text-slate-500">Lưu ý: giao điểm được tính từ hai đường thẳng kéo dài qua hai điểm đầu của mỗi dãy; diện tích dùng công thức dây giày cho đa giác tạo bởi dãy điểm 1.</p>
 </section>;
}
