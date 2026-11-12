'use client';
import { useEffect, useRef, useState } from 'react';

declare global { interface Window { THREE?: any; __khtnThreePromise?: Promise<any> } }
const THREE_CDN='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
function loadThree(){
  if(window.THREE) return Promise.resolve(window.THREE);
  if(!window.__khtnThreePromise) window.__khtnThreePromise=new Promise((resolve,reject)=>{
    const old=document.querySelector(`script[src="${THREE_CDN}"]`) as HTMLScriptElement|null;
    const script=old||document.createElement('script');
    script.src=THREE_CDN; script.async=true;
    script.onload=()=>resolve(window.THREE);
    script.onerror=()=>reject(new Error('Không tải được thư viện 3D. Vui lòng kiểm tra kết nối Internet.'));
    if(!old) document.head.appendChild(script);
  });
  return window.__khtnThreePromise;
}

type Mode='lab'|'mountain'|'geometry';
export default function ThreeLearningStudio({mode,title}:{mode:Mode;title?:string}){
 const host=useRef<HTMLDivElement>(null); const sceneApi=useRef<any>(null);
 const [shape,setShape]=useState('cube'); const [scale,setScale]=useState(1); const [angle,setAngle]=useState(24); const [status,setStatus]=useState('Đang khởi tạo không gian 3D…'); const [selected,setSelected]=useState('');
 useEffect(()=>{let alive=true,renderer:any,raf=0,cleanup=()=>{};
  loadThree().then((T:any)=>{if(!alive||!host.current)return;
   const el=host.current; const scene=new T.Scene(); scene.background=new T.Color(mode==='mountain'?0xbfe8ff:0xeaf4fb); scene.fog=new T.Fog(scene.background,18,48);
   const camera=new T.PerspectiveCamera(45,el.clientWidth/430,.1,100); camera.position.set(7,6,10);
   renderer=new T.WebGLRenderer({antialias:true,alpha:false}); renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2)); renderer.setSize(el.clientWidth,430); renderer.shadowMap.enabled=true; renderer.shadowMap.type=T.PCFSoftShadowMap; el.innerHTML=''; el.appendChild(renderer.domElement);
   scene.add(new T.HemisphereLight(0xffffff,0x718096,2)); const sun=new T.DirectionalLight(0xffffff,2.3);sun.position.set(5,10,7);sun.castShadow=true;scene.add(sun);
   const ground=new T.Mesh(new T.PlaneGeometry(40,40),new T.MeshStandardMaterial({color:mode==='mountain'?0x8cbd83:0xd9e6ef,roughness:.95}));ground.rotation.x=-Math.PI/2;ground.position.y=-.12;ground.receiveShadow=true;scene.add(ground);
   const grid=new T.GridHelper(24,24,0x8aa6bb,0xc5d4df);grid.position.y=-.1;scene.add(grid);
   const root=new T.Group();scene.add(root);
   const mat=(color:number,roughness=.55)=>new T.MeshStandardMaterial({color,roughness,metalness:.08});
   const add=(geo:any,m:any,x:number,y:number,z:number)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;root.add(o);return o;};
   if(mode==='geometry'){
    const colors=[0x2784c7,0x14a38b,0x8b5cf6,0xe58a35,0xd84f70];
    const geos:any={cube:()=>new T.BoxGeometry(2,2,2),cuboid:()=>new T.BoxGeometry(2.8,1.6,1.8),sphere:()=>new T.SphereGeometry(1.25,48,32),cylinder:()=>new T.CylinderGeometry(1,1,2.5,48),cone:()=>new T.ConeGeometry(1.2,2.5,48),prism:()=>new T.CylinderGeometry(1.25,1.25,2,3),pyramid:()=>new T.ConeGeometry(1.35,2.2,4)};
    const object=add(geos[shape](),mat(colors[['cube','cuboid','sphere','cylinder','cone','prism','pyramid'].indexOf(shape)]||colors[0],.35),0,1.25,0);object.name=shape;
    const edges=new T.LineSegments(new T.EdgesGeometry(object.geometry),new T.LineBasicMaterial({color:0x17324d}));object.add(edges);
    if(shape==='sphere'){const equator=new T.Mesh(new T.TorusGeometry(1.26,.018,8,80),mat(0xffffff));equator.rotation.x=Math.PI/2;object.add(equator);}
    if(shape==='cylinder'){const ring=new T.Mesh(new T.TorusGeometry(1,.025,8,64),mat(0xffffff));ring.rotation.x=Math.PI/2;ring.position.y=1.25;object.add(ring);}
    // Axes and dimension guides
    const axes=new T.AxesHelper(3.2);axes.position.set(-2.8,.02,-2.4);root.add(axes);
   }else if(mode==='lab'){
    // Bench and a modular spring stand, cylinder and measuring scale.
    add(new T.BoxGeometry(9,.35,5),mat(0xf8fafc),0,.05,0);
    add(new T.BoxGeometry(3.2,.18,1.8),mat(0x202b38),-1.5,.32,-.3);
    add(new T.BoxGeometry(.14,4,.14),mat(0x9aa8b5,.25),-2.4,2.25,-.2);
    add(new T.BoxGeometry(2.8,.16,.16),mat(0x273849),-1,4.25,-.2);
    for(let i=0;i<13;i++)add(new T.BoxGeometry(.025,.16,.08),mat(0xf8fafc),-2.31,3.9-i*.28,-.1);
    const spring=new T.Mesh(new T.TorusGeometry(.22,.035,10,16),mat(0x9aa7b5,.25));for(let i=0;i<9;i++){const r=spring.clone();r.position.set(-1,3.5-i*.18,-.2);root.add(r);}
    add(new T.BoxGeometry(.08,.5,.08),mat(0x334155),-1,1.95,-.2);add(new T.BoxGeometry(.55,.12,.55),mat(0x64748b),-1,1.62,-.2);
    const cylinder=add(new T.CylinderGeometry(.55,.55,1.9,40,1,true),new T.MeshStandardMaterial({color:0x60a5fa,transparent:true,opacity:.35,side:T.DoubleSide}),2.2,1.25,.6);cylinder.name='Bình chia độ';
    add(new T.CylinderGeometry(.53,.53,.06,40),mat(0x60a5fa),2.2,.32,.6);
    add(new T.BoxGeometry(1.2,.1,.9),mat(0x334155),2.2,.22,.6);
    for(let i=0;i<6;i++)add(new T.BoxGeometry(.07,.12,.07),mat(0xffffff),1.78+i*.16,1.05,.6);
    add(new T.BoxGeometry(.08,2.8,.08),mat(0xe5e7eb),3.65,1.45,.4);
    for(let i=0;i<15;i++)add(new T.BoxGeometry(.2,.025,.08),mat(0x334155),3.5,2.65-i*.17,.4);
   }else{
    // Stylized 3D mountain ridge, switchback trail and 30 checkpoints.
    const hills=[[-4,1.4,-1,3.8,2.8,3.5,0x579b70],[-1.6,1.9,-1.5,3.2,3.8,3.1,0x438c65],[1.2,2.6,-2,3.4,5.2,3.4,0x347b62],[3.7,3.1,-2.2,3.2,6.2,3.1,0x286b58]];
    hills.forEach(([x,y,z,sx,sy,sz,c])=>{const h=add(new T.ConeGeometry(1,1,6),mat(c as number),x as number,y as number,z as number);h.scale.set(sx as number,sy as number,sz as number);});
    const peak=add(new T.ConeGeometry(1.25,2.5,6),mat(0xe9f4f7),3.7,6.5,-2.2);peak.rotation.y=Math.PI/6;
    const points=[[-5,.25,3],[-3.6,.45,2],[-2.2,.7,2.4],[-.7,1,1.2],[.8,1.5,1.5],[2,2,-.2],[3.2,2.8,-1.2],[3.7,4,-2.2]];
    const curve=new T.CatmullRomCurve3(points.map((p:any)=>new T.Vector3(...p)));const path=new T.Mesh(new T.TubeGeometry(curve,100,.13,8,false),mat(0xf5d28b));root.add(path);
    for(let i=0;i<30;i++){const t=i/29,p=curve.getPoint(t);const node=add(new T.SphereGeometry(.16,18,12),mat(i<Math.round(angle/360*29)?0x16a34a:0xf59e0b),p.x,p.y+.18,p.z);node.name=`Trạm ${i+1}`;}
    add(new T.CylinderGeometry(.12,.12,1.4,12),mat(0x805b3b),3.7,5.7,-2.2);
   }
   let down=false,lastX=0,lastY=0,rotY=0,rotX=0;
   const pointerDown=(e:PointerEvent)=>{down=true;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture?.(e.pointerId);};
   const pointerMove=(e:PointerEvent)=>{if(!down)return;rotY+=(e.clientX-lastX)*.008;rotX=Math.max(-.7,Math.min(.7,rotX+(e.clientY-lastY)*.005));lastX=e.clientX;lastY=e.clientY;root.rotation.y=rotY;root.rotation.x=rotX;};
   const pointerUp=()=>{down=false;};renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('pointermove',pointerMove);renderer.domElement.addEventListener('pointerup',pointerUp);renderer.domElement.addEventListener('pointercancel',pointerUp);
   const resize=()=>{if(!host.current)return;camera.aspect=host.current.clientWidth/430;camera.updateProjectionMatrix();renderer.setSize(host.current.clientWidth,430);};window.addEventListener('resize',resize);
   const animate=()=>{raf=requestAnimationFrame(animate);renderer.render(scene,camera);};animate();sceneApi.current={root,renderer,camera,scene};setStatus('Không gian 3D đã sẵn sàng · Kéo chuột để xoay, cuộn để phóng to/thu nhỏ.');
   cleanup=()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize);renderer.domElement.removeEventListener('pointerdown',pointerDown);renderer.domElement.removeEventListener('pointermove',pointerMove);renderer.domElement.removeEventListener('pointerup',pointerUp);renderer.dispose();scene.traverse((o:any)=>{o.geometry?.dispose?.();if(Array.isArray(o.material))o.material.forEach((m:any)=>m.dispose?.());else o.material?.dispose?.();});};
  }).catch((e:any)=>setStatus(e.message||'Không thể khởi tạo 3D.'));
  return()=>{alive=false;cleanup();};
 },[mode,shape]);
 useEffect(()=>{const api=sceneApi.current;if(!api)return;api.root.scale.setScalar(scale);api.root.rotation.y=angle*Math.PI/180;},[scale,angle]);
 const heading=title||(mode==='lab'?'Bàn thí nghiệm 3D':mode==='mountain'?'Hành trình Bạch Mã 3D':'Phòng hình học không gian 3D');
 return <section className="overflow-hidden rounded-3xl border border-sky-200 bg-white shadow-xl">
  <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-950 to-sky-900 p-4 text-white"><div><p className="text-[10px] font-black tracking-[.22em] text-cyan-200">KHTN SỐ · INTERACTIVE 3D</p><h2 className="text-xl font-black">{heading}</h2></div><span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs">WebGL · 3D</span></div>
  <div ref={host} className="w-full touch-none bg-sky-50" aria-label={heading}/>
  <div className="flex flex-wrap items-center justify-between gap-3 border-t p-3"><p className="text-xs text-slate-500" aria-live="polite">{status}</p><div className="flex flex-wrap items-center gap-3"><label className="text-xs font-semibold">Tỉ lệ <input aria-label="Tỉ lệ mô hình" type="range" min=".65" max="1.5" step=".05" value={scale} onChange={e=>setScale(+e.target.value)} className="ml-2 align-middle"/></label><label className="text-xs font-semibold">Góc <input aria-label="Góc xoay mô hình" type="range" min="0" max="360" value={angle} onChange={e=>setAngle(+e.target.value)} className="ml-2 align-middle"/></label>{mode==='geometry'&&<select value={shape} onChange={e=>setShape(e.target.value)} className="rounded-lg border px-2 py-1 text-xs"><option value="cube">Lập phương</option><option value="cuboid">Hộp chữ nhật</option><option value="sphere">Hình cầu</option><option value="cylinder">Hình trụ</option><option value="cone">Hình nón</option><option value="prism">Lăng trụ tam giác</option><option value="pyramid">Hình chóp</option></select>}</div></div>
 </section>;
}
