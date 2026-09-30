import { supabase } from './supabaseClient';
import { HosoUpdateRecord, FieldChangeDetail, HosoUpdateFieldCategory } from '../types/hosoUpdate';
import { PartyMember } from '../types/partyMember';
import { updatePartyMember } from './supabaseService';

const HOSO_UPDATES_STORAGE_KEY = 'chibo_hoso_updates_list';

// Dữ liệu mẫu ban đầu để kiểm thử ngay luồng phê duyệt của Bí thư
export const INITIAL_HOSO_UPDATES: HosoUpdateRecord[] = [
  {
    id: 'upd-001',
    member_id: 'dv-04',
    member_name: 'Trần Văn Linh',
    military_rank: 'Trung úy',
    field_category: 'education',
    category_label: 'Trình độ học vấn & Lý luận chính trị',
    changes: [
      {
        field_name: 'academic_level',
        label: 'Trình độ văn hóa',
        old_value: '12/12',
        new_value: 'Đại học Sĩ quan Kỹ thuật Quân sự (Tốt nghiệp)',
      },
      {
        field_name: 'political_theory',
        label: 'Lý luận chính trị',
        old_value: 'Sơ cấp',
        new_value: 'Trung cấp Lý luận Chính trị',
      },
    ],
    trang_thai: 'pending',
    requested_at: '2026-09-28 14:30',
  },
  {
    id: 'upd-002',
    member_id: 'dv-06',
    member_name: 'Hoàng Minh Tuấn',
    military_rank: 'Đại úy',
    field_category: 'contact',
    category_label: 'Thông tin liên lạc & Chỗ ở',
    changes: [
      {
        field_name: 'phone',
        label: 'Số điện thoại',
        old_value: '0979.114.552',
        new_value: '0988.999.777',
      },
      {
        field_name: 'current_residence',
        label: 'Nơi ở hiện nay',
        old_value: 'Đường Hùng Vương, P. Phú Nhuận, TP Huế',
        new_value: 'Số 15 Lê Huân, P. Thuận Hòa, TP Huế (gần Ban CHQS hơn)',
      },
      {
        field_name: 'distance_km',
        label: 'Cự ly cơ động (km)',
        old_value: '3.0',
        new_value: '1.8',
      },
    ],
    trang_thai: 'pending',
    requested_at: '2026-09-29 09:15',
  },
];

/**
 * Lấy danh sách yêu cầu cập nhật hồ sơ từ LocalStorage
 */
export function getStoredHosoUpdates(): HosoUpdateRecord[] {
  try {
    const raw = localStorage.getItem(HOSO_UPDATES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(HOSO_UPDATES_STORAGE_KEY, JSON.stringify(INITIAL_HOSO_UPDATES));
      return INITIAL_HOSO_UPDATES;
    }
    return JSON.parse(raw) as HosoUpdateRecord[];
  } catch {
    return INITIAL_HOSO_UPDATES;
  }
}

/**
 * Lưu danh sách yêu cầu cập nhật hồ sơ vào LocalStorage
 */
export function saveStoredHosoUpdates(updates: HosoUpdateRecord[]): void {
  try {
    localStorage.setItem(HOSO_UPDATES_STORAGE_KEY, JSON.stringify(updates));
  } catch (e) {
    console.warn('Lỗi lưu hoso_updates:', e);
  }
}

/**
 * Nạp danh sách yêu cầu cập nhật từ Supabase Cloud hoặc LocalStorage
 */
export async function fetchHosoUpdates(): Promise<{
  updates: HosoUpdateRecord[];
  isCloud: boolean;
}> {
  try {
    const { data, error } = await supabase
      .from('hoso_updates')
      .select('*')
      .order('requested_at', { ascending: false });

    if (error || !data || data.length === 0) {
      const local = getStoredHosoUpdates();
      return { updates: local, isCloud: false };
    }

    const parsed: HosoUpdateRecord[] = data.map((row: any) => ({
      id: row.id,
      member_id: row.member_id,
      member_name: row.member_name,
      military_rank: row.military_rank,
      field_category: row.field_category as HosoUpdateFieldCategory,
      category_label: row.category_label,
      changes: typeof row.changes === 'string' ? JSON.parse(row.changes) : row.changes,
      trang_thai: row.trang_thai,
      requested_at: row.requested_at,
      reviewed_by: row.reviewed_by,
      reviewed_at: row.reviewed_at,
      review_note: row.review_note,
    }));

    saveStoredHosoUpdates(parsed);
    return { updates: parsed, isCloud: true };
  } catch {
    const local = getStoredHosoUpdates();
    return { updates: local, isCloud: false };
  }
}

/**
 * Đảng viên tạo yêu cầu chỉnh sửa hồ sơ mới
 * Dữ liệu MỚI KHÔNG GHI ĐÈ trực tiếp vào bảng chính thức, mà INSERT vào bảng trung gian hoso_updates
 */
