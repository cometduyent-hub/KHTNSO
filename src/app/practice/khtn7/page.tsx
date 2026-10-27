'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Experiment = {
  id: string; lesson: string; title: string; page: string; objective: string;
  equipment: string[]; steps: string[]; observation: string[]; caution?: string;
};

const experiments: Experiment[] = [
  {
    id: 'photosynthesis', lesson: 'Bài 24', title: 'Thực hành: Chứng minh quang hợp ở cây xanh', page: '108–110',
    objective: 'Thực hiện hai thí nghiệm trong SGK: chứng minh tinh bột được tạo thành trong quang hợp và quang hợp giải phóng khí oxygen.',
    equipment: ['Giá thí nghiệm', 'Băng giấy đen', 'Bóng đèn 500 W có nguồn điện', 'Nước ấm khoảng 40 °C', 'Cốc thủy tinh', 'Nhiệt kế', 'Đĩa Petri', 'Đèn cồn', 'Ống nghiệm', 'Cồn 90°', 'Dung dịch iodine', 'Chậu cây khoai lang', 'Rong đuôi chó'],
    steps: [
      'Thí nghiệm 1 — Đặt chậu cây khoai lang trong bóng tối 2 ngày.',
      'Dùng băng giấy đen bịt kín một phần lá ở cả hai mặt; đưa cây ra nơi có nắng hoặc dưới đèn điện từ 4 đến 6 giờ.',
      'Ngắt lá, bỏ băng giấy đen; đun lá trong cồn 90° đến khi sôi theo quy trình SGK, sau đó rửa lá trong cốc nước ấm.',
      'Nhúng lá vào dung dịch iodine trong đĩa Petri và quan sát sự đổi màu.',
      'Thí nghiệm 2 — Lấy hai cành rong đuôi chó cho vào hai ống nghiệm; đổ đầy nước, úp ngược vào cốc nước sao cho không lọt bọt khí.',
      'Đặt cốc A trong tối hoặc bọc giấy đen; đặt cốc B nơi có ánh sáng. Sau 6 giờ, thu khí theo hướng dẫn SGK và kiểm tra bằng que đóm còn tàn đỏ.',
    ],
    observation: ['Phần lá được chiếu sáng chuyển xanh tím khi gặp iodine nếu có tinh bột; phần bị che không chuyển màu tương tự.', 'Ống nghiệm ở điều kiện có ánh sáng thu được khí; que đóm còn tàn đỏ bùng cháy trở lại khi kiểm tra oxygen.'],
    caution: 'Trong thí nghiệm thật, cồn 90°, đun nóng, đèn cồn và thủy tinh phải do giáo viên thực hiện/giám sát. Mô phỏng không dùng lửa thật.'
  },
  {
    id: 'respiration', lesson: 'Bài 27', title: 'Thực hành: Hô hấp ở thực vật', page: '116–117',
    objective: 'Chứng minh hạt nảy mầm hô hấp thông qua khí carbon dioxide tạo ra.',
    equipment: ['Tủ ấm (nếu có)', 'Đĩa Petri', 'Cốc thủy tinh', 'Nhiệt kế', 'Nhãn dán', 'Nước ấm khoảng 40 °C', 'Bông hoặc giấy thấm', 'Hai chuông thủy tinh', 'Nước vôi trong', 'Hạt đậu xanh/đậu đỏ/hạt phù hợp'],
    steps: [
      'Chọn hạt chắc, không bị vỡ hoặc mối mọt; ngâm hạt ngập trong nước ấm khoảng 40 °C trong 2 giờ.',
      'Rải hạt đã ngâm lên lớp bông/giấy thấm ẩm trong đĩa Petri, phủ lớp ẩm phía trên và để hạt nảy mầm ở nhiệt độ phòng hoặc 30–35 °C.',
      'Chuẩn bị hai chuông thủy tinh A và B; đặt đĩa hạt nảy mầm cùng cốc nước vôi trong vào chuông A, cốc nước vôi trong vào chuông B.',
      'Để cả hai bộ dụng cụ trong điều kiện ánh sáng phòng thí nghiệm; sau 1 giờ, mở chuông và quan sát bề mặt nước vôi trong ở hai cốc.',
      'Ghi kết quả, so sánh chuông A với chuông B và giải thích sự khác biệt.'
    ],
    observation: ['Nước vôi trong ở chuông A vẩn đục rõ hơn do CO₂ do hạt nảy mầm thải ra.', 'Chuông B là đối chứng để so sánh.']
  },
  {
    id: 'transport', lesson: 'Bài 32', title: 'Thực hành: Chứng minh thân vận chuyển nước và lá thoát hơi nước', page: '136–137',
    objective: 'Quan sát đường vận chuyển nước trong thân và sự thoát hơi nước qua lá.',
    equipment: ['Cốc thủy tinh', 'Dao mổ', 'Kính lúp', 'Túi nylon trong suốt', 'Cần tây hoặc cành hoa màu trắng', 'Hai cây trồng trong chậu đất ẩm', 'Nước pha màu đỏ/xanh'],
    steps: [
      'Thí nghiệm 1 — Cắt ngang cuống lá cần tây gần sát gốc, cắm vào cốc nước pha màu và để nơi thoáng.',
      'Sau 30–60 phút, quan sát sự thay đổi màu ở cuống và lá; dùng dao mổ cắt ngang cuống thành đoạn ngắn.',
      'Dùng kính lúp quan sát các mạch dẫn đã nhuộm màu trong mặt cắt.',
      'Thí nghiệm 2 — Đánh dấu hai chậu cây A và B; ngắt toàn bộ lá ở cây chậu A, giữ nguyên lá ở cây chậu B.',
      'Trùm túi nylon trong suốt kín toàn bộ phần lá/cành ở cả hai chậu, buộc kín miệng túi; đặt cây ngoài sáng.',
      'Sau 15–30 phút, quan sát hiện tượng ở mặt trong túi nylon của chậu A và chậu B, ghi kết quả.'
    ],
    observation: ['Màu nước xuất hiện trong các mạch dẫn của cuống lá, thể hiện đường vận chuyển nước.', 'Túi ở chậu còn lá thường xuất hiện giọt nước ngưng tụ rõ hơn túi ở chậu đã ngắt lá.']
  },
  {
    id: 'response', lesson: 'Bài 35', title: 'Thực hành: Cảm ứng ở sinh vật', page: '145–147',
    objective: 'Thực hành/quan sát tính hướng nước, hướng sáng, hướng tiếp xúc ở thực vật và một số tập tính động vật.',
    equipment: ['Chậu trồng cây hoặc khay nhựa', 'Đất/cát trồng cây', 'Que tre hoặc gỗ nhỏ', 'Chậu/ chai nhựa đã đục lỗ', 'Nước', 'Hộp carton (một hộp khoét lỗ phía trên, một hộp khoét lỗ bên cạnh)', 'Hạt đỗ/đậu/bầu/bí hoặc cây non', 'Tranh ảnh/video tập tính động vật'],
    steps: [
      'Hướng nước — Gieo hạt đỗ vào hai chậu giống nhau, tưới đủ ẩm; khi cây có 3–5 lá, đặt chậu nước có lỗ vào một chậu để nước ngấm vào đất một phía nhưng không làm ngập cây.',
      'Sau 3–5 ngày, nhẹ nhàng nhổ cây ra và quan sát hướng mọc của rễ.',
      'Hướng sáng — Gieo hạt trong hai chậu; đặt hai hộp carton lên cây: một hộp khoét lỗ trên, hộp còn lại khoét lỗ bên cạnh.',
      'Đặt trong môi trường ánh sáng tự nhiên; sau 3–5 ngày, nhấc hộp ra và quan sát hướng thân cây.',
      'Hướng tiếp xúc — Quan sát tranh/ảnh/video về tua cuốn cây mướp, bầu hoặc bí; ghi lại phản ứng khi tiếp xúc với giá đỡ.',
      'Tập tính động vật — Quan sát tranh/ảnh/video về kiếm ăn, đánh dấu lãnh thổ, chăm sóc con non, di cư hoặc sống bầy đàn; ghi vào phiếu.'
    ],
    observation: ['Rễ có xu hướng mọc về phía có nước/đất ẩm.', 'Thân cây uốn về phía nguồn sáng qua lỗ hộp.', 'Tua cuốn quấn quanh giá đỡ khi tiếp xúc; tập tính động vật được mô tả theo tư liệu quan sát.']
  },
  {
    id: 'growth', lesson: 'Bài 38', title: 'Thực hành: Quan sát, mô tả sự sinh trưởng và phát triển ở một số sinh vật', page: '156–157',
    objective: 'Theo dõi sinh trưởng cây trong 5–7 ngày và mô tả các giai đoạn phát triển của một số động vật qua tư liệu.',
    equipment: ['Chai nhựa đã qua sử dụng để làm chậu', 'Đất trồng cây', 'Bình tưới có vòi phun sương', 'Nước ấm 35–40 °C', 'Dao/kéo', 'Thước đo chia đến mm', 'Nhiệt kế', 'Hạt đậu xanh/đậu đen/đậu tương hoặc hạt ngô/hạt lạc', 'Video/tranh ảnh vòng đời muỗi, bướm, ếch đồng, cá, gà, lợn'],
    steps: [
      'Dùng dao hoặc kéo cắt chai nhựa theo chiều dọc/ngang để tạo thành chậu trồng cây.',
      'Ngâm hạt trong nước ấm 35–40 °C khoảng 5–10 giờ tùy loại hạt.',
      'Gieo hạt đã nảy mầm vào chậu, dùng vòi phun sương tưới ẩm đất.',
      'Đặt chậu ở nơi đủ ánh sáng, tưới nước hằng ngày và theo dõi.',
      'Trong khoảng 5–7 ngày, quan sát sự nảy mầm, sinh trưởng và phát triển; đếm số lá, đo chiều cao cây và kích thước lá hằng ngày, ghi vào bảng.',
      'Quan sát tranh/ảnh/video về vòng đời động vật; mô tả giai đoạn, hình thái và kích thước cơ thể ở từng giai đoạn.'
    ],
    observation: ['Bảng theo dõi hằng ngày gồm ngày, chiều cao, số lá và nhận xét.', 'Mô tả theo tư liệu các giai đoạn phát triển và thay đổi hình thái của động vật.']
  }
];

