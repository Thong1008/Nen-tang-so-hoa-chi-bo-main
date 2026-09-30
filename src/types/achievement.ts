export type AchievementStatus = 'pending' | 'approved' | 'rejected';

export interface Achievement {
  id: string;
  member_id: string;
  title: string;
  year: number | string;
  decision_by: string;
  notes?: string;
  status: AchievementStatus;
  rejection_reason?: string;
  created_at?: string;
  approved_at?: string;
  approved_by?: string;
}

export interface CreateAchievementDTO {
  member_id: string;
  title: string;
  year: number | string;
  decision_by: string;
  notes?: string;
}

export const COMMON_ACHIEVEMENT_TITLES = [
  'Chiến sĩ thi đua cơ sở',
  'Chiến sĩ tiên tiến',
  'Đảng viên hoàn thành xuất sắc nhiệm vụ',
  'Bằng khen của Bộ Tư lệnh Quân khu',
  'Bằng khen của Chủ tịch UBND Tỉnh',
  'Giấy khen của Bộ CHQS Tỉnh',
  'Giấy khen của Ban CHQS TP Huế',
  'Huy hiệu 30 năm tuổi Đảng',
  'Huy hiệu 25 năm tuổi Đảng',
  'Huy chương Chiến sĩ vẻ vang hạng Nhất',
  'Huy chương Chiến sĩ vẻ vang hạng Nhì',
  'Huy chương Chiến sĩ vẻ vang hạng Ba',
  'Huy chương Quân kỳ Quyết thắng',
] as const;

export const DECISION_AUTHORITIES = [
  'Đảng ủy - Ban CHQS TP Huế',
  'Bộ Chỉ huy Quân sự Tỉnh Thừa Thiên Huế',
  'Đảng ủy - Bộ Tư lệnh Quân khu 4',
  'Bộ Quốc phòng',
  'UBND Tỉnh Thừa Thiên Huế',
  'Chi bộ Hậu cần - Kỹ thuật',
] as const;
