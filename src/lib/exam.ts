export type ExamQuestion={id:string;type:'mcq'|'tf'|'short'|'essay';prompt:string;options:any;points:number;media:any;metadata:any};
export function shuffle<T>(items:T[], seed=Math.random()):T[]{const a=[...items];let x=Math.floor(seed*2147483647)||1234567;for(let i=a.length-1;i>0;i--){x=(x*48271)%2147483647;const j=x%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
export function normalizeAnswer(v:any){return String(v??'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ');}