declare global { interface Window { THREE?: any; __khtn7ThreeLoader?: Promise<void> } }

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
    if (existing?.dataset.loaded === 'true') return resolve();
    const script = existing || document.createElement('script');
    script.src = src; script.async = true;
    script.onload = () => { script.dataset.loaded = 'true'; resolve(); };
    script.onerror = () => reject(new Error('Không tải được thư viện 3D từ CDN. Hãy kiểm tra kết nối Internet.'));
    if (!existing) document.head.appendChild(script);
  });
}

function addPlant(THREE: any, group: any, x: number, z: number, height: number, leafColor = 0x48a868, bend = 0) {
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.32, 24), new THREE.MeshStandardMaterial({ color: 0xb76e42, roughness: 0.8 }));
  pot.position.set(x, 0.18, z); group.add(pot);
  const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.035, 24), new THREE.MeshStandardMaterial({ color: 0x49372c })); soil.position.set(x, 0.35, z); group.add(soil);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, height, 12), new THREE.MeshStandardMaterial({ color: 0x37864c })); stem.position.set(x + bend * 0.3, 0.36 + height / 2, z); stem.rotation.z = -bend * 0.2; group.add(stem);
  for (let i = 0; i < Math.max(2, Math.floor(height * 3)); i++) {
    const y = 0.5 + (height * (i + 1)) / (Math.max(2, Math.floor(height * 3)) + 1);
    const side = i % 2 ? 1 : -1;
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.18, 18, 12), new THREE.MeshStandardMaterial({ color: leafColor, roughness: 0.55 }));
    leaf.scale.set(1.15, 0.42, 0.65); leaf.position.set(x + bend * ((y - 0.5) / Math.max(height, 0.2)) + side * 0.14, y, z); leaf.rotation.z = side * -0.35 - bend * 0.12; group.add(leaf);
  }
}

