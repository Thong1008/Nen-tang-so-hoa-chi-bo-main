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

 export async function fetchAllAchievements(): Promise<{ achievements: Achievement[]; isCloud: boolean }> {
  const localData = getStoredAchievements();

  try {
    // 1. GỌI DỮ LIỆU TỪ BẢNG THÀNH TÍCH CHÍNH THỨC TRÊN SUPABASE (Thay thế bảng proposals cũ)
    const { data, error } = await supabase
      .from('party_awards')
      .select('*')
      .eq('status', 'approved');

    if (error) {
      console.warn('Lỗi Supabase khi nạp party_awards thực tế:', error.message);
      return { achievements: localData, isCloud: false };
    }
// 2. KIỂM TRA VÀ ÁNH XẠ DỮ LIỆU KHỚP KHÍT 100% VỚI CÁC CỘT TRÊN SUPABASE
if (data && Array.isArray(data) && data.length > 0) {
    const mapped: Achievement[] = data.map((row: any) => ({
        id: row.id?.toString() || Math.random().toString(),
        member_id: row.member_id,
        title: row.title || 'Khen thưởng chính thức',
        year: typeof row.year === 'number' ? row.year : parseInt(row.year || new Date().getFullYear().toString(), 10),
        decision_by: row.decision_by || '', 
        notes: row.notes || undefined,
        status: row.status || 'approved',
        created_at: row.created_at || undefined,
        approved_at: row.created_at || undefined,
        approved_by: row.approved_by || 'Bí thư chi bộ'
    }));

      // Lưu lại bộ nhớ tạm máy cục bộ để phục vụ Offline fallback
      saveStoredAchievements(mapped);
      return { achievements: mapped, isCloud: true };
    }

    return { achievements: [], isCloud: true };
  } catch (err: any) {
    console.error('Lỗi ngoại lệ hệ thống khi fetch achievements:', err.message);
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
export async function s(
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
    await supabase.from('party_award_proposals').insert([{
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
  currentList: any[]
): Promise<{ updatedList: any[]; success: boolean; message: string }> {
  const now = new Date().toISOString();

  // 1. Tìm thông tin chi tiết của đề xuất dựa trên ID (ép kiểu chuỗi để so khớp an toàn trên RAM)
  const targetAch = currentList.find(a => a.id.toString() === achievementId.toString());

  try {
    if (targetAch) {
      // 2. CHÈN DỮ LIỆU THÀNH TÍCH CHÍNH THỨC VÀO BẢNG party_awards (Ghi trạng thái tiếng Anh 'approved')
      const { error: insertError } = await supabase
        .from('party_awards')
        .insert([
          {
            member_id: targetAch.member_id,
            title: targetAch.title || targetAch.name || 'Khen thưởng',
            year: targetAch.year ? parseInt(targetAch.year.toString(), 10) : new Date().getFullYear(),
            decision_by: targetAch.decision_by || 'Bộ chỉ huy Quân sự Tỉnh Thừa Thiên Huế',
            notes: targetAch.notes || '',
            status: 'approved' // Bảng này lưu tiếng Anh chuẩn theo ảnh 2 của bạn
          }
        ]);

      if (insertError) throw insertError;

                  // // 3. CẬP NHẬT TRẠNG THÁI BÊN BẢNG ĐỀ XUẤT party_award_proposals
        // Chuẩn hóa: Biến ID thành chuỗi văn bản sạch để REST API của Supabase nhận diện đúng kiểu số nguyên lớn int8 (Triệt tiêu hoàn toàn lỗi 400)
        const cleanProposalId = achievementId.toString().trim();

        const { error: updateError } = await supabase
          .from('party_award_proposals')
          .update({
            status: 'Đã duyệt' // Chỉ cập nhật duy nhất cột status chắc chắn tồn tại để thông suốt hệ thống
          })
          .eq('id', cleanProposalId);

        if (updateError) throw updateError;
      }
    } catch (err: any) {
      console.error('Lỗi thực tế phát sinh tại hệ thống:', err);
      return { 
        updatedList: currentList, 
        success: false, 
        message: err.message || 'Lỗi cập nhật hệ thống dữ liệu.' 
      };
    }

    // // 4. LỌC BỎ ĐƠN ĐÃ DUYỆT KHỎI STATE CỦA POPUP LẬP TỨC
    // Ép toàn bộ về chuỗi string để bộ lọc Array.filter chạy chính xác, đơn lập tức biến mất trên giao diện Web & Mobile
    const updatedList = currentList.filter(
      (a: any) => a.id.toString().trim() !== achievementId.toString().trim()
    );

    return {
      updatedList,
      success: true,
      message: 'Đã phê duyệt danh hiệu khen thưởng và ghi nhận vào lý lịch Đảng viên thành công.'
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
    await supabase.from('party_award_proposals').update({
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

    await supabase.from('party_awards').delete().eq('id', achievementId);
  } catch (err) {
    console.error('Lỗi khi xóa bản ghi trên Supabase:', err);
  }

  return { updatedList, success: true };
}

/**
 * =================================================================================
 * HÀM CHÈN MỚI: Gửi dữ liệu kê khai khen thưởng mới lên bảng annual_evaluations của Supabase
 * =================================================================================
 */
export async function submitAchievementRequest(
  request: CreateAchievementDTO
): Promise<{ success: boolean; achievement?: Achievement; error?: string }> {
  try {
    // Sau khi đồng nhất, việc insert vào bảng proposals chỉ đơn giản là truyền thẳng:
    const insertData = {
      member_id: request.member_id,
      title: request.title,
      year: request.year,
      decision_by: request.decision_by,
      notes: request.notes,
      status: 'pending'
    };

    // 2. Thực hiện lệnh INSERT lên Supabase
    const { data, error } = await supabase
      .from('party_award_proposals')
      .insert([insertData])
      .select('*')
      .single();

    if (error) {
      console.error('Lỗi Supabase khi thêm khen thưởng:', error.message);
      return { success: false, error: error.message };
    }

    // 3. Mapping dữ liệu trả về thành đối tượng Achievement để giao diện cập nhật mục Chờ Duyệt
    const newAchievement: Achievement = {
      id: data.id?.toString() || Math.random().toString(),
      member_id: data.member_id,
      title: data.title || 'Khen thưởng mới',
      year: data.year?.toString(),
      decision_by: request.decision_by || 'Đang cập nhật',
      notes: data.notes || '',
      status: 'pending' as any, // Trạng thái ban đầu luôn là pending để hiển thị ở danh sách chờ duyệt
      rejection_reason: '',
      created_at: data.created_at || new Date().toISOString()
    };

    // Cập nhật lại bộ nhớ tạm máy cục bộ
    const currentLocal = getStoredAchievements();
    saveStoredAchievements([newAchievement, ...currentLocal]);

    return { success: true, achievement: newAchievement };

  } catch (err: any) {
    console.error('Sự cố hệ thống khi submit khen thưởng:', err);
    return { success: false, error: err.message || 'Lỗi hệ thống' };
  }
}

