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
      'Giáo viên xử lí mẫu lá bằng quy trình an toàn của nhà trường; học sinh quan sát bước tẩy màu và chỉ tiếp tục khi giáo viên cho phép.',
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
    equipment: ['Cốc thủy tinh', 'Lát cắt mẫu do giáo viên chuẩn bị', 'Kính lúp', 'Túi nylon trong suốt', 'Cần tây hoặc cành hoa màu trắng', 'Hai cây trồng trong chậu đất ẩm', 'Nước pha màu đỏ/xanh'],
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
    equipment: ['Chai nhựa đã qua sử dụng để làm chậu', 'Đất trồng cây', 'Bình tưới có vòi phun sương', 'Nước ấm 35–40 °C', 'Chậu nhựa đã được chuẩn bị sẵn', 'Thước đo chia đến mm', 'Nhiệt kế', 'Hạt đậu xanh/đậu đen/đậu tương hoặc hạt ngô/hạt lạc', 'Video/tranh ảnh vòng đời muỗi, bướm, ếch đồng, cá, gà, lợn'],
    steps: [
      'Sử dụng chậu làm từ chai nhựa đã được giáo viên chuẩn bị sẵn; học sinh không tự cắt chai.',
      'Ngâm hạt trong nước ấm 35–40 °C khoảng 5–10 giờ tùy loại hạt.',
      'Gieo hạt đã nảy mầm vào chậu, dùng vòi phun sương tưới ẩm đất.',
      'Đặt chậu ở nơi đủ ánh sáng, tưới nước hằng ngày và theo dõi.',
      'Trong khoảng 5–7 ngày, quan sát sự nảy mầm, sinh trưởng và phát triển; đếm số lá, đo chiều cao cây và kích thước lá hằng ngày, ghi vào bảng.',
      'Quan sát tranh/ảnh/video về vòng đời động vật; mô tả giai đoạn, hình thái và kích thước cơ thể ở từng giai đoạn.'
    ],
    observation: ['Bảng theo dõi hằng ngày gồm ngày, chiều cao, số lá và nhận xét.', 'Mô tả theo tư liệu các giai đoạn phát triển và thay đổi hình thái của động vật.']
  }

  ,{
    id:'friction', lesson:'Bài 1', title:'Khám phá: So sánh lực ma sát trượt khi thay đổi diện tích tiếp xúc', page:'theo hoạt động Hình 1.1',
    objective:'So sánh lực ma sát trượt của cùng miếng gỗ khi đặt trên các mặt tiếp xúc có diện tích khác nhau.',
    equipment:['Miếng gỗ có hai diện tích tiếp xúc như hình SGK','Lực kế','Mặt bàn phẳng'],
    steps:['Lắp lực kế với miếng gỗ theo hình trong SGK.','Kéo miếng gỗ trượt đều trên mặt bàn và đọc số chỉ lực kế.','Đổi mặt tiếp xúc của miếng gỗ để thay đổi diện tích tiếp xúc.','Lặp lại cách kéo như lần trước, ghi và so sánh các số đo.'],
    observation:['So sánh lực kéo khi miếng gỗ trượt đều ở hai cách đặt.','Giữ các điều kiện khác giống nhau để kết quả có thể so sánh.']
  },{
    id:'solubility', lesson:'Bài 1', title:'Khám phá: Khả năng hòa tan của một số chất rắn trong nước', page:'hoạt động phương pháp tìm hiểu tự nhiên',
    objective:'Quan sát và so sánh khả năng hòa tan của muối ăn, đường và đá vôi dạng bột trong nước.',
    equipment:['Ba ống nghiệm','Nước (cùng thể tích cho mỗi ống)','Muối ăn, đường, đá vôi dạng bột','Dụng cụ đong và dụng cụ lấy mẫu theo hình SGK'],
    steps:['Rót cùng một thể tích nước (khoảng 5 mL) vào ba ống nghiệm.','Thêm khoảng 1 g mỗi chất vào một ống nghiệm riêng.','Lắc đều khoảng 1–2 phút theo hướng dẫn SGK.','Quan sát, ghi lại chất tan hoặc còn chất rắn; so sánh kết quả.'],
    observation:['Ghi riêng hiện tượng trong từng ống nghiệm; không suy đoán trước khi quan sát.']
  },{
    id:'speed', lesson:'Bài 9', title:'Khám phá: Đo tốc độ chuyển động', page:'theo hình và hoạt động Bài 9',
    objective:'Liên hệ phép đo quãng đường và thời gian để xác định tốc độ.',
    equipment:['Xe đồ chơi không động cơ hoặc vật chuyển động trong bố trí SGK','Máng/mặt phẳng chuyển động','Thước đo quãng đường','Đồng hồ bấm giây hoặc bộ đo thời gian theo SGK'],
    steps:['Bố trí đường chuyển động và dụng cụ đo như hình SGK.','Đo quãng đường vật đi được.','Đo thời gian chuyển động tương ứng.','Lặp lại phép đo, ghi số liệu và tính tốc độ theo công thức trong bài.'],
    observation:['Đối chiếu kết quả các lần đo; nêu nguồn sai số có thể có.']
  },{
    id:'sound-vibration', lesson:'Bài 12', title:'Khám phá: Nguồn âm dao động', page:'hoạt động khám phá Bài 12',
    objective:'Nhận biết mối liên hệ giữa âm phát ra và dao động của vật.',
    equipment:['Nguồn âm/vật phát âm trong hình SGK','Mặt bàn hoặc giá đỡ phù hợp'],
    steps:['Quan sát vật phát âm theo bố trí trong SGK.','Cho vật phát âm hoạt động theo hướng dẫn của bài.','Quan sát dấu hiệu dao động khi có âm và khi âm dừng.','Ghi nhận xét từ điều quan sát được.'],
    observation:['Âm phát ra gắn với dao động của nguồn âm. Không dùng mô hình 3D thay cho bằng chứng quan sát thật.']
  },{
    id:'pitch-loudness', lesson:'Bài 13', title:'Khám phá: Độ to và độ cao của âm', page:'hoạt động khám phá Bài 13',
    objective:'So sánh âm khi biên độ hoặc tần số dao động thay đổi trong mô hình học tập.',
    equipment:['Nguồn âm/nhạc cụ hoặc dụng cụ phát âm nêu trong SGK'],
    steps:['Tạo âm theo cách bố trí trong SGK.','Thay đổi một yếu tố mỗi lần theo yêu cầu hoạt động.','Lắng nghe và ghi nhận âm to/nhỏ hoặc cao/thấp.','So sánh các trường hợp và rút ra nhận xét.'],
    observation:['Phân biệt độ to với độ cao; không kết luận chỉ từ âm lượng thiết bị phát lại.']
  },{
    id:'sound-reflection', lesson:'Bài 14', title:'Khám phá: Phản xạ âm', page:'hoạt động khám phá Bài 14',
    objective:'Tìm hiểu hiện tượng phản xạ âm và các điều kiện giúp nghe tiếng vang.',
    equipment:['Nguồn âm','Bề mặt phản xạ âm trong bố trí minh họa SGK','Dụng cụ ghi nhận/đo thời gian nếu được nêu trong SGK'],
    steps:['Quan sát sơ đồ và tình huống phản xạ âm trong SGK.','Thực hiện hoặc quan sát bố trí được mô tả trong bài.','So sánh âm nghe được ở các điều kiện khác nhau.','Ghi kết quả và liên hệ điều kiện nghe tiếng vang.'],
    observation:['Bề mặt và khoảng cách ảnh hưởng đến âm phản xạ nghe được.']
  },{
    id:'shadow', lesson:'Bài 15', title:'Khám phá: Đường truyền ánh sáng và vùng tối', page:'hoạt động khám phá Bài 15',
    objective:'Quan sát vùng sáng, vùng tối khi ánh sáng gặp vật cản.',
    equipment:['Nguồn sáng','Vật cản không trong suốt','Màn chắn'],
    steps:['Bố trí nguồn sáng, vật cản và màn chắn theo hình SGK.','Chiếu sáng vật cản và quan sát vùng tối trên màn.','Thay đổi vị trí tương đối theo yêu cầu hoạt động.','Vẽ hoặc ghi lại hình dạng vùng tối quan sát được.'],
    observation:['Vùng tối hình thành phía sau vật cản khi ánh sáng truyền theo đường thẳng trong mô hình này.']
  },{
    id:'reflection', lesson:'Bài 16', title:'Khám phá: Sự phản xạ ánh sáng', page:'hoạt động khám phá Bài 16',
    objective:'Khảo sát tia tới, tia phản xạ và pháp tuyến trên gương phẳng.',
    equipment:['Gương phẳng','Nguồn tia sáng hẹp/bộ quang học theo hình SGK','Tờ giấy hoặc bảng nền có vạch góc'],
    steps:['Đặt gương và bố trí tia sáng theo hình SGK.','Đánh dấu đường đi của tia tới và tia phản xạ.','Xác định pháp tuyến tại điểm tới.','Đo/so sánh góc tới và góc phản xạ theo yêu cầu bài.'],
    observation:['So sánh góc tới và góc phản xạ; kết quả phụ thuộc thao tác căn chỉnh và đọc góc.']
  },{
    id:'plane-mirror', lesson:'Bài 17', title:'Khám phá: Ảnh của vật qua gương phẳng', page:'hoạt động khám phá Bài 17',
    objective:'Quan sát vị trí, kích thước và tính chất ảnh của vật qua gương phẳng.',
    equipment:['Gương phẳng','Vật nhỏ làm vật sáng','Thước và các tấm đánh dấu theo bố trí SGK'],
    steps:['Đặt vật trước gương theo bố trí trong SGK.','Quan sát ảnh và xác định vị trí biểu kiến của ảnh.','Thay đổi khoảng cách vật–gương theo yêu cầu bài.','Ghi nhận xét về kích thước và khoảng cách ảnh.'],
    observation:['Ảnh qua gương phẳng là ảnh ảo, có kích thước bằng vật và cách gương một khoảng bằng khoảng cách từ vật đến gương.']
  },{
    id:'magnet', lesson:'Bài 18', title:'Khám phá: Tương tác giữa nam châm và vật liệu', page:'hoạt động khám phá Bài 18',
    objective:'Quan sát tương tác của nam châm với một số vật và giữa các cực nam châm.',
    equipment:['Nam châm trong hình SGK','Một số vật liệu mẫu theo SGK'],
    steps:['Đặt lần lượt từng vật mẫu gần nam châm, không ép hoặc va đập.','Ghi vật nào bị hút và vật nào không bị hút rõ rệt.','Đưa các cực nam châm lại gần nhau theo bố trí bài.','Ghi nhận hút/đẩy và rút ra nhận xét.'],
    observation:['Hai cực khác tên hút nhau, hai cực cùng tên đẩy nhau; không phải mọi kim loại đều bị nam châm hút.']
  },{
    id:'magnetic-field', lesson:'Bài 19', title:'Khám phá: Từ trường quanh nam châm', page:'hoạt động khám phá Bài 19',
    objective:'Nhận biết từ trường thông qua tác dụng lên kim nam châm và hình ảnh đường sức.',
    equipment:['Nam châm','La bàn/kim nam châm nhỏ theo hình SGK','Tấm nền quan sát theo bố trí bài'],
    steps:['Đặt nam châm và kim nam châm theo hình SGK.','Đưa kim đến các vị trí khác nhau xung quanh nam châm.','Quan sát hướng kim ở mỗi vị trí và ghi lại.','Mô tả sự thay đổi hướng của kim quanh nam châm.'],
    observation:['Kim nam châm định hướng khác nhau tại các vị trí khác nhau trong từ trường.']
  },{
    id:'electromagnet', lesson:'Bài 20', title:'Khám phá: Nam châm điện đơn giản', page:'hoạt động khám phá Bài 20',
    objective:'Quan sát tác dụng từ của cuộn dây có lõi sắt khi được cấp điện trong mô hình học tập.',
    equipment:['Cuộn dây và lõi sắt theo sơ đồ SGK','Nguồn điện thấp áp dùng trong bộ thí nghiệm học đường','Dây nối và vật thử theo hình SGK'],
    steps:['Nhận diện các bộ phận của mạch theo sơ đồ SGK.','Chỉ thực hiện kết nối khi có giáo viên hướng dẫn và dùng đúng bộ nguồn học đường.','Quan sát tác dụng lên vật thử khi mạch được đóng/ngắt theo bài.','Ngắt nguồn sau khi quan sát và ghi kết quả.'],
    observation:['Tác dụng từ xuất hiện khi cuộn dây có dòng điện; thao tác thật phải do giáo viên giám sát.'],
    caution:'Mô phỏng số không có điện thật. Hoạt động phần cứng chỉ dùng bộ nguồn học đường và có giáo viên giám sát.'
  },{
    id:'photosynthesis-factors', lesson:'Bài 23', title:'Khám phá: Yếu tố ảnh hưởng đến quang hợp', page:'hoạt động khám phá Bài 23',
    objective:'So sánh ảnh hưởng của ánh sáng, nước, carbon dioxide hoặc nhiệt độ theo nội dung bài.',
    equipment:['Cây xanh/mẫu vật hoặc hình ảnh trong SGK','Các điều kiện so sánh được nêu trong hoạt động của bài'],
    steps:['Xác định yếu tố cần khảo sát trong hoạt động SGK.','So sánh các trường hợp chỉ khác nhau ở yếu tố đó.','Quan sát/ghi số liệu theo cách bài yêu cầu.','Nêu nhận xét trong phạm vi kết quả đã thu được.'],
    observation:['Các yếu tố môi trường có thể ảnh hưởng đến cường độ quang hợp; không suy ra số liệu định lượng nếu SGK không cung cấp.']
  },{
    id:'cell-respiration', lesson:'Bài 25', title:'Khám phá: Hô hấp tế bào', page:'hoạt động khám phá Bài 25',
    objective:'Liên hệ sự phân giải chất hữu cơ với giải phóng năng lượng ở tế bào.',
    equipment:['Sơ đồ/hình ảnh trong SGK','Tư liệu hoặc mẫu thí nghiệm được giáo viên chuẩn bị nếu bài yêu cầu'],
    steps:['Quan sát hình/sơ đồ hô hấp tế bào trong SGK.','Xác định chất tham gia và sản phẩm theo sơ đồ.','Đối chiếu với hoạt động thực hành về hạt nảy mầm ở Bài 27.','Ghi kết luận theo nội dung bài.'],
    observation:['Đây là hoạt động mô phỏng khái niệm; không thay thế các bước thực hành cụ thể của Bài 27.']
  },{
    id:'gas-exchange', lesson:'Bài 28', title:'Khám phá: Trao đổi khí ở sinh vật', page:'hoạt động khám phá Bài 28',
    objective:'So sánh cơ quan hoặc bề mặt trao đổi khí ở các nhóm sinh vật theo hình SGK.',
    equipment:['Tranh/hình cấu tạo cơ quan trao đổi khí trong SGK','Mẫu vật hoặc mô hình quan sát nếu được nêu trong bài'],
    steps:['Quan sát các hình minh họa trong SGK.','Xác định bề mặt/cơ quan trao đổi khí ở từng sinh vật.','So sánh đặc điểm phù hợp với môi trường sống.','Ghi nhận xét theo bảng hoặc câu hỏi của bài.'],
    observation:['Các sinh vật có hình thức trao đổi khí khác nhau, phù hợp với đặc điểm cơ thể và môi trường.']
  },{
    id:'water-transport', lesson:'Bài 30', title:'Khám phá: Trao đổi nước và chất dinh dưỡng ở thực vật', page:'hoạt động khám phá Bài 30',
    objective:'Mô phỏng đường nước đi từ rễ qua thân đến lá và vai trò của mạch dẫn.',
    equipment:['Sơ đồ rễ, thân, lá trong SGK','Mẫu cây hoặc hình ảnh cấu tạo mạch dẫn nếu bài yêu cầu'],
    steps:['Quan sát sơ đồ cấu tạo rễ, thân và lá.','Lần theo đường di chuyển của nước và chất khoáng theo hình SGK.','Xác định bộ phận vận chuyển tương ứng.','Ghi tóm tắt bằng sơ đồ mũi tên.'],
    observation:['Nước và chất khoáng được vận chuyển từ rễ lên các bộ phận khác của cây qua hệ mạch dẫn.']
  },{
    id:'stimulus', lesson:'Bài 33', title:'Khám phá: Cảm ứng và tập tính ở sinh vật', page:'hoạt động khám phá Bài 33',
    objective:'Nhận diện kích thích, phản ứng và tập tính qua tình huống trong SGK.',
    equipment:['Hình ảnh/tư liệu hành vi sinh vật được nêu trong SGK'],
    steps:['Quan sát tình huống/hình ảnh trong bài.','Xác định kích thích từ môi trường và phản ứng của sinh vật.','Phân biệt phản ứng ở thực vật với tập tính ở động vật theo nội dung bài.','Ghi kết quả vào bảng quan sát.'],
    observation:['Cảm ứng giúp sinh vật phản ứng với thay đổi của môi trường.']
  },{
    id:'reproduction', lesson:'Bài 39', title:'Khám phá: Sinh sản vô tính ở sinh vật', page:'hoạt động khám phá Bài 39',
    objective:'Quan sát ví dụ sinh sản vô tính và xác định cá thể mới được hình thành như thế nào.',
    equipment:['Hình ảnh/mẫu vật sinh sản vô tính được nêu trong SGK'],
    steps:['Quan sát ví dụ trong SGK.','Xác định cơ thể hoặc bộ phận tạo cá thể mới.','Mô tả trình tự phát sinh cá thể mới theo hình.','So sánh các ví dụ được bài đưa ra.'],
    observation:['Ghi đúng ví dụ và đặc điểm được thể hiện trong sách; không tự thêm quy trình nhân giống ngoài bài.']
  }


  ,{
    id:'atom-model', lesson:'Bài 2', title:'Khám phá mô hình: Cấu tạo nguyên tử', page:'hoạt động khám phá Bài 2',
    objective:'Tương tác với mô hình hạt nhân và electron để nhận biết các thành phần cơ bản của nguyên tử.',
    equipment:['Mô hình nguyên tử/hình minh họa theo SGK'],
    steps:['Quan sát mô hình nguyên tử trong SGK.','Nhận diện hạt nhân và các electron theo chú giải hình.','Chọn nguyên tử mẫu trên mô hình tương tác và quan sát số hạt được biểu diễn.','Ghi lại điều mô hình thể hiện và điều mô hình chỉ minh họa.'],
    observation:['Mô hình số giúp hình dung cấu tạo; kích thước và khoảng cách hiển thị không theo tỉ lệ thực.']
  },{
    id:'element-symbol', lesson:'Bài 3', title:'Khám phá: Kí hiệu hóa học và nguyên tố', page:'hoạt động khám phá Bài 3',
    objective:'Ghép tên nguyên tố, kí hiệu hóa học và mô hình hạt đại diện theo nội dung SGK.',
    equipment:['Bảng kí hiệu nguyên tố và hình/mô hình trong SGK'],
    steps:['Quan sát bảng hoặc hình minh họa trong SGK.','Chọn một nguyên tố và đọc tên, kí hiệu theo sách.','Ghép các hạt cùng loại vào một nhóm trong mô hình.','Đối chiếu câu trả lời với bảng kí hiệu.'],
    observation:['Nguyên tố hóa học được xác định bởi loại nguyên tử; kí hiệu cần viết đúng quy ước.']
  },{
    id:'periodic-table', lesson:'Bài 4', title:'Khám phá tương tác: Bảng tuần hoàn', page:'hoạt động khám phá Bài 4',
    objective:'Khám phá cách sắp xếp ô nguyên tố, chu kì và nhóm trong bảng tuần hoàn.',
    equipment:['Bảng tuần hoàn các nguyên tố hóa học trong SGK'],
    steps:['Chọn một ô nguyên tố trên bảng tương tác.','Đọc các thông tin xuất hiện trong ô theo chú giải SGK.','Xác định chu kì và nhóm của nguyên tố được chọn.','So sánh vị trí của một vài nguyên tố theo yêu cầu bài.'],
    observation:['Bảng tương tác chỉ hỗ trợ tra cứu vị trí; thông tin cần đối chiếu với bảng trong SGK.']
  },{
    id:'molecule-model', lesson:'Bài 5', title:'Khám phá mô hình: Phân tử, đơn chất và hợp chất', page:'hoạt động khám phá Bài 5',
    objective:'Lắp ghép mô hình hạt để phân biệt phân tử đơn chất và phân tử hợp chất.',
    equipment:['Mô hình phân tử/hình biểu diễn trong SGK'],
    steps:['Quan sát các mô hình phân tử trong SGK.','Chọn các hạt theo chú giải màu/kí hiệu của mô hình.','Ghép mô hình theo ví dụ mà bài đưa ra.','Phân loại theo thành phần nguyên tố và ghi nhận xét.'],
    observation:['Màu sắc trong mô hình là quy ước minh họa, không phải màu thật của nguyên tử.']
  },{
    id:'chemical-bond', lesson:'Bài 6', title:'Khám phá mô hình: Liên kết hóa học', page:'hoạt động khám phá Bài 6',
    objective:'Quan sát cách mô hình biểu diễn sự liên kết giữa các nguyên tử trong phân tử.',
    equipment:['Hình/mô hình liên kết hóa học trong SGK'],
    steps:['Quan sát ví dụ trong SGK.','Chọn mô hình phân tử được bài yêu cầu.','Quan sát số nguyên tử và cách chúng được nối trong mô hình.','Mô tả điểm giống/khác giữa các mô hình.'],
    observation:['Liên kết trong mô hình là cách biểu diễn kiến thức; không coi que nối hay quả cầu là vật thể thật.']
  },{
    id:'valence', lesson:'Bài 7', title:'Khám phá: Hóa trị và công thức hóa học', page:'hoạt động khám phá Bài 7',
    objective:'Dùng mô hình/phiếu tương tác để kiểm tra cách biểu diễn công thức hóa học theo hóa trị.',
    equipment:['Bảng hóa trị và ví dụ công thức trong SGK'],
    steps:['Chọn ví dụ công thức được nêu trong bài.','Xác định kí hiệu nguyên tố và chỉ số trong công thức.','Dùng thông tin hóa trị trong SGK để kiểm tra tỉ lệ nguyên tử.','Ghi lại công thức và cách kiểm tra.'],
    observation:['Chỉ sử dụng hóa trị và quy tắc được trình bày trong SGK; đối chiếu ví dụ trước khi kết luận.']
  },{
    id:'motion-speed', lesson:'Bài 8', title:'Khám phá: Tốc độ chuyển động', page:'hoạt động khám phá Bài 8',
    objective:'So sánh tốc độ của các chuyển động thông qua quãng đường đi được trong cùng thời gian hoặc thời gian đi cùng quãng đường.',
    equipment:['Hình/đồ thị hoặc dữ liệu chuyển động trong SGK'],
    steps:['Đọc dữ liệu quãng đường và thời gian của từng chuyển động.','So sánh các đại lượng theo câu hỏi của bài.','Tính tốc độ khi có đủ dữ liệu theo công thức SGK.','Nêu chuyển động nhanh hơn/chậm hơn dựa trên kết quả.'],
    observation:['Đảm bảo so sánh trên cùng điều kiện thời gian hoặc quãng đường theo yêu cầu câu hỏi.']
  }

].sort((a, b) => Number(a.lesson.match(/\d+/)?.[0] || 0) - Number(b.lesson.match(/\d+/)?.[0] || 0));

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
        if (['atom-model','element-symbol','periodic-table','molecule-model','chemical-bond','valence'].includes(experiment.id)) {
          const colors=[0x4cc9f0,0xf07167,0xf6bd60,0x90be6d,0xcdb4db];
          for(let i=0;i<7;i++){const ball=new THREE.Mesh(new THREE.SphereGeometry(i===0?0.38:0.25,24,16),new THREE.MeshStandardMaterial({color:colors[i%colors.length],metalness:0.12,roughness:0.25}));ball.position.set(Math.cos(i*0.9)*(i===0?0.1:0.85),1.2+Math.sin(i*1.7)*0.55,Math.sin(i*0.9)*0.75);group.add(ball);}
          for(let i=0;i<3;i++){const orbit=new THREE.Mesh(new THREE.TorusGeometry(0.9+i*0.18,0.012,6,64),new THREE.MeshStandardMaterial({color:0x8be9f5,transparent:true,opacity:0.7}));orbit.rotation.x=Math.PI/2+(i*0.45);orbit.rotation.y=i*0.55;orbit.position.y=1.2;group.add(orbit);}
        } else if (experiment.id === 'friction') {
          const track = new THREE.Mesh(new THREE.BoxGeometry(4.8,0.12,1.25),new THREE.MeshStandardMaterial({color:0x64788b,roughness:0.65})); track.position.set(0,0.83,0); group.add(track);
          const block = new THREE.Mesh(new THREE.BoxGeometry(0.9,0.42,0.55),new THREE.MeshStandardMaterial({color:0xc88955,roughness:0.8})); block.position.set(-0.8,1.1,0); group.add(block);
          const spring = new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,0.65,12),new THREE.MeshStandardMaterial({color:0xd5e6f4,metalness:0.8})); spring.rotation.z=Math.PI/2; spring.position.set(0.05,1.1,0); group.add(spring);
        } else if (experiment.id === 'solubility') {
          addBeaker(THREE,group,-1.8,0,0xe8f4fa,false); addBeaker(THREE,group,0,0,0xe8f4fa,false); addBeaker(THREE,group,1.8,0,0xd5d5cf,true);
          for(let i=0;i<12;i++){const grain=new THREE.Mesh(new THREE.SphereGeometry(0.045,8,6),new THREE.MeshStandardMaterial({color:i%2?0xffffff:0xc7d0d7}));grain.position.set(1.8+(Math.random()-0.5)*0.35,0.35+Math.random()*0.16,(Math.random()-0.5)*0.3);group.add(grain);}
        } else if (experiment.id === 'speed') {
          const ramp=new THREE.Mesh(new THREE.BoxGeometry(4.4,0.16,0.8),new THREE.MeshStandardMaterial({color:0x8b9cac,metalness:0.25})); ramp.position.set(0,1.05,0); ramp.rotation.z=-0.16; group.add(ramp);
          const wheelMat=new THREE.MeshStandardMaterial({color:0x172b3b,roughness:0.5}); const body=new THREE.Mesh(new THREE.BoxGeometry(0.85,0.3,0.48),new THREE.MeshStandardMaterial({color:0x22b7cf,metalness:0.3})); body.position.set(-0.7,1.5,0); group.add(body);
          for(const x of [-1,-0.4]){const w=new THREE.Mesh(new THREE.CylinderGeometry(0.13,0.13,0.09,20),wheelMat);w.rotation.x=Math.PI/2;w.position.set(x,1.36,0.28);group.add(w);}
          const ruler=new THREE.Mesh(new THREE.BoxGeometry(3.6,0.035,0.16),new THREE.MeshStandardMaterial({color:0xf4d35e}));ruler.position.set(0,0.88,0.65);group.add(ruler);
        } else if (experiment.id.startsWith('sound')) {
          const base=new THREE.Mesh(new THREE.BoxGeometry(2.2,0.18,1.1),new THREE.MeshStandardMaterial({color:0x7c8da0}));base.position.set(0,0.82,0);group.add(base);
          const prong=new THREE.Mesh(new THREE.BoxGeometry(0.16,1.4,0.12),new THREE.MeshStandardMaterial({color:0xd9e7f2,metalness:0.8,roughness:0.25}));prong.position.set(0,1.55,0);group.add(prong);
          for(let i=0;i<3;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(0.45+i*0.27,0.018,8,64),new THREE.MeshStandardMaterial({color:0x45d6ec,transparent:true,opacity:0.75}));ring.position.set(0,1.5,0);group.add(ring);}
        } else if (experiment.id === 'shadow') {
          const lamp=new THREE.Mesh(new THREE.SphereGeometry(0.28,20,14),new THREE.MeshStandardMaterial({color:0xffdf8a,emissive:0xffb02e,emissiveIntensity:0.9}));lamp.position.set(-1.8,1.5,0);group.add(lamp);
          const blocker=new THREE.Mesh(new THREE.BoxGeometry(0.35,1.3,0.7),new THREE.MeshStandardMaterial({color:0x28394a}));blocker.position.set(0,1.2,0);group.add(blocker);
          const screen=new THREE.Mesh(new THREE.BoxGeometry(0.12,1.8,1.6),new THREE.MeshStandardMaterial({color:0xdde8ef}));screen.position.set(1.7,1.3,0);group.add(screen);
          const shadow=new THREE.Mesh(new THREE.PlaneGeometry(0.75,0.9),new THREE.MeshBasicMaterial({color:0x273343}));shadow.position.set(1.62,1.3,0);group.add(shadow);
        } else if (experiment.id === 'reflection' || experiment.id === 'plane-mirror') {
          const mirror=new THREE.Mesh(new THREE.BoxGeometry(0.12,1.8,2.3),new THREE.MeshPhysicalMaterial({color:0x9bd9e9,metalness:0.85,roughness:0.12}));mirror.position.set(0,1.5,0);group.add(mirror);
          const object=new THREE.Mesh(new THREE.ConeGeometry(0.3,0.85,5),new THREE.MeshStandardMaterial({color:0xffb65c}));object.position.set(-1.3,1.1,0);group.add(object);
          const lineMat=new THREE.MeshStandardMaterial({color:0x44d7ed,emissive:0x0b7587});const ray=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,2.1,8),lineMat);ray.rotation.z=Math.PI/2.8;ray.position.set(-0.6,1.55,0);group.add(ray);
        } else if (experiment.id === 'magnet' || experiment.id === 'magnetic-field' || experiment.id === 'electromagnet') {
          const bar=new THREE.Mesh(new THREE.BoxGeometry(2.1,0.35,0.45),new THREE.MeshStandardMaterial({color:0x3279c7,metalness:0.25}));bar.position.set(0,1.1,0);group.add(bar);
          const pole=new THREE.Mesh(new THREE.BoxGeometry(0.8,0.36,0.47),new THREE.MeshStandardMaterial({color:0xe95b57}));pole.position.set(-0.65,1.1,0);group.add(pole);
          if(experiment.id==='electromagnet'){for(let i=0;i<8;i++){const coil=new THREE.Mesh(new THREE.TorusGeometry(0.28,0.035,8,20),new THREE.MeshStandardMaterial({color:0xe4b95c,metalness:0.8}));coil.rotation.y=Math.PI/2;coil.position.set(-0.7+i*0.2,1.1,0);group.add(coil);}}
          if(experiment.id==='magnetic-field'){for(let i=0;i<4;i++){const arc=new THREE.Mesh(new THREE.TorusGeometry(0.65+i*0.22,0.018,6,48,Math.PI),new THREE.MeshStandardMaterial({color:0x48d5e9,emissive:0x125b6c}));arc.position.set(0,1.12,0);arc.rotation.z=Math.PI;group.add(arc);}}
        } else if (experiment.id === 'photosynthesis') {
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
      <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl"/><div className="relative"><p className="text-xs font-black tracking-[.28em] text-cyan-300">KHTN 7 · KẾT NỐI TRI THỨC VỚI CUỘC SỐNG</p><h1 className="mt-3 text-3xl font-black sm:text-5xl">Phòng Thực hành 3D</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">Không gian phòng thí nghiệm tương tác. Chọn bài theo đúng thứ tự SGK, xoay mô hình bằng chuột hoặc thao tác cảm ứng, thực hiện từng bước và ghi lại kết quả.</p><div className="mt-5 flex flex-wrap gap-2"><span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 text-xs text-cyan-100">{experiments.length} hoạt động khám phá / thực hành</span><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200">Xoay · Thu phóng · Tương tác</span><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200">Báo cáo CSV</span></div></div>
    </div>
    <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{experiments.map((e,i)=><button key={e.id} onClick={()=>selectExperiment(e.id)} className={`rounded-2xl border p-4 text-left transition ${activeId===e.id?'border-cyan-400 bg-cyan-50 shadow-lg ring-2 ring-cyan-100':'border-slate-200 bg-white hover:border-cyan-300 hover:bg-cyan-50/50'}`}><div className="flex items-center justify-between"><span className={`text-xs font-black tracking-widest ${activeId===e.id?'text-cyan-800':'text-slate-500'}`}>{String(i+1).padStart(2,'0')} · {e.lesson}</span><span className="text-lg">{['🌿','🌱','💧','🪴','🌾'][i]}</span></div><h2 className="mt-2 text-sm font-extrabold leading-5 text-slate-900">{e.title}</h2><p className="mt-2 text-xs text-slate-500">SGK trang {e.page}</p></button>)}</div>
    <div className="mt-6 grid items-start gap-6 xl:grid-cols-[1.35fr_.85fr]">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl"><div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 p-5 sm:p-6"><div><p className="text-xs font-black tracking-widest text-cyan-800">{active.lesson.toUpperCase()} · TRANG {active.page}</p><h2 className="mt-2 text-2xl font-black text-slate-900">{active.title}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{active.objective}</p></div><span className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">Mô hình tương tác</span></div>
        <div className="p-3 sm:p-5"><LabScene experiment={active} lightLevel={lightLevel} days={days} stained={stained} observed={observed} direction={direction}/><div className="mt-4 grid gap-3 sm:grid-cols-2">{active.id==='photosynthesis'&&<><label className="rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-700">Cường độ ánh sáng mô phỏng <span className="float-right text-cyan-800">{lightLevel}%</span><input aria-label="Cường độ ánh sáng" className="mt-3 w-full accent-cyan-700" type="range" min="0" max="100" value={lightLevel} onChange={e=>setLightLevel(Number(e.target.value))}/></label><button onClick={()=>setStained(v=>!v)} className="rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-left text-sm font-bold text-cyan-900">{stained?'Đang xem lá sau khi thử iodine':'Mô phỏng nhỏ iodine vào lá'}<span className="mt-1 block text-xs font-normal">Bật/tắt màu biểu thị kết quả minh họa</span></button></>}{active.id==='respiration'&&<button onClick={()=>setObserved(v=>!v)} className="rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-left text-sm font-bold text-cyan-900">{observed?'Ẩn kết quả quan sát':'Quan sát nước vôi sau 1 giờ'}<span className="mt-1 block text-xs font-normal">So sánh chuông A có hạt nảy mầm với chuông B đối chứng</span></button>}{active.id==='transport'&&<button onClick={()=>setObserved(v=>!v)} className="rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-left text-sm font-bold text-cyan-900">{observed?'Ẩn giọt ngưng tụ':'Mô phỏng quan sát sau 15–60 phút'}<span className="mt-1 block text-xs font-normal">Hiển thị đường màu và giọt nước minh họa</span></button>}{(active.id==='response'||active.id==='growth')&&<label className="rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-700">{active.id==='response'?'Số ngày theo dõi':'Ngày sinh trưởng'} <span className="float-right text-cyan-800">{days} ngày</span><input aria-label="Số ngày" className="mt-3 w-full accent-cyan-700" type="range" min="1" max="7" value={days} onChange={e=>setDays(Number(e.target.value))}/></label>}{active.id==='response'&&<label className="rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-700">Hiện tượng cần mô phỏng<select className="mt-2 w-full rounded-lg border border-slate-200 bg-white p-2" value={direction} onChange={e=>setDirection(e.target.value)}><option value="water">Hướng nước</option><option value="light">Hướng sáng</option><option value="touch">Hướng tiếp xúc</option></select></label>}</div><p className="mt-3 text-xs leading-5 text-slate-500">Mô hình 3D là mô phỏng học tập, rút ngắn thời gian và dùng các hiệu ứng trực quan để minh họa; không thay thế quan sát thực nghiệm thật hoặc số liệu đo thực tế.</p></div>
      </section>
      <div className="space-y-5"><section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg sm:p-6"><p className="text-xs font-black tracking-widest text-cyan-800">CHUẨN BỊ THEO SGK</p><h3 className="mt-2 text-xl font-black text-slate-900">Dụng cụ và mẫu vật</h3><ul className="mt-4 space-y-2">{active.equipment.map((x,i)=><li key={x} className="flex gap-2 text-sm leading-5 text-slate-700"><span className="mt-0.5 text-cyan-700">◆</span><span>{x}</span></li>)}</ul>{active.caution&&<div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">{active.caution}</div>}</section>
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg sm:p-6"><p className="text-xs font-black tracking-widest text-cyan-800">QUY TRÌNH THỰC HÀNH</p><h3 className="mt-2 text-xl font-black text-slate-900">Đánh dấu từng bước đã thực hiện</h3><div className="mt-4 space-y-3">{active.steps.map((step,i)=><label key={`${active.id}-${i}`} className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition ${checkedSteps.includes(i)?'border-emerald-200 bg-emerald-50':'border-slate-100 bg-slate-50 hover:border-cyan-200'}`}><input className="mt-1 h-4 w-4 accent-emerald-600" type="checkbox" checked={checkedSteps.includes(i)} onChange={e=>setCheckedSteps(old=>e.target.checked?[...old,i]:old.filter(v=>v!==i))}/><span className={`text-sm leading-6 ${checkedSteps.includes(i)?'text-emerald-900':'text-slate-700'}`}><b className="mr-1">Bước {i+1}.</b>{step}</span></label>)}</div><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{width:`${checkedSteps.length/active.steps.length*100}%`}}/></div><p className="mt-2 text-xs text-slate-500">Đã đánh dấu {checkedSteps.length}/{active.steps.length} bước.</p></section>
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg sm:p-6"><p className="text-xs font-black tracking-widest text-cyan-800">KẾT QUẢ VÀ BÁO CÁO</p><h3 className="mt-2 text-xl font-black text-slate-900">Quan sát và giải thích</h3><button className="mt-3 rounded-xl bg-cyan-900 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-800" onClick={()=>setShowResult(v=>!v)}>{showResult?'Ẩn gợi ý quan sát':'Hiện gợi ý quan sát'}</button>{showResult&&<ul className="mt-3 space-y-2">{active.observation.map(o=><li key={o} className="rounded-xl bg-cyan-50 p-3 text-sm leading-5 text-cyan-950">{o}</li>)}</ul>}<label className="mt-4 block text-sm font-bold text-slate-700">Ghi chép của học sinh<textarea className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Ghi hiện tượng quan sát được, so sánh đối chứng, giải thích và kết luận…"/></label><button onClick={exportReport} className="mt-3 w-full rounded-xl border border-cyan-800 px-4 py-3 text-sm font-extrabold text-cyan-900 hover:bg-cyan-50">Xuất phiếu thực hành CSV</button></section></div>
    </div>
    <section className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5"><h2 className="text-lg font-black text-slate-900">Phạm vi trích xuất từ SGK</h2><p className="mt-2 text-sm leading-6 text-slate-600">Danh mục gồm 5 bài có tiêu đề “Thực hành” và các hoạt động khám phá đại diện được phân loại theo bài. Các mục “khám phá” là kịch bản tương tác học tập dựa trên chủ đề/hoạt động được nhận diện; trước khi coi là bản chép nguyên văn SGK, giáo viên cần đối chiếu đúng hình, dụng cụ và câu chữ tại trang sách. Những chỗ SGK chỉ yêu cầu quan sát hình được giữ ở dạng quan sát, không tự thêm thí nghiệm vật thật. Thí nghiệm có cồn, lửa, dao mổ hoặc thủy tinh chỉ mô phỏng trên màn hình; thực hành thật cần theo hướng dẫn an toàn của giáo viên.</p><a href="/practice" className="mt-3 inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-100">← Về Phòng Thực hành chung</a></section>
  </main>;
}
