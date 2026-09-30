import { EvaluationGrade } from './partyMember';

export type RatingLevel = 1 | 2 | 3 | 4;

export interface RatingLevelInfo {
  level: RatingLevel;
  points: number;
  label: string;
  shortLabel: string;
  description: string;
  colorName: 'emerald' | 'blue' | 'amber' | 'red';
  btnActiveBg: string;
  badgeClass: string;
}

export const RATING_LEVELS: Record<RatingLevel, RatingLevelInfo> = {
  4: {
    level: 4,
    points: 4,
    label: 'Hoàn thành xuất sắc nhiệm vụ',
    shortLabel: 'Xuất sắc (Mức 4)',
    description: 'Hoàn thành 100% nhiệm vụ vượt tiến độ, gương mẫu tiêu biểu',
    colorName: 'emerald',
    btnActiveBg: 'bg-emerald-700 text-white border-emerald-800 shadow-sm',
    badgeClass: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
  },
  3: {
    level: 3,
    points: 3,
    label: 'Hoàn thành tốt nhiệm vụ',
    shortLabel: 'Tốt (Mức 3)',
    description: 'Hoàn thành tốt các mặt công tác, chấp hành nghiêm kỷ luật',
    colorName: 'blue',
    btnActiveBg: 'bg-blue-700 text-white border-blue-800 shadow-sm',
    badgeClass: 'bg-blue-100 text-blue-900 border border-blue-300',
  },
  2: {
    level: 2,
    points: 2,
    label: 'Hoàn thành nhiệm vụ',
    shortLabel: 'Hoàn thành (Mức 2)',
    description: 'Cơ bản đạt yêu cầu, còn một số tồn tại nhỏ cần khắc phục',
    colorName: 'amber',
    btnActiveBg: 'bg-amber-600 text-white border-amber-700 shadow-sm',
    badgeClass: 'bg-amber-100 text-amber-900 border border-amber-300',
  },
  1: {
    level: 1,
    points: 1,
    label: 'Không hoàn thành nhiệm vụ',
    shortLabel: 'Không HT (Mức 1)',
    description: 'Chưa hoàn thành nhiệm vụ hoặc vi phạm quy định, kỷ luật',
    colorName: 'red',
    btnActiveBg: 'bg-red-700 text-white border-red-800 shadow-sm',
    badgeClass: 'bg-red-100 text-red-900 border border-red-300',
  },
};

export interface PeerBallot {
  id: string;
  evaluation_period: string;
  voter_id: string;
  target_id: string;
  rating_level: RatingLevel;
  created_at?: string;
}

export interface EvaluationPeriodInfo {
  id: string;
  title: string;
  year: number;
  month: number;
  is_locked: boolean;
  notes?: string;
  created_at: string;
  locked_at?: string;
}

export interface MemberBallotSummary {
  target_id: string;
  full_name: string;
  military_rank: string;
  position: string;
  party_status: string;
  total_votes: number;
  count_level_4: number;
  count_level_3: number;
  count_level_2: number;
  count_level_1: number;
  average_score: number;
  rate_level_4: number; // percentage
  rate_level_3_plus: number; // percentage
  rank: number;
  proposed_grade: EvaluationGrade;
}

export interface VoterProgress {
  voter_id: string;
  full_name: string;
  military_rank: string;
  position: string;
  has_voted: boolean;
  voted_at?: string;
  targets_voted_count: number;
}
