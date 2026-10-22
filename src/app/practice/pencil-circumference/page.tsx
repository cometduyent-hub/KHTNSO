'use client';
import { useMemo, useState } from 'react';

/** Additive, dependency-free interactive teaching simulation. Keeps the existing practice room and report flow intact. */
export default function PencilCircumferenceSimulation() {
  const [turns, setTurns] = useState(10);
  const [ghd, setGhd] = useState(30);
  const [dcnn, setDcnn] = useState(1);
  const [radius, setRadius] = useState(0.35);
  const [showUnwrapped, setShowUnwrapped] = useState(false);
  const [zeroAligned, setZeroAligned] = useState(false);
  const [studentReading, setStudentReading] = useState('');
  const [checked, setChecked] = useState(false);
  const circumference = 2 * Math.PI * radius;
  const actualLength = circumference * turns;
  const rulerMarks = useMemo(() => Array.from({ length: ghd * 10 + 1 }, (_, i) => i), [ghd]);
  const readValue = studentReading.trim() === '' ? null : Number(studentReading);
  const expectedCm = actualLength;
  const accepted = readValue !== null && Number.isFinite(readValue) && Math.abs(readValue - expectedCm) <= Math.max(dcnn / 10, 0.15);

  return <main className="max-w-6xl mx-auto px-5 py-8">
    <div className="rounded-3xl p-7 bg-gradient-to-r from-sky-950 to-cyan-700 text-white">
      <a href="/practice" className="text-sm underline text-cyan-100">← Trở về Phòng Thực hành & Đo lường</a>
      <p className="text-cyan-200 font-black tracking-widest text-xs mt-5">MÔ PHỎNG ĐO LƯỜNG · KHTN</p>
      <h1 className="text-3xl md:text-4xl font-black mt-2">Đo chu vi bút chì bằng sợi chỉ</h1>
      <p className="mt-2 text-sky-100">Điều chỉnh số vòng quấn, mở sợi chỉ và đọc chiều dài trên thước. Đây là mô hình học tập tương tác độc lập, không thay thế các chức năng báo cáo hiện có.</p>
    </div>

    <div className="grid lg:grid-cols-[1.35fr_1fr] gap-5 mt-6">
      <section className="card">
        <h2 className="text-xl font-black">Bàn thao tác</h2>
        <p className="text-sm text-slate-500 mt-1">Sơ đồ minh họa tỉ lệ theo dữ liệu mô phỏng; có thể chuyển giữa trạng thái quấn và tháo chỉ.</p>
        <div className="mt-4 rounded-2xl bg-slate-50 border p-4 md:p-6">
          <svg viewBox="0 0 720 300" role="img" aria-label="Bút chì và sợi chỉ trong mô phỏng đo chu vi" className="w-full h-auto">
            <defs><linearGradient id="pencilBody" x1="0" x2="1"><stop offset="0" stopColor="#eab308"/><stop offset=".5" stopColor="#fde68a"/><stop offset="1" stopColor="#ca8a04"/></linearGradient></defs>
            <rect x="42" y="28" width="636" height="244" rx="18" fill="#e0f2fe" />
            {!showUnwrapped ? <g>
              <rect x="115" y="116" width="490" height="36" rx="8" fill="url(#pencilBody)" stroke="#a16207" strokeWidth="2" />
              <polygon points="605,116 642,134 605,152" fill="#d6b58a" stroke="#92400e" strokeWidth="1.5" />
              <polygon points="633,130 642,134 633,138" fill="#334155" />
              <rect x="115" y="116" width="45" height="36" rx="7" fill="#fca5a5" stroke="#be123c" />
              {Array.from({length:turns},(_,i)=><ellipse key={i} cx={175+i*(390/Math.max(1,turns-1))} cy="134" rx="5" ry="19" fill="none" stroke="#dc2626" strokeWidth="2.5" />)}
              <text x="360" y="86" textAnchor="middle" fontSize="18" fontWeight="700" fill="#0f172a">{turns} vòng quấn quanh bút chì</text>
              <text x="360" y="198" textAnchor="middle" fontSize="14" fill="#334155">Chu vi ước tính: {circumference.toFixed(2)} cm/vòng</text>
            </g> : <g>
              <path d={`M 100 135 L ${100 + Math.min(600,actualLength*10)} 135`} stroke="#dc2626" strokeWidth="7" strokeLinecap="round" />
              <circle cx="100" cy="135" r="7" fill={zeroAligned ? '#16a34a' : '#dc2626'} />
              <text x="100" y="110" textAnchor="middle" fontSize="14" fontWeight="700" fill={zeroAligned?'#15803d':'#b91c1c'}>{zeroAligned?'Vạch 0 đã căn':'Đầu chỉ'}</text>
              <text x="360" y="190" textAnchor="middle" fontSize="15" fontWeight="700" fill="#0f172a">Sợi chỉ sau khi tháo: {actualLength.toFixed(2)} cm</text>
            </g>}
            <g transform="translate(70 226)">
              <rect x="0" y="0" width="580" height="28" rx="4" fill="#fff7ed" stroke="#c2410c" />
              {rulerMarks.filter(i=>i%(dcnn===5?50:dcnn===2?20:10)===0).map(i=>{const x=i/(ghd*10)*580;return <g key={i}><line x1={x} y1="0" x2={x} y2={i%(dcnn===5?100:dcnn===2?50:20)===0?18:10} stroke="#9a3412" strokeWidth="1"/><text x={x} y="26" fontSize="9" textAnchor="middle" fill="#7c2d12">{(i/10).toFixed(i%10===0?0:1)}</text></g>})}
            </g>
          </svg>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          <button className={`btn ${showUnwrapped?'border':'bg-sky-900 text-white'}`} onClick={()=>{setShowUnwrapped(false);setChecked(false);}}>1. Quấn chỉ quanh bút chì</button>
          <button className={`btn ${showUnwrapped?'bg-sky-900 text-white':'border'}`} onClick={()=>{setShowUnwrapped(true);setChecked(false);}}>2. Tháo chỉ và đo</button>
        </div>
        {showUnwrapped && <button className="btn border mt-3 w-full" onClick={()=>setZeroAligned(v=>!v)}>{zeroAligned?'Đã căn vạch 0 ✓':'Căn đầu chỉ trùng vạch 0'}</button>}
      </section>

      <section className="card">
        <h2 className="text-xl font-black">Thông số và nhiệm vụ</h2>
        <label className="block mt-4 text-sm font-bold">Số vòng quấn: {turns}
          <input className="w-full mt-2" type="range" min="5" max="30" value={turns} onChange={e=>{setTurns(Number(e.target.value));setChecked(false);}} />
        </label>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <label className="text-sm font-bold">GHĐ thước
            <select className="input" value={ghd} onChange={e=>setGhd(Number(e.target.value))}><option value={30}>30 cm</option><option value={50}>50 cm</option><option value={80}>80 cm</option></select>
          </label>
          <label className="text-sm font-bold">ĐCNN
            <select className="input" value={dcnn} onChange={e=>setDcnn(Number(e.target.value))}><option value={1}>1 mm</option><option value={2}>2 mm</option><option value={5}>5 mm</option></select>
          </label>
        </div>
        <label className="block mt-4 text-sm font-bold">Bán kính bút chì (dữ liệu mô phỏng): {radius.toFixed(2)} cm
          <input className="w-full mt-2" type="range" min="0.2" max="0.5" step="0.01" value={radius} onChange={e=>{setRadius(Number(e.target.value));setChecked(false);}} />
        </label>
        <div className="rounded-xl bg-sky-50 p-4 mt-5 space-y-2 text-sm">
          <div className="flex justify-between gap-3"><span>Chu vi mô phỏng mỗi vòng</span><b>{circumference.toFixed(3)} cm</b></div>
          <div className="flex justify-between gap-3"><span>Chiều dài chỉ lý tưởng</span><b>{actualLength.toFixed(2)} cm</b></div>
          <div className="flex justify-between gap-3"><span>Độ chia nhỏ nhất</span><b>{dcnn} mm</b></div>
          <p className="text-xs text-slate-600 pt-1">Công thức: C = L/N; nếu biết bán kính mô phỏng thì C = 2πr. Đọc thước cần xét độ chia nhỏ nhất và sai số.</p>
        </div>
        <label className="block mt-5 text-sm font-bold">Nhập chiều dài sợi chỉ em đọc được (cm)
          <input className="input" type="number" min="0" step="0.1" value={studentReading} onChange={e=>{setStudentReading(e.target.value);setChecked(false);}} placeholder="Ví dụ: 21,5" />
        </label>
        <button className="btn bg-sky-900 text-white mt-3 w-full" onClick={()=>setChecked(true)}>Kiểm tra kết quả</button>
        {checked && <div className={`rounded-xl p-3 mt-3 text-sm ${accepted?'bg-emerald-50 text-emerald-900':'bg-amber-50 text-amber-900'}`}>
          {readValue===null || !Number.isFinite(readValue) ? 'Em hãy nhập một số đo hợp lệ.' : accepted ? 'Tốt lắm! Số đo nằm trong khoảng chấp nhận của mô hình.' : `Hãy kiểm tra lại thao tác căn vạch 0, số vòng và cách đọc thước. Giá trị lý tưởng của mô hình là khoảng ${expectedCm.toFixed(2)} cm.`}
        </div>}
        <div className="rounded-xl border p-3 mt-4 text-sm"><b>Câu hỏi suy nghĩ</b><ol className="list-decimal pl-5 mt-2 space-y-1"><li>Vì sao quấn nhiều vòng giúp giảm ảnh hưởng của sai số khi đọc thước?</li><li>Nếu sợi chỉ bị chùng hoặc các vòng chồng lên nhau, kết quả thay đổi thế nào?</li><li>Từ chiều dài chỉ L và số vòng N, hãy tính chu vi C của bút chì.</li></ol></div>
      </section>
    </div>
  </main>;
}
