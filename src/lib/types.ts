export type Role='admin'|'teacher'|'student';
export type Lesson={id:string;grade:string;chapter:string;title:string;tags?:string[]};
export type Resource={id:string;title:string;grade:string;type:string;url:string;rights:string;note?:string};