function addBeaker(THREE: any, group: any, x: number, z: number, liquidColor = 0x3e9dd0, cloudy = false) {
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.29, 0.82, 32, 1, true), new THREE.MeshPhysicalMaterial({ color: 0xd8efff, transparent: true, opacity: 0.28, roughness: 0.08, metalness: 0.05, side: THREE.DoubleSide }));
  glass.position.set(x, 0.48, z); group.add(glass);
  const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.26, 0.28, 32), new THREE.MeshStandardMaterial({ color: cloudy ? 0xc6d0c8 : liquidColor, roughness: 0.28, transparent: true, opacity: 0.9 })); liquid.position.set(x, 0.3, z); group.add(liquid);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.025, 8, 32), new THREE.MeshStandardMaterial({ color: 0xcde9f7, metalness: 0.2, roughness: 0.15 })); rim.rotation.x = Math.PI / 2; rim.position.set(x, 0.9, z); group.add(rim);
}

function addTube(THREE: any, group: any, x: number, z: number, color = 0x76b8df) {
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 1.05, 24, 1, true), new THREE.MeshPhysicalMaterial({ color: 0xdaf4ff, transparent: true, opacity: 0.34, side: THREE.DoubleSide })); body.position.set(x, 0.65, z); group.add(body);
  const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.43, 24), new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.82 })); liquid.position.set(x, 0.38, z); group.add(liquid);
  const base = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 12), new THREE.MeshPhysicalMaterial({ color: 0xdaf4ff, transparent: true, opacity: 0.34 })); base.position.set(x, 0.13, z); group.add(base);
}

