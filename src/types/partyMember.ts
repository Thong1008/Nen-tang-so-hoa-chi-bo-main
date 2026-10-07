export type PartyStatus = 'Chính thức' | 'Dự bị';

export type MilitaryRankType = 
  | 'Đại tá'
  | 'Thượng tá'
  | 'Trung tá'
  | 'Thiếu tá'
  | 'Đại úy'
  | 'Thượng úy'
  | 'Trung úy'
  | 'Thiếu úy'
  | 'Thượng tá QNCN'
  | 'Trung tá QNCN' 
  | 'Thiếu tá QNCN'
  | 'Đại úy QNCN'
  | 'Thượng úy QNCN'
  | 'Trung úy QNCN'
  | 'Thiếu úy QNCN';

export type EvaluationGrade = 
  | 'Hoàn thành xuất sắc nhiệm vụ'
  | 'Hoàn thành tốt nhiệm vụ'
  | 'Hoàn thành nhiệm vụ'
  | 'Không hoàn thành nhiệm vụ';

export interface EvaluationRecord {
  year: number;
  grade: EvaluationGrade;
  commendation?: string;
  notes?: string;
}

export interface PartyMember {
  id: string;
  full_name: string;
  birth_year: string;
  citizen_id: string;
  military_rank: string;
  position: string;
  enlistment_date: string;
  party_join_date: string;
  official_party_date?: string;
  party_status: PartyStatus;
  phone: string;
  emergency_contact: string;
  hometown: string;
  current_residence: string;
  distance_km: number;
  academic_level?: string;
  political_theory?: string;
  specialized_qualification?: string;
  foreign_language?: string;
  discipline_record?: string;
  notes?: string;
  evaluations?: EvaluationRecord[];
  created_at?: string;
}

export interface SupabasePartyMemberRow {
  id: string;
  full_name: string;
  birth_year: string;
  citizen_id: string;
  military_rank: string;
  position: string;
  enlistment_date: string;
  party_join_date: string;
  party_status: string;
  phone: string;
  emergency_contact: string;
  hometown: string;
  current_residence: string;
  distance_km: number;
  notes?: string;
  created_at?: string;
}

export interface FilterOptions {
  searchQuery: string;
  statusFilter: 'all' | 'Chính thức' | 'Dự bị';
  rankFilter?: string;
  sortBy?: 'name' | 'rank' | 'distance' | 'join_date';
  sortOrder?: 'asc' | 'desc';
}

export type ActiveTab = 'list' | 'analytics' | 'evaluation' | 'settings';
