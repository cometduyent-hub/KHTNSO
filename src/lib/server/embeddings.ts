export async function createEmbedding(input:string){
  const key=process.env.OPENAI_API_KEY; if(!key) throw new Error('OPENAI_NOT_CONFIGURED');
  const r=await fetch('https://api.openai.com/v1/embeddings',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${key}`},body:JSON.stringify({model:process.env.OPENAI_EMBEDDING_MODEL||'text-embedding-3-small',input})});
  const raw=await r.text(); if(!r.ok) throw new Error(`OPENAI_HTTP_${r.status}:${raw.slice(0,400)}`); const j=JSON.parse(raw); return j.data?.[0]?.embedding;
}
