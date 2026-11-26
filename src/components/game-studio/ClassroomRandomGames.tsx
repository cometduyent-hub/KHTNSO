"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import * as XLSX from "xlsx";

type Student = { id: string; name: string; code?: string };
type ClassRow = { id: string; name: string; grade: string; status: string };
type GameMode = "wheel" | "gift" | "draw" | "teams" | "doors" | "race" | "capsule";

const COLORS = ["#7c3aed", "#db2777", "#ea580c", "#0891b2", "#16a34a", "#2563eb", "#ca8a04", "#9333ea"];
const MODES: { id: GameMode; title: string; icon: string; desc: string }[] = [
  { id: "wheel", title: "Vòng quay may mắn", icon: "🎡", desc: "Quay thật, kim chỉ đúng tên người trúng" },
  { id: "gift", title: "Hộp quà bí ẩn", icon: "🎁", desc: "Mỗi hộp đã được gán sẵn một học sinh" },
  { id: "draw", title: "Bốc thăm may mắn", icon: "🎟️", desc: "Rút phiếu một hoặc nhiều học sinh, không trùng" },
  { id: "teams", title: "Ghép đội tốc độ", icon: "🏁", desc: "Chia đều thành 2, 3, 4, 5, 6 hoặc 8 đội" },
  { id: "doors", title: "Ô cửa bí mật", icon: "🚪", desc: "Mở ô đã gán tên và nhiệm vụ bí mật" },
  { id: "race", title: "Đường đua thần tốc", icon: "🏎️", desc: "Các tay đua xuất phát, người về đích được gọi tên" },
  { id: "capsule", title: "Viên nang vũ trụ", icon: "🪐", desc: "Mở khoang không gian để khám phá tên bí mật" },
];
const TASKS = ["Lên bảng giải bài tập", "Trả lời câu hỏi nhanh", "Giải thích một hiện tượng KHTN", "Trình bày kết quả thí nghiệm", "Đại diện nhóm báo cáo", "Nêu một ví dụ thực tế", "Vẽ sơ đồ hoặc hình minh họa", "Phản biện câu trả lời của bạn"];
const norm = (v: unknown) => String(v ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[đĐ]/g, "d").trim();
const identity = (s: Student) => s.code ? `code:${norm(s.code)}` : `name:${norm(s.name)}`;
function shuffle<T>(input: T[]): T[] { const a = [...input]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function uniqueStudents(list: Student[]) { const seen = new Set<string>(); return list.filter(s => { const k = identity(s); if (!s.name.trim() || seen.has(k)) return false; seen.add(k); return true; }); }
function readHeader(row: Record<string, unknown>, candidates: string[]) { const keys = Object.keys(row); const found = keys.find(k => candidates.includes(norm(k).replace(/[ _-]/g, ""))); return found ? row[found] : undefined; }
function piePath(cx: number, cy: number, r: number, start: number, end: number) { if (end - start >= 359.9) return `M ${cx} ${cy-r} A ${r} ${r} 0 1 1 ${cx} ${cy+r} A ${r} ${r} 0 1 1 ${cx} ${cy-r} Z`; const rad = (d: number) => (d - 90) * Math.PI / 180; const x1 = cx + r * Math.cos(rad(start)), y1 = cy + r * Math.sin(rad(start)); const x2 = cx + r * Math.cos(rad(end)), y2 = cy + r * Math.sin(rad(end)); const large = end - start > 180 ? 1 : 0; return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`; }

export default function ClassroomRandomGames({ onRosterChange }: { onRosterChange?: (students: Student[]) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [classId, setClassId] = useState("");
  const [roster, setRoster] = useState<Student[]>([]);
  const [mode, setMode] = useState<GameMode>("wheel");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [source, setSource] = useState("Chưa chọn danh sách");
  const [search, setSearch] = useState("");
  const [excludePicked, setExcludePicked] = useState(true);
  const [pickCount, setPickCount] = useState(1);
  const [teamCount, setTeamCount] = useState(4);
  const [picked, setPicked] = useState<Student[]>([]);
  const [history, setHistory] = useState<Student[]>([]);
  const [teams, setTeams] = useState<Student[][]>([]);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [boxMap, setBoxMap] = useState<(Student | null)[]>([]);
  const [openedBoxes, setOpenedBoxes] = useState<number[]>([]);
  const [doorMap, setDoorMap] = useState<({ student: Student; task: string } | null)[]>([]);
  const [openedDoors, setOpenedDoors] = useState<number[]>([]);
  const [confetti, setConfetti] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [taskChoice, setTaskChoice] = useState("Tự chọn nhiệm vụ ngẫu nhiên");
  const [currentTask, setCurrentTask] = useState("");
  const [callStats, setCallStats] = useState<Record<string, { name: string; code?: string; count: number }>>({});
  const [musicHint, setMusicHint] = useState("Nhạc nền phát trên màn chiếu sau khi bật âm thanh.");
  const [presentation, setPresentation] = useState<{ id: number; kind: "race" | "capsule"; phase: "running" | "complete"; participants: Student[]; winner: Student; task: string } | null>(null);
  const projectorChannelRef = useRef<BroadcastChannel | null>(null);
  const animationTimerRef = useRef<number | null>(null);

  useEffect(() => {
    try { setCallStats(JSON.parse(localStorage.getItem("khtn-classroom-call-stats-v1") || "{}")); } catch { setCallStats({}); }
  }, []);

  useEffect(() => {
    try { projectorChannelRef.current = new BroadcastChannel("khtn-classroom-projector-v1"); } catch { projectorChannelRef.current = null; }
    return () => { projectorChannelRef.current?.close(); if (animationTimerRef.current) window.clearTimeout(animationTimerRef.current); };
  }, []);

  useEffect(() => {
    const snapshot = { mode, picked, currentTask, roster, wheelRotation, spinning, boxMap, openedBoxes, doorMap, openedDoors, teams, presentation, notice, updatedAt: Date.now() };
    try { localStorage.setItem("khtn-classroom-projector-v1", JSON.stringify(snapshot)); } catch { /* Storage is optional. */ }
    try { projectorChannelRef.current?.postMessage(snapshot); } catch { /* Storage event remains as fallback. */ }
  }, [mode, picked, currentTask, roster, wheelRotation, spinning, boxMap, openedBoxes, doorMap, openedDoors, teams, presentation, notice]);

  function updateCallStats(students: Student[], direction = 1) {
    setCallStats(prev => {
      const next = { ...prev };
      students.forEach(student => {
        const key = identity(student); const old = next[key]?.count || 0;
        next[key] = { name: student.name, code: student.code, count: Math.max(0, old + direction) };
      });
      try { localStorage.setItem("khtn-classroom-call-stats-v1", JSON.stringify(next)); } catch { /* Storage is optional. */ }
      return next;
    });
  }

  function openProjector() {
    const win = window.open("/game-studio/projector", "khtn-classroom-projector", "popup=yes,width=1280,height=800");
    if (!win) setNotice("Trình duyệt đã chặn cửa sổ máy chiếu. Hãy cho phép pop-up cho trang này.");
    else setNotice("Đã mở màn hình trình chiếu riêng. Hãy kéo cửa sổ sang máy chiếu và nhấn F11.");
  }

  const notifyRoster = useCallback((next: Student[]) => { const clean = uniqueStudents(next); setPresentation(null); if (animationTimerRef.current) window.clearTimeout(animationTimerRef.current); setRoster(clean); onRosterChange?.(clean); setPicked([]); setHistory([]); setTeams([]); setOpenedBoxes([]); setOpenedDoors([]); setNotice(`Danh sách hiện có ${clean.length} học sinh.`); }, [onRosterChange]);
  const loadClasses = useCallback(async () => {
    if (!supabase) { setNotice("Chưa cấu hình Supabase."); return; }
    setBusy(true); setNotice("");
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { setNotice("Vui lòng đăng nhập bằng tài khoản giáo viên hoặc admin."); setBusy(false); return; }
    const { data: profile, error: profileError } = await supabase.from("profiles").select("role,active").eq("id", auth.user.id).maybeSingle();
    if (profileError || !profile?.active || !["admin", "teacher"].includes(profile.role)) { setNotice(profileError?.message || "Tài khoản hiện tại chưa có quyền giáo viên/admin."); setBusy(false); return; }
    const { data, error } = await supabase.from("classes").select("id,name,grade,status").eq("status", "active").order("grade").order("name");
    if (error) setNotice(`Không tải được lớp học: ${error.message}`);
    else { setClasses((data || []) as ClassRow[]); if (!data?.length) setNotice("Chưa tìm thấy lớp đang hoạt động mà tài khoản có quyền xem. Kiểm tra CMS Lớp học và quyền RLS."); }
    setBusy(false);
  }, []);
  useEffect(() => { void loadClasses(); }, [loadClasses]);

  const loadStudents = useCallback(async (id: string) => {
    if (!supabase || !id) return;
    const cls = classes.find(c => c.id === id); if (!cls) return;
    setBusy(true); setNotice(`Đang tải học sinh lớp ${cls.name}…`); setClassId(id);
    const { data: members, error: memberError } = await supabase.from("class_members").select("user_id,member_role,active").eq("class_id", id).eq("active", true).eq("member_role", "student");
    if (memberError) { setNotice(`Không đọc được thành viên lớp: ${memberError.message}. Hãy kiểm tra quyền đọc class_members trong Supabase.`); setBusy(false); return; }
    const ids = [...new Set((members || []).map(m => m.user_id).filter(Boolean))];
    let profiles: any[] = [];
    if (ids.length) {
      const { data, error } = await supabase.from("profiles").select("id,full_name,student_code,role,active").in("id", ids).eq("active", true).eq("role", "student").order("full_name");
      if (error) { setNotice(`Đã tìm thấy ${ids.length} liên kết nhưng không đọc được hồ sơ học sinh: ${error.message}`); setBusy(false); return; }
      profiles = data || [];
    }
    // Compatibility fallback: older CMS imports may have populated profiles.class_name/grade without class_members rows.
    if (!profiles.length) {
      const { data: legacy, error: legacyError } = await supabase.from("profiles").select("id,full_name,student_code,role,active").eq("active", true).eq("role", "student").eq("class_name", cls.name).eq("grade", String(cls.grade)).order("full_name");
      if (!legacyError) profiles = legacy || [];
      else { setNotice(`Lớp chưa có thành viên class_members; cũng không đọc được hồ sơ theo class_name: ${legacyError.message}`); setBusy(false); return; }
    }
    const loaded = uniqueStudents(profiles.map(p => ({ id: p.id, name: String(p.full_name || p.student_code || "Học sinh").trim(), code: p.student_code || undefined })));
    notifyRoster(loaded); setSource(`Lớp ${cls.name} · Khối ${cls.grade}`);
    setNotice(loaded.length ? `Đã liên kết thành công ${loaded.length} học sinh từ lớp ${cls.name}.` : `Lớp ${cls.name} chưa có hồ sơ học sinh hoạt động. Hãy thêm học sinh trong CMS · Lớp học hoặc tải Excel.`);
    setBusy(false);
  }, [classes, notifyRoster]);

  function importFile(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const wb = XLSX.read(e.target?.result, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]]; if (!sheet) throw new Error("Tệp không có trang tính đầu tiên.");
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
        const parsed = rows.map((r, i) => {
          const name = String(readHeader(r, ["hoten", "hovaten", "fullname", "name", "tenhocsinh"]) ?? Object.values(r)[0] ?? "").trim();
          const code = String(readHeader(r, ["mahocsinh", "studentcode", "code", "maso"]) ?? "").trim();
          return { id: `file-${i}-${norm(code || name)}`, name, code: code || undefined };
        }).filter(s => s.name);
        if (!parsed.length) throw new Error("Không tìm thấy cột Họ tên. Mẫu chuẩn: Họ và tên | Mã học sinh.");
        notifyRoster(parsed); setClassId(""); setSource(`Tệp ${file.name}`);
      } catch (err: any) { setNotice(err?.message || "Không đọc được tệp danh sách."); }
      if (fileRef.current) fileRef.current.value = "";
    };
    reader.readAsArrayBuffer(file);
  }
  function downloadTemplate() {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["STT", "Họ và tên", "Mã học sinh"], [1, "Nguyễn Văn A", "7A01"], [2, "Trần Thị B", "7A02"]]), "Danh sach lop");
    XLSX.writeFile(wb, "mau-danh-sach-lop.xlsx");
  }
  function pasteNames(value: string) {
    const rows = value.split(/\r?\n/).map((line, i) => {
      const parts = line.split(/[\t,;]+/).map(x => x.trim());
      const name = parts[0] || ""; const code = parts[1] || "";
      return { id: `paste-${i}-${norm(code || name)}`, name, code: code || undefined };
    }).filter(s => s.name);
    notifyRoster(rows); setClassId(""); setSource("Danh sách dán nhanh");
  }

  const calledKeys = useMemo(() => new Set(history.map(identity)), [history]);
  const available = useMemo(() => roster.filter(s => !excludePicked || !calledKeys.has(identity(s))), [roster, excludePicked, calledKeys]);
  const filteredRoster = useMemo(() => roster.filter(s => norm(`${s.name} ${s.code || ""}`).includes(norm(search))), [roster, search]);
  const wheelStudents = roster;
  const wheelSlices = useMemo(() => wheelStudents.map((s, i) => ({ student: s, start: i * 360 / Math.max(1, wheelStudents.length), end: (i + 1) * 360 / Math.max(1, wheelStudents.length) })), [wheelStudents]);

  function playSound(kind: "win" | "open" = "win") {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext; if (!AudioCtx) return;
      const ctx = new AudioCtx(); const notes = kind === "win" ? [523, 659, 784, 1047] : [392, 587, 784];
      notes.forEach((freq, i) => { const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.frequency.value = freq; osc.type = "sine"; gain.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.09); gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + i * 0.09 + 0.02); gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.09 + 0.18); osc.connect(gain); gain.connect(ctx.destination); osc.start(ctx.currentTime + i * 0.09); osc.stop(ctx.currentTime + i * 0.09 + 0.2); });
      window.setTimeout(() => void ctx.close(), 1200);
    } catch { /* Audio is optional; game mechanics remain usable. */ }
  }
  function celebrate() { setConfetti(true); playSound("win"); window.setTimeout(() => setConfetti(false), 2200); }
  function commitPicks(students: Student[], label: string) {
    const valid = excludePicked ? students.filter(s => s && !history.some(h => identity(h) === identity(s))) : students.filter(Boolean);
    if (!valid.length) { setNotice("Không còn học sinh phù hợp. Hãy đặt lại lượt hoặc tắt chế độ không gọi trùng."); return; }
    setPicked(valid); setHistory(h => [...h, ...valid]); updateCallStats(valid, 1); setCurrentTask(taskChoice === "Tự chọn nhiệm vụ ngẫu nhiên" ? TASKS[Math.floor(Math.random() * TASKS.length)] : taskChoice); setNotice(`${label}: ${valid.map(s => s.name).join(", ")}`); celebrate();
  }
  function drawStudents(count = 1) {
    if (!roster.length) { setNotice("Hãy chọn lớp hoặc tải danh sách học sinh trước."); return; }
    if (!available.length) { setNotice("Đã gọi hết danh sách hiện tại. Hãy đặt lại lượt gọi."); return; }
    commitPicks(shuffle(available).slice(0, Math.min(count, available.length)), "Kết quả bốc thăm");
  }
  function callNextStudent() {
    if (mode === "wheel") { spinWheel(); return; }
    if (mode === "race") { startAnimatedSelection("race"); return; }
    if (mode === "capsule") { startAnimatedSelection("capsule"); return; }
    if (mode === "gift") { if (!boxMap.length) prepareBoxes(); else { const next = boxMap.findIndex((student, i) => !!student && !openedBoxes.includes(i)); if (next >= 0) openBox(next); else setNotice("Các hộp đã mở hết. Hãy xáo trộn lượt mới."); } return; }
    if (mode === "doors") { if (!doorMap.length) prepareDoors(); else { const next = doorMap.findIndex((item, i) => !!item && !openedDoors.includes(i)); if (next >= 0) openDoor(next); else setNotice("Các ô cửa đã mở hết. Hãy tạo lượt mới."); } return; }
    drawStudents(1);
  }

  function startAnimatedSelection(kind: "race" | "capsule") {
    if (!available.length) { setNotice("Đã gọi hết danh sách. Hãy đặt lại lượt gọi."); return; }
    if (animationTimerRef.current) window.clearTimeout(animationTimerRef.current);
    const participants = shuffle(available).slice(0, Math.min(kind === "race" ? 5 : 20, available.length));
    const winner = participants[Math.floor(Math.random() * participants.length)];
    const task = taskChoice === "Tự chọn nhiệm vụ ngẫu nhiên" ? TASKS[Math.floor(Math.random() * TASKS.length)] : taskChoice;
    setPicked([]); setCurrentTask("");
    setPresentation({ id: Date.now(), kind, phase: "running", participants, winner, task });
    setNotice(kind === "race" ? "🏁 Các tay đua đang tăng tốc! Chờ cán đích…" : "🪐 Các hành tinh đang chuyển động hỗn loạn! Đang dò tín hiệu…");
    playSound("open");
    animationTimerRef.current = window.setTimeout(() => {
      setPicked([winner]); setHistory(h => [...h, winner]); updateCallStats([winner], 1); setCurrentTask(task);
      setPresentation(prev => prev ? { ...prev, phase: "complete" } : prev);
      setNotice(`🎉 ${winner.name} đã được chọn!`); celebrate();
    }, kind === "race" ? 5900 : 6500);
  }

  function spinWheel() {
    if (spinning || !roster.length) return;
    const pool = available; if (!pool.length) { setNotice("Đã gọi hết danh sách. Hãy đặt lại lượt gọi."); return; }
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    const wheelIndex = wheelStudents.findIndex(s => identity(s) === identity(chosen));
    if (wheelIndex < 0) { commitPicks([chosen], "Vòng quay"); return; }
    const n = wheelStudents.length; const center = (wheelIndex + 0.5) * 360 / n;
    const current = wheelRotation % 360; const delta = (360 - center - current + 360) % 360;
    setSpinning(true); setPicked([]); setWheelRotation(v => v + 360 * 6 + delta); setNotice("Vòng quay đang chạy…");
    window.setTimeout(() => { setPicked([chosen]); setHistory(h => [...h, chosen]); updateCallStats([chosen], 1); setCurrentTask(taskChoice === "Tự chọn nhiệm vụ ngẫu nhiên" ? TASKS[Math.floor(Math.random() * TASKS.length)] : taskChoice); setSpinning(false); setNotice(`🎉 Chúc mừng ${chosen.name}!`); celebrate(); }, 4300);
  }
  function prepareBoxes() {
    const pool = shuffle(available); const mapped = Array.from({ length: 8 }, (_, i) => pool[i] || null);
    setBoxMap(mapped); setOpenedBoxes([]); setPicked([]); setNotice("Đã xáo trộn và niêm phong 8 hộp. Mỗi hộp giữ một tên riêng."); playSound("open");
  }
  function openBox(i: number) {
    if (openedBoxes.includes(i)) return;
    const student = boxMap[i]; if (!student) { setNotice("Hộp này không có tên vì số học sinh còn lại ít hơn số hộp."); return; }
    setOpenedBoxes(a => [...a, i]); commitPicks([student], `Hộp quà ${i + 1}`);
  }
  function prepareDoors() {
    const pool = shuffle(available);
    setDoorMap(Array.from({ length: 12 }, (_, i) => pool[i] ? ({ student: pool[i], task: TASKS[Math.floor(Math.random() * TASKS.length)] }) : null));
    setOpenedDoors([]); setPicked([]); setNotice("12 ô đã được gán tên và nhiệm vụ bí mật. Hãy mời học sinh chọn ô."); playSound("open");
  }
  function openDoor(i: number) {
    if (openedDoors.includes(i)) return;
    const item = doorMap[i]; if (!item?.student) return;
    setOpenedDoors(a => [...a, i]); setCurrentTask(item.task); commitPicks([item.student], `Ô cửa ${i + 1} · ${item.task}`); setCurrentTask(item.task);
    setNotice(`🚪 ${item.student.name} · Nhiệm vụ: ${item.task}`);
  }
  function makeTeams() {
    if (!roster.length) { setNotice("Chưa có danh sách học sinh."); return; }
    const shuffled = shuffle(roster); const count = Math.min(teamCount, shuffled.length);
    const result = Array.from({ length: count }, () => [] as Student[]);
    shuffled.forEach((s, i) => result[i % count].push(s));
    setTeams(result); setMode("teams"); setNotice(`Đã chia ${shuffled.length} học sinh thành ${count} đội; số lượng mỗi đội lệch tối đa 1.`); playSound("win");
  }
  function undoLast() {
    if (!history.length) return; if (animationTimerRef.current) window.clearTimeout(animationTimerRef.current); setPresentation(null);
    const last = history[history.length - 1]; updateCallStats([last], -1); setHistory(h => h.slice(0, -1)); setPicked([]); setNotice(`Đã hoàn tác lượt gọi: ${last.name}. Học sinh đã trở lại danh sách có thể chọn.`);
    setOpenedBoxes([]); setOpenedDoors([]); setBoxMap([]); setDoorMap([]);
  }
  function returnPicked() { if (!picked.length) return; setPresentation(null); const returned = picked.filter(s => history.some(h => identity(h) === identity(s))); updateCallStats(returned, -1); setHistory(h => h.filter(s => !returned.some(r => identity(r) === identity(s)))); setPicked([]); setCurrentTask(""); setNotice(`Đã đưa ${returned.map(s => s.name).join(", ")} trở lại danh sách chưa gọi.`); }
  function resetRound() { if (animationTimerRef.current) window.clearTimeout(animationTimerRef.current); setPresentation(null); updateCallStats(history, -1); setHistory([]); setPicked([]); setTeams([]); setOpenedBoxes([]); setOpenedDoors([]); setBoxMap([]); setDoorMap([]); setNotice("Đã đặt lại lượt gọi. Tất cả học sinh được đưa trở lại."); }
  function exportRoster() {
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(roster.map((s, i) => ({ STT: i + 1, "Họ và tên": s.name, "Mã học sinh": s.code || "" }))), "Danh sach lop"); XLSX.writeFile(wb, "danh-sach-hoc-sinh.xlsx");
  }
  function exportTeams() {
    if (!teams.length) return;
    const rows = teams.flatMap((t, i) => t.map((s, j) => ({ "Đội": `Đội ${i + 1}`, STT: j + 1, "Họ và tên": s.name, "Mã học sinh": s.code || "" })));
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Ket qua chia doi"); XLSX.writeFile(wb, "ket-qua-chia-doi.xlsx");
  }
  async function toggleFullscreen() {
    try { if (!document.fullscreenElement) { await document.documentElement.requestFullscreen(); setFullscreen(true); } else { await document.exitFullscreen(); setFullscreen(false); } } catch { setNotice("Trình duyệt không cho phép bật toàn màn hình."); }
  }

  return <section className="mt-5 space-y-5 rounded-3xl bg-white p-4 shadow-xl sm:p-6">
    <header className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black tracking-[.18em] text-violet-700">CLASSROOM RANDOM GAME · VẬN HÀNH THEO DANH SÁCH THẬT</p><h2 className="mt-1 text-2xl font-black text-slate-950">01 · Danh sách lớp & bộ trò chơi gọi tên</h2><p className="mt-1 text-sm text-slate-600">Chọn lớp từ Supabase hoặc nhập Excel. Mọi trò chơi đều dùng chung một danh sách và một lịch sử chống trùng.</p></div><button onClick={() => void toggleFullscreen()} className="rounded-xl border px-3 py-2 text-sm font-bold">⛶ {fullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}</button></header>
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="rounded-2xl border bg-slate-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2"><b className="text-slate-900">Nguồn danh sách học sinh</b><button onClick={() => void loadClasses()} disabled={busy} className="rounded-lg border bg-white px-3 py-2 text-sm font-bold">↻ Tải lớp</button></div>
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
          <select value={classId} onChange={e => { const id = e.target.value; if (id) void loadStudents(id); else { setClassId(""); notifyRoster([]); setSource("Chưa chọn danh sách"); } }} className="min-w-0 rounded-xl border bg-white p-3 text-sm"><option value="">Chọn lớp đã tạo trong CMS…</option>{classes.map(c => <option key={c.id} value={c.id}>Lớp {c.name} · Khối {c.grade}</option>)}</select>
          <button onClick={() => fileRef.current?.click()} className="rounded-xl bg-indigo-700 px-4 py-3 text-sm font-black text-white">⬆ Tải Excel/CSV</button><button onClick={downloadTemplate} className="rounded-xl border bg-white px-3 py-3 text-sm font-bold">Mẫu Excel</button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={e => importFile(e.target.files?.[0])}/>
        </div>
        <label className="mt-3 block text-sm font-bold text-slate-700">Dán danh sách nhanh <span className="font-normal text-slate-500">(mỗi dòng: Họ tên hoặc Họ tên, mã học sinh)</span><textarea className="mt-1 w-full rounded-xl border bg-white p-3 font-normal" rows={3} placeholder={'Nguyễn Văn A, 7A01\nTrần Thị B, 7A02'} onBlur={e => { if (e.target.value.trim()) pasteNames(e.target.value); }}/></label>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm"><span className="rounded-full bg-indigo-100 px-3 py-1 font-bold text-indigo-900">{source}</span><span className="font-black text-slate-800">{roster.length} học sinh · {available.length} chưa gọi</span></div>
        <div className="mt-3 flex flex-wrap gap-2"><button onClick={exportRoster} disabled={!roster.length} className="rounded-lg border bg-white px-3 py-2 text-sm font-bold disabled:opacity-40">⬇ Xuất danh sách</button><button onClick={() => { setRoster([]); onRosterChange?.([]); setClassId(""); setSource("Chưa chọn danh sách"); resetRound(); }} className="rounded-lg border bg-white px-3 py-2 text-sm font-bold">Xóa danh sách</button><label className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm"><input type="checkbox" checked={excludePicked} onChange={e => setExcludePicked(e.target.checked)}/> Không gọi trùng</label></div>
      </div>
      <aside className="rounded-2xl bg-slate-950 p-4 text-white"><div className="text-xs font-black tracking-widest text-cyan-200">BẢNG ĐIỀU KHIỂN LƯỢT GỌI</div><div className="mt-3 grid grid-cols-2 gap-2"><div className="rounded-xl bg-white/10 p-3"><div className="text-xs text-slate-300">Tổng học sinh</div><div className="text-3xl font-black">{roster.length}</div></div><div className="rounded-xl bg-white/10 p-3"><div className="text-xs text-slate-300">Đã gọi</div><div className="text-3xl font-black">{history.length}</div></div></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${roster.length ? history.length / roster.length * 100 : 0}%` }}/></div><p className="mt-2 text-xs text-slate-300">Tiến độ gọi tên: {roster.length ? Math.round(history.length / roster.length * 100) : 0}%</p><div className="mt-4 flex gap-2"><button onClick={undoLast} disabled={!history.length} className="flex-1 rounded-lg bg-amber-300 px-3 py-2 text-sm font-black text-slate-950 disabled:opacity-40">↶ Hoàn tác</button><button onClick={resetRound} disabled={!history.length && !teams.length} className="flex-1 rounded-lg border border-white/30 px-3 py-2 text-sm font-bold disabled:opacity-40">↻ Đặt lại</button></div><p className="mt-3 text-xs text-slate-300">Lịch sử được dùng chung cho cả 5 trò chơi trong phiên hiện tại.</p></aside>
    </div>
    <div><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-black text-slate-900">02 · Chọn trò chơi</h3><button onClick={openProjector} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white">🖥️ Mở màn hình máy chiếu riêng</button></div><div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-7">{MODES.map(m => <button key={m.id} onClick={() => { if (animationTimerRef.current) window.clearTimeout(animationTimerRef.current); setMode(m.id); setPicked([]); setPresentation(null); }} className={`rounded-2xl border-2 p-3 text-left transition ${mode === m.id ? "border-violet-600 bg-violet-50 ring-2 ring-violet-100" : "border-slate-200 hover:border-violet-300"}`}><span className="text-3xl">{m.icon}</span><b className="mt-2 block text-sm text-slate-900">{m.title}</b><span className="mt-1 block text-xs text-slate-500">{m.desc}</span></button>)}</div></div>
    <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 p-4 text-white sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black tracking-widest text-cyan-200">{MODES.find(m => m.id === mode)?.icon} CLASSROOM GAME</p><h3 className="mt-1 text-2xl font-black">{MODES.find(m => m.id === mode)?.title}</h3></div><div className="flex flex-wrap items-center gap-2"><label className="text-xs">Nhiệm vụ đi kèm<select value={taskChoice} onChange={e => setTaskChoice(e.target.value)} className="ml-2 max-w-52 rounded-lg p-2 text-xs font-bold text-slate-900"><option>Tự chọn nhiệm vụ ngẫu nhiên</option>{TASKS.map(task => <option key={task}>{task}</option>)}</select></label><label className="text-xs">Số học sinh<input type="number" min={1} max={Math.max(1, available.length)} value={pickCount} onChange={e => setPickCount(Math.max(1, Math.min(available.length || 1, Number(e.target.value) || 1)))} className="ml-2 w-16 rounded-lg p-2 text-center font-black text-slate-900"/></label></div></div>
      {mode === "wheel" && <div className="mt-5 flex flex-col items-center"><div className="relative h-[min(78vw,390px)] w-[min(78vw,390px)]"><div className="absolute -top-3 left-1/2 z-20 -translate-x-1/2 text-4xl drop-shadow">🔻</div><svg viewBox="0 0 400 400" className="h-full w-full overflow-visible drop-shadow-2xl" style={{ transform: `rotate(${wheelRotation}deg)`, transition: spinning ? "transform 4.2s cubic-bezier(.12,.78,.12,1)" : "none" }}><circle cx="200" cy="200" r="194" fill="#fff" stroke="#fbbf24" strokeWidth="8"/>{wheelSlices.map((slice, i) => { const mid = (slice.start + slice.end) / 2; const r = 200; const labelX = 200 + 125 * Math.sin(mid * Math.PI / 180); const labelY = 200 - 125 * Math.cos(mid * Math.PI / 180); return <g key={identity(slice.student)}><path d={piePath(200, 200, r, slice.start, slice.end)} fill={COLORS[i % COLORS.length]} stroke="white" strokeWidth="2"/><text x={labelX} y={labelY} fill="white" fontSize={wheelStudents.length > 36 ? 5 : wheelStudents.length > 24 ? 6 : wheelStudents.length > 16 ? 8 : wheelStudents.length > 10 ? 10 : wheelStudents.length > 7 ? 12 : 14} fontWeight="800" textAnchor="middle" dominantBaseline="middle">{slice.student.name.length > (wheelStudents.length > 24 ? 9 : 15) ? `${slice.student.name.slice(0, wheelStudents.length > 24 ? 8 : 13)}…` : slice.student.name}</text></g>; })}<circle cx="200" cy="200" r="37" fill="#fff" stroke="#fbbf24" strokeWidth="5"/><text x="200" y="207" textAnchor="middle" fontSize="24">🎯</text></svg></div><button onClick={spinWheel} disabled={spinning || !available.length || !roster.length} className="mt-5 rounded-full bg-amber-300 px-10 py-4 text-xl font-black text-slate-950 shadow-xl disabled:opacity-40">{spinning ? "ĐANG QUAY…" : "QUAY NGAY"}</button><p className="mt-2 text-xs text-indigo-200">Toàn bộ học sinh trong danh sách đều có một phần trên vòng quay; với lớp đông, tên được rút gọn để vừa mặt vòng.</p></div>}
      {mode === "gift" && <div className="mt-5"><div className="flex flex-wrap justify-center gap-2"><button onClick={prepareBoxes} disabled={!available.length} className="rounded-xl bg-amber-300 px-4 py-2 font-black text-slate-950">🔀 Xáo trộn & niêm phong hộp</button></div><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{Array.from({ length: 8 }, (_, i) => <button key={i} disabled={openedBoxes.includes(i) || !boxMap[i]} onClick={() => openBox(i)} className={`rounded-2xl border-2 p-5 text-4xl shadow-lg transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50 ${openedBoxes.includes(i) ? "border-emerald-300 bg-emerald-100" : "border-amber-200 bg-gradient-to-br from-amber-200 to-orange-400"}`}>{openedBoxes.includes(i) ? "✨" : "🎁"}<span className="mt-2 block text-sm font-black text-slate-950">HỘP {i + 1}</span>{openedBoxes.includes(i) && <span className="mt-1 block text-xs text-slate-800">{boxMap[i]?.name}</span>}</button>)}</div>{!boxMap.length && <p className="mt-3 text-center text-sm text-indigo-100">Nhấn “Xáo trộn & niêm phong hộp” trước khi mời học sinh chọn.</p>}</div>}
      {mode === "draw" && <div className="mt-5 text-center"><div className="text-6xl">🎟️</div><p className="mt-3 text-indigo-100">Còn {available.length} phiếu chưa được rút</p><div className="mt-4 flex flex-wrap justify-center gap-3"><button onClick={() => drawStudents(1)} disabled={!available.length} className="rounded-xl bg-sky-300 px-6 py-3 font-black text-slate-950 disabled:opacity-40">BỐC 1 HỌC SINH</button><button onClick={() => drawStudents(pickCount)} disabled={!available.length} className="rounded-xl bg-white px-6 py-3 font-black text-indigo-950 disabled:opacity-40">BỐC {pickCount} HỌC SINH</button></div></div>}
      {mode === "teams" && <div className="mt-5"><div className="flex flex-wrap items-center justify-center gap-3"><label className="font-bold">Số đội <select value={teamCount} onChange={e => setTeamCount(Number(e.target.value))} className="ml-2 rounded-lg p-2 text-slate-900">{[2, 3, 4, 5, 6, 8].map(n => <option key={n} value={n}>{n} đội</option>)}</select></label><button onClick={makeTeams} disabled={!roster.length} className="rounded-xl bg-emerald-300 px-6 py-3 font-black text-emerald-950 disabled:opacity-40">🏁 GHÉP ĐỘI NGẪU NHIÊN</button></div>{teams.length > 0 && <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{teams.map((team, i) => <div key={i} className="rounded-2xl border border-white/20 p-4" style={{ background: `${COLORS[i % COLORS.length]}55` }}><div className="flex items-center justify-between"><b className="text-lg">ĐỘI {i + 1}</b><span className="rounded-full bg-white/20 px-2 py-1 text-xs font-black">{team.length} HS</span></div><ol className="mt-3 space-y-1 text-sm">{team.map((s, j) => <li key={identity(s)}>{j + 1}. {s.name}</li>)}</ol></div>)}</div>}{teams.length > 0 && <div className="mt-3 text-center"><button onClick={exportTeams} className="rounded-lg bg-white px-4 py-2 text-sm font-black text-emerald-950">⬇ Tải kết quả chia đội Excel</button></div>}</div>}
      {mode === "race" && <div className="mt-5 text-center"><div className="rounded-2xl border border-white/20 bg-white/10 p-5"><div className="text-6xl">🏁</div><p className="mt-2 text-xl font-black">SẴN SÀNG XUẤT PHÁT?</p><p className="mt-1 text-sm text-indigo-100">Tên học sinh được gắn lên xe; các xe tăng tốc và người thắng sẽ cán đích.</p><button onClick={() => startAnimatedSelection("race")} disabled={!available.length || presentation?.phase === "running"} className="mt-4 rounded-full bg-amber-300 px-8 py-3 font-black text-slate-950 disabled:opacity-40">🚦 BẮT ĐẦU CUỘC ĐUA</button></div></div>}
      {mode === "capsule" && <div className="mt-5 text-center"><div className="text-7xl [filter:drop-shadow(0_12px_20px_rgba(56,189,248,.45))]">🪐</div><p className="mt-2 text-lg font-black">TRẠM KHÔNG GIAN BÍ ẨN</p><p className="mt-1 text-sm text-indigo-100">Tên học sinh xuất hiện trên các hành tinh; hệ hành tinh xoay chuyển rồi dừng tại một bạn.</p><button onClick={() => startAnimatedSelection("capsule")} disabled={!available.length || presentation?.phase === "running"} className="mt-4 rounded-xl bg-cyan-300 px-8 py-3 font-black text-slate-950 disabled:opacity-40">🚀 KHỞI ĐỘNG KHÔNG GIAN</button></div>}
      {mode === "doors" && <div className="mt-5"><div className="text-center"><button onClick={prepareDoors} disabled={!available.length} className="rounded-xl bg-indigo-300 px-4 py-2 font-black text-indigo-950">🔐 Tạo lượt ô cửa mới</button><p className="mt-2 text-xs text-indigo-200">Tên học sinh và nhiệm vụ được gán kín trước khi mở ô.</p></div><div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">{Array.from({ length: 12 }, (_, i) => { const item = doorMap[i]; const opened = openedDoors.includes(i); return <button key={i} disabled={opened || !item} onClick={() => openDoor(i)} className={`min-h-28 rounded-2xl border-2 p-3 text-center shadow-lg transition hover:-translate-y-1 disabled:opacity-70 ${opened ? "border-emerald-200 bg-emerald-100 text-slate-900" : "border-indigo-300 bg-gradient-to-br from-indigo-500 to-blue-800 text-white"}`}><span className="text-3xl">{opened ? "🔓" : "🚪"}</span><b className="mt-1 block">Ô {i + 1}</b>{opened && item && <span className="mt-1 block text-xs font-bold">{item.student.name}<br/>{item.task}</span>}</button>; })}</div>{!doorMap.length && <p className="mt-3 text-center text-sm text-indigo-100">Tạo lượt ô cửa mới để gán học sinh và thử thách.</p>}</div>}
      {picked.length > 0 && mode !== "teams" && <div className="mt-5 rounded-2xl border-2 border-amber-300 bg-white p-5 text-center text-slate-950 shadow-xl"><div className="text-sm font-black tracking-widest text-violet-700">🎉 KẾT QUẢ ĐƯỢC CHỌN 🎉</div>{picked.map(s => <div key={identity(s)} className="mt-2 text-3xl font-black">{s.name}</div>)}{currentTask && <p className="mt-2 font-bold text-violet-800">Nhiệm vụ: {currentTask}</p>}</div>}
      {confetti && <div className="pointer-events-none fixed inset-0 z-50 flex items-start justify-around overflow-hidden text-4xl" aria-hidden="true">{["🎉", "✨", "🎊", "⭐", "🎉", "🌟", "🎊"].map((x, i) => <span key={i} className="animate-bounce" style={{ marginTop: `${8 + (i % 3) * 9}vh`, animationDelay: `${i * 80}ms` }}>{x}</span>)}</div>}
      <div className="mt-5 flex flex-wrap justify-center gap-2"><button onClick={callNextStudent} disabled={!available.length || spinning || presentation?.phase === "running"} className="rounded-lg bg-emerald-300 px-4 py-2 text-sm font-black text-slate-950 disabled:opacity-40">▶ Gọi học sinh tiếp theo</button><button onClick={returnPicked} disabled={!picked.length} className="rounded-lg bg-amber-200 px-4 py-2 text-sm font-black text-slate-950 disabled:opacity-40">↩ Đưa học sinh trở lại danh sách</button><button onClick={undoLast} disabled={!history.length} className="rounded-lg border border-white/30 px-4 py-2 text-sm font-bold disabled:opacity-40">↶ Hoàn tác tên vừa gọi</button><button onClick={resetRound} disabled={!history.length && !picked.length && presentation?.phase !== "running"} className="rounded-lg border border-white/30 px-4 py-2 text-sm font-bold disabled:opacity-40">↻ Đặt lại toàn bộ lượt</button></div>
    </div>
    <div className="grid gap-4 lg:grid-cols-3"><div className="rounded-2xl border p-4"><div className="flex items-center justify-between gap-2"><h3 className="font-black text-slate-900">03 · Danh sách học sinh ({roster.length})</h3><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm tên/mã…" className="w-40 rounded-lg border px-3 py-2 text-sm"/></div><div className="mt-3 max-h-64 overflow-y-auto">{filteredRoster.map((s, i) => <div key={identity(s)} className="flex items-center justify-between border-b py-2 text-sm"><span>{i + 1}. {s.name} {s.code && <small className="text-slate-400">· {s.code}</small>}</span><span className={`rounded-full px-2 py-1 text-xs font-bold ${calledKeys.has(identity(s)) ? "bg-slate-100 text-slate-500" : "bg-emerald-100 text-emerald-800"}`}>{calledKeys.has(identity(s)) ? "Đã gọi" : "Chưa gọi"}</span></div>)}{!roster.length && <p className="text-sm text-slate-500">Chưa có học sinh. Hãy chọn lớp hoặc tải danh sách.</p>}</div></div><div className="rounded-2xl border p-4"><h3 className="font-black text-slate-900">04 · Lịch sử gọi tên</h3><div className="mt-3 max-h-64 space-y-2 overflow-y-auto">{history.map((s, i) => <div key={`${identity(s)}-${i}`} className="flex items-center gap-3 rounded-lg bg-slate-50 p-2 text-sm"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-700 font-black text-white">{i + 1}</span><b className="text-slate-800">{s.name}</b><span className="ml-auto text-xs text-slate-400">{s.code || ""}</span></div>)}{!history.length && <p className="text-sm text-slate-500">Chưa có học sinh nào được gọi.</p>}</div></div><div className="rounded-2xl border p-4"><h3 className="font-black text-slate-900">05 · Thống kê qua các tiết học</h3><p className="mt-1 text-xs text-slate-500">Lưu trên máy tính giáo viên này, tiếp tục cộng dồn giữa các lần mở trang.</p><div className="mt-3 max-h-64 space-y-2 overflow-y-auto">{Object.values(callStats).filter(x => x.count > 0).sort((a,b) => b.count-a.count || a.name.localeCompare(b.name,"vi")).map((item,i)=><div key={`${item.code||item.name}-${i}`} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"><span>{item.name}</span><b className="rounded-full bg-violet-100 px-2 py-1 text-violet-800">{item.count} lần</b></div>)}{!Object.values(callStats).some(x => x.count > 0) && <p className="text-sm text-slate-500">Chưa có dữ liệu thống kê.</p>}</div><button onClick={() => { const rows=Object.values(callStats).map(x=>({"Họ và tên":x.name,"Mã học sinh":x.code||"","Số lần được gọi":x.count})); const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows),"Thong ke goi ten"); XLSX.writeFile(wb,"thong-ke-so-lan-duoc-goi.xlsx"); }} className="mt-3 rounded-lg border px-3 py-2 text-xs font-bold">⬇ Xuất thống kê Excel</button></div></div>
    {notice && <div role="status" className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-sm font-semibold text-indigo-950">{busy ? "⏳ " : "ℹ️ "}{notice}</div>}
  </section>;
}