export async function submitHosoUpdateRequest(
  member: PartyMember,
  fieldCategory: HosoUpdateFieldCategory,
  categoryLabel: string,
  changes: FieldChangeDetail[],
  currentUpdates: HosoUpdateRecord[]
): Promise<{
  success: boolean;
  message: string;
  updatedList: HosoUpdateRecord[];
  newRecord: HosoUpdateRecord;
}> {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const newRecord: HosoUpdateRecord = {
    id: `upd-${Date.now().toString().slice(-6)}`,
    member_id: member.id,
    member_name: member.full_name,
    military_rank: member.military_rank,
    field_category: fieldCategory,
    category_label: categoryLabel,
    changes,
    trang_thai: 'pending',
    requested_at: dateStr,
  };

  const updatedList = [newRecord, ...currentUpdates];
  saveStoredHosoUpdates(updatedList);

  // Thử đẩy vào Supabase table hoso_updates
  try {
    await supabase.from('hoso_updates').insert([
      {
        id: newRecord.id,
        member_id: newRecord.member_id,
        member_name: newRecord.member_name,
        military_rank: newRecord.military_rank,
        field_category: newRecord.field_category,
        category_label: newRecord.category_label,
        changes: JSON.stringify(newRecord.changes),
        trang_thai: 'pending',
        requested_at: newRecord.requested_at,
      },
    ]);
  } catch {
    // Lưu nội bộ thành công
  }

  return {
    success: true,
    message: 'Yêu cầu thay đổi đã được gửi và đang ở trạng thái Chờ duyệt bởi Bí thư Chi bộ',
    updatedList,
    newRecord,
  };
}

/**
 * Bí thư Chi bộ phê duyệt yêu cầu cập nhật hồ sơ
 * Khi duyệt, áp dụng thay đổi vào hồ sơ Đảng viên chính thức
 */
export async function approveHosoUpdateRequest(
  updateId: string,
  reviewerName: string,
  currentUpdates: HosoUpdateRecord[],
  currentMembers: PartyMember[]
): Promise<{
  success: boolean;
  message: string;
  updatedUpdates: HosoUpdateRecord[];
  updatedMembers: PartyMember[];
}> {
  const updateIdx = currentUpdates.findIndex((u) => u.id === updateId);
  if (updateIdx === -1) {
    return {
      success: false,
      message: 'Không tìm thấy yêu cầu cập nhật',
      updatedUpdates: currentUpdates,
      updatedMembers: currentMembers,
    };
  }

  const targetUpdate = currentUpdates[updateIdx];
  const now = new Date();
  const reviewedAtStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const updatedRecord: HosoUpdateRecord = {
    ...targetUpdate,
    trang_thai: 'approved',
    reviewed_by: reviewerName || 'Đ/c Nguyễn Anh Toàn - Bí thư Chi bộ',
    reviewed_at: reviewedAtStr,
  };

  const updatedUpdatesList = [...currentUpdates];
  updatedUpdatesList[updateIdx] = updatedRecord;
  saveStoredHosoUpdates(updatedUpdatesList);

  // Áp dụng các thay đổi vào Đảng viên trong danh sách
  const targetMemberIdx = currentMembers.findIndex((m) => m.id === targetUpdate.member_id);
  let updatedMembersList = [...currentMembers];

  if (targetMemberIdx !== -1) {
    const originalMember = currentMembers[targetMemberIdx];
    const modifiedMember = { ...originalMember };

    // Duyệt qua các trường thay đổi
    targetUpdate.changes.forEach((c) => {
      const field = c.field_name as keyof PartyMember;
      if (field === 'distance_km') {
        (modifiedMember as any).distance_km = parseFloat(c.new_value) || originalMember.distance_km;
      } else {
        (modifiedMember as any)[field] = c.new_value;
      }
    });

    const res = await updatePartyMember(modifiedMember, currentMembers);
    updatedMembersList = res.updatedList;
  }

  // Cập nhật Supabase
  try {
    await supabase
      .from('hoso_updates')
      .update({
        trang_thai: 'approved',
        reviewed_by: updatedRecord.reviewed_by,
        reviewed_at: updatedRecord.reviewed_at,
      })
      .eq('id', updateId);
  } catch {
    // Fallback local
  }

  return {
    success: true,
    message: `Đã phê duyệt và cập nhật thành công hồ sơ của đ/c ${targetUpdate.member_name}`,
    updatedUpdates: updatedUpdatesList,
    updatedMembers: updatedMembersList,
  };
}

/**
 * Bí thư Chi bộ từ chối yêu cầu cập nhật hồ sơ
 */
export async function rejectHosoUpdateRequest(
  updateId: string,
  reviewerName: string,
  reason: string,
  currentUpdates: HosoUpdateRecord[]
): Promise<{
  success: boolean;
  message: string;
  updatedUpdates: HosoUpdateRecord[];
}> {
  const updateIdx = currentUpdates.findIndex((u) => u.id === updateId);
  if (updateIdx === -1) {
    return {
      success: false,
      message: 'Không tìm thấy yêu cầu cập nhật',
      updatedUpdates: currentUpdates,
    };
  }

  const targetUpdate = currentUpdates[updateIdx];
  const now = new Date();
  const reviewedAtStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const updatedRecord: HosoUpdateRecord = {
    ...targetUpdate,
    trang_thai: 'rejected',
    reviewed_by: reviewerName || 'Đ/c Nguyễn Anh Toàn - Bí thư Chi bộ',
    reviewed_at: reviewedAtStr,
    review_note: reason || 'Chưa cung cấp đủ giấy tờ / minh chứng hợp lệ',
  };

  const updatedUpdatesList = [...currentUpdates];
  updatedUpdatesList[updateIdx] = updatedRecord;
  saveStoredHosoUpdates(updatedUpdatesList);

  // Cập nhật Supabase
  try {
    await supabase
      .from('hoso_updates')
      .update({
        trang_thai: 'rejected',
        reviewed_by: updatedRecord.reviewed_by,
        reviewed_at: updatedRecord.reviewed_at,
        review_note: updatedRecord.review_note,
      })
      .eq('id', updateId);
  } catch {
    // Fallback local
  }

  return {
    success: true,
    message: `Đã từ chối yêu cầu cập nhật của đ/c ${targetUpdate.member_name}`,
    updatedUpdates: updatedUpdatesList,
  };
}
