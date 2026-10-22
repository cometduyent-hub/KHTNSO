'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Level = { id: string; level_no: number; title: string };
type Question = { id: string; prompt: string; type: string; points: number; lesson_id: string | null; subject_code: string | null; difficulty: string | null };
type Challenge = { id: string; level_id: string; round_no: number; title: string; grade: string | null; subject_code: string | null; reward_diamonds: number; status: string };
const SUBJECTS = [
  { code: 'KHTN', label: 'KHTN', icon: '🔬' },
  { code: 'ENGLISH', label: 'Anh văn', icon: '🔤' },
  { code: 'MATH', label: 'Toán', icon: '📐' },
  { code: 'LITERATURE', label: 'Văn sử địa', icon: '📚' },
  { code: 'MIXED', label: 'Tổng hợp', icon: '🌈' },
];
const normalize = (v: unknown) => String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
function subjectMatches(q: Question, subject: string) {
  if (subject === 'MIXED') return true;
  if (q.subject_code) return normalize(q.subject_code) === normalize(subject);
  // Backward-compatible fallback for older questions without subject_code.
  const p = normalize(q.prompt);
  if (subject === 'KHTN') return /vat ly|vat li|hoa hoc|sinh hoc|khoa hoc tu nhien/.test(p);
  if (subject === 'ENGLISH') return /english|vocabulary|grammar|tiếng anh/.test(p);
  if (subject === 'MATH') return /toan|math|dai so|hinh hoc/.test(p);
  if (subject === 'LITERATURE_HISTORY_GEOGRAPHY') return /ngu van|lich su|dia ly|dia li|van hoc|history|geography/.test(p);
  return false;
}
export default function GameAdmin() {
  const [role, setRole] = useState('');
  const [levels, setLevels] = useState<Level[]>([]);
  const [qs, setQs] = useState<Question[]>([]);
  const [rows, setRows] = useState<Challenge[]>([]);
  const [level, setLevel] = useState('');
  const [round, setRound] = useState('1');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('KHTN');
  const [grade, setGrade] = useState('7');
  const [reward, setReward] = useState('3');
  const [time, setTime] = useState('60');
  const [difficulty, setDifficulty] = useState('mixed');
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    if (!supabase) { setMsg('Chưa cấu hình Supabase.'); setLoading(false); return; }
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { setMsg('Vui lòng đăng nhập.'); setLoading(false); return; }
    const { data: profile } = await supabase.from('profiles').select('role,active').eq('id', auth.user.id).maybeSingle();
    setRole(profile?.role || '');
    if (!profile?.active || !['admin', 'teacher'].includes(profile?.role)) { setRole(''); setMsg('Cần quyền giáo viên hoặc admin.'); setLoading(false); return; }
    const [l, q, c] = await Promise.all([
      supabase.from('game_levels').select('id,level_no,title').order('level_no'),
      supabase.from('question_bank').select('id,prompt,type,points,lesson_id,subject_code,difficulty').eq('status','published').in('type',['mcq','tf','short']).order('created_at',{ascending:false}).limit(1000),
      supabase.from('game_challenges').select('id,level_id,round_no,title,grade,subject_code,reward_diamonds,status').order('round_no'),
    ]);
    const errors = [l.error, q.error, c.error].filter(Boolean);
    if (errors.length) setMsg(errors.map(e => e?.message).join(' · '));
    setLevels((l.data || []) as Level[]); setLevel(v => v || l.data?.[0]?.id || '');
    setQs((q.data || []) as Question[]); setRows((c.data || []) as Challenge[]); setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => qs.filter(q => {
    const sameSubject = subjectMatches(q, subject);
    const sameDifficulty = difficulty === 'mixed' || !q.difficulty || normalize(q.difficulty) === normalize(difficulty);
    return sameSubject && sameDifficulty && normalize(q.prompt).includes(normalize(query));
  }), [qs, subject, difficulty, query]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    if (!selected.length) { setMsg('Chọn ít nhất một câu hỏi đã xuất bản, đúng môn học và độ khó.'); return; }
    if (!level) { setMsg('Chưa có cấp độ game. Hãy kiểm tra dữ liệu game_levels.'); return; }
    setBusy(true); setMsg('');
    const subjectLabel = SUBJECTS.find(s => s.code === subject)?.label || subject;
    const cleanTitle = title.trim() || `Vòng ${round}`;
    const taggedTitle = subject === 'MIXED' ? `[Tổng hợp] ${cleanTitle}` : `[${subjectLabel}] ${cleanTitle}`;
    const { error } = await supabase.from('game_challenges').insert({
      level_id: level, round_no: Number(round), title: taggedTitle, grade,
      subject_code: subject, question_ids: selected, reward_diamonds: Number(reward) || 0,
      time_limit_seconds: time && Number(time) > 0 ? Number(time) : null,
      difficulty, status: 'published',
    });
    if (error) setMsg(`Không tạo được vòng: ${error.message}`);
    else { setMsg(`Đã tạo và xuất bản vòng môn ${subjectLabel} với ${selected.length} câu hỏi.`); setTitle(''); setSelected([]); await load(); }
    setBusy(false);
  }
  async function remove(c: Challenge) {
    if (!supabase || !confirm(`Xóa vòng ${c.round_no}: ${c.title}?`)) return;
    const { error } = await supabase.from('game_challenges').delete().eq('id', c.id);
    if (error) setMsg(error.message); else { setMsg('Đã xóa vòng.'); await load(); }
  }
  if (loading) return <main className="max-w-7xl mx-auto px-5 py-10"><div className="card">Đang tải công cụ quản lý game…</div></main>;
  if (!['admin','teacher'].includes(role)) return <main className="max-w-4xl mx-auto px-5 py-10"><div className="card"><h1 className="text-3xl font-black">CMS · Game</h1><p className="mt-3">{msg}</p><a className="btn bg-sky-900 text-white mt-4" href="/login">Đăng nhập</a></div></main>;

  return <main className="max-w-7xl mx-auto px-5 py-10">
    <h1 className="text-4xl font-black">CMS · Chinh phục đỉnh Bạch Mã</h1>
    <p className="text-slate-600 mt-2">Tạo vòng từ câu hỏi đã xuất bản. Đáp án vẫn được chấm bằng RPC server-side; không gửi khóa đáp án xuống trình duyệt.</p>
    <div className="card mt-4 border-sky-200 bg-sky-50"><h2 className="font-black">Quy trình tạo câu hỏi đúng</h2><ol className="list-decimal pl-5 mt-2 space-y-1 text-sm"><li>Vào CMS · Ngân hàng câu hỏi, nhập câu hỏi và đáp án chuẩn, chọn đúng môn học/mã môn, khối lớp và độ khó.</li><li>Xuất bản câu hỏi trước khi quay lại trang này. Câu nháp/ẩn không xuất hiện trong danh sách.</li><li>Chọn đúng cuộc leo núi, cấp độ, vòng và khối lớp; chọn cùng một môn học rồi mới chọn câu hỏi.</li><li>Đặt tên vòng ngắn, ví dụ “KHTN 7 · Tốc độ”; chọn số câu, thời gian và kim cương hợp lý rồi tạo vòng.</li><li>Vào `/game`, chọn cuộc leo núi tương ứng và thử mở vòng. Nếu không thấy vòng, kiểm tra nhãn môn học và trạng thái xuất bản.</li></ol><p className="mt-2 text-xs text-slate-600">Với câu Đúng/Sai, cần có đủ nội dung các ý và đáp án tương ứng trong ngân hàng; game hiện chỉ chọn loại MCQ, Đúng/Sai và trả lời ngắn.</p></div>
    <form className="card mt-6 grid md:grid-cols-3 gap-4" onSubmit={save}>
      <h2 className="md:col-span-3 text-xl font-black">Tạo vòng mới</h2>
      <label className="font-bold text-sm md:col-span-3">Cuộc leo núi<select className="input" value={subject} onChange={e=>{setSubject(e.target.value);setSelected([]);}} required>{SUBJECTS.map(s=><option key={s.code} value={s.code}>{s.icon} {s.label}</option>)}</select></label>
      <label className="font-bold text-sm">Cấp độ<select className="input" value={level} onChange={e=>setLevel(e.target.value)} required>{levels.map(l=><option key={l.id} value={l.id}>Cấp {l.level_no} · {l.title}</option>)}</select></label>
      <label className="font-bold text-sm">Vòng (1–30)<input className="input" type="number" min="1" max="30" value={round} onChange={e=>setRound(e.target.value)} required/></label>
      <label className="font-bold text-sm">Khối lớp<select className="input" value={grade} onChange={e=>setGrade(e.target.value)}>{['6','7','8','9','10','11','12'].map(g=><option key={g}>{g}</option>)}</select></label>
      <label className="font-bold text-sm md:col-span-2">Tên thử thách<input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder={`Vòng ${round} · chủ đề`}/></label>
      <label className="font-bold text-sm">Độ khó<select className="input" value={difficulty} onChange={e=>{setDifficulty(e.target.value);setSelected([]);}}>{['easy','mixed','hard','advanced'].map(x=><option key={x} value={x}>{({easy:'Dễ',mixed:'Hỗn hợp',hard:'Khó',advanced:'Nâng cao'} as Record<string,string>)[x]}</option>)}</select></label>
      <label className="font-bold text-sm">Kim cương tối đa<input className="input" type="number" min="0" max="100" value={reward} onChange={e=>setReward(e.target.value)}/></label>
      <label className="font-bold text-sm">Thời gian (giây; 0 = không giới hạn)<input className="input" type="number" min="0" max="3600" value={time} onChange={e=>setTime(e.target.value)}/></label>
      <div className="md:col-span-3"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-black">Chọn câu hỏi ({selected.length} đã chọn · {filtered.length} phù hợp)</h3><input className="input mt-0 max-w-sm" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tìm nội dung câu hỏi…"/></div>
        <p className="text-xs text-slate-500 mt-1">Chỉ hiện câu đã xuất bản, dạng trắc nghiệm/Đúng-Sai/trả lời ngắn, theo môn và độ khó đang chọn. Các câu cũ chưa có mã môn chỉ được nhận diện khi nội dung có từ khóa phù hợp; nên bổ sung mã môn trong ngân hàng.</p>
        <div className="max-h-80 overflow-y-auto border rounded-xl p-2 mt-3 space-y-2">{filtered.map(q=><label className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50" key={q.id}><input type="checkbox" className="mt-1" checked={selected.includes(q.id)} onChange={e=>setSelected(a=>e.target.checked?[...a,q.id]:a.filter(id=>id!==q.id))}/><span className="min-w-0"><span className="text-xs bg-slate-100 rounded px-2 py-1">{q.type} · {q.points} điểm · {q.subject_code || 'chưa gắn mã môn'}{q.difficulty ? ` · ${q.difficulty}` : ''}</span><span className="block mt-1 whitespace-pre-wrap">{q.prompt}</span></span></label>)}{filtered.length===0&&<p className="text-slate-500 p-3">Không có câu phù hợp. Hãy xuất bản câu hỏi và kiểm tra mã môn/độ khó trong ngân hàng câu hỏi.</p>}</div>
      </div>
      <div className="md:col-span-3 flex flex-wrap gap-2"><button className="btn bg-sky-900 text-white" disabled={busy}>{busy?'Đang lưu…':'Tạo và xuất bản vòng'}</button><button type="button" className="btn border" onClick={()=>void load()}>Tải lại</button><a className="btn border" href="/game">Xem phòng chơi</a><a className="btn border" href="/admin/exams">Ngân hàng câu hỏi</a></div>
      {msg&&<p className="md:col-span-3 text-sm text-sky-900 break-words">{msg}</p>}
    </form>
    <section className="card mt-6"><h2 className="text-2xl font-black">Danh sách vòng ({rows.length})</h2><div className="mt-4 space-y-2">{rows.map(c=><div className="border rounded-xl p-3 flex flex-wrap items-center justify-between gap-3" key={c.id}><div><b>Cấp {levels.find(l=>l.id===c.level_id)?.level_no} · Vòng {c.round_no}: {c.title}</b><p className="text-sm text-slate-500">{SUBJECTS.find(s=>s.code===c.subject_code)?.label || c.subject_code || 'Vòng cũ chưa gắn môn'} · Lớp {c.grade} · 💎 {c.reward_diamonds} · {c.status}</p></div><button className="btn border text-red-700" onClick={()=>void remove(c)}>Xóa</button></div>)}{rows.length===0&&<p className="text-slate-500">Chưa có vòng nào.</p>}</div></section>
  </main>;
}
