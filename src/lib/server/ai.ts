import { createClient } from '@supabase/supabase-js';

export function getServerSupabase(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('SUPABASE_NOT_CONFIGURED');
  const auth = request.headers.get('authorization') || '';
  return createClient(url, key, { global: { headers: auth ? { Authorization: auth } : {} } });
}

export async function requireUser(request: Request) {
  const supabase = getServerSupabase(request);
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('UNAUTHENTICATED');
  return { supabase, user: data.user };
}

export async function requireStaff(request: Request) {
  const { supabase, user } = await requireUser(request);
  const { data: profile, error } = await supabase.from('profiles').select('role,grade,class_name,full_name').eq('id', user.id).single();
  if (error || !profile || !['admin','teacher'].includes(profile.role)) throw new Error('FORBIDDEN');
  return { supabase, user, profile };
}

export async function callOpenAI(input: string, instructions: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_NOT_CONFIGURED');
  const model = process.env.OPENAI_MODEL || 'gpt-5.6-luna';
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, instructions, input, max_output_tokens: Number(process.env.OPENAI_MAX_OUTPUT_TOKENS || 2400) })
  });
  const raw = await response.text();
  if (!response.ok) throw new Error(`OPENAI_HTTP_${response.status}:${raw.slice(0,500)}`);
  const json = JSON.parse(raw);
  return { text: String(json.output_text || ''), response: json, model };
}

export function parseJsonLoose(text: string): any {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try { return JSON.parse(cleaned); } catch {}
  const firstObj = cleaned.indexOf('{'); const lastObj = cleaned.lastIndexOf('}');
  const firstArr = cleaned.indexOf('['); const lastArr = cleaned.lastIndexOf(']');
  if (firstArr >= 0 && lastArr > firstArr) { try { return JSON.parse(cleaned.slice(firstArr, lastArr + 1)); } catch {} }
  if (firstObj >= 0 && lastObj > firstObj) { try { return JSON.parse(cleaned.slice(firstObj, lastObj + 1)); } catch {} }
  throw new Error('AI_INVALID_JSON');
}

export function jsonResponse(data: unknown, status = 200) { return Response.json(data, { status }); }
export function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
  const map: Record<string, number> = { UNAUTHENTICATED: 401, FORBIDDEN: 403, OPENAI_NOT_CONFIGURED: 503, SUPABASE_NOT_CONFIGURED: 503, AI_INVALID_JSON: 502 };
  const status = map[message] || (message.startsWith('OPENAI_HTTP_') ? 502 : 500);
  return jsonResponse({ ok: false, error: message }, status);
}

export async function logAi(supabase: any, userId: string, action: string, meta: Record<string, unknown> = {}) {
  await supabase.from('ai_usage_logs').insert({ user_id: userId, action, model: process.env.OPENAI_MODEL || 'gpt-5.6-luna', metadata: meta });
}
