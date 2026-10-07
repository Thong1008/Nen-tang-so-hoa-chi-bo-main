import { PartyMember } from '../types/partyMember';

export function exportPartyMembersToWord(members: PartyMember[], filterLabel: string = 'Toàn bộ Chi bộ'): void {
  const currentDate = new Date();
  const day = currentDate.getDate().toString().padStart(2, '0');
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const year = currentDate.getFullYear();
  const totalMembers = members.length;
  const officialCount = members.filter(m => m.party_status === 'Chính thức').length;
  const reserveCount = members.filter(m => m.party_status === 'Dự bị').length;
  const now = new Date();
  const headerHtml = `
    <table style="width: 100%; border-collapse: collapse; border: none; font-family: 'Times New Roman', serif; margin-bottom: 20px;">
      <tr>
        <!-- Khối tên Chi bộ / Đảng ủy cấp trên (Bên trái) -->
        <td style="width: 45%; text-align: center; vertical-align: top; border: none; padding: 0;">
          <div style="font-size: 13pt; font-weight: bold; text-transform: uppercase; line-height: 1.2;">
            ĐẢNG ỦY TRUNG ĐOÀN 6
          </div>
          <div style="font-size: 13pt; font-weight: bold; text-transform: uppercase; line-height: 1.2; margin-top: 3px;">
            CHI BỘ BAN HẬU CẦN - KỸ THUẬT
          </div>
          <!-- Dấu * nằm căn giữa thay thế cho nét gạch chân cũ -->
          <div style="text-align: center; font-size: 14pt; font-weight: bold; margin-top: 2px; margin-bottom: 2px; line-height: 1;">
            *
          </div>
          <div style="font-size: 12pt; font-style: normal; line-height: 1.2; margin-top: 2px;">
            Số: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-DS/CB
          </div>
        </td>
        
        <!-- Khối Tiêu ngữ & Ngày tháng kèm Địa danh Phú Bài (Bên phải) -->
        <td style="width: 55%; text-align: center; vertical-align: top; border: none; padding: 0;">
          <div style="font-size: 14pt; font-weight: bold; text-transform: uppercase; line-height: 1.2; letter-spacing: 0.3px;">
            ĐẢNG CỘNG SẢN VIỆT NAM
          </div>
          <!-- Nét gạch chân liền dưới tiêu ngữ -->
          <div style="text-align: center; margin-top: 2px; margin-bottom: 4px;">
            <span style="display: inline-block; width: 120px; border-top: 1px solid #000000;"></span>
          </div>
          <!-- Thêm địa danh Phú Bài, ngày... tháng... năm... -->
          <div style="font-size: 13pt; font-style: italic; color: #000000; margin-top: 8px;">
            Phú Bài, ngày&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;tháng&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;năm ${year}
          </div>
        </td>
      </tr>
    </table>

    <!-- Khối Tiêu đề chính của văn bản và 5 dấu gạch nhỏ phía dưới -->
    <div style="text-align: center; font-family: 'Times New Roman', serif; margin-top: 25px; margin-bottom: 20px;">
      <div style="font-size: 15pt; font-weight: bold; text-transform: uppercase; line-height: 1.3; letter-spacing: 0.5px;">
        DANH SÁCH TRÍCH NGANG ĐẢNG VIÊN NĂM 2026
      </div>
      <div style="font-size: 13pt; font-weight: bold; text-transform: uppercase; line-height: 1.3; margin-top: 5px;">
        CHI BỘ BAN HẬU CẦN - KỸ THUẬT - TRUNG ĐOÀN 6
      </div>
      <!-- 5 dấu gạch nhỏ căn giữa phía dưới tên Danh sách -->
      <div style="text-align: center; font-size: 10pt; font-weight: bold; margin-top: 4px; letter-spacing: 2px; color: #000000;">
        -----
      </div>
    </div>
  `;

   const rowsHtml = members.map((m, idx) => `
    <tr style="font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.15; mso-line-height-rule: exactly;">
      <!-- STT -->
      <td style="width: 5%; text-align: center; padding: 2px 3px; border: 1px solid #333333; vertical-align: middle;">
        ${idx + 1}
      </td>
      <!-- Họ và tên -->
      <td style="width: 15%; font-weight: bold; padding: 2px 3px; border: 1px solid #333333; vertical-align: middle;">
        ${m.full_name}
      </td>
      <!-- Năm sinh -->
      <td style="width: 8%; text-align: center; padding: 2px 3px; border: 1px solid #333333; vertical-align: middle;">
        ${m.birth_year}
      </td>
      <!-- Số CCCD -->
      <td style="width: 10%; text-align: center; padding: 2px 3px; border: 1px solid #333333; vertical-align: middle;">
        ${m.citizen_id || ''}
      </td>
      <!-- Cấp bậc -->
      <td style="width: 8%; text-align: center; padding: 2px 3px; border: 1px solid #333333; vertical-align: middle;">
        ${m.military_rank || ''}
      </td>
      <!-- Chức vụ -->
      <td style="width: 10%; padding: 2px 3px; border: 1px solid #333333; vertical-align: middle;">
        ${m.position || ''}
      </td>
      <!-- Nhập ngũ -->
      <td style="width: 7%; text-align: center; padding: 2px 3px; border: 1px solid #333333; vertical-align: middle;">
        ${m.enlistment_date || ''}
      </td>
      <!-- Ngày vào Đảng -->
      <td style="width: 11%; text-align: center; padding: 2px 3px; border: 1px solid #333333; vertical-align: middle;">
        <div style="margin: 0; padding: 0;">${m.party_join_date || ''}</div>
        <div style="font-size: 9pt; font-style: italic; color: #555555; margin: 0; padding: 0;">(${m.party_status || ''})</div>
      </td>
      <!-- Số điện thoại -->
      <td style="width: 9%; text-align: center; padding: 2px 3px; border: 1px solid #333333; vertical-align: middle;">
        ${m.phone || ''}
      </td>
      <!-- Khi cần báo tin cho ai -->
      <td style="width: 11%; padding: 2px 3px; border: 1px solid #333333; font-size: 10pt; vertical-align: middle;">
        ${m.emergency_contact || ''}
      </td>
      <!-- Quê quán -->
      <td style="width: 12%; padding: 2px 3px; border: 1px solid #333333; font-size: 10pt; vertical-align: middle;">
        ${m.hometown || ''}
      </td>
      <!-- Nơi ở & cự ly -->
      <td style="width: 16%; padding: 2px 3px; border: 1px solid #333333; font-size: 10pt; vertical-align: middle;">
        <div style="margin: 0; padding: 0;">${m.current_residence || ''}</div>
        <div style="margin: 1px 0 0 0; padding: 0;"><span style="font-size: 9.5pt; font-weight: bold; color: #dd0000;">${m.distance_km || '0'} km</span></div>
      </td>
      <!-- Ghi chú -->
      <td style="width: 8%; padding: 2px 3px; border: 1px solid #333333; font-size: 10pt; vertical-align: middle;">
        ${m.notes || ''}
      </td>
    </tr>
  `).join('');

  const wordHtmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Danh sách trích ngang Đảng viên</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page Section1 {
          size: 841.9pt 595.3pt; /* Định dạng khổ giấy A4 Ngang Landscape */
          margin: 36pt 36pt 36pt 36pt;
          mso-header-margin: 18pt;
          mso-footer-margin: 18pt;
          mso-paper-source: 0;
        }
        div.Section1 { page: Section1; }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 11pt;
          line-height: 1.3;
          color: #000000;
        }
      </style>
    </head>
    <body>
      <div class="Section1">
        
        <!-- 1. Tiêu đề hành chính chuẩn và địa danh Phú Bài -->
        ${headerHtml}
        
        <!-- 2. Bảng danh sách 13 cột chuẩn thể thức -->
        <table style="width: 100%; border-collapse: collapse; font-family: 'Times New Roman', serif;">
          <thead>
            <!-- Hàng 1: Tiêu đề cột -->
            <tr style="background-color: #f2f2f2; font-size: 11pt; font-weight: bold; text-align: center;">
              <th style="width: 5%; border: 1px solid #333333; padding: 6px 4px; vertical-align: middle;">STT</th>
              <th style="width: 15%; border: 1px solid #333333; padding: 6px 4px; vertical-align: middle;">Họ và tên</th>
              <th style="width: 8%; border: 1px solid #333333; padding: 6px 4px; vertical-align: middle;">Năm sinh</th>
              <th style="width: 10%; border: 1px solid #333333; padding: 6px 4px; vertical-align: middle;">Số CCCD</th>
              <th style="width: 8%; border: 1px solid #333333; padding: 6px 4px; vertical-align: middle;">Cấp bậc</th>
              <th style="width: 10%; border: 1px solid #333333; padding: 6px 4px; vertical-align: middle;">Chức vụ</th>
              <th style="width: 7%; border: 1px solid #333333; padding: 6px 4px; vertical-align: middle;">Nhập ngũ</th>
              <th style="width: 11%; border: 1px solid #333333; padding: 6px 4px; vertical-align: middle;">Ngày vào Đảng</th>
              <th style="width: 9%; border: 1px solid #333333; padding: 6px 4px; vertical-align: middle;">Số điện thoại</th>
              <th style="width: 11%; border: 1px solid #333333; padding: 6px 4px; vertical-align: middle;">Khi cần báo tin cho ai</th>
              <th style="width: 12%; border: 1px solid #333333; padding: 6px 4px; vertical-align: middle;">Quê quán</th>
              <th style="width: 16%; border: 1px solid #333333; padding: 6px 4px; vertical-align: middle;">Nơi ở & cự ly</th>
              <th style="width: 8%; border: 1px solid #333333; padding: 6px 4px; vertical-align: middle;">Ghi chú</th>
            </tr>
            <!-- Hàng 2: Đánh số thứ tự cột (1) đến (13) -->
            <tr style="background-color: #fafafa; font-size: 10pt; text-align: center; font-style: italic;">
              <td style="border: 1px solid #333333; padding: 4px;">(1)</td>
              <td style="border: 1px solid #333333; padding: 4px;">(2)</td>
              <td style="border: 1px solid #333333; padding: 4px;">(3)</td>
              <td style="border: 1px solid #333333; padding: 4px;">(4)</td>
              <td style="border: 1px solid #333333; padding: 4px;">(5)</td>
              <td style="border: 1px solid #333333; padding: 4px;">(6)</td>
              <td style="border: 1px solid #333333; padding: 4px;">(7)</td>
              <td style="border: 1px solid #333333; padding: 4px;">(8)</td>
              <td style="border: 1px solid #333333; padding: 4px;">(9)</td>
              <td style="border: 1px solid #333333; padding: 4px;">(10)</td>
              <td style="border: 1px solid #333333; padding: 4px;">(11)</td>
              <td style="border: 1px solid #333333; padding: 4px;">(12)</td>
              <td style="border: 1px solid #333333; padding: 4px;">(13)</td>
            </tr>
          </thead>
          <tbody>
            <!-- 3. Đổ dữ liệu vòng lặp các hàng đảng viên -->
            ${rowsHtml}
          </tbody>
        </table>
         <!-- BỔ SUNG PHẦN CHỮ KÝ CHUẨN THỂ THỨC VĂN BẢN ĐẢNG -->
      <table style="width: 100%; border-collapse: collapse; border: none; font-family: 'Times New Roman', serif; margin-top: 35px; page-break-inside: avoid;">
        <tr>
          <!-- Bên trái: Nơi nhận (nếu có) -->
          <td style="width: 50%; text-align: left; vertical-align: top; border: none; padding: 0; font-size: 11pt; line-height: 1.3;">
            <div style="font-weight: bold; font-style: italic; text-decoration: underline;">Nơi nhận:</div>
            <div style="font-size: 10pt; margin-top: 3px;">- Đảng ủy Trung đoàn (b/c);</div>
            <div style="font-size: 10pt;">- Lưu Chi bộ.</div>
          </td>
          
          <!-- Bên phải: Người ký ban hành -->
          <td style="width: 50%; text-align: center; vertical-align: top; border: none; padding: 0; font-size: 12pt; line-height: 1.3;">
            <div style="font-weight: bold; text-transform: uppercase;">T/M CHI BỘ</div>
            <div style="font-weight: bold; text-transform: uppercase; margin-top: 2px;">BÍ THƯ</div>
            
            <!-- Khoảng trống 60px để ký tên và đóng dấu -->
            <div style="height: 70px;"></div> 
            
            <div style="font-weight: bold; font-size: 13pt;">Nguyễn Văn A</div>
          </td>
        </tr>
      </table>
      
    </div>
  </body>
  </html>
`;
    
  
  const blob = new Blob(['\ufeff', wordHtmlContent], {
    type: 'application/msword;charset=utf-8'
  });
  
  const link = document.createElement('a');
  const filename = `Trich_Ngang_Dang_Vien_LLVT_Hue_${year}_${day}${month}.doc`;
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
