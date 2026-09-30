import { supabase } from './supabaseClient';
import { Achievement, CreateAchievementDTO } from '../types/achievement';

const ACHIEVEMENTS_STORAGE_KEY = 'member_achievements_offline_v1';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-01',
    member_id: 'dv-01',
    title: 'Chiến sĩ thi đua cơ sở',
    year: '2024',
    decision_by: 'Bộ Chỉ huy Quân sự Tỉnh Thừa Thiên Huế',
    notes: 'Hoàn thành xuất sắc toàn diện công tác Hậu cần - Kỹ thuật năm 2024',
    status: 'approved',
    created_at: '2024-12-15T08:00:00Z',
    approved_at: '2024-12-20T09:00:00Z',
    approved_by: 'dv-01',
  },
  {
    id: 'ach-02',
    member_id: 'dv-01',
    title: 'Bằng khen của Bộ Tư lệnh Quân khu 4',
    year: '2023',
    decision_by: 'Đảng ủy - Bộ Tư lệnh Quân khu 4',
    notes: 'Thành tích xuất sắc trong diễn tập khu vực phòng thủ thành phố',
    status: 'approved',
    created_at: '2023-11-10T08:00:00Z',
    approved_at: '2023-11-12T09:00:00Z',
    approved_by: 'dv-01',
  },
  {
    id: 'ach-03',
    member_id: 'dv-02',
    title: 'Chiến sĩ thi đua cơ sở',
    year: '2025',
    decision_by: 'Bộ Chỉ huy Quân sự Tỉnh Thừa Thiên Huế',
    notes: 'Duy trì hệ số kỹ thuật phương tiện xe - máy đạt 100% SSCĐ',
    status: 'approved',
    created_at: '2025-12-10T08:00:00Z',
    approved_at: '2025-12-15T10:00:00Z',
    approved_by: 'dv-01',
  },
  {
    id: 'ach-04',
    member_id: 'dv-03',
    title: 'Huy hiệu 25 năm tuổi Đảng',
    year: '2024',
    decision_by: 'Đảng ủy Quân sự Tỉnh Thừa Thiên Huế',
    notes: 'Rèn luyện và cống hiến kiên trung trong hàng ngũ Đảng Cộng sản Việt Nam',
    status: 'approved',
    created_at: '2024-05-19T08:00:00Z',
    approved_at: '2024-05-19T09:00:00Z',
    approved_by: 'dv-01',
  },
  {
    id: 'ach-05',
    member_id: 'dv-05',
    title: 'Bằng khen của Chủ tịch UBND Tỉnh',
    year: '2024',
    decision_by: 'UBND Tỉnh Thừa Thiên Huế',
    notes: 'Thành tích xuất sắc trong công tác phòng chống bão lụt, cứu hộ cứu nạn',
    status: 'approved',
    created_at: '2024-10-25T08:00:00Z',
    approved_at: '2024-10-28T09:00:00Z',
    approved_by: 'dv-01',
  },
  {
    id: 'ach-06',
    member_id: 'dv-05',
    title: 'Chiến sĩ thi đua cơ sở',
    year: '2025',
    decision_by: 'Bộ Chỉ huy Quân sự Tỉnh Thừa Thiên Huế',
    notes: 'Chủ trì xây dựng thành công phần mềm Quản lý Đảng viên số hóa Chi bộ',
    status: 'pending',
    created_at: '2026-09-15T14:30:00Z',
  },
  {
    id: 'ach-07',
    member_id: 'dv-07',
    title: 'Chiến sĩ thi đua cơ sở',
    year: '2025',
    decision_by: 'Bộ Chỉ huy Quân sự Tỉnh Thừa Thiên Huế',
    notes: 'Đảm bảo quân số khỏe trên 99.2%, không để dịch bệnh xảy ra',
    status: 'pending',
    created_at: '2026-09-18T09:15:00Z',
  },
  {
    id: 'ach-08',
    member_id: 'dv-10',
    title: 'Giấy khen của Bộ CHQS Tỉnh',
    year: '2024',
    decision_by: 'Bộ Chỉ huy Quân sự Tỉnh Thừa Thiên Huế',
    notes: 'Đạt giải Nhì Hội thi Thợ kỹ thuật sửa chữa súng pháo cấp Tỉnh',
    status: 'approved',
    created_at: '2024-08-12T08:00:00Z',
    approved_at: '2024-08-15T09:00:00Z',
    approved_by: 'dv-01',
  },
  {
    id: 'ach-09',
    member_id: 'dv-10',
    title: 'Chiến sĩ tiên tiến',
    year: '2025',
    decision_by: 'Đảng ủy - Ban CHQS TP Huế',
    notes: 'Bảo dưỡng định kỳ 100% vũ khí trang bị tại kho kỹ thuật đơn vị',
    status: 'pending',
    created_at: '2026-09-20T11:00:00Z',
  },
  {
    id: 'ach-10',
    member_id: 'dv-14',
    title: 'Huy chương Chiến sĩ vẻ vang hạng Ba',
    year: '2024',
    decision_by: 'Bộ Quốc phòng',
    notes: 'Ghi nhận thời gian phục vụ liên tục trong Quân đội Nhân dân Việt Nam',
    status: 'approved',
    created_at: '2024-12-22T08:00:00Z',
    approved_at: '2024-12-22T09:00:00Z',
    approved_by: 'dv-01',
  },
  {
    id: 'ach-11',
    member_id: 'dv-19',
    title: 'Chiến sĩ thi đua cơ sở',
    year: '2025',
    decision_by: 'Bộ Chỉ huy Quân sự Tỉnh Thừa Thiên Huế',
    notes: 'Đạt danh hiệu "Bếp nuôi quân giỏi, quản lý tốt", phục vụ diễn tập xuất sắc',
    status: 'pending',
    created_at: '2026-09-22T16:20:00Z',
  },
  {
    id: 'ach-12',
    member_id: 'dv-04',
    title: 'Chiến sĩ tiên tiến',
    year: '2025',
    decision_by: 'Đảng ủy - Ban CHQS TP Huế',
    notes: 'Đảng viên trẻ hoàn thành tốt nhiệm vụ trực SSCĐ và quản lý quân trang',
    status: 'pending',
    created_at: '2026-09-24T10:00:00Z',
  }
];

