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
  UserCheck, 
  ShieldAlert, 
  FileText,
  Building,
  User,
  Medal,
  ChevronRight
} from 'lucide-react';

interface MemberDetailModalProps {
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

type ModalTab = 'info' | 'achievements' | 'evaluations';

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
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
  const [activeTab, setActiveTab] = useState<ModalTab>('achievements'); // Default to achievements as requested
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // Form state for self-service proposal
  const [formTitle, setFormTitle] = useState<string>('Chiến sĩ thi đua cơ sở');
  const [formYear, setFormYear] = useState<string>('2025');
  const [formDecisionBy, setFormDecisionBy] = useState<string>('Bộ Chỉ huy Quân sự Tỉnh Thừa Thiên Huế');
  const [formNotes, setFormNotes] = useState<string>('');
  const [submittingForm, setSubmittingForm] = useState<boolean>(false);

  // Rejection prompt state
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  if (!member) return null;

  // Filter achievements for this member
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
        notes: formNotes.trim(),
      });
      setShowAddForm(false);
      setFormNotes('');
    } finally {
      setSubmittingForm(false);
    }
  };

  const handleConfirmReject = async (achievementId: string) => {
    await onRejectAchievement(achievementId, rejectReason);
    setRejectingId(null);
    setRejectReason('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs font-interface overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Banner đỏ truyền thống quân đội & Tiêu đề trang trọng */}
        <div className="bg-gradient-to-r from-red-950 via-red-900 to-amber-950 text-white p-5 sm:p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-red-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Ảnh đại diện tròn có viền vàng */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-400 text-red-950 flex items-center justify-center font-bold text-xl ring-4 ring-amber-300/40 shrink-0 shadow-lg select-none">
                {member.full_name.slice(-2)}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-200 border border-amber-400/30">
                    {member.id.toUpperCase()}
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      member.party_status === 'Chính thức'
                        ? 'bg-red-800/80 text-amber-300 border border-amber-400/40'
                        : 'bg-amber-800/80 text-white border border-amber-400/30'
                    }`}
                  >
                    Đảng viên {member.party_status}
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-white mt-1 leading-snug">
                  {member.full_name}
                </h2>

                <p className="text-xs text-red-200 mt-0.5 flex items-center gap-1.5">
                  <span className="font-semibold text-amber-300">{member.military_rank}</span>
                  <span>·</span>
                  <span>{member.position}</span>
                </p>
              </div>
            </div>

            {/* Bộ chuyển đổi vai trò duyệt (Bí thư dv-01 vs Đảng viên) */}
            {onToggleSecretary && (
              <div className="bg-slate-900/80 border border-slate-700/80 p-1 rounded-xl flex items-center gap-1 text-xs">
                <span className="text-[10px] text-slate-400 px-2 uppercase font-semibold">
                  Quyền xem:
                </span>
                <button
                  type="button"
                  onClick={onToggleSecretary}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSecretary
                      ? 'bg-red-800 text-amber-300 shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{isSecretary ? 'Bí thư Chi bộ (Có quyền duyệt)' : 'Đảng viên kê khai'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Tab Navigation bên trong Modal */}
          <div className="flex items-center gap-1 mt-5 border-b border-red-800/60 pt-1 text-xs">
            <button
              onClick={() => setActiveTab('achievements')}
              className={`px-3.5 py-2 font-semibold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'achievements'
                  ? 'border-amber-400 text-amber-300 bg-red-900/40 rounded-t-lg'
                  : 'border-transparent text-red-200 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Quá trình Khen thưởng & Danh hiệu</span>
              {pendingAchievements.length > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-400 text-red-950 font-bold rounded-full text-[10px]">
                  {pendingAchievements.length} chờ duyệt
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('info')}
              className={`px-3.5 py-2 font-semibold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'info'
                  ? 'border-amber-400 text-amber-300 bg-red-900/40 rounded-t-lg'
                  : 'border-transparent text-red-200 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Lý lịch & Thông tin cơ bản</span>
            </button>

            <button
              onClick={() => setActiveTab('evaluations')}
              className={`px-3.5 py-2 font-semibold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'evaluations'
                  ? 'border-amber-400 text-amber-300 bg-red-900/40 rounded-t-lg'
                  : 'border-transparent text-red-200 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Lịch sử đánh giá hằng năm</span>
            </button>
          </div>
        </div>

        {/* Nội dung Tab bên trong modal */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 custom-scrollbar space-y-5">
          {/* ================= TAB 1: KHEN THƯỞNG & LUỒNG PHÊ DUYỆT ================= */}
          {activeTab === 'achievements' && (
            <div className="space-y-6">
              {/* Header Tab Khen thưởng + Nút mở Form kê khai */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Medal className="w-4 h-4 text-red-700" />
                    Quá Trình Khen Thưởng & Danh Hiệu Đã Ghi Nhận
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Hồ sơ thi đua khen thưởng của đồng chí {member.full_name}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-800 hover:bg-red-700 active:bg-red-900 rounded-lg shadow-xs transition-all cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
                  <span>{showAddForm ? 'Đóng Biểu Mẫu' : '+ Tự Kê Khai Khen Thưởng Mới'}</span>
                </button>
              </div>

              {/* Form Tự Kê Khai & Đề Xuất (Self-service Form) */}
              {showAddForm && (
                <form
                  onSubmit={handleCreateSubmit}
                  className="bg-amber-50/50 p-4 sm:p-5 rounded-xl border border-amber-300 space-y-4 transition-all"
                >
                  <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                    <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-amber-700" />
                      <span>Kê Khai Đề Xuất Khen Thưởng (Gửi Tới Bí Thư Chi Bộ)</span>
                    </div>
                    <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-medium">
                      Trạng thái: Chờ duyệt sau khi nộp
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Tên danh hiệu */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Hình thức / Danh hiệu khen thưởng <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        list="common-achievements"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="VD: Chiến sĩ thi đua cơ sở"
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 text-slate-900"
                        required
                      />
                      <datalist id="common-achievements">
                        {COMMON_ACHIEVEMENT_TITLES.map((t) => (
                          <option key={t} value={t} />
                        ))}
                      </datalist>
                    </div>

                    {/* Năm đạt được */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Năm đạt được <span className="text-red-600">*</span>
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
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Cấp ký quyết định */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Cấp ký quyết định công nhận <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        list="decision-authorities"
                        value={formDecisionBy}
                        onChange={(e) => setFormDecisionBy(e.target.value)}
                        placeholder="VD: Bộ Chỉ huy Quân sự Tỉnh Thừa Thiên Huế"
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 text-slate-900"
                        required
                      />
                      <datalist id="decision-authorities">
                        {DECISION_AUTHORITIES.map((a) => (
                          <option key={a} value={a} />
                        ))}
                      </datalist>
                    </div>

                    {/* Ghi chú thành tích */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Ghi chú thành tích tóm tắt
                      </label>
                      <input
                        type="text"
                        value={formNotes}
                        onChange={(e) => setFormNotes(e.target.value)}
                        placeholder="VD: Đạt thành tích xuất sắc trong diễn tập chỉ huy"
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={submittingForm}
                      className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-red-800 hover:bg-red-700 active:bg-red-900 rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 text-amber-300" />
                      <span>{submittingForm ? 'Đang gửi...' : 'Gửi Đề Xuất Tới Bí Thư'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Danh sách các đề xuất ĐANG CHỜ BÍ THƯ DUYỆT (Pending) */}
              {pendingAchievements.length > 0 && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-amber-900 uppercase tracking-wide flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      Đang Chờ Bí Thư Phê Duyệt ({pendingAchievements.length} mục)
                    </span>
                    {isSecretary && (
                      <span className="text-[11px] text-red-800 font-semibold lowercase">
                        * Bạn có quyền duyệt ngay tại đây
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {pendingAchievements.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 bg-amber-50/70 border border-amber-300 rounded-xl space-y-2"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-amber-950 font-document text-[14px]">
                                {item.title}
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-200 text-amber-900 border border-amber-300">
                                ⏳ Chờ Bí thư duyệt
                              </span>
                            </div>
                            <div className="text-xs text-slate-600 mt-0.5">
                              Năm đạt: <strong className="text-slate-800">{item.year}</strong> · Cấp quyết định: <strong className="text-slate-800">{item.decision_by}</strong>
                            </div>
                            {item.notes && (
                              <p className="text-xs text-slate-500 italic mt-1 bg-white/70 p-1.5 rounded border border-amber-200">
                                "{item.notes}"
                              </p>
                            )}
                          </div>

                          {/* Action Buttons cho Bí thư */}
                          {isSecretary && (
                            <div className="flex items-center gap-1.5 shrink-0 pt-1">
                              {rejectingId === item.id ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="text"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Lý do từ chối..."
                                    className="text-xs px-2 py-1 bg-white border border-red-300 rounded w-36"
                                  />
                                  <button
                                    onClick={() => handleConfirmReject(item.id)}
                                    className="px-2 py-1 text-xs font-semibold bg-red-700 text-white rounded"
                                  >
                                    Xác nhận
                                  </button>
                                  <button
                                    onClick={() => setRejectingId(null)}
                                    className="px-1.5 py-1 text-xs text-slate-500"
                                  >
                                    Hủy
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => onApproveAchievement(item.id)}
                                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Phê Duyệt</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setRejectingId(item.id);
                                      setRejectReason('');
                                    }}
                                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-white hover:bg-red-50 text-red-700 border border-red-200 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span>Từ Chối</span>
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Danh sách các danh hiệu ĐÃ ĐƯỢC DUYỆT (Approved) */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center justify-between">
                  <span>Danh Hiệu Chính Thức Trong Lý Lịch ({approvedAchievements.length})</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Trích xuất theo thể thức Hướng dẫn 05-HD/VPTW
                  </span>
                </div>

                {approvedAchievements.length > 0 ? (
                  <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white">
                    {approvedAchievements.map((item, idx) => (
                      <div
                        key={item.id}
                        className="p-3.5 hover:bg-slate-50/70 transition-colors flex items-start justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900 font-document text-[14.5px]">
                                {item.title}
                              </h4>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Đã phê duyệt</span>
                              </span>
                            </div>
                            <div className="text-xs text-slate-600 mt-1">
                              Năm công nhận: <strong className="text-slate-900 font-mono">{item.year}</strong> · Cấp ban hành: <strong className="text-slate-800">{item.decision_by}</strong>
                            </div>
                            {item.notes && (
                              <p className="text-xs text-slate-500 mt-1 italic">
                                "{item.notes}"
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
                    Chưa có danh hiệu nào được phê duyệt. Nhấp nút "+ Tự Kê Khai Khen Thưởng Mới" để gửi hồ sơ tới Bí thư Chi bộ.
                  </div>
                )}
              </div>

              {/* Danh sách đề xuất bị từ chối (Rejected) */}
              {rejectedAchievements.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-bold text-red-900 uppercase tracking-wide">
                    Đề Xuất Chưa Đủ Điều Kiện ({rejectedAchievements.length})
                  </div>
                  <div className="space-y-2">
                    {rejectedAchievements.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-red-50/60 border border-red-200 rounded-lg text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-red-950 font-document text-[13.5px]">{item.title} (Năm {item.year})</span>
                          <span className="text-[10px] text-red-700 bg-red-100 px-1.5 py-0.5 rounded font-semibold">
                            Từ chối
                          </span>
                        </div>
                        {item.rejection_reason && (
                          <div className="text-[11px] text-red-800 mt-1">
                            Lý do: {item.rejection_reason}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 2: THÔNG TIN CƠ BẢN (READ-ONLY) ================= */}
          {activeTab === 'info' && (
            <div className="space-y-5">
              {/* Khối 1: Thông tin Quân sự & Đảng */}
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-red-800" />
                  1. Thông Tin Quân Sự & Tổ Chức Đảng
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500">Mã Đảng viên:</span>
                    <div className="font-mono font-bold text-slate-900 mt-0.5 text-sm">{member.id.toUpperCase()}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Ngày sinh:</span>
                    <div className="font-semibold text-slate-800 mt-0.5 font-document text-[14px]">{member.birth_year}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Số thẻ CCCD:</span>
                    <div className="font-mono text-slate-800 mt-0.5 font-semibold text-[13px] tabular-nums">{member.citizen_id}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Thời gian nhập ngũ:</span>
                    <div className="font-semibold text-slate-800 mt-0.5 font-document text-[14px]">{member.enlistment_date}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Ngày vào Đảng CSVN:</span>
                    <div className="font-semibold text-slate-800 mt-0.5 font-document text-[14px]">
                      {member.party_join_date}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Ngày chính thức:</span>
                    <div className="font-semibold text-slate-800 mt-0.5 font-document text-[14px]">
                      {member.official_party_date || 'Chưa công nhận'}
                    </div>
                  </div>
                  <div className="col-span-2 sm:col-span-3 pt-2 border-t border-slate-200">
                    <span className="text-slate-500">Chức vụ trong Chi bộ / Cơ quan:</span>
                    <div className="font-semibold text-slate-900 mt-0.5 text-sm">{member.position}</div>
                  </div>
                </div>
              </div>

              {/* Khối 2: Nơi ở, Quê quán & Sẵn sàng cơ động */}
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-red-800" />
                  2. Địa Bàn Cư Trú & Sẵn Sàng Cơ Động (SSCĐ)
                </h3>
                <div className="space-y-2.5 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <span className="text-slate-500">Nơi ở hiện nay:</span>
                      <div className="font-semibold text-slate-800 mt-0.5 text-[13.5px] font-document">{member.current_residence}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-slate-500">Cự ly cơ động về Ban CHQS TP:</span>
                      <div className="font-bold text-red-900 text-sm tabular-nums mt-0.5">{member.distance_km} km</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-500">Quê quán:</span>
                    <div className="font-semibold text-slate-800 mt-0.5 font-document text-[13.5px]">{member.hometown}</div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                    <div>
                      <span className="text-slate-500">Điện thoại liên lạc cá nhân:</span>
                      <div className="font-mono text-slate-900 mt-0.5 font-bold text-sm tabular-nums">{member.phone}</div>
                    </div>
                    <div>
                      <span className="text-slate-500">Khi cần báo tin khẩn cấp:</span>
                      <div className="font-semibold text-slate-800 mt-0.5">{member.emergency_contact}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ghi chú đặc thù */}
              {member.notes && (
                <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 text-xs text-amber-950">
                  <strong className="font-semibold">Ghi chú bổ sung của Chi bộ:</strong> {member.notes}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: ĐÁNH GIÁ CHẤT LƯỢNG HẰNG NĂM ================= */}
          {activeTab === 'evaluations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 uppercase tracking-wide">
                  Kết Quả Xếp Loại Chất Lượng Đảng Viên (Quy định 124-QĐ/TW)
                </span>
                <span className="text-slate-500">Chi bộ biểu quyết phê duyệt</span>
              </div>

              {member.evaluations && member.evaluations.length > 0 ? (
                <div className="space-y-2.5">
                  {member.evaluations.map((ev, i) => (
                    <div
                      key={i}
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Năm {ev.year}:</span>
                          <span className="text-red-900">{ev.grade}</span>
                        </div>
                        {ev.commendation && (
                          <div className="text-xs text-amber-800 font-semibold mt-1">
                            ★ Danh hiệu thi đua: {ev.commendation}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 font-medium bg-white px-2.5 py-1 rounded border border-slate-200">
                        Nghị quyết Chi bộ đã thông qua
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Chưa có dữ liệu đánh giá các năm trước.</p>
              )}
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-2">
            <span>Hồ sơ lưu trữ Chi bộ Hậu cần - Kỹ thuật</span>
            <span>·</span>
            <span className="text-emerald-700 font-medium">Bảo mật nội bộ</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(member);
              }}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              Sửa lý lịch
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
