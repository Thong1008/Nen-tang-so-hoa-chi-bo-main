import React, { useState, useMemo } from 'react';
import { PartyMember } from '../types/partyMember';
import { RatingLevel, RATING_LEVELS } from '../types/evaluation';
import { 
  Check, 
  Send, 
  Zap, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  UserCheck, 
  Info,
  ChevronDown
} from 'lucide-react';

interface QuickVoteMobileProps {
  members: PartyMember[];
  currentVoterId: string;
  onSelectVoterId: (id: string) => void;
  currentVotes: Record<string, RatingLevel>;
  onRateTarget: (targetId: string, level: RatingLevel) => void;
  onQuickFillGood: () => void;
  onSubmitBallot: () => Promise<void>;
  submitting: boolean;
  hasAlreadySubmitted: boolean;
  isPeriodLocked: boolean;
}

export const QuickVoteMobile: React.FC<QuickVoteMobileProps> = ({
  members,
  currentVoterId,
  onSelectVoterId,
  currentVotes,
  onRateTarget,
  onQuickFillGood,
  onSubmitBallot,
  submitting,
  hasAlreadySubmitted,
  isPeriodLocked,
}) => {
  const [missingAlertId, setMissingAlertId] = useState<string | null>(null);

  // Current voter profile
  const currentVoter = useMemo(() => {
    return members.find(m => m.id === currentVoterId) || members[0];
  }, [members, currentVoterId]);

  // 20 comrades excluding self
  const targets = useMemo(() => {
    return members.filter(m => m.id !== currentVoterId);
  }, [members, currentVoterId]);

  const votedCount = useMemo(() => {
    return targets.filter(t => currentVotes[t.id] !== undefined).length;
  }, [targets, currentVotes]);

  const isComplete = votedCount === targets.length;

  const handleAttemptSubmit = () => {
    // Find first unrated comrade
    const firstMissing = targets.find(t => currentVotes[t.id] === undefined);
    if (firstMissing) {
      setMissingAlertId(firstMissing.id);
      const element = document.getElementById(`target-card-${firstMissing.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    onSubmitBallot();
  };

  return (
    <div className="space-y-3 font-interface pb-24">
      {/* Sticky Voter Selector & Progress on Mobile */}
      <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 shadow-md space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs text-slate-300 font-medium">Cử tri bỏ phiếu:</span>
          </div>

          <select
            value={currentVoterId}
            onChange={(e) => onSelectVoterId(e.target.value)}
            className="text-xs font-bold px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-amber-300 focus:outline-none cursor-pointer max-w-[200px] truncate"
          >
            {members.map(m => (
              <option key={m.id} value={m.id}>
                {m.id.toUpperCase()}: {m.full_name}
              </option>
            ))}
          </select>
        </div>

        {/* Status progress bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Tiến độ chấm điểm:</span>
            <span className="font-bold tabular-nums text-amber-400">
              {votedCount} / 20 đồng chí {isComplete ? '(Đủ điều kiện)' : `(Thiếu ${20 - votedCount})`}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isComplete ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${(votedCount / 20) * 100}%` }}
            />
          </div>
        </div>

        {/* Quick action bar */}
        {!hasAlreadySubmitted && !isPeriodLocked && (
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <button
              onClick={onQuickFillGood}
              type="button"
              className="w-full py-1.5 px-3 bg-blue-600/30 hover:bg-blue-600/40 text-blue-200 border border-blue-500/40 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <span>Điền nhanh toàn bộ [Mức 3 - Tốt]</span>
            </button>
          </div>
        )}

        {hasAlreadySubmitted && (
          <div className="pt-1.5 text-xs text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Phiếu đã được nộp và khóa bảo mật trên hệ thống.</span>
          </div>
        )}
      </div>

      {/* Roster of 20 comrades with 1-touch pill rating */}
      <div className="space-y-2.5">
        {targets.map((target, idx) => {
          const selected = currentVotes[target.id];
          const isRated = selected !== undefined;
          const isMissingHighlighted = missingAlertId === target.id;

          return (
            <div
              key={target.id}
              id={`target-card-${target.id}`}
              className={`p-3 rounded-xl border transition-all ${
                isMissingHighlighted
                  ? 'bg-red-50 border-red-500 ring-2 ring-red-400 shadow-md'
                  : isRated
                  ? 'bg-white border-slate-200 shadow-2xs'
                  : 'bg-amber-50/50 border-amber-300 shadow-xs'
              }`}
            >
              {/* Comrade identity */}
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm truncate">
                      {target.full_name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {target.id.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    <strong className="text-red-900 font-semibold">{target.military_rank}</strong> · {target.position}
                  </div>
                </div>
              </div>

              {/* 4 Pill Touch Buttons right under each comrade */}
              <div className="grid grid-cols-4 gap-1">
                {([4, 3, 2, 1] as RatingLevel[]).map((level) => {
                  const info = RATING_LEVELS[level];
                  const isSelected = selected === level;

                  // Label abbreviations on mobile
                  const mobileShortLabels: Record<RatingLevel, string> = {
                    4: 'Xuất sắc',
                    3: 'Tốt',
                    2: 'Đạt',
                    1: 'Chưa Đạt',
                  };

                  return (
                    <button
                      key={level}
                      type="button"
                      disabled={hasAlreadySubmitted || isPeriodLocked}
                      onClick={() => {
                        onRateTarget(target.id, level);
                        if (missingAlertId === target.id) setMissingAlertId(null);
                      }}
                      className={`py-2 px-1 text-[11px] font-bold rounded-lg transition-all text-center flex flex-col items-center justify-center min-h-[44px] cursor-pointer border ${
                        isSelected
                          ? info.btnActiveBg
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span className="text-[9px] opacity-75 font-normal">Mức {level}</span>
                      <span className="leading-tight truncate w-full">{mobileShortLabels[level]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Submission Bar on Mobile */}
      {!hasAlreadySubmitted && (
        <div className="fixed bottom-14 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl z-30">
          <div className="max-w-md mx-auto flex items-center justify-between gap-3">
            <div className="text-xs">
              <span className="text-slate-500">Đã chấm:</span>
              <strong className="text-slate-900 ml-1 tabular-nums">{votedCount} / 20</strong>
            </div>

            <button
              onClick={handleAttemptSubmit}
              disabled={submitting}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all ${
                isComplete
                  ? 'bg-red-800 hover:bg-red-700 active:bg-red-900'
                  : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              <Send className="w-4 h-4 text-amber-300" />
              <span>
                {submitting
                  ? 'Đang gửi phiếu...'
                  : isComplete
                  ? 'GỬI PHIẾU ĐÁNH GIÁ (20/20)'
                  : `CÒN THIẾU ${20 - votedCount} ĐỒNG CHÍ`}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
