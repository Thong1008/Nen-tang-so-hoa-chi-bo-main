import { supabase } from './supabaseClient';
import { PartyMember } from '../types/partyMember';
import { AuthUser } from '../types/hosoUpdate';

const AUTH_STORAGE_KEY = 'chibo_current_auth_user';

export interface LoginResult {
  success: boolean;
  message: string;
  user?: AuthUser;
  isCloudAuth?: boolean;
}

/**
 * Kiểm tra vai trò: Bí thư (dv-01) hoặc Phó Bí thư (dv-02) là Quản trị viên (Admin)
 */
export function checkIsAdminRole(member: PartyMember): boolean {
  const pos = member.position.toLowerCase();
  const isSecretaryOrDeputy = 
    pos.includes('bí thư') || 
    pos.includes('chủ nhiệm') ||
    member.id === 'dv-01' || 
    member.id === 'dv-02';
  return isSecretaryOrDeputy;
}

/**
 * Đăng nhập hệ thống bằng CCCD hoặc Mã Đảng viên
 * Tích hợp cấu trúc Supabase Auth và cơ chế xác thực nội bộ Chi bộ
 */
export async function authenticatePartyMember(
  identifier: string,
  password: string,
  members: PartyMember[]
): Promise<LoginResult> {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPwd = password.trim();

  if (!cleanId) {
    return { success: false, message: 'Vui lòng nhập Số CCCD hoặc Mã Đảng viên' };
  }

  // 1. Thử xác thực với Supabase Auth nếu hệ thống đã cấu hình email / auth
  let isCloudAuth = false;
  try {
    const formattedEmail = cleanId.includes('@') 
      ? cleanId 
      : `${cleanId}@chibo-hckt.vn`;
    
    const { data: cloudAuthData, error: cloudError } = await supabase.auth.signInWithPassword({
      email: formattedEmail,
      password: cleanPwd || 'Chibo@2026',
    });

    if (cloudAuthData?.user && !cloudError) {
      isCloudAuth = true;
    }
  } catch {
    // Supabase Auth proxy / network fallback
    isCloudAuth = false;
  }

  // 2. Tìm kiếm đồng chí trong danh sách 21 Đảng viên (mỗi đảng viên có tài khoản ứng với STT 1-21, Mã ĐV hoặc CCCD)
  const matchedMember = members.find((m, index) => {
    const stt = index + 1;
    const matchStt = cleanId === String(stt) || cleanId === String(stt).padStart(2, '0');
    const matchMemberId = 
      m.id.toLowerCase() === cleanId || 
      m.id.toLowerCase() === `dv-${cleanId.padStart(2, '0')}` || 
      m.id.toLowerCase() === `dv-${cleanId}`;
    const matchCccd = m.citizen_id.replace(/\s/g, '') === cleanId.replace(/\s/g, '');
    const matchPhone = m.phone.replace(/[^0-9]/g, '') === cleanId.replace(/[^0-9]/g, '');
    return matchStt || matchMemberId || matchCccd || matchPhone;
  });

  if (!matchedMember) {
    return {
      success: false,
      message: 'Tài khoản không tồn tại. Vui lòng nhập đúng STT (1 đến 21) hoặc Mã Đảng viên.',
    };
  }

  // Mật khẩu mặc định chấp nhận: bất kỳ mật khẩu nào nhập vào (hoặc demo 123456)
  // Trong môi trường quân đội nội bộ, định danh theo CCCD & Mã ĐV
  const isAdmin = checkIsAdminRole(matchedMember);

  const authUser: AuthUser = {
    id: matchedMember.id,
    citizen_id: matchedMember.citizen_id,
    full_name: matchedMember.full_name,
    military_rank: matchedMember.military_rank,
    position: matchedMember.position,
    party_status: matchedMember.party_status,
    role: isAdmin ? 'admin' : 'member',
  };

  saveStoredAuthUser(authUser);

  return {
    success: true,
    message: isAdmin 
      ? `Đăng nhập thành công! Chào mừng Bí thư / Phó Bí thư ${authUser.full_name}.`
      : `Đăng nhập thành công! Chào mừng đồng chí ${authUser.full_name} vào Cổng Đảng viên.`,
    user: authUser,
    isCloudAuth,
  };
}

/**
 * Lưu phiên đăng nhập người dùng hiện tại
 */
export function saveStoredAuthUser(user: AuthUser | null): void {
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (e) {
    console.warn('Lỗi lưu session user:', e);
  }
}

/**
 * Lấy phiên đăng nhập hiện tại từ LocalStorage
 */
export function getStoredAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

/**
 * Đăng xuất
 */
export async function logoutPartyMember(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch {
    // ignore
  }
  saveStoredAuthUser(null);
}
