import { PartyMember } from '../types/partyMember';

export function exportPartyMembersToWord(members: PartyMember[], filterLabel: string = 'Toàn bộ Chi bộ'): void {
  const currentDate = new Date();
  const day = currentDate.getDate().toString().padStart(2, '0');
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const year = currentDate.getFullYear();

  const totalMembers = members.length;
  const officialCount = members.filter(m => m.party_status === 'Chính thức').length;
  const reserveCount = members.filter(m => m.party_status === 'Dự bị').length;

  const rowsHtml = members.map((m, idx) => `
    <tr>
      <td style="text-align: center; font-weight: normal; padding: 6px 4px; border: 1px solid #333333;">${idx + 1}</td>
      <td style="font-weight: bold; padding: 6px 4px; border: 1px solid #333333;">${m.full_name}</td>
      <td style="text-align: center; padding: 6px 4px; border: 1px solid #333333;">${m.birth_year}</td>
      <td style="text-align: center; font-family: 'Times New Roman', serif; padding: 6px 4px; border: 1px solid #333333;">${m.citizen_id}</td>
      <td style="text-align: center; padding: 6px 4px; border: 1px solid #333333;">${m.military_rank}</td>
      <td style="padding: 6px 4px; border: 1px solid #333333;">${m.position}</td>
      <td style="text-align: center; padding: 6px 4px; border: 1px solid #333333;">${m.enlistment_date}</td>
      <td style="text-align: center; padding: 6px 4px; border: 1px solid #333333;">
        <div>${m.party_join_date}</div>
        <div style="font-size: 11px; font-style: italic; color: #555;">(${m.party_status})</div>
      </td>
      <td style="text-align: center; padding: 6px 4px; border: 1px solid #333333;">${m.phone}</td>
      <td style="padding: 6px 4px; border: 1px solid #333333; font-size: 12px;">${m.emergency_contact}</td>
      <td style="padding: 6px 4px; border: 1px solid #333333; font-size: 12px;">${m.hometown}</td>
      <td style="padding: 6px 4px; border: 1px solid #333333; font-size: 12px;">
        ${m.current_residence}
        <br/><span style="font-style: italic; color: #444;">(${m.distance_km} km)</span>
      </td>
      <td style="padding: 6px 4px; border: 1px solid #333333; font-size: 12px;">${m.notes || ''}</td>
    </tr>
  `).join('');

  const wordHtmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Danh sách trích ngang Đảng viên - LLVT TP Huế</title>
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
          size: 841.9pt 595.3pt; /* A4 Landscape */
          margin: 36pt 36pt 36pt 36pt;
          mso-header-margin: 18pt;
          mso-footer-margin: 18pt;
          mso-paper-source: 0;
        }
        div.Section1 { page: Section1; }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 13pt;
          line-height: 1.35;
          color: #000000;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
          margin-bottom: 20px;
          font-size: 11pt;
        }
        th {
          background-color: #f2f2f2;
          font-weight: bold;
          text-align: center;
          padding: 8px 4px;
          border: 1px solid #000000;
        }
        td {
          vertical-align: middle;
        }
      </style>
    </head>
    <body>
      <div class="Section1">
        <!-- Header cơ quan ban hành theo Nghị định 30/2020/NĐ-CP -->
        <table style="width: 100%; border: none; margin-bottom: 15px;">
          <tr style="border: none;">
            <td style="width: 45%; vertical-align: top; text-align: center; border: none;">
              <div style="font-size: 11pt; font-weight: bold; text-transform: uppercase;">ĐẢNG BỘ TRUNG ĐOÀN 6</div>
              <div style="font-size: 11pt; font-weight: bold; text-transform: uppercase; text-decoration: underline;">CHI BỘ BAN HẬU CẦN - KỸ THUẬT</div>
              <div style="font-size: 10pt; margin-top: 4px;">Số: &nbsp;&nbsp;&nbsp;&nbsp; -DS/CB</div>
            </td>
            <td style="width: 55%; vertical-align: top; text-align: center; border: none;">
              <div style="font-size: 11pt; font-weight: bold; text-transform: uppercase;">ĐẢNG CỘNG SẢN VIỆT NAM</div>
              <div style="font-size: 11pt; font-style: italic; margin-top: 6px;">Ngày ${day} tháng ${month} năm ${year}</div>
            </td>
          </tr>
        </table>

        <!-- Tiêu đề văn bản -->
        <div style="text-align: center; margin: 20px 0 15px 0;">
          <div style="font-size: 15pt; font-weight: bold; text-transform: uppercase;">DANH SÁCH TRÍCH NGANG ĐẢNG VIÊN NĂM ${year}</div>
          <div style="font-size: 12pt; font-weight: bold; margin-top: 5px;">CHI BỘ BAN HẬU CẦN - KỸ THUẬT - TRUNG ĐOÀN 6</div>
          <div style="font-size: 11pt; font-style: italic; margin-top: 4px;">
            (Áp dụng theo Hướng dẫn số 05-HD/VPTW và Nghị định 30/2020/NĐ-CP)
          </div>
          <div style="font-size: 11pt; margin-top: 6px;">
            Bộ lọc: <b>${filterLabel}</b> | Tổng quân số: <b>${totalMembers}</b> đồng chí 
            (Chính thức: <b>${officialCount}</b> đ/c; Dự bị: <b>${reserveCount}</b> đ/c)
          </div>
        </div>

        <!-- Bảng 13 cột chuẩn thể thức -->
        <table>
          <thead>
            <tr>
              <th style="width: 3%;">STT</th>
              <th style="width: 11%;">Họ và tên</th>
              <th style="width: 7%;">Năm sinh</th>
              <th style="width: 9%;">Số CCCD</th>
              <th style="width: 8%;">Cấp bậc</th>
              <th style="width: 10%;">Chức vụ</th>
              <th style="width: 6%;">Nhập ngũ</th>
              <th style="width: 9%;">Ngày vào Đảng</th>
              <th style="width: 8%;">Số điện thoại</th>
              <th style="width: 9%;">Khi cần báo tin cho ai</th>
              <th style="width: 9%;">Quê quán</th>
              <th style="width: 10%;">Nơi ở & cự ly</th>
              <th style="width: 6%;">Ghi chú</th>
            </tr>
            <tr style="font-size: 9pt; background-color: #fafafa;">
              <th>(1)</th>
              <th>(2)</th>
              <th>(3)</th>
              <th>(4)</th>
              <th>(5)</th>
              <th>(6)</th>
              <th>(7)</th>
              <th>(8)</th>
              <th>(9)</th>
              <th>(10)</th>
              <th>(11)</th>
              <th>(12)</th>
              <th>(13)</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <!-- Chữ ký xác nhận theo thể thức Đảng và Quân đội -->
        <table style="width: 100%; border: none; margin-top: 25px; page-break-inside: avoid;">
          <tr style="border: none;">
            <td style="width: 45%; vertical-align: top; text-align: center; border: none;">
              <div style="font-size: 11pt; font-weight: bold; text-transform: uppercase;">NGƯỜI LẬP BIỂU</div>
              <div style="font-size: 10pt; font-style: italic;">(Ký, ghi rõ họ tên)</div>
              <div style="height: 70px;"></div>
              <div style="font-size: 11pt; font-weight: bold;">Đại úy Nguyễn Văn Thông</div>
            </td>
            <td style="width: 55%; vertical-align: top; text-align: center; border: none;">
              <div style="font-size: 11pt; font-weight: bold; text-transform: uppercase;">T/M CHI BỘ</div>
              <div style="font-size: 11pt; font-weight: bold; text-transform: uppercase;">BÍ THƯ</div>
              <div style="font-size: 10pt; font-style: italic;">(Ký, đóng dấu)</div>
              <div style="height: 70px;"></div>
              <div style="font-size: 11pt; font-weight: bold;">Trung tá Nguyễn Anh Toàn</div>
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
