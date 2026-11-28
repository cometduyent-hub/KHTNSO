"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

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
const PLANETS = ["🪐", "🌍", "🌕", "🔴", "🟣", "🌎", "🌑", "🟠", "🌏", "💫", "🛰️", "🌟", "🔵", "☄️"];
const GIFT_MASCOTS = ["🐻", "🐰", "🐼", "🦊", "🐸", "🐱", "🐧", "🐨"];
const DOOR_MASCOTS = ["🦄", "🐯", "🐵", "🐻‍❄️", "🐼", "🐰", "🐲", "🐸", "🐹", "🐥", "🦁", "🐙"];
const WHEEL_COLORS = ["#7c3aed", "#db2777", "#ea580c", "#0891b2", "#16a34a", "#2563eb", "#ca8a04", "#9333ea", "#e11d48", "#0f766e", "#4f46e5", "#c2410c"];

export default function ProjectorScreen() {
  const [data, setData] = useState<Snapshot>({});
  const [music, setMusic] = useState(false);
  const [soundReady, setSoundReady] = useState(false);
  // These values must be initialized before effects read them in dependency arrays.
  const mode = data.mode || "wheel";
  const presentation = data.presentation;
  const audioRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const wheelDiskRef = useRef<HTMLDivElement | null>(null);
  const previousWheelRotationRef = useRef<number | null>(null);
  const wheelAnimationRef = useRef<Animation | null>(null);
  const raceAnimationsRef = useRef<Animation[]>([]);
  const planetAnimationsRef = useRef<Map<HTMLElement, Animation>>(new Map());
  const raceStageRef = useRef<HTMLDivElement | null>(null);
  const drawCloudRef = useRef<HTMLDivElement | null>(null);
  const drawAnimationsRef = useRef<Animation[]>([]);
  const spaceStageRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    const target = Number(data.wheelRotation || 0);
    const previous = previousWheelRotationRef.current;
    if (previous === null) {
      previousWheelRotationRef.current = target;
      return;
    }
    if (target !== previous && data.spinning && wheelDiskRef.current) {
      wheelAnimationRef.current?.cancel();
      const node = wheelDiskRef.current;
      node.style.transform = `rotate(${previous}deg)`;
      const animation = node.animate(
        [{ transform: `rotate(${previous}deg)` }, { transform: `rotate(${target}deg)` }],
        { duration: 4300, easing: "cubic-bezier(.08,.82,.12,1)", fill: "forwards" },
      );
      wheelAnimationRef.current = animation;
      animation.onfinish = () => {
        node.style.transform = `rotate(${target}deg)`;
        animation.cancel();
      };
    }
    previousWheelRotationRef.current = target;
  }, [data.wheelRotation, data.spinning]);

  // Drive the race with measured pixel distances so each car visibly reaches the finish line.
  useEffect(() => {
    raceAnimationsRef.current.forEach(animation => animation.cancel());
    raceAnimationsRef.current = [];
    if (mode !== "race" || presentation?.kind !== "race" || presentation.phase !== "running") return;
    const frame = window.requestAnimationFrame(() => {
      const stage = raceStageRef.current;
      if (!stage) return;
      const finish = stage.querySelector<HTMLElement>(".race-finish");
      const lanes = Array.from(stage.querySelectorAll<HTMLElement>(".race-lane"));
      if (!finish || !lanes.length) return;
      const finishRect = finish.getBoundingClientRect();
      lanes.forEach((lane, index) => {
        const car = lane.querySelector<HTMLElement>(".race-car");
        if (!car) return;
        const carRect = car.getBoundingClientRect();
        const distance = Math.max(0, finishRect.left - carRect.left - carRect.width * 0.45);
        const isWinner = presentation.winner.id === lane.dataset.studentId;
        const duration = isWinner ? 9250 : 8650 + (index % 4) * 180;
        // Cars surge, briefly lead, fall back, then make a final push.
        const progress = isWinner
          ? [0, .12, .31, .48, .63, .78, .91, 1]
          : [0, .12, .29, .46, .61, .77, .91, 1];
        const factors = isWinner
          ? [0, .12, .38, .34, .57, .53, .82, 1]
          : [0, .15 + (index % 2) * .03, .39 + (index % 3) * .025, .31 + (index % 2) * .04, .56 + (index % 3) * .025, .49 + (index % 2) * .04, .67 + (index % 3) * .025, .76 + (index % 2) * .025];
        const animation = lane.animate(
          progress.map((offset, key) => ({ offset, transform: `translateX(${Math.round(distance * factors[key])}px)` })),
          { duration, delay: index * 55, easing: "cubic-bezier(.22,.61,.36,1)", fill: "forwards" },
        );
        raceAnimationsRef.current.push(animation);
      });
    });
    return () => {
      window.cancelAnimationFrame(frame);
      raceAnimationsRef.current.forEach(animation => {
        const lane = animation.effect instanceof KeyframeEffect ? animation.effect.target as HTMLElement : null;
        if (lane) lane.style.transform = getComputedStyle(lane).transform;
        animation.cancel();
      });
      raceAnimationsRef.current = [];
    };
  }, [mode, presentation?.id, presentation?.kind, presentation?.phase]);

  // Let every ticket wander independently around the stage, with different paths and timing.
  useEffect(() => {
    drawAnimationsRef.current.forEach(animation => animation.cancel());
    drawAnimationsRef.current = [];
    if (mode !== "draw") return;
    const frame = window.requestAnimationFrame(() => {
      const stage = drawCloudRef.current;
      if (!stage) return;
      const tickets = Array.from(stage.querySelectorAll<HTMLElement>("[data-draw-ticket]"));
      tickets.forEach((ticket, index) => {
        const width = Math.max(240, stage.clientWidth - ticket.offsetWidth - 12);
        const height = Math.max(150, stage.clientHeight - ticket.offsetHeight - 12);
        const x = () => Math.round((Math.random() - .5) * Math.min(width * .42, 190));
        const y = () => Math.round((Math.random() - .5) * Math.min(height * .42, 115));
        const r = () => Math.round((Math.random() - .5) * 90);
        const frames = Array.from({ length: 7 }, (_, step) => ({
          transform: `translate(${x()}px, ${y()}px) rotate(${r()}deg) scale(${.78 + Math.random() * .42})`,
          offset: step / 6,
        }));
        frames[0] = { ...frames[0], transform: "translate(0px, 0px) rotate(0deg) scale(1)" };
        const animation = ticket.animate(frames, {
          duration: 5200 + Math.random() * 4300,
          delay: -Math.random() * 4500,
          iterations: Infinity,
          direction: "alternate",
          easing: "ease-in-out",
        });
        drawAnimationsRef.current.push(animation);
      });
    });
    return () => {
      window.cancelAnimationFrame(frame);
      drawAnimationsRef.current.forEach(animation => animation.cancel());
      drawAnimationsRef.current = [];
    };
  }, [mode, data.roster?.length]);

  // Animate each planet on its own circular orbit using Web Animations API.
  // This avoids CSS transform overrides that previously removed the centering translation.
  useEffect(() => {
    planetAnimationsRef.current.forEach(animation => animation.cancel());
    planetAnimationsRef.current.clear();
    if (mode !== "capsule" || presentation?.kind !== "capsule") return;
    const stage = spaceStageRef.current;
    if (!stage) return;
    const planets = Array.from(stage.querySelectorAll<HTMLElement>(".space-planet"));
    if (presentation.phase === "running") {
      planets.forEach((planet, index) => {
        const radius = Number.parseFloat(planet.style.getPropertyValue("--orbit-radius")) || 70;
        const start = Number.parseFloat(planet.style.getPropertyValue("--orbit-start")) || 0;
        const duration = Number.parseFloat(planet.style.getPropertyValue("--orbit-duration")) * 1000 || 7000;
        const direction = index % 2 ? -1 : 1;
        const animation = planet.animate(
          [
            { transform: `translate(-50%,-50%) rotate(${start}deg) translateX(${radius}px)` },
            { transform: `translate(-50%,-50%) rotate(${start + direction * 360}deg) translateX(${radius}px)` },
          ],
          { duration, iterations: Infinity, easing: "linear", delay: -((index * 730) % duration), fill: "both" },
        );
        planetAnimationsRef.current.set(planet, animation);
      });
    } else if (presentation.phase === "complete") {
      planets.forEach(planet => planetAnimationsRef.current.get(planet)?.pause());
      const winner = planets.find(planet => planet.dataset.studentId === presentation.winner.id);
      if (winner) {
        winner.style.left = "50%";
        winner.style.top = "50%";
        const currentTransform = getComputedStyle(winner).transform;
        winner.animate(
          [{ transform: currentTransform }, { transform: "translate(-50%,-50%) scale(1.75)" }],
          { duration: 700, easing: "cubic-bezier(.2,1.35,.4,1)", fill: "forwards" },
        );
      }
    }
    return () => {
      planetAnimationsRef.current.forEach((animation, planet) => {
        planet.style.transform = getComputedStyle(planet).transform;
        animation.cancel();
      });
      planetAnimationsRef.current.clear();
    };
  }, [mode, presentation?.id, presentation?.kind, presentation?.phase, presentation?.winner?.id]);

  async function toggleMusic() {
    if (music) { if (timerRef.current) window.clearInterval(timerRef.current); timerRef.current = null; await audioRef.current?.close(); audioRef.current = null; setMusic(false); return; }
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      const ctx: AudioContext = new Ctx(); await ctx.resume(); audioRef.current = ctx;
      const notes = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 1046.5, 880, 783.99, 659.25, 783.99]; let index = 0;
      const play = () => {
        if (!audioRef.current) return;
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = "triangle"; osc.frequency.value = notes[index++ % notes.length];
        gain.gain.setValueAtTime(0.0001, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.032, ctx.currentTime + 0.04); gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.27);
        osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.3);
      };
      play(); timerRef.current = window.setInterval(play, 330); setMusic(true); setSoundReady(true);
    } catch { setSoundReady(false); }
  }

  const roster = data.roster || [];
  const current = data.picked?.[data.picked.length - 1];
  const modeTitle: Record<string, string> = { wheel: "VÒNG QUAY MAY MẮN", gift: "HỘP QUÀ BÍ ẨN", draw: "BỐC THĂM MAY MẮN", teams: "GHÉP ĐỘI TỐC ĐỘ", doors: "Ô CỬA BÍ MẬT", race: "ĐƯỜNG ĐUA THẦN TỐC", capsule: "KHÔNG GIAN BÍ ẨN" };
  const icon: Record<string, string> = { wheel: "🎡", gift: "🎁", draw: "🎟️", teams: "🏁", doors: "🚪", race: "🏎️", capsule: "🪐" };
  const wheelGradient = useMemo(() => {
    if (!roster.length) return "conic-gradient(#7c3aed 0deg 45deg,#db2777 45deg 90deg,#ea580c 90deg 135deg,#0891b2 135deg 180deg,#16a34a 180deg 225deg,#2563eb 225deg 270deg,#ca8a04 270deg 315deg,#9333ea 315deg)";
    const step = 360 / roster.length;
    return `conic-gradient(${roster.map((_, i) => `${WHEEL_COLORS[i % WHEEL_COLORS.length]} ${i * step}deg ${(i + 1) * step - 0.65}deg, #fff ${(i + 1) * step - 0.65}deg ${(i + 1) * step}deg`).join(",")})`;
  }, [roster]);
  const wheelLabels = useMemo(() => roster.map((student, i) => {
    const angle = ((i + 0.5) / Math.max(1, roster.length)) * Math.PI * 2 - Math.PI / 2;
    return { student, left: 50 + Math.cos(angle) * 37, top: 50 + Math.sin(angle) * 37, angle: (angle * 180) / Math.PI + 90 };
  }), [roster]);
  const openedBoxes = data.openedBoxes || [];
  const openedDoors = data.openedDoors || [];

  return <main className="projector-root relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-4 py-5 text-white sm:px-7">
    <div className="projector-stars" aria-hidden="true"/><div className="projector-stars projector-stars-two" aria-hidden="true"/><div className="projector-nebula nebula-a"/><div className="projector-nebula nebula-b"/><div className="projector-floor" aria-hidden="true"/>
    <header className="relative z-20 flex w-full max-w-7xl items-center justify-between gap-3">
      <div><p className="text-[10px] font-black tracking-[.35em] text-cyan-200 sm:text-xs">KHTN SỐ · KHỞI ĐỘNG LỚP HỌC</p><h1 className="mt-1 text-xl font-black tracking-wide sm:text-4xl">{icon[mode] || "🎲"} {modeTitle[mode] || "TRÒ CHƠI GỌI TÊN"}</h1></div>
      <button onClick={() => void toggleMusic()} className="music-button shrink-0 rounded-full border border-white/25 bg-white/10 px-3 py-2 text-xs font-black shadow-xl backdrop-blur sm:px-5 sm:py-3 sm:text-sm">{music ? "🔊 Tắt nhạc" : "🎵 Bật nhạc"}</button>
    </header>

    <section className="relative z-10 my-auto flex w-full max-w-7xl flex-col items-center py-5 text-center sm:py-8">
      {mode === "wheel" && <div className="wheel-scene"><div className="wheel-aura"/><div className="wheel-stage"><div className="wheel-pointer">▼</div><div ref={wheelDiskRef} className={`wheel-disk ${data.spinning ? "is-spinning" : ""}`} style={{ transform: `rotate(${data.wheelRotation || 0}deg)`, background: wheelGradient }}><div className="wheel-gloss"/><div className="wheel-sectors"/>{wheelLabels.map((item, i) => <span key={item.student.id || i} className="wheel-student" style={{ left: `${item.left}%`, top: `${item.top}%`, width: `${Math.max(6, Math.min(24, 220 / Math.max(1, roster.length)))}%`, fontSize: `${Math.max(6, Math.min(14, 140 / Math.max(1, roster.length)))}px`, transform: `translate(-50%,-50%) rotate(${-item.angle}deg)` }}>{item.student.name}</span>)}<b className="wheel-hub">🎯</b></div></div><div className="wheel-pedestal"/></div>}

      {mode === "gift" && <div className="gift-grid">{Array.from({ length: 8 }, (_, i) => { const student = data.boxMap?.[i]; const opened = openedBoxes.includes(i); return <div key={i} className={`gift-box ${opened ? "opened" : ""}`}><span className="gift-box-icon">{GIFT_MASCOTS[i]}</span><span className="gift-box-lid">🎁</span><small>HỘP {i + 1}</small>{opened && <b>{student?.name || ""}</b>}</div>; })}</div>}
      {mode === "doors" && <div className="door-grid">{Array.from({ length: 12 }, (_, i) => { const item = data.doorMap?.[i]; const opened = openedDoors.includes(i); return <div key={i} className={`door-card ${opened ? "opened" : ""}`}><span className="door-mascot">{DOOR_MASCOTS[i]}</span><span className="door-symbol">{opened ? "🔓" : "🚪"}</span><small>Ô CỬA {i + 1}</small>{opened && <b>{item?.student.name}</b>}</div>; })}</div>}
      {mode === "draw" && <div className="draw-stage"><div ref={drawCloudRef} className="ticket-cloud">{roster.slice(0, 18).map((s, i) => <span data-draw-ticket key={s.id || i} style={{ left: `${5 + ((i * 29) % 86)}%`, top: `${8 + ((i * 43) % 78)}%` }}>🎟️<small>{s.name}</small></span>)}</div><div className="draw-badge">🎫</div></div>}
      {mode === "teams" && <div className="team-stage">{(data.teams || []).map((team, i) => <div key={i} className="team-card"><b>ĐỘI {i + 1}</b>{team.map(s => <span key={s.id}>{s.name}</span>)}</div>)}</div>}

      {mode === "race" && <div ref={raceStageRef} className={`race-stage ${presentation?.kind === "race" ? "race-active" : ""} ${presentation?.kind === "race" && presentation.phase === "complete" ? "race-complete" : ""}`}>
        <div className="race-sky"><span>☁️</span><span>☁️</span><span>☀️</span><span>☁️</span></div><div className="race-track-lines"/><div className="race-finish"><span>🏁</span><small>ĐÍCH</small></div>
        {(presentation?.kind === "race" ? presentation.participants : roster.slice(0, 10)).map((student, i) => { const isWinner = presentation?.kind === "race" && presentation.winner.id === student.id; const duration = isWinner ? "9.25s" : `${8.65 + (i % 4) * 0.18}s`; return <div key={`${presentation?.id || "idle"}-${student.id}`} data-student-id={student.id} className={`race-lane ${isWinner && presentation?.phase === "complete" ? "winner" : ""}`} style={{ top: `${43 + i * 5.45}%`, animationDelay: `${i * 0.045}s`, animationDuration: duration }}><span className="race-speed-lines" aria-hidden="true"/><span className={`race-car car-color-${i % 5}`} aria-label="Xe đua"><span className="car-body">{["🏎️", "🚙", "🏎️", "🚕", "🚗"][i % 5]}</span><i className="car-wheel car-wheel-front"/><i className="car-wheel car-wheel-back"/></span><b className="race-driver">{student.name}</b></div>; })}
        {!presentation && <div className="race-idle">🏎️ SẴN SÀNG XUẤT PHÁT?</div>}
        {presentation?.kind === "race" && presentation.phase === "running" && <div className="race-countdown">🚦 XUẤT PHÁT!</div>}
      </div>}

      {mode === "capsule" && <div ref={spaceStageRef} className={`space-stage ${presentation?.kind === "capsule" && presentation.phase === "running" ? "space-chaos" : ""} ${presentation?.kind === "capsule" && presentation.phase === "complete" ? "space-stop" : ""}`}>
        <div className="space-stars"/><div className="space-orbit orbit-one"/><div className="space-orbit orbit-two"/><div className="space-planet-core">🌌</div>
        {(presentation?.kind === "capsule" ? presentation.participants : roster.slice(0, 20)).map((student, i) => {
          const isWinner = presentation?.kind === "capsule" && presentation.phase === "complete" && presentation.winner.id === student.id;
          const orbitRadius = 45 + (i % 6) * 23;
          const orbitDuration = 5.2 + (i % 7) * 1.15;
          const orbitStart = (i * 137.5) % 360;
          const style: CSSProperties = {
            left: "50%", top: "50%",
            animationDelay: `${-(i * 0.73 % orbitDuration)}s`,
            animationDuration: `${orbitDuration}s`,
            animationDirection: i % 2 ? "reverse" : "normal",
            ["--orbit-radius" as any]: `${orbitRadius}px`,
            ["--orbit-start" as any]: `${orbitStart}deg`,
            ["--orbit-duration" as any]: `${orbitDuration}s`,
          };
          return <div key={`${presentation?.id || "idle"}-${student.id}`} data-student-id={student.id} className={`space-planet ${isWinner ? "planet-winner" : ""}`} style={style}><div className="space-planet-content"><span className={`planet-orb orb-${i % 6}`}><i>{PLANETS[i % PLANETS.length]}</i></span><b>{student.name}</b></div></div>;
        })}
        {!roster.length && <div className="space-idle">🪐 CHỜ DANH SÁCH HỌC SINH</div>}
        {presentation?.kind === "capsule" && presentation.phase === "running" && <div className="space-signal">ĐANG QUÉT TÍN HIỆU HÀNH TINH…</div>}
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
      .projector-root{isolation:isolate;background:radial-gradient(ellipse at 50% 35%,#4338a8 0%,#21145e 42%,#080b2b 100%);font-family:Arial,sans-serif}
      .projector-stars{position:absolute;inset:-15%;opacity:.42;background-image:radial-gradient(#fff 1.3px,transparent 1.6px),radial-gradient(#a5f3fc 1px,transparent 1.5px);background-size:47px 47px,83px 83px;background-position:0 0,23px 31px;animation:starsSlide 25s linear infinite;pointer-events:none}.projector-stars-two{opacity:.2;background-size:131px 131px,173px 173px;animation-duration:43s;animation-direction:reverse}
      .projector-nebula{position:absolute;width:42vw;height:42vw;border-radius:50%;filter:blur(85px);opacity:.27;pointer-events:none;z-index:-1}.nebula-a{background:#06b6d4;top:4%;left:-12%}.nebula-b{background:#ec4899;right:-10%;bottom:-8%}.projector-floor{position:absolute;bottom:-28vh;left:15%;width:70%;height:42vh;transform:perspective(300px) rotateX(62deg);background:repeating-linear-gradient(90deg,#67e8f922 0 1px,transparent 1px 70px),repeating-linear-gradient(0deg,#c4b5fd22 0 1px,transparent 1px 55px);mask-image:linear-gradient(transparent,#000)}
      .music-button{box-shadow:0 0 25px #22d3ee33;transition:transform .2s,background .2s}.music-button:hover{transform:translateY(-2px);background:#ffffff26}
      .wheel-scene{position:relative;padding-bottom:26px;filter:drop-shadow(0 25px 25px #02061788)}.wheel-aura{position:absolute;inset:8%;border-radius:50%;background:#facc15;filter:blur(48px);opacity:.25;animation:auraPulse 2s ease-in-out infinite alternate}.wheel-stage{position:relative;width:min(76vw,53vh,530px);aspect-ratio:1;margin:12px auto 0;perspective:1000px}.wheel-pointer{position:absolute;z-index:9;top:-18px;left:50%;transform:translateX(-50%);font-size:clamp(34px,5vw,58px);color:#fff7ad;text-shadow:0 4px 0 #b45309,0 9px 16px #000}.wheel-disk{position:absolute;inset:0;border:12px solid #fff0b3;border-radius:50%;overflow:hidden;box-shadow:0 0 0 7px #f59e0b,0 0 0 13px #7c2d12,0 0 65px #fbbf2499,inset 0 0 30px #0009;transition:none;transform-style:preserve-3d}.wheel-disk.is-spinning{filter:drop-shadow(0 0 32px #fde68a);will-change:transform;animation:wheelGlow .55s ease-in-out infinite alternate}.wheel-gloss{position:absolute;inset:0;z-index:1;border-radius:50%;background:linear-gradient(135deg,#ffffff55 0%,transparent 34%,transparent 67%,#0003 100%);pointer-events:none}.wheel-sectors{position:absolute;inset:0;background:repeating-conic-gradient(from 0deg,#ffffff55 0deg 1deg,transparent 1deg 12deg);border-radius:50%}.wheel-student{position:absolute;z-index:2;width:24%;font-weight:1000;color:#fff;text-align:center;line-height:1.1;text-shadow:0 2px 5px #000,0 0 8px #000;overflow-wrap:anywhere}.wheel-hub{position:absolute;z-index:4;left:50%;top:50%;transform:translate(-50%,-50%);display:grid;place-items:center;width:19%;aspect-ratio:1;border:6px solid #fbbf24;border-radius:50%;background:radial-gradient(circle at 30% 25%,#fff,#dbeafe 45%,#64748b);color:#312e81;font-size:clamp(23px,4vw,42px);box-shadow:0 8px 0 #92400e,0 12px 22px #0008}.wheel-pedestal{position:relative;z-index:-1;width:35%;height:35px;margin:-4px auto 0;border-radius:50%;background:linear-gradient(#fde68a,#b45309);box-shadow:0 12px 24px #0009}
      .gift-grid{display:grid;grid-template-columns:repeat(4,minmax(65px,1fr));gap:clamp(8px,2vw,20px);width:min(88vw,820px);perspective:900px}.gift-box{position:relative;display:flex;min-height:clamp(85px,14vh,145px);flex-direction:column;align-items:center;justify-content:center;border:3px solid #fde68a;border-radius:22px;background:linear-gradient(145deg,#fef08a 0%,#f59e0b 42%,#c2410c 100%);box-shadow:inset 0 4px 10px #fff9,0 9px 0 #9a3412,0 18px 30px #0007;animation:giftBounce 2.1s ease-in-out infinite alternate;transform-style:preserve-3d}.gift-box:before{content:"";position:absolute;top:0;bottom:0;left:42%;width:16%;background:linear-gradient(90deg,#fff4,#fff9,#b45309aa);border-left:1px solid #fff8;border-right:1px solid #92400e55}.gift-box:nth-child(even){animation-delay:.35s}.gift-box-icon{position:relative;z-index:2;font-size:clamp(35px,6vw,65px);filter:drop-shadow(0 5px 4px #78350f99);animation:mascotBob 1.7s ease-in-out infinite alternate}.gift-box-lid{position:absolute;z-index:3;right:8%;top:4%;font-size:clamp(16px,2.3vw,25px);filter:drop-shadow(0 3px 3px #78350f88)}.gift-box small{position:relative;z-index:1;font-size:11px;font-weight:1000;color:#431407}.gift-box b{position:relative;z-index:1;max-width:95%;margin-top:4px;color:#fff;font-size:clamp(10px,1.3vw,16px);text-shadow:0 2px 4px #000;overflow-wrap:anywhere}.gift-box.opened{background:linear-gradient(145deg,#a7f3d0,#059669);box-shadow:0 8px 0 #065f46,0 15px 25px #0006;animation:revealPop .5s ease-out}
      .door-grid{display:grid;grid-template-columns:repeat(6,minmax(55px,1fr));gap:clamp(7px,1.4vw,15px);width:min(90vw,900px);perspective:900px}.door-card{position:relative;display:flex;min-height:clamp(75px,13vh,130px);flex-direction:column;align-items:center;justify-content:center;border:2px solid #c4b5fd;border-radius:16px;background:linear-gradient(145deg,#a5b4fc 0%,#6366f1 38%,#312e81 100%);box-shadow:inset 0 3px 9px #fff8,0 8px 0 #1e1b4b,0 12px 22px #0006;animation:doorFloat 2s ease-in-out infinite alternate;transform-style:preserve-3d}.door-card:after{content:"";position:absolute;inset:7px;border:1px solid #ffffff55;border-radius:10px;pointer-events:none}.door-card:nth-child(3n){animation-delay:.4s}.door-card>span{font-size:clamp(28px,4.5vw,48px);filter:drop-shadow(0 5px 4px #0005)}.door-card>.door-mascot{font-size:clamp(32px,5vw,56px);animation:mascotBob 1.8s ease-in-out infinite alternate}.door-card>.door-symbol{position:absolute;right:8px;top:5px;font-size:clamp(14px,2vw,22px)}.door-card small{font-size:10px;font-weight:1000}.door-card b{max-width:95%;font-size:clamp(9px,1.1vw,13px);overflow-wrap:anywhere}.door-card.opened{background:linear-gradient(145deg,#a7f3d0,#059669);box-shadow:0 7px 0 #065f46;animation:revealPop .5s ease-out}
      .draw-stage{position:relative;width:min(80vw,560px);height:min(42vh,340px);display:grid;place-items:center;perspective:800px}.ticket-cloud{position:absolute;inset:0}.ticket-cloud span{position:absolute;font-size:38px;filter:drop-shadow(0 8px 6px #0007);will-change:transform}.ticket-cloud small{display:block;max-width:100px;border-radius:999px;background:#312e81dd;padding:2px 5px;font-size:9px;font-weight:900;color:#fff;text-shadow:0 2px 4px #000;overflow-wrap:anywhere}.draw-badge{z-index:2;font-size:clamp(90px,14vw,150px);filter:drop-shadow(0 18px 24px #fbbf2488);animation:badgePulse 1.5s ease-in-out infinite}
      .team-stage{display:flex;flex-wrap:wrap;justify-content:center;gap:14px;max-width:1100px;perspective:1000px}.team-card{min-width:150px;border:1px solid #ffffff66;border-radius:22px;background:linear-gradient(145deg,#ffffff30,#ffffff0c);padding:16px;text-align:left;backdrop-filter:blur(8px);box-shadow:inset 0 1px 1px #fff8,0 12px 30px #0005;transform:rotateY(-4deg)}.team-card>b{display:block;margin-bottom:8px;color:#fde68a;font-size:20px}.team-card span{display:block;margin-top:5px;font-size:clamp(12px,1.4vw,18px);font-weight:800}
      .race-stage{position:relative;width:min(96vw,1240px);height:min(62vh,600px);min-height:390px;overflow:hidden;border:8px solid #e2e8f0;border-radius:26px;background:linear-gradient(#7dd3fc 0 34%,#86efac 34% 43%,#334155 43% 100%);box-shadow:inset 0 0 35px #0f172a77,0 20px 55px #0009;perspective:900px}.race-sky{position:absolute;inset:0 0 60%;display:flex;justify-content:space-around;align-items:center;font-size:clamp(26px,4vw,42px);opacity:.9}.race-track-lines{position:absolute;left:0;right:0;top:43%;bottom:0;background:repeating-linear-gradient(0deg,transparent 0 15.5%,#f8fafc 15.5% 16%,transparent 16% 17%),repeating-linear-gradient(90deg,#ffffff0b 0 35px,#ffffff22 36px 38px);transform:perspective(260px) rotateX(8deg);transform-origin:top}.race-active .race-track-lines{animation:roadRush .42s linear infinite}.race-speed-lines{position:absolute;left:-28px;width:30px;height:3px;border-radius:9px;background:#e0f2fe;opacity:0;box-shadow:-9px -8px 0 #bae6fd,-15px 8px 0 #fff}.race-active .race-speed-lines{animation:speedTrail .48s linear infinite}.race-finish{position:absolute;z-index:5;right:5%;top:39%;bottom:0;display:flex;flex-direction:column;justify-content:center;align-items:center;width:38px;background:repeating-linear-gradient(0deg,#fff 0 12px,#111827 12px 24px);color:#111;font-size:28px;box-shadow:0 0 20px #fff9}.race-finish small{position:absolute;bottom:8px;font-size:9px;font-weight:1000;writing-mode:vertical-rl}.race-lane{position:absolute;left:2%;display:flex;align-items:center;gap:6px;width:76%;height:8%;transform:translateX(0);will-change:transform}.race-car{position:relative;display:inline-block;min-width:64px;height:54px;animation:carSuspension .22s ease-in-out infinite alternate}.car-body{position:relative;z-index:2;display:block;font-size:clamp(34px,5vw,58px);line-height:1;filter:drop-shadow(0 7px 5px #0008)}.car-wheel{position:absolute;z-index:3;bottom:4px;width:10px;height:10px;border:2px solid #cbd5e1;border-radius:50%;background:#111827;box-shadow:0 0 0 2px #020617;animation:wheelRoll .18s linear infinite}.car-wheel-front{left:42px}.car-wheel-back{left:12px}.race-active .race-car{animation-duration:.22s}.race-active .car-wheel{animation-duration:.14s}.race-lane.winner .race-car{filter:drop-shadow(0 0 16px #fde047)}.race-car{font-size:clamp(30px,5vw,56px);filter:drop-shadow(0 7px 5px #0008);transform:rotateY(-16deg)}.race-driver{max-width:52%;border:2px solid #fff;border-radius:999px;background:linear-gradient(90deg,#312e81,#6d28d9);padding:5px 12px;font-size:clamp(10px,1.5vw,17px);overflow-wrap:anywhere;box-shadow:0 4px 8px #0007}.race-active .race-lane{will-change:transform}.race-lane.winner .race-driver{background:linear-gradient(90deg,#92400e,#f59e0b);box-shadow:0 0 20px #fde047}.race-complete .race-finish{animation:finishFlash .35s ease-in-out 4 alternate}.race-countdown{position:absolute;z-index:7;top:10px;left:50%;transform:translateX(-50%);border:2px solid #fde68a;border-radius:999px;background:#9a3412e8;padding:7px 22px;color:#fff;font-size:clamp(16px,2.6vw,27px);font-weight:1000;letter-spacing:.08em;text-shadow:0 3px 8px #000;box-shadow:0 0 22px #facc15aa;animation:countdownFlash .9s ease-in-out infinite alternate;pointer-events:none;white-space:nowrap}.race-idle{position:absolute;inset:0;display:grid;place-items:center;font-size:clamp(20px,4vw,40px);font-weight:1000;color:#fff;text-shadow:0 3px 8px #000}
      .space-stage{position:relative;width:min(94vw,1120px);height:min(54vh,460px);min-height:290px;overflow:hidden;border:2px solid #a5f3fc88;border-radius:30px;background:radial-gradient(ellipse at 50% 50%,#3b238c 0%,#171044 43%,#070b2c 100%);box-shadow:inset 0 0 70px #020617,0 20px 55px #0009;perspective:1000px}.space-stars{position:absolute;inset:0;background-image:radial-gradient(#fff 1.2px,transparent 1.8px),radial-gradient(#67e8f9 1px,transparent 1.7px);background-size:37px 37px,67px 67px;background-position:0 0,18px 21px;opacity:.5;animation:starsSlide 16s linear infinite}.space-orbit{position:absolute;left:50%;top:50%;border:1px solid #c4b5fd55;border-radius:50%;transform:translate(-50%,-50%) rotateX(68deg);pointer-events:none;box-shadow:0 0 12px #a78bfa22}.orbit-one{width:45%;height:78%;animation:orbitSpin 28s linear infinite}.orbit-two{width:75%;height:120%;border-color:#67e8f966;animation:orbitSpin 38s linear infinite reverse}.space-stage:after{content:"";position:absolute;left:50%;top:50%;width:90%;height:90%;border:1px dashed #67e8f933;border-radius:50%;transform:translate(-50%,-50%) rotateX(68deg);pointer-events:none}.space-planet-core{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:clamp(55px,9vw,95px);opacity:.5;filter:drop-shadow(0 0 30px #a78bfa)}.space-planet{position:absolute;z-index:2;display:flex;flex-direction:column;align-items:center;gap:2px;min-width:50px;max-width:115px;transform:translate(-50%,-50%);filter:drop-shadow(0 8px 7px #02061799)}.space-planet-content{display:flex;flex-direction:column;align-items:center;gap:2px}.space-planet-content>.planet-orb{position:relative;display:grid;place-items:center;width:clamp(34px,4.8vw,57px);aspect-ratio:1;border:1px solid #ffffff99;border-radius:50%;background:radial-gradient(circle at 28% 23%,#fff 0%,#bfdbfe 8%,#38bdf8 28%,#1d4ed8 67%,#0c1b4b 100%);box-shadow:inset -9px -8px 13px #020617aa,inset 4px 3px 8px #ffffffaa,0 0 18px #38bdf866;animation:orbBreathe 2.8s ease-in-out infinite alternate}.planet-orb i{font-style:normal;font-size:clamp(19px,3vw,34px);filter:drop-shadow(0 3px 3px #0008)}.orb-1{background:radial-gradient(circle at 28% 22%,#fff 0%,#fbcfe8 9%,#f472b6 34%,#be185d 70%,#4a044e 100%)!important}.orb-2{background:radial-gradient(circle at 28% 22%,#fff 0%,#fde68a 9%,#fb923c 34%,#c2410c 70%,#431407 100%)!important}.orb-3{background:radial-gradient(circle at 28% 22%,#fff 0%,#bbf7d0 9%,#34d399 34%,#047857 70%,#022c22 100%)!important}.orb-4{background:radial-gradient(circle at 28% 22%,#fff 0%,#ddd6fe 9%,#a78bfa 34%,#6d28d9 70%,#2e1065 100%)!important}.orb-5{background:radial-gradient(circle at 28% 22%,#fff 0%,#fecaca 9%,#f87171 34%,#b91c1c 70%,#450a0a 100%)!important}.space-planet-content>b{max-width:100%;border:1px solid #ffffff77;border-radius:999px;background:linear-gradient(90deg,#312e81ed,#581c87e8);padding:3px 8px;font-size:clamp(8px,1vw,12px);font-weight:1000;overflow-wrap:anywhere;text-shadow:0 2px 3px #000;box-shadow:0 4px 9px #0006}.space-chaos .space-planet{will-change:transform}.space-chaos .space-planet-content{animation:none}.space-chaos .planet-orb{animation-duration:1.2s}.space-stop .space-planet{will-change:transform}.space-stop .space-planet .space-planet-content{animation:none}.space-stop .space-planet .planet-orb{animation-play-state:paused}.space-stop .space-planet.planet-winner{z-index:9;filter:drop-shadow(0 0 35px #fef08a)}.space-stop .space-planet.planet-winner .space-planet-content{animation:none;transform:none}.space-stop .space-planet.planet-winner .planet-orb{width:clamp(65px,9vw,105px);animation:orbBreathe 1.1s ease-in-out infinite alternate}.planet-winner b{background:linear-gradient(90deg,#92400e,#d97706);color:white;font-size:clamp(11px,1.6vw,18px);padding:5px 13px;box-shadow:0 0 20px #facc15}.space-signal{position:absolute;z-index:8;left:50%;bottom:12px;transform:translateX(-50%);max-width:90%;border:1px solid #67e8f9aa;border-radius:999px;background:#0e7490dd;padding:8px 18px;color:#ecfeff;font-size:clamp(10px,1.4vw,16px);font-weight:1000;letter-spacing:.08em;box-shadow:0 0 25px #22d3ee66;white-space:nowrap}.space-idle{position:absolute;inset:0;display:grid;place-items:center;font-size:24px;font-weight:1000}
      .projector-result{border-color:#ffffff66;background:linear-gradient(135deg,#ffffff24,#ffffff0b);box-shadow:inset 0 1px 1px #fff8,0 20px 55px #02061788;animation:resultGlow 2.2s ease-in-out infinite alternate}.projector-name{font-size:clamp(34px,6.5vw,86px);font-weight:1000;line-height:1.08;letter-spacing:.01em;color:#fff;text-shadow:0 5px 0 #4338ca,0 12px 35px #0009;animation:namePop .65s cubic-bezier(.2,1.5,.5,1) both;overflow-wrap:anywhere}
      @keyframes mascotBob{to{transform:translateY(-7px) rotate(5deg) scale(1.06)}}@keyframes starsSlide{to{background-position:86px 86px,102px 62px}}@keyframes wheelGlow{to{filter:drop-shadow(0 0 48px #fde68a) brightness(1.08)}}@keyframes roadRush{to{background-position:0 0,76px 0}}@keyframes speedTrail{0%{opacity:0;transform:translateX(15px) scaleX(.4)}35%{opacity:.9}100%{opacity:0;transform:translateX(-24px) scaleX(1.4)}}@keyframes carSuspension{to{translate:0 -3px}}@keyframes finishFlash{to{filter:brightness(1.7);box-shadow:0 0 32px #fde68a}}@keyframes auraPulse{to{transform:scale(1.15);opacity:.42}}@keyframes giftBounce{to{transform:translateY(-9px) rotateY(8deg)}}@keyframes doorFloat{to{transform:translateY(-8px) rotateY(7deg)}}@keyframes revealPop{from{transform:scale(.65) rotateY(80deg);filter:brightness(2)}to{transform:scale(1);filter:brightness(1)}}@keyframes ticketFloat{to{transform:translateY(-18px) rotate(12deg)}}@keyframes badgePulse{50%{transform:scale(1.12) rotate(8deg)}}@keyframes carRace{0%{transform:translateX(0)}12%{transform:translateX(8%)}48%{transform:translateX(48%)}72%{transform:translateX(78%)}88%{transform:translateX(105%)}100%{transform:translateX(124%)}}@keyframes wheelRoll{to{transform:rotate(360deg)}}@keyframes planetOrbit{from{transform:translate(-50%,-50%) rotate(var(--orbit-start)) translateX(var(--orbit-radius))}to{transform:translate(-50%,-50%) rotate(calc(var(--orbit-start) + 360deg)) translateX(var(--orbit-radius))}}@keyframes planetCounterOrbit{from{transform:rotate(calc(-1 * var(--orbit-start)))}to{transform:rotate(calc(-1 * (var(--orbit-start) + 360deg)))}}@keyframes orbBreathe{to{filter:brightness(1.28);box-shadow:inset -9px -8px 13px #020617aa,inset 4px 3px 8px #ffffffaa,0 0 28px #67e8f9aa}}@keyframes planetWinner{from{opacity:.3;transform:translate(-50%,-50%) scale(.25) rotate(-90deg)}to{opacity:1;transform:translate(-50%,-50%) scale(1.75) rotate(0)}}@keyframes namePop{from{opacity:0;transform:scale(.5) rotateX(45deg)}to{opacity:1;transform:scale(1) rotateX(0)}}@keyframes resultGlow{to{box-shadow:inset 0 1px 1px #fff8,0 0 55px #a78bfa66}}@keyframes countdownFlash{to{filter:brightness(1.25);transform:translateX(-50%) scale(1.04)}}@keyframes orbitSpin{to{transform:translate(-50%,-50%) rotateX(68deg) rotateZ(360deg)}}
      @media(max-width:650px){.door-grid{grid-template-columns:repeat(4,minmax(50px,1fr))}.wheel-student{font-size:8px}.race-stage{min-height:340px;height:58vh}.space-stage{min-height:280px}.space-planet{min-width:42px}.space-planet-content>b{font-size:8px;padding:2px 5px}}
      @media(prefers-reduced-motion:reduce){.projector-root *{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important}}
    `}</style>
  </main>;
}
