"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Student = { id: string; name: string; code?: string };
type Presentation = { id: number; kind: "race" | "capsule"; phase: "running" | "complete"; participants: Student[]; winner: Student; task: string };
type Snapshot = {
  mode?: string; picked?: Student[]; currentTask?: string; roster?: Student[];
  wheelRotation?: number; spinning?: boolean; boxMap?: (Student | null)[]; openedBoxes?: number[];
  doorMap?: ({ student: Student; task: string } | null)[]; openedDoors?: number[]; teams?: Student[][];
  presentation?: Presentation | null; notice?: string; updatedAt?: number;
};
const STORAGE_KEY = "khtn-classroom-projector-v1";
const CHANNEL = "khtn-classroom-projector-v1";
const PLANETS = ["🪐", "🌍", "🌕", "🔴", "🟣", "🌎", "🌑", "🟠", "🌏", "💫", "🛰️", "🌟"];
const WHEEL_COLORS = ["#7c3aed", "#db2777", "#ea580c", "#0891b2", "#16a34a", "#2563eb", "#ca8a04", "#9333ea", "#e11d48", "#0f766e", "#4f46e5", "#c2410c"];

export default function ProjectorScreen() {
  const [data, setData] = useState<Snapshot>({});
  const [music, setMusic] = useState(false);
  const [soundReady, setSoundReady] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    const apply = (next: Snapshot) => {
      if (!next || typeof next !== "object") return;
      const stamp = Number(next.updatedAt || 0);
      if (stamp >= lastUpdateRef.current) { lastUpdateRef.current = stamp; setData(next); }
    };
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) apply(JSON.parse(raw)); } catch { /* Ignore unavailable storage. */ }
    let channel: BroadcastChannel | null = null;
    try { channel = new BroadcastChannel(CHANNEL); channel.onmessage = e => apply(e.data || {}); } catch { /* Storage event fallback. */ }
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue) { try { apply(JSON.parse(event.newValue)); } catch { /* Ignore malformed snapshots. */ } }
    };
    window.addEventListener("storage", onStorage);
    return () => { channel?.close(); window.removeEventListener("storage", onStorage); if (timerRef.current) window.clearInterval(timerRef.current); void audioRef.current?.close(); };
  }, []);

  async function toggleMusic() {
    if (music) { if (timerRef.current) window.clearInterval(timerRef.current); timerRef.current = null; await audioRef.current?.close(); audioRef.current = null; setMusic(false); return; }
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      const ctx: AudioContext = new Ctx(); await ctx.resume(); audioRef.current = ctx;
      const notes = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 1046.5, 880, 783.99]; let index = 0;
      const play = () => {
        if (!audioRef.current) return;
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = "triangle"; osc.frequency.value = notes[index++ % notes.length];
        gain.gain.setValueAtTime(0.0001, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.035, ctx.currentTime + 0.04); gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.27);
        osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.3);
      };
      play(); timerRef.current = window.setInterval(play, 340); setMusic(true); setSoundReady(true);
    } catch { setSoundReady(false); }
  }

  const mode = data.mode || "wheel";
  const roster = data.roster || [];
  const current = data.picked?.[data.picked.length - 1];
  const presentation = data.presentation;
  const modeTitle: Record<string, string> = { wheel: "VÒNG QUAY MAY MẮN", gift: "HỘP QUÀ BÍ ẨN", draw: "BỐC THĂM MAY MẮN", teams: "GHÉP ĐỘI TỐC ĐỘ", doors: "Ô CỬA BÍ MẬT", race: "ĐƯỜNG ĐUA THẦN TỐC", capsule: "KHÔNG GIAN BÍ ẨN" };
  const icon: Record<string, string> = { wheel: "🎡", gift: "🎁", draw: "🎟️", teams: "🏁", doors: "🚪", race: "🏎️", capsule: "🪐" };
  const wheelGradient = useMemo(() => {
    if (!roster.length) return "conic-gradient(#7c3aed 0deg 45deg,#db2777 45deg 90deg,#ea580c 90deg 135deg,#0891b2 135deg 180deg,#16a34a 180deg 225deg,#2563eb 225deg 270deg,#ca8a04 270deg 315deg,#9333ea 315deg)";
    const step = 360 / roster.length;
    return `conic-gradient(${roster.map((_, i) => `${WHEEL_COLORS[i % WHEEL_COLORS.length]} ${i * step}deg ${(i + 1) * step - 0.8}deg, #ffffff ${(i + 1) * step - 0.8}deg ${(i + 1) * step}deg`).join(",")})`;
  }, [roster]);
  const wheelLabels = useMemo(() => roster.map((student, i) => {
    const angle = ((i + 0.5) / Math.max(1, roster.length)) * Math.PI * 2 - Math.PI / 2;
    return { student, left: 50 + Math.cos(angle) * 37, top: 50 + Math.sin(angle) * 37, angle: (angle * 180) / Math.PI + 90 };
  }), [roster]);
  const openedBoxes = data.openedBoxes || [];
  const openedDoors = data.openedDoors || [];

  return <main className="projector-root relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-4 py-5 text-white sm:px-7">
    <div className="projector-stars" aria-hidden="true"/><div className="projector-nebula nebula-a"/><div className="projector-nebula nebula-b"/>
    <header className="relative z-20 flex w-full max-w-7xl items-center justify-between gap-3">
      <div><p className="text-[10px] font-black tracking-[.35em] text-cyan-200 sm:text-xs">KHTN SỐ · KHỞI ĐỘNG LỚP HỌC</p><h1 className="mt-1 text-xl font-black tracking-wide sm:text-4xl">{icon[mode] || "🎲"} {modeTitle[mode] || "TRÒ CHƠI GỌI TÊN"}</h1></div>
      <button onClick={() => void toggleMusic()} className="shrink-0 rounded-full border border-white/25 bg-white/10 px-3 py-2 text-xs font-black shadow-xl backdrop-blur sm:px-5 sm:py-3 sm:text-sm">{music ? "🔊 Tắt nhạc" : "🎵 Bật nhạc"}</button>
    </header>

    <section className="relative z-10 my-auto flex w-full max-w-7xl flex-col items-center py-5 text-center sm:py-8">
      {mode === "wheel" && <div className="wheel-stage"><div className="wheel-pointer">▼</div><div className={`wheel-disk ${data.spinning ? "is-spinning" : ""}`} style={{ transform: `rotate(${data.wheelRotation || 0}deg)`, background: wheelGradient }}><div className="wheel-sectors"/>{wheelLabels.map((item, i) => <span key={item.student.id || i} className="wheel-student" style={{ left: `${item.left}%`, top: `${item.top}%`, width: `${Math.max(6, Math.min(24, 220 / Math.max(1, roster.length)))}%`, fontSize: `${Math.max(6, Math.min(14, 140 / Math.max(1, roster.length)))}px`, transform: `translate(-50%,-50%) rotate(${-item.angle}deg)` }}>{item.student.name}</span>)}<b className="wheel-hub">🎯</b></div></div>}

      {mode === "gift" && <div className="gift-grid">{Array.from({ length: 8 }, (_, i) => { const student = data.boxMap?.[i]; const opened = openedBoxes.includes(i); return <div key={i} className={`gift-box ${opened ? "opened" : ""}`}><span>{opened ? "✨" : "🎁"}</span><small>HỘP {i + 1}</small>{opened && <b>{student?.name || ""}</b>}</div>; })}</div>}
      {mode === "doors" && <div className="door-grid">{Array.from({ length: 12 }, (_, i) => { const item = data.doorMap?.[i]; const opened = openedDoors.includes(i); return <div key={i} className={`door-card ${opened ? "opened" : ""}`}><span>{opened ? "🔓" : "🚪"}</span><small>Ô CỬA {i + 1}</small>{opened && <b>{item?.student.name}</b>}</div>; })}</div>}
      {mode === "draw" && <div className="draw-stage"><div className="ticket-cloud">{roster.slice(0, 18).map((s, i) => <span key={s.id || i} style={{ animationDelay: `${(i % 9) * -0.17}s` }}>🎟️<small>{s.name}</small></span>)}</div><div className="draw-badge">🎫</div></div>}
      {mode === "teams" && <div className="team-stage">{(data.teams || []).map((team, i) => <div key={i} className="team-card"><b>ĐỘI {i + 1}</b>{team.map(s => <span key={s.id}>{s.name}</span>)}</div>)}</div>}

      {mode === "race" && <div className={`race-stage ${presentation?.kind === "race" && presentation.phase === "running" ? "race-running" : ""} ${presentation?.kind === "race" && presentation.phase === "complete" ? "race-complete" : ""}`}>
        <div className="race-sky"><span>☁️</span><span>☁️</span><span>☀️</span></div><div className="race-finish">🏁<small>ĐÍCH</small></div>
        {(presentation?.kind === "race" ? presentation.participants : roster.slice(0, 5)).map((student, i) => <div key={`${presentation?.id || "idle"}-${student.id}`} className={`race-lane ${presentation?.kind === "race" && presentation.phase === "complete" && presentation.winner.id === student.id ? "winner" : ""}`} style={{ top: `${20 + i * 15}%`, animationDelay: `${i * 0.13}s`, animationDuration: `${3.1 + (i % 5) * 0.2}s` }}><span className="race-car">{["🏎️", "🚙", "🏎️", "🚕", "🚗"][i % 5]}</span><b className="race-driver">{student.name}</b></div>)}
        {!presentation && <div className="race-idle">🏎️ SẴN SÀNG XUẤT PHÁT?</div>}
      </div>}

      {mode === "capsule" && <div className={`space-stage ${presentation?.kind === "capsule" && presentation.phase === "running" ? "space-chaos" : ""} ${presentation?.kind === "capsule" && presentation.phase === "complete" ? "space-stop" : ""}`}>
        <div className="space-planet-core">🌌</div>
        {(presentation?.kind === "capsule" ? presentation.participants : roster.slice(0, 12)).map((student, i) => {
          const isWinner = presentation?.kind === "capsule" && presentation.phase === "complete" && presentation.winner.id === student.id;
          const left = 8 + ((i * 37 + 11) % 82); const top = 10 + ((i * 29 + 17) % 78);
          return <div key={`${presentation?.id || "idle"}-${student.id}`} className={`space-planet ${isWinner ? "planet-winner" : ""}`} style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${(i % 7) * -0.43}s`, animationDuration: `${2.1 + (i % 5) * 0.7}s` }}><span>{PLANETS[i % PLANETS.length]}</span><b>{student.name}</b></div>;
        })}
        {!roster.length && <div className="space-idle">🪐 CHỜ DANH SÁCH HỌC SINH</div>}
      </div>}

      <div className="projector-result mt-5 w-full max-w-5xl rounded-[1.6rem] border border-white/30 bg-white/10 px-5 py-6 shadow-2xl backdrop-blur-xl sm:mt-7 sm:rounded-[2rem] sm:px-12 sm:py-10">
        <p className="text-xs font-black tracking-[.25em] text-amber-200 sm:text-sm sm:tracking-[.4em]">{current ? "🎉 CHÚNG TA CÓ MỘT CÁI TÊN! 🎉" : presentation?.phase === "running" ? "✨ ĐANG TÌM KIẾM NHÂN VẬT MAY MẮN ✨" : "SẴN SÀNG CHƯA?"}</p>
        <div key={`${current?.id || current?.name || "waiting"}-${data.updatedAt || 0}`} className="projector-name mt-3">{current?.name || (presentation?.phase === "running" ? "AI SẼ ĐƯỢC GỌI TÊN?" : "HỌC SINH MAY MẮN")}</div>
        {current?.code && <p className="mt-2 text-base font-bold text-cyan-100 sm:text-lg">Mã học sinh: {current.code}</p>}
        {(data.currentTask || (presentation?.phase === "complete" ? presentation.task : "")) && <div className="mx-auto mt-4 max-w-3xl rounded-2xl border border-amber-200/50 bg-amber-300/15 px-4 py-3"><p className="text-[10px] font-black tracking-[.3em] text-amber-200 sm:text-xs">NHIỆM VỤ THỬ THÁCH</p><p className="mt-1 text-lg font-black sm:text-2xl">{data.currentTask || presentation?.task}</p></div>}
      </div>
      <p className="mt-4 max-w-5xl text-xs font-semibold text-indigo-100 sm:text-sm">{data.notice || "Giáo viên đang chuẩn bị trò chơi…"}</p>
    </section>
    <footer className="relative z-20 flex w-full max-w-7xl items-center justify-between gap-3 text-[9px] font-bold text-indigo-200 sm:text-xs"><span>HỌC VUI · KHÁM PHÁ · CHINH PHỤC KHTN</span><span>{soundReady ? "Âm thanh đã sẵn sàng" : "Bật nhạc để khuấy động không khí"}</span></footer>

    <style jsx global>{`
      .projector-root{background:radial-gradient(ellipse at 50% 45%,#312e81 0%,#17164c 43%,#070b24 100%);font-family:Arial,sans-serif}
      .projector-stars{position:absolute;inset:0;opacity:.32;background-image:radial-gradient(#fff 1px,transparent 1px),radial-gradient(#a5f3fc 1px,transparent 1px);background-size:43px 43px,79px 79px;background-position:0 0,23px 31px;animation:starsSlide 30s linear infinite}
      .projector-nebula{position:absolute;width:38vw;height:38vw;border-radius:50%;filter:blur(85px);opacity:.22;pointer-events:none}.nebula-a{background:#06b6d4;top:4%;left:-12%}.nebula-b{background:#c026d3;right:-10%;bottom:-8%}
      .wheel-stage{position:relative;width:min(76vw,52vh,510px);aspect-ratio:1;margin:12px auto 0}.wheel-pointer{position:absolute;z-index:5;top:-16px;left:50%;transform:translateX(-50%);font-size:clamp(32px,5vw,52px);color:#fff7ad;text-shadow:0 4px 10px #000}.wheel-disk{position:absolute;inset:0;border:10px solid #fff0b3;border-radius:50%;overflow:hidden;box-shadow:0 0 0 6px #f59e0b,0 0 65px #fbbf2488,inset 0 0 25px #0008;transition:transform 4.2s cubic-bezier(.09,.78,.12,1)}.wheel-disk.is-spinning{filter:drop-shadow(0 0 25px #fde68a)}.wheel-sectors{position:absolute;inset:0;background:repeating-conic-gradient(from 0deg,#ffffff55 0deg 1deg,transparent 1deg 12deg);border-radius:50%}.wheel-student{position:absolute;z-index:2;width:24%;font-size:clamp(8px,1.2vw,14px);font-weight:1000;color:#fff;text-align:center;line-height:1.1;text-shadow:0 2px 4px #000;overflow-wrap:anywhere}.wheel-hub{position:absolute;z-index:4;left:50%;top:50%;transform:translate(-50%,-50%);display:grid;place-items:center;width:19%;aspect-ratio:1;border:5px solid #fbbf24;border-radius:50%;background:#fff;color:#312e81;font-size:clamp(23px,4vw,42px);box-shadow:0 6px 18px #0008}
      .gift-grid{display:grid;grid-template-columns:repeat(4,minmax(65px,1fr));gap:clamp(8px,2vw,20px);width:min(88vw,780px)}.gift-box{display:flex;min-height:clamp(85px,14vh,140px);flex-direction:column;align-items:center;justify-content:center;border:3px solid #fde68a;border-radius:22px;background:linear-gradient(145deg,#fcd34d,#ea580c);box-shadow:0 9px 0 #9a3412,0 18px 30px #0007;animation:giftBounce 2.1s ease-in-out infinite alternate}.gift-box:nth-child(even){animation-delay:.35s}.gift-box>span{font-size:clamp(35px,6vw,65px)}.gift-box small{font-size:11px;font-weight:1000;color:#431407}.gift-box b{max-width:95%;margin-top:4px;color:#fff;font-size:clamp(10px,1.3vw,16px);text-shadow:0 2px 4px #000;overflow-wrap:anywhere}.gift-box.opened{background:linear-gradient(145deg,#a7f3d0,#059669);box-shadow:0 8px 0 #065f46,0 15px 25px #0006;animation:revealPop .5s ease-out}
      .door-grid{display:grid;grid-template-columns:repeat(6,minmax(55px,1fr));gap:clamp(7px,1.4vw,15px);width:min(90vw,850px)}.door-card{display:flex;min-height:clamp(75px,13vh,125px);flex-direction:column;align-items:center;justify-content:center;border:2px solid #c4b5fd;border-radius:16px;background:linear-gradient(145deg,#818cf8,#312e81);box-shadow:0 8px 0 #1e1b4b,0 12px 22px #0006;animation:doorFloat 2s ease-in-out infinite alternate}.door-card:nth-child(3n){animation-delay:.4s}.door-card>span{font-size:clamp(28px,4.5vw,48px)}.door-card small{font-size:10px;font-weight:1000}.door-card b{max-width:95%;font-size:clamp(9px,1.1vw,13px);overflow-wrap:anywhere}.door-card.opened{background:linear-gradient(145deg,#a7f3d0,#059669);box-shadow:0 7px 0 #065f46;animation:revealPop .5s ease-out}
      .draw-stage{position:relative;width:min(80vw,520px);height:min(42vh,320px);display:grid;place-items:center}.ticket-cloud{position:absolute;inset:0}.ticket-cloud span{position:absolute;font-size:38px;animation:ticketFloat 2.5s ease-in-out infinite alternate}.ticket-cloud span:nth-child(1){left:5%;top:15%}.ticket-cloud span:nth-child(2){left:25%;top:5%}.ticket-cloud span:nth-child(3){left:45%;top:12%}.ticket-cloud span:nth-child(4){left:65%;top:7%}.ticket-cloud span:nth-child(5){left:82%;top:18%}.ticket-cloud span:nth-child(6){left:12%;top:65%}.ticket-cloud span:nth-child(7){left:32%;top:70%}.ticket-cloud span:nth-child(8){left:55%;top:65%}.ticket-cloud span:nth-child(9){left:76%;top:70%}.ticket-cloud small{display:block;font-size:9px;font-weight:900;color:#fff;text-shadow:0 2px 4px #000}.draw-badge{z-index:2;font-size:clamp(90px,14vw,150px);filter:drop-shadow(0 18px 24px #fbbf2488);animation:badgePulse 1.5s ease-in-out infinite}
      .team-stage{display:flex;flex-wrap:wrap;justify-content:center;gap:14px;max-width:1100px}.team-card{min-width:150px;border:1px solid #ffffff55;border-radius:22px;background:#ffffff19;padding:16px;text-align:left;backdrop-filter:blur(8px);box-shadow:0 12px 30px #0004}.team-card>b{display:block;margin-bottom:8px;color:#fde68a;font-size:20px}.team-card span{display:block;margin-top:5px;font-size:clamp(12px,1.4vw,18px);font-weight:800}
      .race-stage{position:relative;width:min(92vw,1050px);height:min(48vh,390px);min-height:250px;overflow:hidden;border:8px solid #e2e8f0;border-radius:24px;background:linear-gradient(#7dd3fc 0 45%,#86efac 45% 52%,#334155 52%);box-shadow:0 20px 45px #0007}.race-sky{position:absolute;inset:0 0 55%;display:flex;justify-content:space-around;font-size:35px;opacity:.85}.race-finish{position:absolute;z-index:3;right:3%;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;align-items:center;width:45px;background:repeating-linear-gradient(0deg,#fff 0 12px,#111827 12px 24px);color:#111;font-size:32px}.race-finish small{position:absolute;bottom:8px;font-size:9px;font-weight:1000;writing-mode:vertical-rl}.race-lane{position:absolute;left:2%;display:flex;align-items:center;gap:8px;width:82%;height:15%;transform:translateX(0)}.race-car{font-size:clamp(30px,5vw,56px);filter:drop-shadow(0 5px 4px #0007)}.race-driver{max-width:55%;border:2px solid #fff;border-radius:999px;background:#1e1b4be8;padding:5px 12px;font-size:clamp(10px,1.5vw,17px);overflow-wrap:anywhere}.race-running .race-lane{animation:carRace 3.6s cubic-bezier(.2,.8,.2,1) forwards}.race-running .race-lane:nth-of-type(2){animation-duration:3.1s}.race-running .race-lane:nth-of-type(3){animation-duration:3.8s}.race-running .race-lane:nth-of-type(4){animation-duration:3.4s}.race-running .race-lane:nth-of-type(5){animation-duration:3.9s}.race-running .race-lane:nth-of-type(6){animation-duration:3.2s}.race-complete .race-lane.winner{z-index:4;filter:drop-shadow(0 0 20px #fde047);transform:translateX(105%)}.race-idle{position:absolute;inset:0;display:grid;place-items:center;font-size:clamp(20px,4vw,40px);font-weight:1000;color:#fff;text-shadow:0 3px 8px #000}
      .space-stage{position:relative;width:min(92vw,1050px);height:min(50vh,410px);min-height:270px;overflow:hidden;border:1px solid #a5f3fc66;border-radius:28px;background:radial-gradient(circle at 50% 50%,#312e81,#090d2d 72%);box-shadow:inset 0 0 60px #020617,0 20px 45px #0007}.space-planet-core{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:clamp(55px,9vw,95px);opacity:.55;filter:drop-shadow(0 0 30px #a78bfa)}.space-planet{position:absolute;z-index:2;display:flex;flex-direction:column;align-items:center;gap:2px;min-width:54px;max-width:110px;transform:translate(-50%,-50%);animation:planetChaos 2.7s ease-in-out infinite alternate}.space-planet>span{font-size:clamp(28px,4.2vw,48px);filter:drop-shadow(0 5px 9px #0008)}.space-planet>b{max-width:100%;border:1px solid #ffffff66;border-radius:999px;background:#312e81dd;padding:3px 8px;font-size:clamp(8px,1vw,12px);font-weight:1000;overflow-wrap:anywhere;text-shadow:0 2px 3px #000}.space-chaos .space-planet{animation-name:planetChaos,planetWobble;animation-duration:2.4s,3.7s;animation-timing-function:ease-in-out,linear;animation-iteration-count:infinite,infinite}.space-stop .space-planet{animation-play-state:paused}.space-stop .space-planet.planet-winner{z-index:8;left:50%!important;top:50%!important;transform:translate(-50%,-50%) scale(1.7);filter:drop-shadow(0 0 35px #fef08a);animation:planetWinner .65s ease-out both}.planet-winner b{background:#d97706;color:white;font-size:clamp(10px,1.5vw,17px);padding:5px 12px}.space-idle{position:absolute;inset:0;display:grid;place-items:center;font-size:24px;font-weight:1000}
      .projector-result{animation:resultGlow 2.2s ease-in-out infinite alternate}.projector-name{font-size:clamp(34px,6.5vw,86px);font-weight:1000;line-height:1.08;letter-spacing:.01em;color:#fff;text-shadow:0 5px 0 #4338ca,0 12px 35px #0009;animation:namePop .65s cubic-bezier(.2,1.5,.5,1) both;overflow-wrap:anywhere}
      @keyframes starsSlide{to{background-position:86px 86px,102px 62px}}@keyframes giftBounce{to{transform:translateY(-9px) rotateY(8deg)}}@keyframes doorFloat{to{transform:translateY(-8px) rotateY(7deg)}}@keyframes revealPop{from{transform:scale(.65) rotateY(80deg);filter:brightness(2)}to{transform:scale(1);filter:brightness(1)}}@keyframes ticketFloat{to{transform:translateY(-18px) rotate(12deg)}}@keyframes badgePulse{50%{transform:scale(1.12) rotate(8deg)}}@keyframes carRace{0%{transform:translateX(0)}65%{transform:translateX(75%)}100%{transform:translateX(110%)}}@keyframes planetChaos{0%{translate:-18px -14px;rotate:-18deg}50%{translate:25px 22px;rotate:20deg}100%{translate:-24px 18px;rotate:50deg}}@keyframes planetWobble{0%{scale:1}50%{scale:1.2}100%{scale:.88}}@keyframes planetWinner{from{opacity:.4;scale:.5}to{opacity:1;scale:1}}@keyframes namePop{from{opacity:0;transform:scale(.5) rotateX(45deg)}to{opacity:1;transform:scale(1) rotateX(0)}}@keyframes resultGlow{to{box-shadow:0 0 55px #a78bfa66}}
      @media(max-width:650px){.door-grid{grid-template-columns:repeat(4,minmax(50px,1fr))}.wheel-student{font-size:8px}.race-stage{min-height:220px}}
      @media(prefers-reduced-motion:reduce){.projector-root *{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important}}
    `}</style>
  </main>;
}
