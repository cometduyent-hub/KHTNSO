"use client";

import { useEffect, useRef, useState } from "react";

type Student = { id: string; name: string; code?: string };
type Snapshot = {
  mode?: string; picked?: Student[]; currentTask?: string; roster?: Student[];
  wheelRotation?: number; spinning?: boolean; boxMap?: (Student | null)[]; openedBoxes?: number[];
  doorMap?: ({ student: Student; task: string } | null)[]; openedDoors?: number[]; teams?: Student[][];
  notice?: string; updatedAt?: number;
};
const STORAGE_KEY = "khtn-classroom-projector-v1";
const CHANNEL = "khtn-classroom-projector-v1";

export default function ProjectorScreen() {
  const [data, setData] = useState<Snapshot>({});
  const [music, setMusic] = useState(false);
  const [soundReady, setSoundReady] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) setData(JSON.parse(raw)); } catch { /* Ignore unavailable storage. */ }
    let channel: BroadcastChannel | null = null;
    try { channel = new BroadcastChannel(CHANNEL); channel.onmessage = e => setData(e.data || {}); } catch { /* Storage event fallback. */ }
    const onStorage = (event: StorageEvent) => { if (event.key === STORAGE_KEY && event.newValue) { try { setData(JSON.parse(event.newValue)); } catch { /* Ignore malformed snapshots. */ } } };
    window.addEventListener("storage", onStorage);
    return () => { channel?.close(); window.removeEventListener("storage", onStorage); if (timerRef.current) window.clearInterval(timerRef.current); void audioRef.current?.close(); };
  }, []);

  async function toggleMusic() {
    if (music) { if (timerRef.current) window.clearInterval(timerRef.current); timerRef.current = null; await audioRef.current?.close(); audioRef.current = null; setMusic(false); return; }
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      const ctx: AudioContext = new Ctx(); await ctx.resume(); audioRef.current = ctx;
      const notes = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 698.46]; let index = 0;
      const play = () => { if (!audioRef.current) return; const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.type = "triangle"; osc.frequency.value = notes[index++ % notes.length]; gain.gain.setValueAtTime(0.0001, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.045, ctx.currentTime + 0.035); gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.28); osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.3); };
      play(); timerRef.current = window.setInterval(play, 360); setMusic(true); setSoundReady(true);
    } catch { setSoundReady(false); }
  }

  const mode = data.mode || "wheel";
  const names = data.picked || [];
  const current = names[names.length - 1];
  const modeTitle: Record<string, string> = { wheel: "VÒNG QUAY MAY MẮN", gift: "HỘP QUÀ BÍ ẨN", draw: "BỐC THĂM MAY MẮN", teams: "GHÉP ĐỘI TỐC ĐỘ", doors: "Ô CỬA BÍ MẬT", race: "ĐƯỜNG ĐUA THẦN TỐC", capsule: "VIÊN NANG VŨ TRỤ" };
  const icon: Record<string, string> = { wheel: "🎡", gift: "🎁", draw: "🎟️", teams: "🏁", doors: "🚪", race: "🏎️", capsule: "🪐" };

  return <main className="projector-root relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-5 py-6 text-white">
    <div className="projector-stars" aria-hidden="true"/><div className="projector-glow projector-glow-a"/><div className="projector-glow projector-glow-b"/>
    <header className="relative z-10 flex w-full max-w-7xl items-center justify-between gap-4">
      <div><p className="text-xs font-black tracking-[.35em] text-cyan-200">KHTN SỐ · CLASSROOM GAME</p><h1 className="mt-2 text-2xl font-black tracking-wide sm:text-4xl">{icon[mode] || "🎲"} {modeTitle[mode] || "TRÒ CHƠI GỌI TÊN"}</h1></div>
      <button onClick={() => void toggleMusic()} className="rounded-full border border-white/25 bg-white/10 px-4 py-3 text-sm font-black shadow-xl backdrop-blur">{music ? "🔊 Tắt nhạc nền" : "🎵 Bật nhạc nền"}</button>
    </header>
    <section className="relative z-10 my-auto flex w-full max-w-7xl flex-col items-center py-8 text-center">
      {mode === "wheel" && <div className={`projector-wheel ${data.spinning ? "projector-wheel-spin" : ""}`}><div className="projector-wheel-inner">{(data.roster || []).slice(0, 12).map((s, i) => <span key={s.id || i} style={{ transform: `rotate(${i * 30}deg) translateY(-8.2rem)` }}>{s.name.split(" ").slice(-2).join(" ")}</span>)}<b>🎯</b></div></div>}
      {mode === "gift" && <div className="projector-cubes"><span>🎁</span><span>🎁</span><span>🎁</span><span>🎁</span><span>🎁</span></div>}
      {mode === "doors" && <div className="projector-doors">{Array.from({ length: 12 }, (_, i) => <div key={i} className={(data.openedDoors || []).includes(i) ? "opened" : ""}>{(data.openedDoors || []).includes(i) ? "✨" : "🚪"}<small>Ô {i + 1}</small></div>)}</div>}
      {mode === "race" && <div className="projector-race"><div className="race-track"><span>🏎️</span><span>🚙</span><span>🚕</span></div><div className="text-xl font-black tracking-[.25em] text-cyan-100">3 · 2 · 1 · XUẤT PHÁT!</div></div>}
      {mode === "capsule" && <div className="projector-capsule">🪐<span>🚀</span></div>}
      {mode === "draw" && <div className="projector-ticket">🎟️</div>}
      {mode === "teams" && <div className="flex flex-wrap justify-center gap-4">{(data.teams || []).map((team, i) => <div key={i} className="rounded-3xl border border-white/20 bg-white/10 p-5 text-left backdrop-blur"><b className="text-xl">ĐỘI {i + 1}</b>{team.map(s => <p key={s.id} className="mt-2">{s.name}</p>)}</div>)}</div>}
      <div className="projector-result mt-8 w-full max-w-5xl rounded-[2rem] border border-white/30 bg-white/10 px-6 py-8 shadow-2xl backdrop-blur-xl sm:px-12 sm:py-12">
        <p className="text-sm font-black tracking-[.4em] text-amber-200">{current ? "🎉 CHÚNG TA CÓ MỘT CÁI TÊN! 🎉" : "SẴN SÀNG CHƯA?"}</p>
        <div key={`${current?.id || current?.name || "waiting"}-${data.updatedAt || 0}`} className="projector-name mt-4">{current?.name || "HỌC SINH MAY MẮN"}</div>
        {current?.code && <p className="mt-2 text-lg font-bold text-cyan-100">Mã học sinh: {current.code}</p>}
        {data.currentTask && <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-amber-200/50 bg-amber-300/15 px-5 py-4"><p className="text-xs font-black tracking-[.3em] text-amber-200">NHIỆM VỤ THỬ THÁCH</p><p className="mt-2 text-xl font-black sm:text-2xl">{data.currentTask}</p></div>}
      </div>
      <p className="mt-6 text-sm font-semibold text-indigo-100">{data.notice || "Giáo viên đang chuẩn bị trò chơi…"}</p>
    </section>
    <footer className="relative z-10 flex w-full max-w-7xl items-center justify-between text-xs font-bold text-indigo-200"><span>HỌC VUI · KHÁM PHÁ · CHINH PHỤC KHTN</span><span>{soundReady ? "Âm thanh đã sẵn sàng" : "Nhấn Bật nhạc để phát âm thanh"}</span></footer>
    <style jsx global>{`
      .projector-root{background:radial-gradient(circle at 50% 45%,#312e81 0%,#17164c 42%,#070b24 100%);font-family:Arial,sans-serif}
      .projector-stars{position:absolute;inset:0;opacity:.28;background-image:radial-gradient(#fff 1px,transparent 1px);background-size:42px 42px;animation:starDrift 24s linear infinite}
      .projector-glow{position:absolute;width:34vw;height:34vw;border-radius:50%;filter:blur(80px);opacity:.25;pointer-events:none}.projector-glow-a{background:#06b6d4;top:5%;left:-10%}.projector-glow-b{background:#c026d3;right:-8%;bottom:0}
      .projector-wheel{width:min(54vw,390px);height:min(54vw,390px);border-radius:50%;background:conic-gradient(#f59e0b 0 45deg,#ec4899 45deg 90deg,#06b6d4 90deg 135deg,#8b5cf6 135deg 180deg,#22c55e 180deg 225deg,#f97316 225deg 270deg,#3b82f6 270deg 315deg,#eab308 315deg);border:12px solid #fef3c7;box-shadow:0 0 55px #fbbf24aa,inset 0 0 0 8px #ffffff55;position:relative;transform-style:preserve-3d}.projector-wheel:after{content:"▼";position:absolute;top:-30px;left:calc(50% - 17px);font-size:34px;color:#fff}.projector-wheel-inner{position:absolute;inset:0;border-radius:50%;display:grid;place-items:center}.projector-wheel-inner span{position:absolute;top:50%;left:50%;font-size:11px;font-weight:900;transform-origin:0 0;text-shadow:0 2px 3px #000}.projector-wheel-inner b{font-size:52px;background:#fff;border-radius:50%;padding:16px;box-shadow:0 5px 20px #0006}.projector-wheel-spin{animation:wheelSpin 4.2s cubic-bezier(.12,.78,.12,1)}
      .projector-cubes{display:flex;gap:clamp(10px,3vw,35px);perspective:900px}.projector-cubes span{font-size:clamp(55px,8vw,110px);padding:20px;border-radius:25px;background:linear-gradient(145deg,#fcd34d,#ea580c);box-shadow:0 18px 0 #9a3412,0 25px 45px #0008;transform:rotateY(-18deg) rotateX(10deg);animation:cubeFloat 2.3s ease-in-out infinite alternate}.projector-cubes span:nth-child(even){animation-delay:.4s;transform:rotateY(18deg) rotateX(-8deg)}
      .projector-doors{display:grid;grid-template-columns:repeat(6,minmax(45px,90px));gap:12px;perspective:700px}.projector-doors div{padding:13px 5px;border-radius:14px;background:linear-gradient(145deg,#818cf8,#312e81);box-shadow:0 8px 0 #1e1b4b,0 12px 22px #0006;font-size:30px;transform:rotateY(-8deg);animation:doorPulse 2s ease-in-out infinite}.projector-doors .opened{background:linear-gradient(145deg,#a7f3d0,#059669);transform:rotateY(18deg)}.projector-doors small{display:block;font-size:11px;font-weight:900}
      .projector-race{width:min(85vw,900px)}.race-track{border:8px solid #fff;border-radius:30px;padding:18px 35px;background:repeating-linear-gradient(0deg,#334155 0 34px,#475569 34px 68px);display:flex;flex-direction:column;gap:6px;overflow:hidden}.race-track span{font-size:clamp(34px,5vw,60px);text-align:left;animation:raceMove 3s ease-in-out infinite alternate}.race-track span:nth-child(2){animation-delay:.25s}.race-track span:nth-child(3){animation-delay:.5s}
      .projector-capsule{font-size:clamp(90px,14vw,170px);position:relative;filter:drop-shadow(0 20px 25px #38bdf888);animation:float 2.8s ease-in-out infinite}.projector-capsule span{position:absolute;font-size:.45em;right:-.3em;top:-.1em;animation:orbit 5s linear infinite}.projector-ticket{font-size:clamp(100px,15vw,180px);filter:drop-shadow(0 20px 25px #fbbf2488);animation:float 2s ease-in-out infinite}
      .projector-result{animation:resultGlow 2.2s ease-in-out infinite alternate}.projector-name{font-size:clamp(42px,7vw,92px);font-weight:1000;line-height:1.08;letter-spacing:.015em;color:#fff;text-shadow:0 5px 0 #4338ca,0 12px 35px #0009;animation:namePop .65s cubic-bezier(.2,1.5,.5,1) both;overflow-wrap:anywhere}
      @keyframes starDrift{to{background-position:42px 84px}}@keyframes wheelSpin{to{transform:rotate(1440deg)}}@keyframes cubeFloat{to{transform:translateY(-16px) rotateY(18deg) rotateX(-8deg)}}@keyframes doorPulse{50%{filter:brightness(1.3);transform:translateY(-5px) rotateY(8deg)}}@keyframes raceMove{to{transform:translateX(45%)}}@keyframes float{50%{transform:translateY(-20px) rotate(5deg)}}@keyframes orbit{to{transform:rotate(360deg) translateX(24px) rotate(-360deg)}}@keyframes namePop{from{opacity:0;transform:scale(.5) rotateX(45deg)}to{opacity:1;transform:scale(1) rotateX(0)}}@keyframes resultGlow{to{box-shadow:0 0 55px #a78bfa66}}@media(max-width:650px){.projector-doors{grid-template-columns:repeat(4,minmax(45px,1fr))}}
    `}</style>
  </main>;
}
