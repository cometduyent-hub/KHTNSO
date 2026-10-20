'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Subject = { code: string; name: string; active: boolean; sort_order: number };
type Entry = { id: string; entry_type: 'formula' | 'template'; subject_code: string; grade: number; title: string; content: string; description: string; status: 'draft' | 'published' | 'archived'; sort_order: number };
const blank = (): Omit<Entry, 'id'> => ({ entry_type: 'template', subject_code: 'NGUVAN', grade: 0, title: '', content: '', description: '', status: 'draft', sort_order: 100 });

export default function BoardConfigPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [form, setForm] = useState<Omit<Entry, 'id'> & { id?: string }>(blank());
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setNotice('');
    if (!supabase) { setNotice('Chưa cấu hình Supabase.'); setLoading(false); return; }
    const { data: auth } = await supabase.auth.getSession();
    if (!auth.session) { setNotice('Bạn cần đăng nhập bằng tài khoản Admin.'); setLoading(false); return; }
    const { data: profile, error: profileError } = await supabase.from('profiles').select('role,active').eq('id', auth.session.user.id).maybeSingle();
    if (profileError || !profile?.active || profile.role !== 'admin') { setNotice('Chỉ Admin đang hoạt động mới được cấu hình thư viện bảng tương tác.'); setLoading(false); return; }
    setRole(profile.role);
    const [s, e] = await Promise.all([
      supabase.from('subject_catalog').select('code,name,active,sort_order').order('sort_order'),
      supabase.from('board_catalog').select('*').order('subject_code').order('sort_order').order('title'),
    ]);
    if (s.error || e.error) setNotice(`Chưa đọc được CMS. Nếu đây là lần đầu triển khai, hãy chạy migration supabase/migrations/20261020_multisubject_board_cms.sql trong Supabase SQL Editor. Chi tiết: ${s.error?.message || e.error?.message}`);
    setSubjects((s.data || []) as Subject[]); setEntries((e.data || []) as Entry[]); setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function submit(event: FormEvent) {
    event.preventDefault(); if (!supabase || role !== 'admin') return;
    if (!form.title.trim() || !form.content.trim()) { setNotice('Vui lòng nhập tên và nội dung mẫu.'); return; }
    setSaving(true); setNotice('');
    const payload = { entry_type: form.entry_type, subject_code: form.subject_code, grade: Number(form.grade) || 0, title: form.title.trim(), content: form.content.trim(), description: form.description.trim(), status: form.status, sort_order: Number(form.sort_order) || 0 };
    const result = form.id ? await supabase.from('board_catalog').update(payload).eq('id', form.id) : await supabase.from('board_catalog').insert({ ...payload, created_by: (await supabase.auth.getUser()).data.user?.id });
    if (result.error) setNotice(`Không lưu được: ${result.error.message}`);
    else { setNotice('Đã lưu cấu hình. Mẫu xuất bản sẽ xuất hiện trong bảng tương tác sau khi tải lại.'); setForm(blank()); await load(); }
    setSaving(false);
  }
  async function remove(row: Entry) {
    if (!supabase || !window.confirm(`Xóa mẫu “${row.title}”?`)) return;
    const { error } = await supabase.from('board_catalog').delete().eq('id', row.id);
    if (error) setNotice(`Không xóa được: ${error.message}`); else { setNotice('Đã xóa mẫu.'); await load(); }
  }
  const filtered = entries.filter(e => (filterSubject === 'all' || e.subject_code === filterSubject) && (filterType === 'all' || e.entry_type === filterType));
  if (loading) return <main className="mx-auto max-w-6xl px-4 py-10"><div className="card">Đang tải cấu hình bảng tương tác…</div></main>;
  if (role !== 'admin') return <main className="mx-auto max-w-3xl px-4 py-10"><section className="card"><h1 className="text-2xl font-black">CMS bảng tương tác đa môn</h1><p className="mt-3">{notice}</p><a className="btn mt-4 inline-block bg-sky-900 text-white" href="/login">Đăng nhập</a></section></main>;
  return <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
    <header className="rounded-3xl bg-gradient-to-r from-slate-950 via-blue-950 to-cyan-700 p-6 text-white sm:p-8"><p className="text-sm font-bold tracking-widest text-cyan-200">KHTN SỐ · CMS</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">Cấu hình bảng tương tác đa môn</h1><p className="mt-3 max-w-3xl text-sky-100">Quản lý công thức và mẫu nội dung theo môn học, khối lớp. Chỉ các mục ở trạng thái “Đã xuất bản” mới hiển thị với người dùng.</p><div className="mt-5 flex flex-wrap gap-2"><a className="rounded-xl bg-white px-4 py-2 font-bold text-sky-950" href="/teaching-board">Mở bảng tương tác ↗</a><a className="rounded-xl border border-white/40 px-4 py-2 font-bold" href="/admin">Quay về CMS</a></div></header>
    {notice && <div role="status" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{notice}</div>}
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <form onSubmit={submit} className="card space-y-4"><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-black">{form.id ? 'Sửa mẫu' : 'Thêm công thức / mẫu'}</h2>{form.id && <button type="button" className="btn border" onClick={() => setForm(blank())}>Mẫu mới</button>}</div>
        <label className="block text-sm font-bold">Loại nội dung<select className="mt-1 w-full rounded-xl border p-3" value={form.entry_type} onChange={e => setForm(f => ({ ...f, entry_type: e.target.value as Entry['entry_type'] }))}><option value="template">Mẫu nội dung / sơ đồ chữ</option><option value="formula">Công thức</option></select></label>
        <label className="block text-sm font-bold">Môn học<select className="mt-1 w-full rounded-xl border p-3" value={form.subject_code} onChange={e => setForm(f => ({ ...f, subject_code: e.target.value }))}>{subjects.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}</select></label>
        <div className="grid gap-3 sm:grid-cols-2"><label className="block text-sm font-bold">Khối lớp<select className="mt-1 w-full rounded-xl border p-3" value={form.grade} onChange={e => setForm(f => ({ ...f, grade: Number(e.target.value) }))}><option value={0}>Tất cả khối</option>{[6,7,8,9,10,11,12].map(g => <option key={g} value={g}>Lớp {g}</option>)}</select></label><label className="block text-sm font-bold">Thứ tự<input type="number" className="mt-1 w-full rounded-xl border p-3" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}/></label></div>
        <label className="block text-sm font-bold">Tên hiển thị<input required className="mt-1 w-full rounded-xl border p-3" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ví dụ: Sơ đồ phân tích văn bản"/></label>
        <label className="block text-sm font-bold">Nội dung chèn lên bảng<textarea required rows={6} className="mt-1 w-full rounded-xl border p-3 font-medium" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Nhập công thức hoặc mẫu nội dung. Xuống dòng để tạo các dòng riêng."/></label>
        <label className="block text-sm font-bold">Ghi chú hướng dẫn<textarea rows={2} className="mt-1 w-full rounded-xl border p-3" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}/></label>
        <label className="block text-sm font-bold">Trạng thái<select className="mt-1 w-full rounded-xl border p-3" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Entry['status'] }))}><option value="draft">Bản nháp</option><option value="published">Đã xuất bản</option><option value="archived">Lưu trữ</option></select></label>
        <button disabled={saving} className="btn w-full bg-blue-700 text-white disabled:opacity-60" type="submit">{saving ? 'Đang lưu…' : form.id ? 'Cập nhật mẫu' : 'Lưu mẫu'}</button>
      </form>
      <section className="card"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-black">Thư viện mẫu ({filtered.length})</h2><button className="btn border" onClick={() => void load()}>Tải lại</button></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><select className="rounded-xl border p-3" value={filterSubject} onChange={e => setFilterSubject(e.target.value)}><option value="all">Tất cả môn</option>{subjects.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}</select><select className="rounded-xl border p-3" value={filterType} onChange={e => setFilterType(e.target.value)}><option value="all">Tất cả loại</option><option value="formula">Công thức</option><option value="template">Mẫu nội dung</option></select></div>
        <div className="mt-4 space-y-3">{filtered.map(row => <article key={row.id} className="rounded-2xl border p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-sky-100 px-2 py-1 text-sky-900">{subjects.find(s => s.code === row.subject_code)?.name || row.subject_code}</span><span className="rounded-full bg-slate-100 px-2 py-1">{row.entry_type === 'formula' ? 'Công thức' : 'Mẫu nội dung'}</span><span className={`rounded-full px-2 py-1 ${row.status === 'published' ? 'bg-emerald-100 text-emerald-800' : row.status === 'draft' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'}`}>{row.status === 'published' ? 'Đã xuất bản' : row.status === 'draft' ? 'Bản nháp' : 'Lưu trữ'}</span><span className="rounded-full bg-violet-100 px-2 py-1 text-violet-900">{row.grade ? `Lớp ${row.grade}` : 'Mọi khối'}</span></div><h3 className="mt-2 text-lg font-black">{row.title}</h3><pre className="mt-2 whitespace-pre-wrap break-words font-sans text-sm text-slate-700">{row.content}</pre>{row.description && <p className="mt-2 text-xs text-slate-500">{row.description}</p>}</div><div className="flex gap-2"><button className="btn border" onClick={() => setForm({ ...row })}>Sửa</button><button className="btn border border-red-200 text-red-700" onClick={() => void remove(row)}>Xóa</button></div></div></article>)}{!filtered.length && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Chưa có mẫu phù hợp với bộ lọc.</p>}</div>
      </section>
    </div>
  </main>;
}
