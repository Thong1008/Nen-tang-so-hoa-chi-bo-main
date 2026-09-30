/**
 * ==============================================================================
 * BỘ HÀM JAVASCRIPT QUẢN LÝ TÀI KHOẢN VÀ PHÂN QUYỀN ĐẢNG VIÊN VỚI SUPABASE
 * ĐẢNG BỘ TRUNG ĐOÀN 6 - CHI BỘ BAN HẬU CẦN - KỸ THUẬT
 * Thư viện sử dụng: @supabase/supabase-js (Vanilla JavaScript ES6)
 * ==============================================================================
 */

// 1. CẤU HÌNH VÀ KHỞI TẠO SUPABASE CLIENT
// Thay thế SUPABASE_URL và SUPABASE_ANON_KEY bằng thông tin cấu hình trong Project Settings -> API của bạn
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cboajmbpiqglesncgvve.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNib2FqbWJwaXFnbGVzbmNndnZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2NzAyODQsImV4cCI6MjEwNjI0NjI4NH0.ET3HkfOKUU_DE8V0HA8EYqwNazX16FeR6s2JrTP03Wc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Quy ước đuôi email nội bộ cho các tài khoản không có internet bên ngoài
const AUTH_EMAIL_DOMAIN = '@chi-bo.local';


// ==============================================================================
// 1. HÀM KHỞI TẠO TÀI KHOẢN HÀNG LOẠT (BULK CREATE ACCOUNTS)
// ==============================================================================
/**
 * Tự động tạo tài khoản hàng loạt cho danh sách Đảng viên
 * @param {Array<Object>} danhSachDangVien - Mảng các Đảng viên từ bảng dữ liệu
 * Cấu trúc mẫu mỗi phần tử:
 * {
 *   id: 'dv-01',
 *   full_name: 'Nguyễn Anh Toàn',
 *   citizen_id: '046088001248', // Bắt buộc: dùng làm tên đăng nhập và mật khẩu gốc
 *   position: 'Bí thư Chi bộ - Chủ nhiệm Hậu cần - Kỹ thuật',
 *   military_rank: 'Trung tá',
 *   phone: '0914.288.765'
 * }
 */
export async function khoiTaoTaiKhoanHangLoat(danhSachDangVien) {
  console.log(`[Bắt đầu] Khởi tạo tài khoản cho ${danhSachDangVien.length} Đảng viên...`);
  const ketQua = {
    thanhCong: [],
    thatBai: []
  };

  for (const dv of danhSachDangVien) {
    const cccd = String(dv.citizen_id).trim();

    if (!cccd) {
      console.warn(`Bỏ qua đồng chí ${dv.full_name}: Không có số CCCD`);
      ketQua.thatBai.push({ ten: dv.full_name, lyDo: 'Thiếu số CCCD' });
      continue;
    }

    // Quy ước email giả lập và mật khẩu khởi tạo
    const email = `${cccd}${AUTH_EMAIL_DOMAIN}`;
    const matKhauMacDinh = cccd; // Dùng chính CCCD làm mật khẩu lần đầu

    // Xác định vai trò (Role)
    const chucVuLower = (dv.position || '').toLowerCase();
    let vaiTro = 'Dang_vien';
    if (chucVuLower.includes('bí thư') || dv.id === 'dv-01') {
      vaiTro = 'Bi_thu';
    } else if (chucVuLower.includes('phó bí thư') || dv.id === 'dv-02') {
      vaiTro = 'Pho_bi_thu';
    }

    try {
      // Bước 1: Đăng ký tài khoản vào Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: matKhauMacDinh,
        options: {
          data: {
            full_name: dv.full_name,
            citizen_id: cccd,
            role: vaiTro,
            member_code: dv.id,
            is_first_login: true // Đánh dấu bắt buộc đổi mật khẩu lần đầu
          }
        }
      });

      if (authError) {
        // Nếu tài khoản đã tồn tại trên Auth, bỏ qua hoặc cập nhật tiếp
        if (authError.message.includes('already registered')) {
          console.log(`Tài khoản đồng chí ${dv.full_name} (${cccd}) đã tồn tại trên Supabase Auth.`);
        } else {
          throw authError;
        }
      }

      // Lấy User ID được cấp từ Supabase Auth (nếu là user mới)
      const authUserId = authData?.user?.id;

      // Bước 2: Liên kết và ghi đè thông tin vai trò vào bảng `profiles`
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authUserId, // Khóa ngoại liên kết auth.users (nếu có)
          citizen_id: cccd,
          member_code: dv.id,
          full_name: dv.full_name,
          role: vaiTro, // 'Bi_thu' | 'Pho_bi_thu' | 'Dang_vien'
          position: dv.position,
          military_rank: dv.military_rank,
          is_first_login: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'citizen_id'
        });

      if (profileError) {
        console.warn(`Lỗi lưu bảng profiles cho đồng chí ${dv.full_name}:`, profileError.message);
      }

      ketQua.thanhCong.push({
        ten: dv.full_name,
        cccd: cccd,
        email: email,
        vaiTro: vaiTro
      });

      console.log(`✓ Đã tạo xong tài khoản: ${dv.full_name} (${cccd}) - Vai trò: ${vaiTro}`);
    } catch (err) {
      console.error(`✕ Lỗi khi tạo tài khoản đồng chí ${dv.full_name}:`, err.message);
      ketQua.thatBai.push({ ten: dv.full_name, cccd: cccd, lyDo: err.message });
    }
  }

  console.log(`[Hoàn tất] Thành công: ${ketQua.thanhCong.length}, Thất bại: ${ketQua.thatBai.length}`);
  return ketQua;
}