export function getStoredAchievements(): Achievement[] {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    if (!raw) {
      saveStoredAchievements(INITIAL_ACHIEVEMENTS);
      return INITIAL_ACHIEVEMENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_ACHIEVEMENTS;
  } catch {
    return INITIAL_ACHIEVEMENTS;
  }
}

export function saveStoredAchievements(achievements: Achievement[]): void {
  try {
    localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(achievements));
  } catch (e) {
    console.error('Lỗi lưu achievements vào localStorage:', e);
  }
}

/**
 * Fetch all achievements from Supabase or localStorage fallback
 */
export async function fetchAllAchievements(): Promise<{ achievements: Achievement[]; isCloud: boolean }> {
  const localData = getStoredAchievements();

  try {
    const { data, error } = await supabase
      .from('member_achievements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Lỗi Supabase khi nạp member_achievements:', error.message);
      return { achievements: localData, isCloud: false };
    }

    if (data && Array.isArray(data) && data.length > 0) {
      const mapped: Achievement[] = data.map((row: any) => ({
        id: row.id,
        member_id: row.member_id,
        title: row.title,
        year: row.year,
        decision_by: row.decision_by,
        notes: row.notes,
        status: row.status,
        rejection_reason: row.rejection_reason,
        created_at: row.created_at,
        approved_at: row.approved_at,
        approved_by: row.approved_by,
      }));
      saveStoredAchievements(mapped);
      return { achievements: mapped, isCloud: true };
    }

    // If cloud is empty, seed with initial achievements
    if (localData.length > 0) {
      const rows = localData.map(a => ({
        id: a.id,
        member_id: a.member_id,
        title: a.title,
        year: a.year,
        decision_by: a.decision_by,
        notes: a.notes || '',
        status: a.status,
        rejection_reason: a.rejection_reason || null,
        created_at: a.created_at,
        approved_at: a.approved_at || null,
        approved_by: a.approved_by || null,
      }));
      await supabase.from('member_achievements').upsert(rows).then(() => {});
    }

    return { achievements: localData, isCloud: true };
  } catch (err) {
    console.warn('Sự cố mạng hoặc DNS khi nạp khen thưởng:', err);
    return { achievements: localData, isCloud: false };
  }
}

/**
 * Filter achievements by member ID
 */