function LabScene({ experiment, lightLevel, days, stained, observed, direction }: { experiment: Experiment; lightLevel: number; days: number; stained: boolean; observed: boolean; direction: string }) {
  const mount = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let renderer: any, frame = 0, controls: any, disposed = false;
    const el = mount.current;
    if (!el) return;
    const start = async () => {
      try {
        if (!window.THREE) {
          window.__khtn7ThreeLoader ||= (async () => {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
            await loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js');
          })();
          await window.__khtn7ThreeLoader;
        }
        if (disposed || !el || !window.THREE) return;
        const THREE = window.THREE;
        const scene = new THREE.Scene(); scene.background = new THREE.Color(0x091827); scene.fog = new THREE.Fog(0x091827, 10, 22);
        const camera = new THREE.PerspectiveCamera(42, el.clientWidth / Math.max(1, el.clientHeight), 0.1, 100); camera.position.set(6, 5, 8);
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false }); renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.setSize(el.clientWidth, el.clientHeight); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.outputEncoding = THREE.sRGBEncoding; el.innerHTML = ''; el.appendChild(renderer.domElement);
        const hemi = new THREE.HemisphereLight(0xd9edff, 0x25364c, 1.65); scene.add(hemi);
        const key = new THREE.DirectionalLight(0xffffff, 2.1); key.position.set(4, 8, 5); key.castShadow = true; scene.add(key);
        const rimLight = new THREE.PointLight(0x27c5d9, 1.3, 14); rimLight.position.set(-4, 4, -3); scene.add(rimLight);
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(22, 22), new THREE.MeshStandardMaterial({ color: 0x15273a, metalness: 0.25, roughness: 0.6 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -0.02; floor.receiveShadow = true; scene.add(floor);
        const table = new THREE.Mesh(new THREE.BoxGeometry(8, 0.25, 4.6), new THREE.MeshStandardMaterial({ color: 0x253d51, metalness: 0.4, roughness: 0.3 })); table.position.y = 0.65; table.castShadow = true; table.receiveShadow = true; scene.add(table);
        for (const [x,z] of [[-3.5,-1.8],[3.5,-1.8],[-3.5,1.8],[3.5,1.8]]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.18,1.25,0.18),new THREE.MeshStandardMaterial({color:0x607b91,metalness:0.65,roughness:0.28})); leg.position.set(x,0.05,z); scene.add(leg); }
        const group = new THREE.Group(); scene.add(group);
        if (experiment.id === 'photosynthesis') {
          addPlant(THREE, group, -2.1, 0, 1.7, stained ? 0x3d74bb : 0x43a65d, 0.1);
          addBeaker(THREE, group, 0.0, 0.0, 0x65c8e8);
          addTube(THREE, group, 1.1, 0.0, 0x9bdcf2); addTube(THREE, group, 1.8, 0.0, 0x9bdcf2);
          const lamp = new THREE.Group(); const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.07,1.4,16),new THREE.MeshStandardMaterial({color:0x90a4b8,metalness:0.7})); stem.position.set(2.9,1.2,0); lamp.add(stem); const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.28,24,16),new THREE.MeshStandardMaterial({color:0xffe5a3,emissive:0xffb52e,emissiveIntensity:lightLevel/45})); bulb.position.set(2.9,1.95,0); lamp.add(bulb); const glow = new THREE.PointLight(0xffc66d,lightLevel/24,5); glow.position.copy(bulb.position); lamp.add(glow); group.add(lamp);
        } else if (experiment.id === 'respiration') {
          addBeaker(THREE, group, -1.35, 0, 0xdce8de, observed); addBeaker(THREE, group, 1.35, 0, 0xdce8de, false);
          for (let i=0;i<18;i++){const seed=new THREE.Mesh(new THREE.SphereGeometry(0.08,12,8),new THREE.MeshStandardMaterial({color:0x987044,roughness:0.8}));seed.scale.set(1.35,0.55,0.75);seed.position.set(-1.35+(Math.random()-0.5)*0.45,0.86+Math.random()*0.15,(Math.random()-0.5)*0.4);group.add(seed);}
          for (const x of [-1.35,1.35]) { const dome = new THREE.Mesh(new THREE.SphereGeometry(0.9,32,24,0,Math.PI*2,0,Math.PI/2),new THREE.MeshPhysicalMaterial({color:0xb9e7ff,transparent:true,opacity:0.18,roughness:0.08,side:THREE.DoubleSide})); dome.position.set(x,0.8,0); dome.scale.set(1.1,1.4,1); group.add(dome); }
        } else if (experiment.id === 'transport') {
          addBeaker(THREE, group, -1.4, 0, 0x27b8d8);
          addPlant(THREE, group, -1.4, 0, 1.5, 0x41a65a, 0);
          // dyed stem overlay
          const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.055,0.07,1.25,12),new THREE.MeshStandardMaterial({color:0x1c9bb9})); stalk.position.set(-1.4,1.1,0); group.add(stalk);
          for(let i=0;i<5;i++){const dot=new THREE.Mesh(new THREE.SphereGeometry(0.055,12,8),new THREE.MeshStandardMaterial({color:0x45d8f4,emissive:0x08758c}));dot.position.set(0.1+i*0.17,0.75+(i%2)*0.18,0);group.add(dot);}
          addPlant(THREE, group, 1.45, 0, 1.65, 0x3fa75d, 0);
          const bag = new THREE.Mesh(new THREE.SphereGeometry(0.72,24,16),new THREE.MeshPhysicalMaterial({color:0xbdeaff,transparent:true,opacity:0.17,roughness:0.08,side:THREE.DoubleSide}));bag.scale.set(1.1,1.3,0.85);bag.position.set(1.45,1.4,0);group.add(bag);
          if (observed) for(let i=0;i<18;i++){const drop=new THREE.Mesh(new THREE.SphereGeometry(0.035,8,6),new THREE.MeshStandardMaterial({color:0x8ee8ff,metalness:0.1,roughness:0.1}));drop.position.set(1.45+(Math.random()-0.5)*0.8,1.05+Math.random()*0.9,(Math.random()-0.5)*0.55);group.add(drop);}
        } else if (experiment.id === 'response') {
          const bend = direction === 'water' ? 0.7 : direction === 'light' ? -0.7 : 0.2;
          addPlant(THREE, group, -1.7, 0, 1.4 + Math.min(days,7)*0.07, 0x45a960, bend);
          addPlant(THREE, group, 0, 0, 1.4 + Math.min(days,7)*0.07, 0x45a960, direction === 'light' ? 0.7 : 0.05);
          addPlant(THREE, group, 1.7, 0, 1.4 + Math.min(days,7)*0.07, 0x45a960, direction === 'touch' ? 0.4 : 0.05);
          addBeaker(THREE, group, -2.5, 0.4, 0x38bfe6);
          const box = new THREE.Mesh(new THREE.BoxGeometry(1.3,2.1,1.2),new THREE.MeshStandardMaterial({color:0x8a9aab,roughness:0.8})); box.position.set(1.7,1.4,-0.1); box.material.side=THREE.DoubleSide; group.add(box);
          const hole = new THREE.Mesh(new THREE.CircleGeometry(0.22,24),new THREE.MeshStandardMaterial({color:0xffd17d,emissive:0x9e6d21,side:THREE.DoubleSide})); hole.position.set(1.7,1.75,0.52); group.add(hole);
        } else {
          const height = 0.45 + Math.min(days,7)*0.2;
          addPlant(THREE, group, -2.1, 0, height, 0x3fa75d, 0.05); addPlant(THREE, group, -0.7, 0, height*0.9, 0x4caf68, 0.02); addPlant(THREE, group, 0.7, 0, height*0.75, 0x65b977, 0.0);
          addBeaker(THREE, group, 2.3, 0, 0x6bbbe4);
          for(let i=0;i<Math.min(days+2,8);i++){const leaf=new THREE.Mesh(new THREE.SphereGeometry(0.12,12,8),new THREE.MeshStandardMaterial({color:0x5ab9d0}));leaf.scale.set(1.2,0.45,0.6);leaf.position.set(2.1+(i%3)*0.22,1.3+Math.floor(i/3)*0.18,0.2);group.add(leaf);}
        }
        controls = THREE.OrbitControls ? new THREE.OrbitControls(camera, renderer.domElement) : null;
        if (controls) { controls.enableDamping = true; controls.dampingFactor = 0.06; controls.target.set(0,1.0,0); controls.minDistance=5; controls.maxDistance=14; controls.maxPolarAngle=Math.PI*0.49; }
        const resize = () => { if(!el || !renderer) return; camera.aspect=el.clientWidth/Math.max(1,el.clientHeight); camera.updateProjectionMatrix(); renderer.setSize(el.clientWidth,el.clientHeight); };
        const observer = new ResizeObserver(resize); observer.observe(el);
        const animate = () => { if(disposed)return; frame=requestAnimationFrame(animate); if(controls)controls.update(); renderer.render(scene,camera); };
        animate();
        (renderer as any).__cleanup = () => { observer.disconnect(); if(controls)controls.dispose(); renderer.dispose(); };
      } catch (e:any) { setError(e?.message || 'Không khởi tạo được mô hình 3D.'); }
    };
    void start();
    return () => { disposed=true; cancelAnimationFrame(frame); if(renderer){renderer.__cleanup?.(); if(renderer.domElement?.parentNode)renderer.domElement.parentNode.removeChild(renderer.domElement);} };
  }, [experiment.id, lightLevel, days, stained, observed, direction]);
  return <div className="relative overflow-hidden rounded-2xl border border-cyan-900/60 bg-slate-950"><div ref={mount} className="h-[320px] w-full sm:h-[430px] touch-pan-y"/><div className="absolute left-3 top-3 rounded-xl border border-white/10 bg-slate-950/75 px-3 py-2 text-xs font-semibold text-cyan-100 backdrop-blur">LAB 3D · {experiment.lesson.toUpperCase()}</div><div className="absolute bottom-3 right-3 rounded-lg bg-slate-950/75 px-3 py-2 text-xs text-slate-200">Kéo để xoay · Cuộn/chụm để phóng to</div>{error && <div className="absolute inset-0 grid place-items-center bg-slate-950/95 p-6 text-center text-sm text-amber-200">{error}</div>}</div>;
}

