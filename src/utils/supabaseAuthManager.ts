// src/utils/supabaseAuthManager.ts
import { createClient } from '@supabase/supabase-js';
import { PartyMember } from '../types/partyMember';

const SUPABASE_URL = 'https://supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNib2FqbWJwaXFnbGVzbmNndnZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2NzAyODQsImV4cCI6MjEwNjI0NjI4NH0.ET3HkfOKUU_DE8V0HA8EYqwNazX16FeR6s2JrTP03Wc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const AUTH_EMAIL_DOMAIN = '@chi-bo.local';

interface KetQuaKhoiTao {
  thanhCong: Array<{ ten: string; cccd: string; email: string; vaiTro: string }>;
  thatBai: Array<{ ten: string; cccd?: string; lyDo: string }>;
}

/**
 * Hàm khởi tạo tài khoản hàng loạt cho danh sách Đảng viên (TypeScript chuẩn)
 */
export async function khoiTaoTaiKhoanHangLoat(danhSachDangVien: PartyMember[]): Promise<KetQuaKhoiTao> {
  console.log(`[Bắt đầu] Khởi tạo tài khoản cho ${danhSachDangVien.length} Đảng viên...`);
  const ketQua: KetQuaKhoiTao = {
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

    const email = `${cccd}${AUTH_EMAIL_DOMAIN}`;
    const matKhauMacDinh = cccd;

    const chucVuLower = (dv.position || '').toLowerCase();
    let vaiTro = 'Dang_vien';
    if (chucVuLower.includes('bí thư') || dv.id === 'dv-01') {
      vaiTro = 'Bi_thu';
    } else if (chucVuLower.includes('phó bí thư') || dv.id === 'dv-02') {
      vaiTro = 'Pho_bi_thu';
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: matKhauMacDinh,
        options: {
          data: {
            full_name: dv.full_name,
            citizen_id: cccd,
            role: vaiTro,
            member_code: dv.id,
            is_first_login: true
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`Tài khoản đồng chí ${dv.full_name} (${cccd}) đã tồn tại.`);
        } else {
          throw authError;
        }
      }

      const authUserId = authData?.user?.id;

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authUserId,
          citizen_id: cccd,
          member_code: dv.id,
          full_name: dv.full_name,
          role: vaiTro,
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

      console.log(`✓ Đã tạo xong tài khoản: ${dv.full_name} (${cccd})`);
    } catch (err: any) {
      console.error(`✕ Lỗi khi tạo tài khoản đồng chí ${dv.full_name}:`, err.message);
      ketQua.thatBai.push({ ten: dv.full_name, cccd: cccd, lyDo: err.message });
    }
  }

  console.log(`[Hoàn tất] Thành công: ${ketQua.thanhCong.length}, Thất bại: ${ketQua.thatBai.length}`);
  return ketQua;
}
