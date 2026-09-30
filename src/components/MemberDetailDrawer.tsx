import React, { useState } from 'react';
import { PartyMember } from '../types/partyMember';
import { 
  Achievement, 
  CreateAchievementDTO, 
  COMMON_ACHIEVEMENT_TITLES, 
  DECISION_AUTHORITIES 
} from '../types/achievement';
import { 
  X, 
  Shield, 
  MapPin, 
  Phone, 
  Award, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  PlusCircle, 
  Send, 
  Check, 
  XCircle, 
  FileText,
  Building,
  User,
  Medal,
  ShieldAlert,
  ChevronDown
} from 'lucide-react';

interface MemberDetailDrawerProps {
  member: PartyMember | null;
  onClose: () => void;
  onEdit: (member: PartyMember) => void;
  achievements: Achievement[];
  isSecretary: boolean;
  onToggleSecretary?: () => void;
  onSubmitAchievement: (data: CreateAchievementDTO) => Promise<void>;
  onApproveAchievement: (achievementId: string) => Promise<void>;
  onRejectAchievement: (achievementId: string, reason: string) => Promise<void>;
}

export const MemberDetailDrawer: React.FC<MemberDetailDrawerProps> = ({
  member,
  onClose,
  onEdit,
  achievements,
  isSecretary,
  onToggleSecretary,
  onSubmitAchievement,
  onApproveAchievement,
  onRejectAchievement,
}) => {
  const [activeTab, setActiveTab] = useState<'achievements' | 'info' | 'evaluations'>('achievements');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // Short 3-field proposal form
  const [formTitle, setFormTitle] = useState<string>('Chiến sĩ thi đua cơ sở');
  const [formYear, setFormYear] = useState<string>('2025');
  const [formDecisionBy, setFormDecisionBy] = useState<string>('Bộ Chỉ huy Quân sự Tỉnh Thừa Thiên Huế');
  const [submittingForm, setSubmittingForm] = useState<boolean>(false);

  // Rejection handling
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  if (!member) return null;

  const memberAchievements = achievements.filter(a => a.member_id === member.id);
  const approvedAchievements = memberAchievements.filter(a => a.status === 'approved');
  const pendingAchievements = memberAchievements.filter(a => a.status === 'pending');
  const rejectedAchievements = memberAchievements.filter(a => a.status === 'rejected');

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formYear || !formDecisionBy.trim()) return;

    setSubmittingForm(true);
    try {
      await onSubmitAchievement({
        member_id: member.id,
        title: formTitle.trim(),
        year: formYear,
        decision_by: formDecisionBy.trim(),
      });
      setShowAddForm(false);
    } finally {
      setSubmittingForm(false);
    }
  };

  const handleConfirmReject = async (id: string) => {
    await onRejectAchievement(id, rejectReason);
    setRejectingId(null);
    setRejectReason('');
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center bg-slate-950/75 backdrop-blur-xs font-interface overflow-hidden">
      {/* Mobile Backdrop tap to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      {/* Drawer Container: Slide-up on mobile, Centered Modal on desktop */}
      <div className="bg-white w-full md:max-w-2xl rounded-t-2xl md:rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] md:max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
        
        {/* Mobile Swipe Handle bar */}
        <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto my-2 md:hidden" />

        {/* Header Drawer */}
        <div className="bg-gradient-to-r from-red-950 via-red-900 to-amber-950 text-white p-4 sm:p-5 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 text-red-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-3 sm:gap-4 pr-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-amber-400 text-red-950 flex items-center justify-center font-bold text-base sm:text-lg ring-2 ring-amber-300/60 shrink-0 shadow-md">
              {member.full_name.slice(-2)}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-200 border border-amber-400/30">
                  {member.id.toUpperCase()}
                </span>
                <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded bg-red-800 text-amber-300 border border-amber-400/30">
                  {member.party_status}
                </span>

                {onToggleSecretary && (
                  <button
                    onClick={onToggleSecretary}
                    className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded bg-black/40 text-amber-300 border border-amber-400/30 cursor-pointer flex items-center gap-1"
                  >
                    <ShieldAlert className="w-3 h-3 text-amber-400" />
                    <span>{isSecretary ? 'Quyền: Bí thư Chi bộ' : 'Quyền: Đảng viên'}</span>
                  </button>
                )}
              </div>

              <h2 className="text-base sm:text-lg font-bold text-white mt-1 truncate">
                {member.full_name}
              </h2>

              <p className="text-xs text-red-200 mt-0.5 truncate">
                <span className="font-semibold text-amber-300">{member.military_rank}</span> · {member.position}
              </p>
            </div>
          </div>

          {/* Segmented Sub-tabs */}
          <div className="grid grid-cols-3 gap-1 mt-4 pt-1 border-t border-red-800/60 text-xs">
            <button
              onClick={() => setActiveTab('achievements')}
              className={`py-1.5 text-center font-semibold rounded-lg transition-all cursor-pointer relative ${
                activeTab === 'achievements'
                  ? 'bg-red-800 text-amber-300 shadow-xs'
                  : 'text-red-200 hover:text-white'
              }`}
            >
              <span>Khen thưởng</span>
              {pendingAchievements.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-amber-400 text-red-950 font-bold rounded-full text-[9px]">
                  {pendingAchievements.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('info')}
              className={`py-1.5 text-center font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'info'
                  ? 'bg-red-800 text-amber-300 shadow-xs'
                  : 'text-red-200 hover:text-white'
              }`}
            >
              Lý lịch trích ngang
            </button>

            <button
              onClick={() => setActiveTab('evaluations')}
              className={`py-1.5 text-center font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'evaluations'
                  ? 'bg-red-800 text-amber-300 shadow-xs'
                  : 'text-red-200 hover:text-white'
              }`}
            >
              Đánh giá hằng năm
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 custom-scrollbar space-y-4">
          
          {/* ================= TAB 1: KHEN THƯỞNG & DUYỆT (MOBILE-OPTIMIZED) ================= */}
          {activeTab === 'achievements' && (
            <div className="space-y-4">
              {/* Nút to rõ ràng: + Bổ sung danh hiệu */}
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="w-full py-2.5 px-4 bg-red-800 hover:bg-red-700 active:bg-red-900 text-white rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-amber-300" />
                <span>{showAddForm ? 'Đóng Biểu Mẫu Tự Kê Khai' : '+ Bổ Sung Danh Hiệu / Khen Thưởng Mới'}</span>
              </button>

              {/* Form cực ngắn chỉ 3 ô nhập cho Mobile */}
              {showAddForm && (
                <form
                  onSubmit={handleCreateSubmit}
                  className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-300 space-y-3 transition-all"
                >
                  <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5 border-b border-amber-200 pb-1.5">
                    <Medal className="w-3.5 h-3.5 text-red-700" />
                    <span>Tự Kê Khai Đề Xuất Khen Thưởng</span>
                  </div>

                  {/* 1. Tên danh hiệu */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      1. Tên danh hiệu / hình thức khen thưởng <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      list="drawer-achievements"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="VD: Chiến sĩ thi đua cơ sở"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 text-slate-900"
                      required
                    />
                    <datalist id="drawer-achievements">
                      {COMMON_ACHIEVEMENT_TITLES.map((t) => (
                        <option key={t} value={t} />
                      ))}
                    </datalist>
                  </div>

                  {/* 2. Năm đạt */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      2. Năm đạt được <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={formYear}
                      onChange={(e) => setFormYear(e.target.value)}
                      placeholder="VD: 2025"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 text-slate-900 font-mono"
                      required
                    />
                  </div>

                  {/* 3. Cấp quyết định */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      3. Cấp ký quyết định công nhận <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      list="drawer-authorities"
                      value={formDecisionBy}
                      onChange={(e) => setFormDecisionBy(e.target.value)}
                      placeholder="VD: Bộ Chỉ huy Quân sự Tỉnh Thừa Thiên Huế"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 text-slate-900"
                      required
                    />
                    <datalist id="drawer-authorities">
                      {DECISION_AUTHORITIES.map((a) => (
                        <option key={a} value={a} />
                      ))}
                    </datalist>
                  </div>

                  {/* Nút gửi đề xuất */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 rounded-lg hover:bg-slate-200"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={submittingForm}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-800 hover:bg-red-700 rounded-lg shadow-xs cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 text-amber-300" />
                      <span>{submittingForm ? 'Đang gửi...' : 'Gửi Đề Xuất Tới Bí Thư'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Các mục chờ Bí thư duyệt (Pending) - One touch approve on mobile */}
              {pendingAchievements.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-amber-900 uppercase flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      Đang chờ phê duyệt ({pendingAchievements.length})
                    </span>
                    {isSecretary && (
                      <span className="text-[10px] text-red-800 font-semibold lowercase">
                        Chạm 1 lần để duyệt
                      </span>
                    )}
                  </div>

                  {pendingAchievements.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-amber-50/80 border border-amber-300 rounded-xl space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-900 font-document text-sm">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-slate-600 mt-0.5">
                            Năm: <strong className="text-slate-800 font-mono">{item.year}</strong> · Cấp: <span>{item.decision_by}</span>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 text-[10px] font-bold shrink-0">
                          Chờ duyệt
                        </span>
                      </div>

                      {/* Nút thao tác của Bí thư: 1 chạm Duyệt / Hủy */}
                      {isSecretary && (
                        <div className="pt-2 border-t border-amber-200/80 flex items-center justify-end gap-2">
                          {rejectingId === item.id ? (
                            <div className="flex items-center gap-1.5 w-full">
                              <input
                                type="text"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Lý do từ chối..."
                                className="text-xs px-2 py-1 bg-white border border-red-300 rounded flex-1"
                              />
                              <button
                                onClick={() => handleConfirmReject(item.id)}
                                className="px-2.5 py-1 text-xs font-bold bg-red-700 text-white rounded"
                              >
                                Xác nhận
                              </button>
                              <button
                                onClick={() => setRejectingId(null)}
                                className="px-1.5 py-1 text-xs text-slate-500"
                              >
                                Đóng
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => onApproveAchievement(item.id)}
                                className="flex-1 py-1.5 px-3 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>[✓ Duyệt Ngay]</span>
                              </button>
                              <button
                                onClick={() => {
                                  setRejectingId(item.id);
                                  setRejectReason('');
                                }}
                                className="py-1.5 px-3 text-xs font-semibold text-red-700 bg-white hover:bg-red-50 border border-red-200 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>[✕ Từ chối]</span>
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Danh sách các danh hiệu đã được duyệt chính thức */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-800 uppercase">
                  Danh hiệu chính thức ({approvedAchievements.length})
                </div>

                {approvedAchievements.length > 0 ? (
                  <div className="space-y-2">
                    {approvedAchievements.map((item, idx) => (
                      <div
                        key={item.id}
                        className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs flex items-start gap-3"
                      >
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-bold text-slate-900 font-document text-sm">
                              {item.title}
                            </h4>
                            <span className="text-[10px] font-semibold text-emerald-700 inline-flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Đã duyệt</span>
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Năm: <strong className="text-slate-800 font-mono">{item.year}</strong> · Cấp: <span>{item.decision_by}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                    Chưa có danh hiệu chính thức. Nhấp nút "+ Bổ Sung Danh Hiệu" ở trên để gửi đề xuất.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 2: LÝ LỊCH TRÍCH NGANG (TIMES NEW ROMAN) ================= */}
          {activeTab === 'info' && (
            <div className="space-y-3 font-document text-[13.5px] leading-relaxed">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="font-sans text-xs font-bold text-slate-800 uppercase tracking-wide border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-red-800" />
                  <span>Lý Lịch Quân Nhân & Tổ Chức Đảng</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-slate-500 font-sans">Mã Đảng viên:</span>
                    <div className="font-mono font-bold text-slate-900">{member.id.toUpperCase()}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-sans">Ngày sinh:</span>
                    <div className="font-bold text-slate-900">{member.birth_year}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-sans">Số CCCD:</span>
                    <div className="font-mono text-slate-900 font-bold">{member.citizen_id}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-sans">Nhập ngũ:</span>
                    <div className="font-bold text-slate-900">{member.enlistment_date}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 font-sans">Ngày vào Đảng CSVN:</span>
                    <div className="font-bold text-slate-900">
                      {member.party_join_date} {member.official_party_date ? `(Chính thức: ${member.official_party_date})` : ''}
                    </div>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-200">
                    <span className="text-slate-500 font-sans">Chức vụ công tác:</span>
                    <div className="font-bold text-slate-900">{member.position}</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="font-sans text-xs font-bold text-slate-800 uppercase tracking-wide border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-700" />
                  <span>Nơi Ở & Khả Năng Cơ Động SSCĐ</span>
                </div>

                <div className="text-xs space-y-1.5 pt-1">
                  <div>
                    <span className="text-slate-500 font-sans">Nơi ở hiện nay:</span>
                    <div className="font-semibold text-slate-900">{member.current_residence}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-sans">Cự ly đến Ban CHQS TP:</span>
                    <span className="font-bold text-red-800 text-sm font-sans">{member.distance_km} km</span>
                  </div>
                  <div className="pt-1 border-t border-slate-200">
                    <span className="text-slate-500 font-sans">Quê quán:</span>
                    <div className="text-slate-800">{member.hometown}</div>
                  </div>
                  <div className="pt-1 border-t border-slate-200 flex justify-between items-center">
                    <div>
                      <span className="text-slate-500 font-sans">Số điện thoại:</span>
                      <div className="font-mono font-bold text-slate-900">{member.phone}</div>
                    </div>
                    <a
                      href={`tel:${member.phone.replace(/[^0-9]/g, '')}`}
                      className="px-3 py-1 bg-emerald-700 text-white rounded-lg text-xs font-sans font-semibold flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Gọi ngay</span>
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-500 font-sans">Báo tin khẩn cấp:</span>
                    <div className="text-slate-800 text-[11.5px]">{member.emergency_contact}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: ĐÁNH GIÁ CHẤT LƯỢNG HẰNG NĂM ================= */}
          {activeTab === 'evaluations' && (
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-slate-800 uppercase">
                Lịch sử đánh giá Đảng viên (Quy định 124-QĐ/TW)
              </div>

              {member.evaluations && member.evaluations.length > 0 ? (
                member.evaluations.map((ev, i) => (
                  <div
                    key={i}
                    className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Năm {ev.year}:</span>
                        <span className="text-red-900">{ev.grade}</span>
                      </div>
                      {ev.commendation && (
                        <div className="text-[11px] text-amber-800 font-semibold mt-0.5">
                          ★ {ev.commendation}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">Đã biểu quyết</span>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-slate-50 text-center text-slate-400 text-xs rounded-xl">
                  Chưa có dữ liệu đánh giá các năm trước.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Drawer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              onClose();
              onEdit(member);
            }}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg cursor-pointer"
          >
            Chỉnh sửa lý lịch
          </button>
          
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
