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
import { PartyMember } from '../types/partyMember';

const SUPABASE_URL = 'https://cboajmbpiqglesncgvve.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNib2FqbWJwaXFnbGVzbmNndnZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2NzAyODQsImV4cCI6MjEwNjI0NjI4NH0.ET3HkfOKUU_DE8V0HA8EYqwNazX16FeR6s2JrTP03Wc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Quy ước đuôi email nội bộ cho các tài khoản không có internet bên ngoài
const AUTH_EMAIL_DOMAIN = '@chi-bo.local';


// ==============================================================================
// 1. HÀM KHỞI TẠO TÀI KHOẢN HÀNG LOẠT (BULK CREATE ACCOUNTS)
// ==============================================================================
export interface BulkAccountItem {
  id?: string;
  full_name?: string;
  citizen_id?: string;
  position?: string;
  military_rank?: string;
  phone?: string;
}

export async function khoiTaoTaiKhoanHangLoat(danhSachDangVien: (BulkAccountItem | PartyMember)[]) {
  console.log(`[Bắt đầu] Khởi tạo tài khoản cho ${danhSachDangVien.length} Đảng viên...`);
  const ketQua: {
    thanhCong: Array<{ ten?: string; cccd: string; email: string; vaiTro: string }>;
    thatBai: Array<{ ten?: string; cccd?: string; lyDo: string }>;
  } = {
    thanhCong: [],
    thatBai: []
  };

  for (const dv of danhSachDangVien) {
    const cccd = String(dv.citizen_id || '').trim();

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
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`✕ Lỗi khi tạo tài khoản đồng chí ${dv.full_name}:`, errMsg);
      ketQua.thatBai.push({ ten: dv.full_name, cccd: cccd, lyDo: errMsg });
    }
  }

  console.log(`[Hoàn tất] Thành công: ${ketQua.thanhCong.length}, Thất bại: ${ketQua.thatBai.length}`);
  return ketQua;
}


// ==============================================================================
// 2. HÀM XỬ LÝ ĐĂNG NHẬP VÀ PHÂN QUYỀN ĐIỀU HƯỚNG (LOGIN & REDIRECT)
// ==============================================================================
export async function xuLyDangNhapVaDieuHuong(soCCCD: string, matKhau: string) {
  const cccdClean = String(soCCCD).trim();
  const matKhauClean = String(matKhau).trim();

  // Kiểm tra dữ liệu đầu vào
  if (!cccdClean) {
    return { success: false, message: 'Thiếu tài khoản' };
  }

  if (!matKhauClean) {
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
      return { success: false, error: error.message };
    }

    const user = data.user;
    console.log('Đăng nhập thành công:', user.email);

    // Bước 2: Truy vấn thông tin vai trò (Role) từ bảng `profiles`
    let vaiTro = user.user_metadata?.role || 'Dang_vien';

    const { data: profileData, error: profileErr } = await supabase
      .from('profiles')
      .select('role, is_first_login, full_name')
      .eq('citizen_id', cccdClean)
      .single();

    if (!profileErr && profileData) {
      vaiTro = profileData.role;
    }

    return { success: true, user, role: vaiTro };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('Lỗi trong quá trình đăng nhập:', err);
    return { success: false, error: errMsg };
  }
}


// ==============================================================================
// 3. HÀM ĐỔI MẬT KHẨU LẦN ĐẦU (CHANGE PASSWORD)
// ==============================================================================
export async function doiMatKhauLanDau(matKhauMoi: string, soCCCD?: string) {
  if (!matKhauMoi || matKhauMoi.trim().length < 6) {
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

    return { success: true, data };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('Lỗi cập nhật mật khẩu:', err);
    return { success: false, error: errMsg };
  }
}