export function getAchievementsByMember(allAchievements: Achievement[], memberId: string): Achievement[] {
  return allAchievements
    .filter(a => a.member_id === memberId)
    .sort((a, b) => {
      // Pending first, then by year descending
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (b.status === 'pending' && a.status !== 'pending') return 1;
      return String(b.year).localeCompare(String(a.year));
    });
}

/**
 * Count total pending requests across the unit
 */
export function countPendingAchievements(allAchievements: Achievement[]): number {
  return allAchievements.filter(a => a.status === 'pending').length;
}

/**
 * Submit a new achievement request (Self-service proposal)
 */
export async function submitAchievementRequest(
  data: CreateAchievementDTO,
  currentList: Achievement[]
): Promise<{ updatedList: Achievement[]; newAchievement: Achievement; success: boolean; message: string }> {
  const newAch: Achievement = {
    id: `ach-${Date.now()}`,
    member_id: data.member_id,
    title: data.title.trim(),
    year: data.year,
    decision_by: data.decision_by.trim(),
    notes: data.notes?.trim() || '',
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  const updatedList = [newAch, ...currentList];
  saveStoredAchievements(updatedList);

  // Sync to Supabase in background
  try {
    await supabase.from('member_achievements').insert([{
      id: newAch.id,
      member_id: newAch.member_id,
      title: newAch.title,
      year: newAch.year,
      decision_by: newAch.decision_by,
      notes: newAch.notes,
      status: 'pending',
      created_at: newAch.created_at,
    }]);
  } catch (err) {
    console.warn('Đã lưu nội bộ (Chờ đồng bộ Cloud):', err);
  }

  return {
    updatedList,
    newAchievement: newAch,
    success: true,
    message: 'Đã gửi đề xuất khen thưởng tới Bí thư Chi bộ xem xét phê duyệt.',
  };
}

/**
 * Approve an achievement request (Secretary dv-01)
 */
export async function approveAchievement(
  achievementId: string,
  approverId: string = 'dv-01',
  currentList: Achievement[]
): Promise<{ updatedList: Achievement[]; success: boolean; message: string }> {
  const now = new Date().toISOString();
  const updatedList = currentList.map(a => {
    if (a.id === achievementId) {
      return {
        ...a,
        status: 'approved' as const,
        approved_at: now,
        approved_by: approverId,
        rejection_reason: undefined,
      };
    }
    return a;
  });

  saveStoredAchievements(updatedList);

  // Sync with Supabase
  try {
    await supabase.from('member_achievements').update({
      status: 'approved',
      approved_at: now,
      approved_by: approverId,
      rejection_reason: null,
    }).eq('id', achievementId);
  } catch (err) {
    console.warn('Lỗi cập nhật cloud, đã lưu nội bộ:', err);
  }

  return {
    updatedList,
    success: true,
    message: 'Đã phê duyệt danh hiệu khen thưởng và ghi nhận vào lý lịch Đảng viên.',
  };
}

/**
 * Reject an achievement request (Secretary dv-01)
 */
export async function rejectAchievement(
  achievementId: string,
  reason: string,
  currentList: Achievement[]
): Promise<{ updatedList: Achievement[]; success: boolean; message: string }> {
  const updatedList = currentList.map(a => {
    if (a.id === achievementId) {
      return {
        ...a,
        status: 'rejected' as const,
        rejection_reason: reason.trim() || 'Hồ sơ chưa đủ điều kiện theo quy chế thi đua khen thưởng',
      };
    }
    return a;
  });

  saveStoredAchievements(updatedList);

  // Sync with Supabase
  try {
    await supabase.from('member_achievements').update({
      status: 'rejected',
      rejection_reason: reason.trim() || 'Hồ sơ chưa đủ điều kiện theo quy chế',
    }).eq('id', achievementId);
  } catch (err) {
    console.warn('Lỗi cập nhật cloud, đã lưu nội bộ:', err);
  }

  return {
    updatedList,
    success: true,
    message: 'Đã từ chối đề xuất khen thưởng.',
  };
}

/**
 * Delete achievement record
 */
export async function deleteAchievement(
  achievementId: string,
  currentList: Achievement[]
): Promise<{ updatedList: Achievement[]; success: boolean }> {
  const updatedList = currentList.filter(a => a.id !== achievementId);
  saveStoredAchievements(updatedList);

  try {
    await supabase.from('member_achievements').delete().eq('id', achievementId);
  } catch {}

  return { updatedList, success: true };
}