// ==============================================================================
// 2. HÀM XỬ LÝ ĐĂNG NHẬP VÀ PHÂN QUYỀN ĐIỀU HƯỚNG (LOGIN & REDIRECT)
// ==============================================================================
/**
 * Xử lý sự kiện khi bấm nút "ĐĂNG NHẬP VÀO HỆ THỐNG"
 * @param {string} soCCCD - Số CCCD hoặc Số thứ tự được nhập từ ô Tài khoản
 * @param {string} matKhau - Mật khẩu người dùng nhập
 */
export async function xuLyDangNhapVaDieuHuong(soCCCD, matKhau) {
  const cccdClean = String(soCCCD).trim();
  const matKhauClean = String(matKhau).trim();

  // Kiểm tra dữ liệu đầu vào
  if (!cccdClean) {
    alert('Đồng chí vui lòng nhập Số CCCD hoặc Tài khoản!');
    return { success: false, message: 'Thiếu tài khoản' };
  }

  if (!matKhauClean) {
    alert('Đồng chí vui lòng nhập Mật khẩu!');
    return { success: false, message: 'Thiếu mật khẩu' };
  }

  // Chuyển đổi CCCD thành định dạng email của hệ thống
  const email = `${cccdClean}${AUTH_EMAIL_DOMAIN}`;

  try {
    // Bước 1: Gọi hàm đăng nhập của Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: matKhauClean,
    });

    if (error) {
      alert('Đăng nhập không thành công! Vui lòng kiểm tra lại Số CCCD hoặc Mật khẩu.');
      return { success: false, error: error.message };
    }

    const user = data.user;
    console.log('Đăng nhập thành công:', user.email);

    // Bước 2: Truy vấn thông tin vai trò (Role) từ bảng `profiles`
    let vaiTro = user.user_metadata?.role || 'Dang_vien';
    let isFirstLogin = user.user_metadata?.is_first_login;

    const { data: profileData, error: profileErr } = await supabase
      .from('profiles')
      .select('role, is_first_login, full_name')
      .eq('citizen_id', cccdClean)
      .single();

    if (!profileErr && profileData) {
      vaiTro = profileData.role;
      isFirstLogin = profileData.is_first_login;
    }

    // Bước 3: Kiểm tra nếu là Đảng viên đăng nhập lần đầu bằng mật khẩu mặc định (CCCD)
    if (matKhauClean === cccdClean || isFirstLogin === true) {
      const batBuocDoi = confirm(
        `Chào mừng đồng chí ${profileData?.full_name || ''}!\n` +
        `Đây là lần đầu đồng chí đăng nhập bằng mật khẩu mặc định (CCCD).\n` +
        `Để đảm bảo an toàn bí mật quân sự, đồng chí vui lòng đổi mật khẩu mới ngay bây giờ!`
      );

      if (batBuocDoi) {
        const matKhauMoi = prompt('Nhập mật khẩu mới của đồng chí (tối thiểu 6 ký tự):');
        if (matKhauMoi && matKhauMoi.length >= 6) {
          await doiMatKhauLanDau(matKhauMoi, cccdClean);
        } else {
          alert('Mật khẩu chưa được đổi. Đồng chí có thể cập nhật lại trong mục Hồ sơ cá nhân.');
        }
      }
    }

    // Bước 4: Phân quyền điều hướng (Redirect)
    if (vaiTro === 'Bi_thu' || vaiTro === 'Pho_bi_thu') {
      console.log('Điều hướng vào trang Quản trị Chi bộ (admin_dashboard.html)...');
      window.location.href = 'admin_dashboard.html';
    } else {
      console.log('Điều hướng vào Cổng Đảng viên tự phục vụ (member_portal.html)...');
      window.location.href = 'member_portal.html';
    }

    return { success: true, user, role: vaiTro };
  } catch (err) {
    console.error('Lỗi trong quá trình đăng nhập:', err);
    alert('Đã xảy ra sự cố kết nối. Vui lòng thử lại!');
    return { success: false, error: err.message };
  }
}


// ==============================================================================
// 3. HÀM ĐỔI MẬT KHẨU LẦN ĐẦU (CHANGE PASSWORD)
// ==============================================================================
/**
 * Đổi sang mật khẩu mới an toàn và hủy cờ đăng nhập lần đầu
 * @param {string} matKhauMoi - Mật khẩu mới người dùng muốn thiết lập
 * @param {string} [soCCCD] - Số CCCD của Đảng viên (dùng để cập nhật bảng profiles)
 */
export async function doiMatKhauLanDau(matKhauMoi, soCCCD) {
  if (!matKhauMoi || matKhauMoi.trim().length < 6) {
    alert('Mật khẩu mới phải có độ dài tối thiểu từ 6 ký tự trở lên!');
    return { success: false, message: 'Mật khẩu quá ngắn' };
  }

  try {
    // 1. Cập nhật mật khẩu trên Supabase Auth
    const { data, error } = await supabase.auth.updateUser({
      password: matKhauMoi.trim(),
      data: {
        is_first_login: false // Đánh dấu đã đổi mật khẩu thành công
      }
    });

    if (error) {
      alert(`Đổi mật khẩu thất bại: ${error.message}`);
      return { success: false, error: error.message };
    }

    // 2. Cập nhật trạng thái trong bảng `profiles` để đồng bộ
    if (soCCCD) {
      await supabase
        .from('profiles')
        .update({
          is_first_login: false,
          updated_at: new Date().toISOString()
        })
        .eq('citizen_id', soCCCD);
    }

    alert('Đổi mật khẩu thành công! Mật khẩu mới đã được lưu an toàn vào hệ thống.');
    return { success: true, data };
  } catch (err) {
    console.error('Lỗi cập nhật mật khẩu:', err);
    alert('Có lỗi xảy ra khi cập nhật mật khẩu. Vui lòng thử lại!');
    return { success: false, error: err.message };
  }
}
