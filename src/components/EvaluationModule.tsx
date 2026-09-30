import React, { useState, useEffect, useMemo } from 'react';
import { PartyMember } from '../types/partyMember';
import { 
  RatingLevel, 
  RATING_LEVELS, 
  MemberBallotSummary, 
  VoterProgress, 
  EvaluationPeriodInfo,
  PeerBallot
} from '../types/evaluation';
import { 
  fetchPeriodBallots, 
  submitVoterBallots, 
  calculateEvaluationSummary, 
  togglePeriodLock,
  exportEvaluationMinutesToWord,
  CURRENT_PERIOD
} from '../utils/evaluationService';
import { 
  Award, 
  UserCheck, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Unlock, 
  FileDown, 
  Users, 
  TrendingUp, 
  ChevronRight, 
  Star, 
  Send, 
  Info,
  Clock,
  Sparkles,
  Zap,
  Eye,
  Check
} from 'lucide-react';

interface EvaluationModuleProps {
  members: PartyMember[];
}

export const EvaluationModule: React.FC<EvaluationModuleProps> = ({ members }) => {
  const [periodId, setPeriodId] = useState<string>('2026-09');
  const [ballots, setBallots] = useState<PeerBallot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCloud, setIsCloud] = useState<boolean>(false);
  const [periodInfo, setPeriodInfo] = useState<EvaluationPeriodInfo>(CURRENT_PERIOD);

  // Role switching: Secretary (dv-01) vs Member Voter
  const [currentVoterId, setCurrentVoterId] = useState<string>('dv-04'); // Default to a young comrade
  const [isSecretaryRole, setIsSecretaryRole] = useState<boolean>(false);

  // Current voter's ratings in memory: { targetId: RatingLevel }
  const [currentVotes, setCurrentVotes] = useState<Record<string, RatingLevel>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Filter for Secretary's Ranking Table
  const [tableFilter, setTableFilter] = useState<'all' | 'Xuất sắc' | 'Tốt' | 'Hoàn thành' | 'Không HT'>('all');

  // Load ballots and sync
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchPeriodBallots(periodId);
      setBallots(res.ballots);
      setIsCloud(res.isCloud);
    } catch {
      console.warn('Lỗi nạp ballots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [periodId]);

  // Calculate summaries, progress and metrics
  const {
    summaries,
    votersProgress,
    totalVotersCount,
    completedVotersCount,
  } = useMemo(() => {
    return calculateEvaluationSummary(periodId, members, ballots);
  }, [periodId, members, ballots]);

  // Get current voter's existing votes from ballots
  useEffect(() => {
    const voterExistingBallots = ballots.filter(
      b => b.evaluation_period === periodId && b.voter_id === currentVoterId
    );
    const initialMap: Record<string, RatingLevel> = {};
    voterExistingBallots.forEach(b => {
      initialMap[b.target_id] = b.rating_level;
    });
    setCurrentVotes(initialMap);
  }, [currentVoterId, ballots, periodId]);

  // Current voter's profile
  const currentVoter = useMemo(() => {
    return members.find(m => m.id === currentVoterId) || members[0];
  }, [members, currentVoterId]);

  // Check if current voter has completed all 20 targets
  const currentVoterTargets = useMemo(() => {
    // 20 comrades excluding self
    return members.filter(m => m.id !== currentVoterId);
  }, [members, currentVoterId]);

  const currentVotedCount = useMemo(() => {
    return currentVoterTargets.filter(m => currentVotes[m.id] !== undefined).length;
  }, [currentVoterTargets, currentVotes]);

  const hasAlreadySubmitted = useMemo(() => {
    const progress = votersProgress.find(v => v.voter_id === currentVoterId);
    return Boolean(progress?.has_voted);
  }, [votersProgress, currentVoterId]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Toggle quick rating for single target
  const handleRateTarget = (targetId: string, level: RatingLevel) => {
    if (periodInfo.is_locked) {
      showToast('Kỳ bỏ phiếu đã bị khóa bởi Bí thư Chi bộ.', 'error');
      return;
    }
    if (hasAlreadySubmitted) {
      showToast('Phiếu của đồng chí đã được khóa nộp, không thể thay đổi.', 'info');
      return;
    }
    setCurrentVotes(prev => ({
      ...prev,
      [targetId]: level,
    }));
  };

  // Quick fill all targets to Level 3 (Good) to save time, then user can customize
  const handleQuickFillGood = () => {
    if (hasAlreadySubmitted || periodInfo.is_locked) return;
    const filled: Record<string, RatingLevel> = { ...currentVotes };
    currentVoterTargets.forEach(target => {
      if (filled[target.id] === undefined) {
        filled[target.id] = 3; // Default Good
      }
    });
    setCurrentVotes(filled);
    showToast('Đã nạp nhanh mức "Hoàn thành tốt" cho các đồng chí còn lại!', 'info');
  };

  // Submit Ballot
  const handleSubmitBallot = async () => {
    if (periodInfo.is_locked) {
      showToast('Kỳ đánh giá đang bị khóa!', 'error');
      return;
    }

    if (currentVotedCount < currentVoterTargets.length) {
      showToast(
        `Đồng chí chưa hoàn thành đánh giá (còn thiếu ${currentVoterTargets.length - currentVotedCount} người). Vui lòng chấm điểm đủ 20 đồng chí!`,
        'error'
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitVoterBallots(periodId, currentVoterId, currentVotes);
      showToast(res.message, 'success');
      await loadData();
    } catch (e: any) {
      showToast(`Lỗi gửi phiếu: ${e.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Period Lock (Secretary only)
  const handleTogglePeriodLock = () => {
    const nextState = !periodInfo.is_locked;
    const updated = togglePeriodLock(periodId, nextState);
    setPeriodInfo(updated);
    showToast(
      nextState
        ? 'Đã chốt kết quả và KHÓA kỳ bỏ phiếu thành công!'
        : 'Đã MỞ LẠI kỳ bỏ phiếu cho Đảng viên nộp bổ sung.',
      'info'
    );
  };

  // Filtered Ranking Table
  const filteredSummaries = useMemo(() => {
    if (tableFilter === 'all') return summaries;
    if (tableFilter === 'Xuất sắc') return summaries.filter(s => s.proposed_grade === 'Hoàn thành xuất sắc nhiệm vụ');
    if (tableFilter === 'Tốt') return summaries.filter(s => s.proposed_grade === 'Hoàn thành tốt nhiệm vụ');
    if (tableFilter === 'Hoàn thành') return summaries.filter(s => s.proposed_grade === 'Hoàn thành nhiệm vụ');
    if (tableFilter === 'Không HT') return summaries.filter(s => s.proposed_grade === 'Không hoàn thành nhiệm vụ');
    return summaries;
  }, [summaries, tableFilter]);

  // Top performers
  const top4Summaries = useMemo(() => {
    return summaries.slice(0, 4);
  }, [summaries]);

  return (
    <div className="space-y-6 font-interface">
      {/* 1. THANH ĐIỀU HƯỚNG VAI TRÒ & TIẾN ĐỘ TỔNG QUAN */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Bộ chọn vai trò tinh gọn */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Chế độ truy cập:
            </span>
            <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-100 text-xs">
              <button
                onClick={() => {
                  setIsSecretaryRole(true);
                  setCurrentVoterId('dv-01');
                }}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSecretaryRole
                    ? 'bg-red-800 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                <span>Bí thư Chi bộ (Chủ tọa)</span>
              </button>

              <button
                onClick={() => {
                  setIsSecretaryRole(false);
                  if (currentVoterId === 'dv-01') setCurrentVoterId('dv-04');
                }}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  !isSecretaryRole
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Đảng viên bỏ phiếu tín nhiệm</span>
              </button>
            </div>
          </div>

          {/* Chọn tài khoản Đảng viên cụ thể nếu đang ở chế độ Cử tri */}
          {!isSecretaryRole && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600">Đăng nhập tài khoản:</span>
              <select
                value={currentVoterId}
                onChange={(e) => setCurrentVoterId(e.target.value)}
                className="text-xs font-semibold px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-slate-800 cursor-pointer"
              >
                {members.map((m) => {
                  const prog = votersProgress.find(v => v.voter_id === m.id);
                  return (
                    <option key={m.id} value={m.id}>
                      {m.id.toUpperCase()}: {m.military_rank} {m.full_name} {prog?.has_voted ? '(✓ Đã nộp phiếu)' : '(Chưa nộp)'}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Huy hiệu trạng thái Kỳ đánh giá */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                periodInfo.is_locked
                  ? 'bg-red-100 text-red-900 border border-red-300'
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}
            >
              {periodInfo.is_locked ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-red-700" />
                  <span>Kỳ họp: ĐÃ KHÓA KẾT QUẢ</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span>Kỳ họp: ĐANG DIỄN RA BỎ PHIẾU</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Thanh tóm tắt tiến độ tổng thể */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-500">Kỳ đánh giá:</span>
              <strong className="text-slate-900 ml-1.5">{periodInfo.title}</strong>
            </div>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div>
              <span className="text-slate-500">Tiến độ cử tri nộp phiếu:</span>
              <strong className="text-red-900 ml-1.5 tabular-nums">
                {completedVotersCount} / {totalVotersCount} đồng chí ({((completedVotersCount / totalVotersCount) * 100).toFixed(0)}%)
              </strong>
            </div>
          </div>

          <div className="w-full sm:w-48 bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${(completedVotersCount / totalVotersCount) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. CHẾ ĐỘ: BÍ THƯ CHI BỘ (CHỦ TỌA / QUẢN TRỊ) */}
      {isSecretaryRole ? (
        <div className="space-y-6">
          {/* Action Bar của Bí thư */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-red-800" />
                Bảng Tổng Hợp Kiểm Phiếu & Xếp Hạng Tự Động
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Đồng chí <strong>Trung tá Nguyễn Anh Toàn</strong> - Bí thư Chi bộ Hậu cần - Kỹ thuật chủ tọa
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Nút Khóa / Mở kỳ bỏ phiếu */}
              <button
                onClick={handleTogglePeriodLock}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs ${
                  periodInfo.is_locked
                    ? 'bg-amber-700 hover:bg-amber-600 text-white'
                    : 'bg-red-800 hover:bg-red-700 text-white'
                }`}
              >
                {periodInfo.is_locked ? (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>Mở Lại Kỳ Bỏ Phiếu</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Chốt Kết Quả & Khóa Phiếu</span>
                  </>
                )}
              </button>

              {/* Nút Xuất Biên bản kiểm phiếu Word chuẩn Nghị định 30 */}
              <button
                onClick={() => exportEvaluationMinutesToWord(periodInfo, summaries, votersProgress)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors cursor-pointer shadow-2xs"
                title="Xuất biên bản kiểm phiếu và nghị quyết xếp loại chuẩn thể thức công văn Đảng sang Microsoft Word"
              >
                <FileDown className="w-4 h-4 text-red-800" />
                <span>Xuất Biên Bản Kiểm Phiếu Word (.doc)</span>
              </button>
            </div>
          </div>

          {/* Khối theo dõi tiến độ nộp phiếu của 21 đồng chí */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wide">
                Trạng Thái Nộp Phiếu Của 21 Đảng Viên
              </span>
              <span className="text-slate-500">
                Đã nộp: <strong className="text-emerald-700">{completedVotersCount}</strong> · Chưa nộp: <strong className="text-amber-700">{totalVotersCount - completedVotersCount}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {votersProgress.map((v) => (
                <div
                  key={v.voter_id}
                  className={`p-2 rounded-lg border text-xs flex flex-col justify-between ${
                    v.has_voted
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : 'bg-amber-50/70 border-amber-200 text-amber-950'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-slate-500">
                      {v.voter_id.toUpperCase()}
                    </span>
                    {v.has_voted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                    )}
                  </div>
                  <div className="font-semibold truncate text-[11.5px] mt-1">
                    {v.full_name}
                  </div>
                  <div className="text-[10px] opacity-75 truncate">
                    {v.military_rank}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Biểu đồ thanh ngang trực quan Top 4 Xuất Sắc */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  Top 4 Đồng Chí Đạt Điểm Tín Nhiệm Cao Nhất (Dự Kiến "Xuất Sắc")
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Theo Quy định 124-QĐ/TW: Không quá 20% số lượng Đảng viên được xếp loại Hoàn thành tốt nhiệm vụ
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {top4Summaries.map((s, idx) => (
                <div
                  key={s.target_id}
                  className="p-3.5 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50/60 to-white relative overflow-hidden"
                >
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-amber-400 text-red-950 font-bold text-xs flex items-center justify-center shadow-xs">
                    #{idx + 1}
                  </div>
                  <div className="text-xs text-amber-800 font-semibold">{s.target_id.toUpperCase()} · {s.military_rank}</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5 truncate">{s.full_name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{s.position}</div>

                  <div className="mt-3 pt-2.5 border-t border-amber-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500">Điểm Trung Bình:</span>
                      <div className="text-base font-bold text-red-900 tabular-nums">
                        {s.average_score.toFixed(2)} <span className="text-xs font-normal text-slate-500">/ 4.0</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500">Tỷ lệ Mức 4 (XS):</span>
                      <div className="text-sm font-bold text-emerald-700 tabular-nums">
                        {s.rate_level_4}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bảng tổng hợp xếp hạng 21 đồng chí chuẩn font Times New Roman */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            {/* Thanh lọc phân loại */}
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs font-interface">
              <div className="font-bold text-slate-800 uppercase tracking-wide">
                Bảng Điểm Tín Nhiệm & Xếp Loại Toàn Chi Bộ ({filteredSummaries.length} đồng chí)
              </div>

              <div className="flex items-center gap-1">
                {(['all', 'Xuất sắc', 'Tốt', 'Hoàn thành', 'Không HT'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setTableFilter(tab)}
                    className={`px-3 py-1 rounded-md font-medium transition-all ${
                      tableFilter === tab
                        ? 'bg-red-800 text-white shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
                    }`}
                  >
                    {tab === 'all' ? 'Tất cả (21)' : tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Bảng 10 cột chuẩn thể thức */}
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse font-document text-[13.5px] leading-normal min-w-[1050px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 border-b border-slate-300 font-bold text-center">
                    <th className="py-2.5 px-2 border-r border-slate-300 w-14">Hạng</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-left min-w-[170px]">Họ và tên</th>
                    <th className="py-2.5 px-2 border-r border-slate-300 w-24">Cấp bậc</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-left min-w-[170px]">Chức vụ</th>
                    <th className="py-2.5 px-2 border-r border-slate-300 w-20 text-emerald-800">Mức 4 (XS)</th>
                    <th className="py-2.5 px-2 border-r border-slate-300 w-20 text-blue-800">Mức 3 (Tốt)</th>
                    <th className="py-2.5 px-2 border-r border-slate-300 w-20 text-amber-800">Mức 2 (HT)</th>
                    <th className="py-2.5 px-2 border-r border-slate-300 w-20 text-red-800">Mức 1 (KHT)</th>
                    <th className="py-2.5 px-2 border-r border-slate-300 w-24 font-bold">Điểm TB</th>
                    <th className="py-2.5 px-3 text-center min-w-[170px]">Xếp loại đề xuất</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredSummaries.map((s) => (
                    <tr key={s.target_id} className="hover:bg-amber-50/40 transition-colors">
                      {/* Hạng */}
                      <td className="py-2.5 px-2 text-center font-bold text-slate-900 border-r border-slate-200">
                        {s.rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-red-950 text-xs">1</span>
                        ) : s.rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-slate-900 text-xs">2</span>
                        ) : s.rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-600 text-white text-xs">3</span>
                        ) : (
                          <span className="tabular-nums">{s.rank}</span>
                        )}
                      </td>

                      {/* Họ và tên */}
                      <td className="py-2.5 px-3 border-r border-slate-200">
                        <div className="font-bold text-slate-900">{s.full_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{s.target_id.toUpperCase()}</div>
                      </td>

                      {/* Cấp bậc */}
                      <td className="py-2.5 px-2 text-center border-r border-slate-200 whitespace-nowrap text-slate-800 font-semibold">
                        {s.military_rank}
                      </td>

                      {/* Chức vụ */}
                      <td className="py-2.5 px-3 border-r border-slate-200 text-slate-800 text-[12.5px]">
                        {s.position}
                      </td>

                      {/* Mức 4 */}
                      <td className="py-2.5 px-2 text-center border-r border-slate-200 font-bold text-emerald-800 tabular-nums">
                        {s.count_level_4}
                      </td>

                      {/* Mức 3 */}
                      <td className="py-2.5 px-2 text-center border-r border-slate-200 font-medium text-blue-800 tabular-nums">
                        {s.count_level_3}
                      </td>

                      {/* Mức 2 */}
                      <td className="py-2.5 px-2 text-center border-r border-slate-200 text-amber-800 tabular-nums">
                        {s.count_level_2}
                      </td>

                      {/* Mức 1 */}
                      <td className="py-2.5 px-2 text-center border-r border-slate-200 text-red-800 tabular-nums">
                        {s.count_level_1}
                      </td>

                      {/* Điểm TB */}
                      <td className="py-2.5 px-2 text-center border-r border-slate-200 font-bold text-red-900 text-[14px] tabular-nums">
                        {s.average_score.toFixed(2)}
                      </td>

                      {/* Xếp loại đề xuất */}
                      <td className="py-2.5 px-3 text-center font-interface">
                        <span
                          className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-md ${
                            s.proposed_grade === 'Hoàn thành xuất sắc nhiệm vụ'
                              ? 'bg-red-100 text-red-900 border border-red-300'
                              : s.proposed_grade === 'Hoàn thành tốt nhiệm vụ'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : s.proposed_grade === 'Hoàn thành nhiệm vụ'
                              ? 'bg-blue-100 text-blue-900 border border-blue-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {s.proposed_grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* 3. CHẾ ĐỘ: ĐẢNG VIÊN BỎ PHIẾU (CỬ TRI - 20 ĐỒNG CHÍ) */
        <div className="space-y-5">
          {/* Banner thông tin cử tri hiện tại */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 text-white p-4 sm:p-5 rounded-xl border border-slate-800 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-800 text-amber-300 font-bold text-base flex items-center justify-center ring-2 ring-amber-400/80 shrink-0">
                  {currentVoter.full_name.slice(-2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      {currentVoter.id.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-300">
                      {currentVoter.party_status}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white mt-0.5">
                    {currentVoter.military_rank} {currentVoter.full_name}
                  </h2>
                  <p className="text-xs text-slate-300">{currentVoter.position}</p>
                </div>
              </div>

              {/* Thông tin khóa phiếu hoặc tiến độ */}
              <div className="text-right">
                {hasAlreadySubmitted ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Phiếu của đồng chí đã nộp & khóa an toàn</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="text-xs text-amber-300 font-medium">
                      Đã đánh giá: <strong className="text-white tabular-nums">{currentVotedCount} / 20</strong> đồng chí
                    </div>
                    <div className="text-[11px] text-slate-300">
                      {currentVotedCount === 20 ? 'Đã đủ điều kiện nộp phiếu' : `Còn thiếu ${20 - currentVotedCount} đồng chí`}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-700/60 text-xs text-slate-300 flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Nguyên tắc khách quan:</strong> Đồng chí đánh giá 20 đồng chí còn lại theo 4 mức chuẩn (bản thân tự động được ẩn khỏi danh sách chấm điểm).
              </span>
            </div>
          </div>

          {/* Thanh công cụ hỗ trợ bỏ phiếu 1 chạm */}
          {!hasAlreadySubmitted && (
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Thao tác nhanh tiết kiệm thời gian:</span>
                <button
                  onClick={handleQuickFillGood}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg font-semibold transition-colors cursor-pointer"
                  title="Điền sẵn Mức 3 (Hoàn thành tốt nhiệm vụ) cho những đồng chí chưa chấm, sau đó bạn chỉ cần chỉnh lại người xuất sắc hoặc cần lưu ý"
                >
                  <Zap className="w-3.5 h-3.5 text-blue-600" />
                  <span>Điền nhanh toàn bộ [Mức 3 - Tốt]</span>
                </button>
              </div>

              {/* Nút gửi phiếu đánh giá */}
              <button
                onClick={handleSubmitBallot}
                disabled={submitting || currentVotedCount < 20}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-red-800 hover:bg-red-700 active:bg-red-900 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 text-amber-300" />
                <span>
                  {submitting
                    ? 'Đang gửi phiếu...'
                    : currentVotedCount === 20
                    ? 'GỬI PHIẾU ĐÁNH GIÁ (20/20)'
                    : `CÒN THIẾU ${20 - currentVotedCount} NGƯỜI`}
                </span>
              </button>
            </div>
          )}

          {/* Danh sách 20 thẻ (Cards) Đảng viên - Responsive Mobile & Desktop */}
          <div className="space-y-3">
            {currentVoterTargets.map((target, idx) => {
              const selectedLevel = currentVotes[target.id];
              const isRated = selectedLevel !== undefined;

              return (
                <div
                  key={target.id}
                  className={`p-4 rounded-xl border transition-all duration-150 ${
                    isRated
                      ? 'bg-white border-slate-200 shadow-2xs'
                      : 'bg-amber-50/40 border-amber-300/80 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    {/* Thông tin Đảng viên được chấm */}
                    <div className="flex items-center gap-3 min-w-[280px]">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-sm text-slate-800 shrink-0">
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 truncate">
                            {target.full_name}
                          </span>
                          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {target.id.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          <span className="font-semibold text-red-900">{target.military_rank}</span> · {target.position}
                        </div>
                      </div>
                    </div>

                    {/* 4 Nút Chọn Nhanh 1 Chạm (Radio Chips) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1 max-w-xl">
                      {([4, 3, 2, 1] as RatingLevel[]).map((level) => {
                        const info = RATING_LEVELS[level];
                        const isSelected = selectedLevel === level;

                        return (
                          <button
                            key={level}
                            type="button"
                            disabled={hasAlreadySubmitted || periodInfo.is_locked}
                            onClick={() => handleRateTarget(target.id, level)}
                            className={`px-2.5 py-2 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
                              isSelected
                                ? info.btnActiveBg
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                            } ${hasAlreadySubmitted ? 'cursor-default' : ''}`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                            <span className="truncate">{info.shortLabel}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Nút gửi phiếu ở cuối trang cho cử tri cuộn tới cuối */}
          {!hasAlreadySubmitted && (
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div className="text-xs text-slate-600">
                Đã hoàn tất: <strong className="text-slate-900 tabular-nums">{currentVotedCount} / 20</strong> đồng chí
              </div>
              <button
                onClick={handleSubmitBallot}
                disabled={submitting || currentVotedCount < 20}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-red-800 hover:bg-red-700 active:bg-red-900 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 text-amber-300" />
                <span>GỬI PHIẾU ĐÁNH GIÁ NGAY</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Thông báo Toast góc dưới */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold text-white bg-slate-900 border border-slate-700">
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}
    </div>
  );
};
