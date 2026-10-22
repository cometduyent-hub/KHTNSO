'use client';

import { useEffect, useRef, useState } from 'react';

declare global { interface Window { THREE?: any } }

const THREE_VERSION = '128';
const CDN = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
const ORBIT = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js';

export default function PencilCircumferenceSimulation() {
  const hostRef = useRef<HTMLDivElement>(null);
  const runtimeRef = useRef<any>(null);
  const stateRef = useRef({ turns: 10, ghd: 50, wound: true });
  const [turns, setTurns] = useState(10);
  const [ghd, setGhd] = useState(50);
  const [dcnn, setDcnn] = useState(1);
  const [wound, setWound] = useState(true);
  const [aligned, setAligned] = useState(false);
  const [reading, setReading] = useState('');
  const [message, setMessage] = useState('Quấn chỉ sát nhau quanh bút chì, sau đó tháo chỉ và đặt đầu chỉ tại vạch 0.');
  const [ready, setReady] = useState(false);

  stateRef.current = { turns, ghd, wound };
  const trueCircumferenceCm = 2 * Math.PI * 0.35; // illustrative simulated pencil radius: 0.35 cm
  const trueLength = trueCircumferenceCm * turns;
  const scale = dcnn / 10;
  const snappedLength = Math.round(trueLength / scale) * scale;
  const measuredCircumference = reading.trim() !== '' && Number.isFinite(Number(reading)) ? Number(reading) / turns : null;
  const measuredDiameter = measuredCircumference !== null ? measuredCircumference / Math.PI : null;

  useEffect(() => {
    let cancelled = false;
    const loadScript = (src: string) => new Promise<void>((resolve, reject) => {
      const existing = document.querySelector(`script[data-three-src="${src}"]`) as HTMLScriptElement | null;
      if (existing) {
        if (src.includes('OrbitControls') && (window as any).THREE?.OrbitControls) return resolve();
        if ((window as any).THREE && !src.includes('OrbitControls')) return resolve();
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error(`Không tải được ${src}`)), { once: true });
        return;
      }
      const script = document.createElement('script'); script.src = src; script.async = true; script.dataset.threeSrc = src;
      script.onload = () => resolve(); script.onerror = () => reject(new Error(`Không tải được thư viện 3D: ${src}`)); document.head.appendChild(script);
    });
    async function start() {
      try {
        if (!(window as any).THREE) await loadScript(CDN);
        if (!(window as any).THREE?.OrbitControls) await loadScript(ORBIT);
        if (cancelled || !hostRef.current) return;
        const THREE = (window as any).THREE;
        if (!THREE || !THREE.OrbitControls) throw new Error('Thư viện Three.js/OrbitControls chưa sẵn sàng. Hãy tải lại trang hoặc kiểm tra kết nối mạng.');
        const host = hostRef.current;
        const scene = new THREE.Scene(); scene.background = new THREE.Color(0xf0f7ff);
        const camera = new THREE.PerspectiveCamera(45, host.clientWidth / Math.max(host.clientHeight, 1), 0.1, 1000); camera.position.set(7, 5, 8);
        const renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.setSize(host.clientWidth, host.clientHeight); renderer.shadowMap.enabled = true; host.replaceChildren(renderer.domElement);
        const controls = new THREE.OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.target.set(0, 0.7, 0);
        scene.add(new THREE.HemisphereLight(0xffffff, 0x8aa0b8, 1.8));
        const light = new THREE.DirectionalLight(0xffffff, 2); light.position.set(5, 8, 5); light.castShadow = true; scene.add(light);
        const mat = (color: number, roughness = 0.7) => new THREE.MeshStandardMaterial({ color, roughness });
        const wood = mat(0xf0bd70), graphite = mat(0x30343b), paint = mat(0xffd84a), red = mat(0xd83b42), threadMat = new THREE.MeshStandardMaterial({ color: 0x1684d8, roughness: 0.6 });
        // Worktop and axis
        const table = new THREE.Mesh(new THREE.BoxGeometry(13, 0.18, 8), mat(0xe0e8f0)); table.position.y = -0.5; table.receiveShadow = true; scene.add(table);
        const grid = new THREE.GridHelper(12, 24, 0xa4b9cc, 0xd3e0ea); grid.position.y = -0.39; scene.add(grid);
        // Pencil lies along the X axis, with a sharpened conical tip.
        const pencilGroup = new THREE.Group();
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 5.2, 12), paint); shaft.rotation.z = Math.PI / 2; shaft.position.x = 0.05; shaft.castShadow = true; pencilGroup.add(shaft);
        const tip = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.9, 12), wood); tip.rotation.z = -Math.PI / 2; tip.position.x = -2.95; tip.castShadow = true; pencilGroup.add(tip);
        const lead = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.25, 10), graphite); lead.rotation.z = -Math.PI / 2; lead.position.x = -3.48; pencilGroup.add(lead);
        const eraser = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.35, 12), red); eraser.rotation.z = Math.PI / 2; eraser.position.x = 2.82; pencilGroup.add(eraser);
        const ferrule = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.22, 12), mat(0xbac4ce, 0.35)); ferrule.rotation.z = Math.PI / 2; ferrule.position.x = 2.55; pencilGroup.add(ferrule);
        scene.add(pencilGroup);
        // Ruler on the table, with centimeter marks and 0, 10, 20, 30 labels represented by tick heights.
        const ruler = new THREE.Mesh(new THREE.BoxGeometry(6, 0.08, 0.65), mat(0xfaf5d8)); ruler.position.set(0, -0.34, 1.65); scene.add(ruler);
        const ticks = new THREE.Group();
        for (let i = 0; i <= 60; i++) {
          const major = i % 10 === 0, mid = i % 5 === 0;
          const tick = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.018, major ? 0.28 : mid ? 0.18 : 0.1), mat(0x24384b));
          tick.position.set(-2.92 + i * (5.84 / 60), -0.285, 1.49); ticks.add(tick);
        }
        scene.add(ticks);
        // Thread: helix while wound, straight line beside the ruler when unwrapped.
        const threadGroup = new THREE.Group(); scene.add(threadGroup);
        function rebuildThread() {
          while (threadGroup.children.length) { const obj = threadGroup.children.pop(); if (obj.geometry) obj.geometry.dispose(); }
          const current = stateRef.current;
          if (current.wound) {
            const pts: any[] = []; const count = Math.max(100, current.turns * 80);
            for (let i = 0; i <= count; i++) { const t = i / count; const angle = t * current.turns * Math.PI * 2; pts.push(new THREE.Vector3(-2.45 + t * 4.8, 0.22 + Math.cos(angle) * 0.365, Math.sin(angle) * 0.365)); }
            const curve = new THREE.CatmullRomCurve3(pts); const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, count, 0.025, 5, false), threadMat); mesh.castShadow = true; threadGroup.add(mesh);
          } else {
            const lengthWorld = Math.min(current.ghd / 10, 5.8); const pts = [new THREE.Vector3(-2.9, -0.15, 0.9), new THREE.Vector3(-2.9 + lengthWorld, -0.15, 0.9)];
            const geo = new THREE.BufferGeometry().setFromPoints(pts); threadGroup.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x1684d8, linewidth: 3 })));
            const tipSphere = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), mat(0x1684d8)); tipSphere.position.copy(pts[1]); threadGroup.add(tipSphere);
          }
        }
        rebuildThread();
        const animate = () => { if (cancelled) return; controls.update(); renderer.render(scene, camera); runtimeRef.current.frame = requestAnimationFrame(animate); };
        runtimeRef.current = { renderer, controls, scene, camera, rebuildThread, frame: 0 };
        animate(); setReady(true);
        const resize = () => { if (!hostRef.current || !runtimeRef.current) return; const w = hostRef.current.clientWidth, h = Math.max(hostRef.current.clientHeight, 1); camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h); };
        window.addEventListener('resize', resize); runtimeRef.current.resize = resize;
      } catch (e: any) { if (!cancelled) setMessage(e?.message || 'Không khởi tạo được mô hình 3D.'); }
    }
    void start();
    return () => { cancelled = true; setReady(false); const r = runtimeRef.current; if (r) { cancelAnimationFrame(r.frame); window.removeEventListener('resize', r.resize); r.controls?.dispose(); r.renderer?.dispose(); r.renderer?.domElement?.remove(); runtimeRef.current = null; } };
  }, []);

  useEffect(() => { runtimeRef.current?.rebuildThread?.(); }, [turns, ghd, wound]);

  function unwrap() { setWound(false); setAligned(false); setReading(''); setMessage('Chỉ đã tháo ra. Đặt đầu chỉ trùng vạch 0 rồi đọc chiều dài trên thước.'); }
  function wind() { setWound(true); setAligned(false); setReading(''); setMessage('Chỉ được quấn quanh bút chì. Đếm đủ số vòng, sau đó tháo chỉ để đo.'); }
  function checkReading() {
    if (wound) { setMessage('Hãy bấm “Tháo chỉ” trước khi đọc chiều dài.'); return; }
    if (!aligned) { setMessage('Hãy xác nhận đã kéo/đặt đầu chỉ trùng vạch 0 trên thước.'); return; }
    if (reading.trim() === '' || !Number.isFinite(Number(reading)) || Number(reading) <= 0) { setMessage('Nhập chiều dài chỉ đọc được trên thước (cm).'); return; }
    const expected = snappedLength;
    const difference = Math.abs(Number(reading) - expected);
    setMessage(difference <= Math.max(scale, 0.1) ? `Đạt: số đo gần với giá trị mô phỏng ${expected.toFixed(2)} cm. Tính C = L/N.` : `Hãy kiểm tra lại vạch đọc. Giá trị mô phỏng gần đúng là ${expected.toFixed(2)} cm (có xét ĐCNN đã chọn).`);
  }

  return <main className="max-w-7xl mx-auto px-4 py-8 space-y-5">
    <header className="rounded-3xl bg-gradient-to-r from-sky-950 to-cyan-700 p-6 text-white"><a href="/practice" className="text-sm text-cyan-100 underline">← Trở về Phòng Thực hành & Đo lường</a><p className="mt-4 text-xs font-black tracking-[.2em] text-cyan-200">VIRTUAL LAB · THREE.JS R{THREE_VERSION}</p><h1 className="mt-2 text-3xl md:text-4xl font-black">Mô Phỏng Đo Chu Vi Bút Chì</h1><p className="mt-2 text-sky-100">Quan sát mô hình 3D, quấn/tháo chỉ, chọn giới hạn đo và độ chia nhỏ nhất, rồi tự đọc số đo để tính chu vi và đường kính.</p></header>
    <section className="grid xl:grid-cols-[1.5fr_1fr] gap-5">
      <div className="card"><div className="flex flex-wrap justify-between gap-2 items-center"><h2 className="text-xl font-black">Mô hình 3D thao tác</h2><span className={`rounded-full px-3 py-1 text-xs font-bold ${ready?'bg-emerald-100 text-emerald-800':'bg-amber-100 text-amber-900'}`}>{ready?'Đã tải mô hình':'Đang tải mô hình'}</span></div><div ref={hostRef} className="mt-3 h-[420px] w-full overflow-hidden rounded-2xl border bg-sky-50"/><p className="mt-2 text-xs text-slate-500">Kéo chuột để xoay camera; cuộn để phóng to/thu nhỏ. Mô hình hiển thị bút, chỉ và thước đo 3D.</p></div>
      <div className="card space-y-4"><h2 className="text-xl font-black">Bảng điều khiển</h2>
        <label className="block text-sm font-bold">Số vòng quấn N: <b>{turns}</b><input className="mt-2 w-full" type="range" min="5" max="30" step="1" value={turns} onChange={e=>setTurns(Number(e.target.value))}/><div className="flex justify-between text-xs text-slate-500"><span>5 vòng</span><span>30 vòng</span></div></label>
        <label className="block text-sm font-bold">Giới hạn đo (GHĐ)<select className="input mt-1" value={ghd} onChange={e=>setGhd(Number(e.target.value))}>{[30,50,80].map(v=><option key={v} value={v}>{v} cm</option>)}</select></label>
        <label className="block text-sm font-bold">Độ chia nhỏ nhất (ĐCNN)<select className="input mt-1" value={dcnn} onChange={e=>setDcnn(Number(e.target.value))}>{[1,2,5].map(v=><option key={v} value={v}>{v} mm</option>)}</select></label>
        <div className="grid grid-cols-2 gap-2"><button className="btn bg-sky-900 text-white" onClick={wind}>Quấn chỉ</button><button className="btn border" onClick={unwrap}>Tháo chỉ</button></div>
        {!wound && <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 space-y-3"><label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={aligned} onChange={e=>setAligned(e.target.checked)}/><span>Đã đặt đầu chỉ trùng vạch 0 trên thước.</span></label><label className="block text-sm font-bold">Chiều dài chỉ đọc được L (cm)<input className="input mt-1" type="number" min="0" step={dcnn/10} value={reading} onChange={e=>setReading(e.target.value)} placeholder="Tự đọc trên thước rồi nhập"/></label><button className="btn bg-emerald-700 text-white" onClick={checkReading}>Kiểm tra số đo</button></div>}
        <p className="text-sm text-slate-600">{message}</p>
      </div>
    </section>
    <section className="card"><h2 className="text-xl font-black">Xử lí số liệu</h2><p className="mt-1 text-sm text-slate-600">Không tự điền kết quả đo thay người học. Chỉ nhập chiều dài L sau khi tháo chỉ và đọc thước.</p><div className="grid md:grid-cols-3 gap-3 mt-4"><div className="rounded-xl bg-slate-50 p-4"><div className="text-sm text-slate-500">Số vòng quấn</div><div className="text-2xl font-black">N = {turns}</div></div><div className="rounded-xl bg-slate-50 p-4"><div className="text-sm text-slate-500">GHĐ / ĐCNN</div><div className="text-2xl font-black">{ghd} cm / {dcnn} mm</div></div><div className="rounded-xl bg-slate-50 p-4"><div className="text-sm text-slate-500">Đọc chiều dài L</div><div className="text-2xl font-black">{reading.trim() && Number.isFinite(Number(reading)) ? `${Number(reading).toFixed(2)} cm` : 'Chưa nhập'}</div></div></div>{measuredCircumference !== null && <div className="grid md:grid-cols-2 gap-3 mt-3"><div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"><div className="text-sm text-emerald-800">Chu vi trung bình C = L/N</div><div className="text-2xl font-black">{measuredCircumference.toFixed(4)} cm</div></div><div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"><div className="text-sm text-emerald-800">Đường kính d = C/π</div><div className="text-2xl font-black">{measuredDiameter!.toFixed(4)} cm</div></div></div>}<div className="mt-4 flex flex-wrap gap-2"><button className="btn border" onClick={()=>{setReading('');setAligned(false);setMessage('Đã xóa số đo. Hãy thực hiện lại thao tác đo.')}}>Làm lại phép đo</button><button className="btn border" onClick={()=>window.print()}>In phiếu thực hành</button></div></section>
  </main>;
}
