export type HosoUpdateFieldCategory = 'education' | 'achievement' | 'discipline' | 'contact';

export type HosoUpdateStatus = 'Chờ duyệt' | 'Đã duyệt' | 'Từ chối';

export interface FieldChangeDetail {
  label: string;
  field_name: string;
  old_value: string;
  new_value: string;
}

export interface HosoUpdateRecord {
  id: string;
  member_id: string;
  member_name: string;
  military_rank: string;
  field_category: HosoUpdateFieldCategory;
  category_label: string;
  changes: FieldChangeDetail[];
  trang_thai: HosoUpdateStatus;
  requested_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_note?: string;
}

export interface AuthUser {
  id: string; // e.g. "dv-01"
  citizen_id: string; // e.g. "046088001248"
  full_name: string;
  military_rank: string;
  position: string;
  party_status: 'Chính thức' | 'Dự bị';
  role: 'admin' | 'member'; // admin: Bí thư / Phó Bí thư; member: Đảng viên thường
}