export default function KHTN7Practice() {
  const [activeId, setActiveId] = useState(experiments[0].id);
  const [lightLevel, setLightLevel] = useState(70);
  const [days, setDays] = useState(4);
  const [stained, setStained] = useState(false);
  const [observed, setObserved] = useState(false);
  const [direction, setDirection] = useState('light');
  const [checkedSteps, setCheckedSteps] = useState<number[]>([]);
  const [notes, setNotes] = useState('');
  const [showResult, setShowResult] = useState(false);
  const active = useMemo(() => experiments.find(e => e.id === activeId) || experiments[0], [activeId]);
  const selectExperiment = (id: string) => { setActiveId(id); setCheckedSteps([]); setNotes(''); setShowResult(false); setStained(false); setObserved(false); setDays(4); };
  const exportReport = () => {
    const rows = [['Môn','Khoa học tự nhiên 7'],['Bài',active.lesson],['Tên bài',active.title],['Trang SGK',active.page],['Mục tiêu',active.objective],['Dụng cụ',active.equipment.join('; ')],['Các bước đã đánh dấu',checkedSteps.map(i=>`${i+1}. ${active.steps[i]}`).join('\n')],['Quan sát theo mô phỏng',active.observation.join('\n')],['Ghi chép học sinh',notes]];
    const blob = new Blob(['\ufeff'+rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8;'});
    const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`${active.lesson.replace(' ','-')}-bao-cao.csv`; a.click(); URL.revokeObjectURL(url);
  };
  return <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10">
    <div className="relative overflow-hidden rounded-[2rem] border border-cyan-900/30 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-6 text-white shadow-2xl sm:p-9">
      <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl"/><div className="relative"><p className="text-xs font-black tracking-[.28em] text-cyan-300">KHTN 7 · KẾT NỐI TRI THỨC VỚI CUỘC SỐNG</p><h1 className="mt-3 text-3xl font-black sm:text-5xl">Phòng Thực hành 3D</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">Không gian phòng thí nghiệm tương tác. Chọn bài theo đúng thứ tự SGK, xoay mô hình bằng chuột hoặc thao tác cảm ứng, thực hiện từng bước và ghi lại kết quả.</p><div className="mt-5 flex flex-wrap gap-2"><span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 text-xs text-cyan-100">5 bài thực hành trong SGK</span><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200">Xoay · Thu phóng · Tương tác</span><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200">Báo cáo CSV</span></div></div>
    </div>
    <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{experiments.map((e,i)=><button key={e.id} onClick={()=>selectExperiment(e.id)} className={`rounded-2xl border p-4 text-left transition ${activeId===e.id?'border-cyan-400 bg-cyan-50 shadow-lg ring-2 ring-cyan-100':'border-slate-200 bg-white hover:border-cyan-300 hover:bg-cyan-50/50'}`}><div className="flex items-center justify-between"><span className={`text-xs font-black tracking-widest ${activeId===e.id?'text-cyan-800':'text-slate-500'}`}>{String(i+1).padStart(2,'0')} · {e.lesson}</span><span className="text-lg">{['🌿','🌱','💧','🪴','🌾'][i]}</span></div><h2 className="mt-2 text-sm font-extrabold leading-5 text-slate-900">{e.title}</h2><p className="mt-2 text-xs text-slate-500">SGK trang {e.page}</p></button>)}</div>
    <div className="mt-6 grid items-start gap-6 xl:grid-cols-[1.35fr_.85fr]">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl"><div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 p-5 sm:p-6"><div><p className="text-xs font-black tracking-widest text-cyan-800">{active.lesson.toUpperCase()} · TRANG {active.page}</p><h2 className="mt-2 text-2xl font-black text-slate-900">{active.title}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{active.objective}</p></div><span className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">Mô hình tương tác</span></div>
        <div className="p-3 sm:p-5"><LabScene experiment={active} lightLevel={lightLevel} days={days} stained={stained} observed={observed} direction={direction}/><div className="mt-4 grid gap-3 sm:grid-cols-2">{active.id==='photosynthesis'&&<><label className="rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-700">Cường độ ánh sáng mô phỏng <span className="float-right text-cyan-800">{lightLevel}%</span><input aria-label="Cường độ ánh sáng" className="mt-3 w-full accent-cyan-700" type="range" min="0" max="100" value={lightLevel} onChange={e=>setLightLevel(Number(e.target.value))}/></label><button onClick={()=>setStained(v=>!v)} className="rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-left text-sm font-bold text-cyan-900">{stained?'Đang xem lá sau khi thử iodine':'Mô phỏng nhỏ iodine vào lá'}<span className="mt-1 block text-xs font-normal">Bật/tắt màu biểu thị kết quả minh họa</span></button></>}{active.id==='respiration'&&<button onClick={()=>setObserved(v=>!v)} className="rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-left text-sm font-bold text-cyan-900">{observed?'Ẩn kết quả quan sát':'Quan sát nước vôi sau 1 giờ'}<span className="mt-1 block text-xs font-normal">So sánh chuông A có hạt nảy mầm với chuông B đối chứng</span></button>}{active.id==='transport'&&<button onClick={()=>setObserved(v=>!v)} className="rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-left text-sm font-bold text-cyan-900">{observed?'Ẩn giọt ngưng tụ':'Mô phỏng quan sát sau 15–60 phút'}<span className="mt-1 block text-xs font-normal">Hiển thị đường màu và giọt nước minh họa</span></button>}{(active.id==='response'||active.id==='growth')&&<label className="rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-700">{active.id==='response'?'Số ngày theo dõi':'Ngày sinh trưởng'} <span className="float-right text-cyan-800">{days} ngày</span><input aria-label="Số ngày" className="mt-3 w-full accent-cyan-700" type="range" min="1" max="7" value={days} onChange={e=>setDays(Number(e.target.value))}/></label>}{active.id==='response'&&<label className="rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-700">Hiện tượng cần mô phỏng<select className="mt-2 w-full rounded-lg border border-slate-200 bg-white p-2" value={direction} onChange={e=>setDirection(e.target.value)}><option value="water">Hướng nước</option><option value="light">Hướng sáng</option><option value="touch">Hướng tiếp xúc</option></select></label>}</div><p className="mt-3 text-xs leading-5 text-slate-500">Mô hình 3D là mô phỏng học tập, rút ngắn thời gian và dùng các hiệu ứng trực quan để minh họa; không thay thế quan sát thực nghiệm thật hoặc số liệu đo thực tế.</p></div>
      </section>
      <div className="space-y-5"><section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg sm:p-6"><p className="text-xs font-black tracking-widest text-cyan-800">CHUẨN BỊ THEO SGK</p><h3 className="mt-2 text-xl font-black text-slate-900">Dụng cụ và mẫu vật</h3><ul className="mt-4 space-y-2">{active.equipment.map((x,i)=><li key={x} className="flex gap-2 text-sm leading-5 text-slate-700"><span className="mt-0.5 text-cyan-700">◆</span><span>{x}</span></li>)}</ul>{active.caution&&<div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">{active.caution}</div>}</section>
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg sm:p-6"><p className="text-xs font-black tracking-widest text-cyan-800">QUY TRÌNH THỰC HÀNH</p><h3 className="mt-2 text-xl font-black text-slate-900">Đánh dấu từng bước đã thực hiện</h3><div className="mt-4 space-y-3">{active.steps.map((step,i)=><label key={`${active.id}-${i}`} className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition ${checkedSteps.includes(i)?'border-emerald-200 bg-emerald-50':'border-slate-100 bg-slate-50 hover:border-cyan-200'}`}><input className="mt-1 h-4 w-4 accent-emerald-600" type="checkbox" checked={checkedSteps.includes(i)} onChange={e=>setCheckedSteps(old=>e.target.checked?[...old,i]:old.filter(v=>v!==i))}/><span className={`text-sm leading-6 ${checkedSteps.includes(i)?'text-emerald-900':'text-slate-700'}`}><b className="mr-1">Bước {i+1}.</b>{step}</span></label>)}</div><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{width:`${checkedSteps.length/active.steps.length*100}%`}}/></div><p className="mt-2 text-xs text-slate-500">Đã đánh dấu {checkedSteps.length}/{active.steps.length} bước.</p></section>
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg sm:p-6"><p className="text-xs font-black tracking-widest text-cyan-800">KẾT QUẢ VÀ BÁO CÁO</p><h3 className="mt-2 text-xl font-black text-slate-900">Quan sát và giải thích</h3><button className="mt-3 rounded-xl bg-cyan-900 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-800" onClick={()=>setShowResult(v=>!v)}>{showResult?'Ẩn gợi ý quan sát':'Hiện gợi ý quan sát'}</button>{showResult&&<ul className="mt-3 space-y-2">{active.observation.map(o=><li key={o} className="rounded-xl bg-cyan-50 p-3 text-sm leading-5 text-cyan-950">{o}</li>)}</ul>}<label className="mt-4 block text-sm font-bold text-slate-700">Ghi chép của học sinh<textarea className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Ghi hiện tượng quan sát được, so sánh đối chứng, giải thích và kết luận…"/></label><button onClick={exportReport} className="mt-3 w-full rounded-xl border border-cyan-800 px-4 py-3 text-sm font-extrabold text-cyan-900 hover:bg-cyan-50">Xuất phiếu thực hành CSV</button></section></div>
    </div>
    <section className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5"><h2 className="text-lg font-black text-slate-900">Phạm vi trích xuất từ SGK</h2><p className="mt-2 text-sm leading-6 text-slate-600">Danh mục theo mục lục sách đính kèm gồm đủ 5 bài có tiêu đề “Thực hành”: Bài 24 (tr.108), Bài 27 (tr.116), Bài 32 (tr.136), Bài 35 (tr.145), Bài 38 (tr.156). Một số bài học khác còn có hoạt động quan sát/thí nghiệm trong tiến trình bài học; các hoạt động đó cần được bổ sung tiếp theo từng trang SGK để tránh bỏ sót hoặc gán sai dụng cụ/quy trình. Thí nghiệm có cồn, lửa, dao mổ hoặc thủy tinh chỉ mô phỏng trên màn hình; thực hành thật cần theo hướng dẫn an toàn của giáo viên.</p><a href="/practice" className="mt-3 inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-100">← Về Phòng Thực hành chung</a></section>
  </main>;
}
