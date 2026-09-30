import React, { useState, useMemo } from 'react';
import { PartyMember } from '../types/partyMember';
import { AuthUser, HosoUpdateRecord, HosoUpdateFieldCategory, FieldChangeDetail } from '../types/hosoUpdate';
import { submitHosoUpdateRequest } from '../utils/hosoUpdateService';
import { 
  User, 
  Shield, 
  Star, 
  LogOut, 
  GraduationCap, 
  Award, 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Edit3, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Send, 
  X, 
  Calendar,
  Building,
  Check,
  Info
} from 'lucide-react';

interface MemberPortalProps {
  currentUser: AuthUser;
  members: PartyMember[];
  hosoUpdates: HosoUpdateRecord[];
  onUpdateHosoList: (newList: HosoUpdateRecord[]) => void;
  onLogout?: () => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  embedded?: boolean;
}

export const MemberPortal: React.FC<MemberPortalProps> = ({
  currentUser,
  members,
  hosoUpdates,
  onUpdateHosoList,
  onLogout,
  showToast,
  embedded = false,
}) => {
  // Tìm hồ sơ chi tiết của đồng chí đang đăng nhập
  const member = useMemo(() => {
    return members.find((m) => m.id === currentUser.id) || members[0];
  }, [members, currentUser.id]);

  // Các yêu cầu cập nhật của riêng đồng chí này
  const myUpdates = useMemo(() => {
    return hosoUpdates.filter((u) => u.member_id === member.id);
  }, [hosoUpdates, member.id]);

  const pendingCount = useMemo(() => {
    return myUpdates.filter((u) => u.trang_thai === 'pending').length;
  }, [myUpdates]);

  // Modal yêu cầu chỉnh sửa
  const [editingCategory, setEditingCategory] = useState<HosoUpdateFieldCategory | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states theo category
  // 1. Education
  const [formAcademic, setFormAcademic] = useState(member.academic_level || '12/12');
  const [formPolitical, setFormPolitical] = useState(member.political_theory || 'Sơ cấp');
  const [formSpecialized, setFormSpecialized] = useState(member.specialized_qualification || member.position);
  const [formLanguage, setFormLanguage] = useState(member.foreign_language || 'Không');

  // 2. Achievement
  const [formAwardTitle, setFormAwardTitle] = useState('Chiến sĩ thi đua cơ sở');
  const [formAwardYear, setFormAwardYear] = useState('2025');
  const [formAwardDecisionBy, setFormAwardDecisionBy] = useState('Bộ Chỉ huy Quân sự Tỉnh Thừa Thiên Huế');

  // 3. Discipline
  const [formDisciplineText, setFormDisciplineText] = useState(member.discipline_record || 'Không có');

  // 4. Contact
  const [formPhone, setFormPhone] = useState(member.phone);
  const [formResidence, setFormResidence] = useState(member.current_residence);
  const [formDistance, setFormDistance] = useState(member.distance_km.toString());
  const [formEmergency, setFormEmergency] = useState(member.emergency_contact);

  const openEditModal = (category: HosoUpdateFieldCategory) => {
    setEditingCategory(category);
    if (category === 'education') {
      setFormAcademic(member.academic_level || '12/12');
      setFormPolitical(member.political_theory || 'Sơ cấp');
      setFormSpecialized(member.specialized_qualification || member.position);
      setFormLanguage(member.foreign_language || 'Không');
    } else if (category === 'contact') {
      setFormPhone(member.phone);
      setFormResidence(member.current_residence);
      setFormDistance(member.distance_km.toString());
      setFormEmergency(member.emergency_contact);
    } else if (category === 'discipline') {
      setFormDisciplineText(member.discipline_record || 'Không có');
    }
  };

  const handleSaveRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setSubmitting(true);

    try {
      let categoryLabel = '';
      const changes: FieldChangeDetail[] = [];

      if (editingCategory === 'education') {
        categoryLabel = 'Trình độ học vấn & Lý luận chính trị';
        if (formAcademic !== (member.academic_level || '12/12')) {
          changes.push({
            field_name: 'academic_level',
            label: 'Trình độ văn hóa',
            old_value: member.academic_level || '12/12',
            new_value: formAcademic,
          });
        }
        if (formPolitical !== (member.political_theory || 'Sơ cấp')) {
          changes.push({
            field_name: 'political_theory',
            label: 'Lý luận chính trị',
            old_value: member.political_theory || 'Sơ cấp',
            new_value: formPolitical,
          });
        }
        if (formSpecialized !== (member.specialized_qualification || member.position)) {
          changes.push({
            field_name: 'specialized_qualification',
            label: 'Chuyên môn nghiệp vụ',
            old_value: member.specialized_qualification || member.position,
            new_value: formSpecialized,
          });
        }
        if (formLanguage !== (member.foreign_language || 'Không')) {
          changes.push({
            field_name: 'foreign_language',
            label: 'Ngoại ngữ',
            old_value: member.foreign_language || 'Không',
            new_value: formLanguage,
          });
        }
      } else if (editingCategory === 'achievement') {
        categoryLabel = 'Khen thưởng & Danh hiệu thi đua';
        changes.push({
          field_name: 'notes',
          label: 'Đề xuất Khen thưởng mới',
          old_value: 'Danh hiệu hiện có',
          new_value: `${formAwardTitle} (Năm ${formAwardYear} - Cấp ký: ${formAwardDecisionBy})`,
        });
      } else if (editingCategory === 'discipline') {
        categoryLabel = 'Kỷ luật Đảng & Quân đội';
        changes.push({
          field_name: 'discipline_record',
          label: 'Tình trạng kỷ luật',
          old_value: member.discipline_record || 'Không có',
          new_value: formDisciplineText,
        });
      } else if (editingCategory === 'contact') {
        categoryLabel = 'Thông tin liên lạc & Chỗ ở';
        if (formPhone !== member.phone) {
          changes.push({
            field_name: 'phone',
            label: 'Số điện thoại',
            old_value: member.phone,
            new_value: formPhone,
          });
        }
        if (formResidence !== member.current_residence) {
          changes.push({
            field_name: 'current_residence',
            label: 'Nơi ở hiện nay',
            old_value: member.current_residence,
            new_value: formResidence,
          });
        }
        if (formDistance !== member.distance_km.toString()) {
          changes.push({
            field_name: 'distance_km',
            label: 'Cự ly cơ động (km)',
            old_value: `${member.distance_km} km`,
            new_value: `${formDistance} km`,
          });
        }
        if (formEmergency !== member.emergency_contact) {
          changes.push({
            field_name: 'emergency_contact',
            label: 'Khi cần liên hệ ai',
            old_value: member.emergency_contact,
            new_value: formEmergency,
          });
        }
      }

      if (changes.length === 0) {
        showToast('Đồng chí chưa thay đổi thông tin nào so với hồ sơ hiện tại!', 'info');
        setEditingCategory(null);
        return;
      }

      // Gửi vào bảng hoso_updates (KHÔNG ghi đè bảng chính)
      const res = await submitHosoUpdateRequest(
        member,
        editingCategory,
        categoryLabel,
        changes,
        hosoUpdates
      );

      onUpdateHosoList(res.updatedList);
      showToast(res.message, 'success');
      setEditingCategory(null);
    } catch {
      showToast('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại!', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={embedded ? "w-full max-w-5xl mx-auto space-y-5 font-interface pb-6" : "min-h-screen bg-slate-100 font-interface flex flex-col"}>
      {/* 1. HEADER RIÊNG CHO ĐẢNG VIÊN (Chỉ hiển thị khi chạy độc lập, ẩn khi lồng trong Unified UI) */}
      {!embedded && (
        <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md shrink-0 sticky top-0 z-30">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-800 ring-2 ring-amber-400 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                <img
                  src="/logo.jpg"
                  alt="Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-400 tracking-wider">
                  CHI BỘ BAN HẬU CẦN - KỸ THUẬT
                </div>
                <h1 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                  <span>Cổng Đảng Viên Tự Phục Vụ</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-mono">
                    {member.id.toUpperCase()}
                  </span>
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold text-slate-200">
                  {member.military_rank} {member.full_name}
                </div>
                <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                  {member.position}
                </div>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-200 border border-slate-700 hover:border-red-800 transition-colors text-xs font-semibold cursor-pointer shadow-xs"
                  title="Đăng xuất khỏi Cổng Đảng viên"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng Xuất</span>
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      {/* 2. KHỐI NỘI DUNG: HỒ SƠ ĐẢNG VIÊN CÁ NHÂN */}
      <div className={embedded ? "space-y-5" : "flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-5"}>
        {/* Banner thông báo các yêu cầu đang chờ Bí thư duyệt */}
        {pendingCount > 0 && (
          <div className="bg-amber-50 border border-amber-300 p-4 rounded-xl shadow-xs flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <div className="text-amber-950">
                Đồng chí hiện có <strong>{pendingCount}</strong> yêu cầu thay đổi thông tin đang ở trạng thái{' '}
                <strong className="text-amber-800 underline">Chờ duyệt bởi Bí thư Chi bộ</strong>. Dữ liệu chính thức sẽ tự động cập nhật ngay khi được phê duyệt.
              </div>
            </div>
            <a href="#hoso-history" className="text-amber-800 font-bold hover:underline shrink-0 hidden sm:inline">
              Xem tiến độ ↓
            </a>
          </div>
        )}

        {/* Card 1: Định danh & Lý lịch Quân nhân (Trang trọng font Times New Roman) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-red-950 via-red-900 to-amber-950 text-white p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-amber-400 text-red-950 flex items-center justify-center font-bold text-2xl ring-4 ring-amber-300/40 shadow-lg shrink-0">
                {member.full_name.slice(-2)}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-200 border border-amber-400/30">
                    MÃ: {member.id.toUpperCase()}
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
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {member.full_name}
                </h2>
                <div className="text-xs text-red-200 mt-0.5">
                  <span className="font-semibold text-amber-300">{member.military_rank}</span> · {member.position}
                </div>
              </div>
            </div>

            <div className="bg-black/30 border border-white/10 p-3 rounded-xl text-xs space-y-1 sm:text-right">
              <div className="text-slate-300">
                CCCD: <strong className="text-white font-mono">{member.citizen_id}</strong>
              </div>
              <div className="text-slate-300">
                Ngày vào Đảng: <strong className="text-white">{member.party_join_date}</strong>
              </div>
              <div className="text-slate-300">
                Chính thức: <strong className="text-amber-300">{member.official_party_date || 'Chưa'}</strong>
              </div>
            </div>
          </div>

          {/* Chi tiết lý lịch chuẩn thể thức văn bản Đảng */}
          <div className="p-5 sm:p-6 font-document text-[14px] text-slate-800 leading-relaxed grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 border-b border-slate-100 bg-slate-50/50">
            <div>
              <span className="text-slate-500 font-interface text-xs block">Năm sinh:</span>
              <strong className="text-slate-900">{member.birth_year}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-interface text-xs block">Nhập ngũ:</span>
              <strong className="text-slate-900">{member.enlistment_date}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-interface text-xs block">Quê quán:</span>
              <strong className="text-slate-900">{member.hometown}</strong>
            </div>
          </div>
        </div>

        {/* 4 KHỐI THÔNG TIN VỚI NÚT "YÊU CẦU CHỈNH SỬA" */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Section 1: Trình độ học vấn & Chuyên môn */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Trình Độ Học Vấn & Chuyên Môn</h3>
                  <p className="text-[11px] text-slate-500">Văn hóa, chính trị, chuyên ngành</p>
                </div>
              </div>
              <button
                onClick={() => openEditModal('education')}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer border border-blue-200"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Yêu cầu sửa</span>
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Trình độ văn hóa:</span>
                <strong className="text-slate-900 font-medium">{member.academic_level || '12/12'}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Lý luận chính trị:</span>
                <strong className="text-slate-900 font-medium">{member.political_theory || 'Sơ cấp'}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Chuyên môn nghiệp vụ:</span>
                <strong className="text-slate-900 font-medium">{member.specialized_qualification || member.position}</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Ngoại ngữ:</span>
                <strong className="text-slate-900 font-medium">{member.foreign_language || 'Không'}</strong>
              </div>
            </div>
          </div>

          {/* Section 2: Thông tin liên lạc & Cư trú */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Thông Tin Liên Lạc & Cư Trú</h3>
                  <p className="text-[11px] text-slate-500">SĐT, nơi ở & cự ly cơ động</p>
                </div>
              </div>
              <button
                onClick={() => openEditModal('contact')}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer border border-emerald-200"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Yêu cầu sửa</span>
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Số điện thoại:</span>
                <strong className="text-slate-900 font-mono">{member.phone}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Nơi ở hiện nay:</span>
                <strong className="text-slate-900 max-w-[240px] text-right truncate">{member.current_residence}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Cự ly tới Ban CHQS TP Huế:</span>
                <strong className="text-slate-900">{member.distance_km} km</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Khi cần liên hệ ai:</span>
                <strong className="text-slate-900 max-w-[240px] text-right truncate">{member.emergency_contact}</strong>
              </div>
            </div>
          </div>

          {/* Section 3: Quá trình Khen thưởng */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Khen Thưởng & Danh Hiệu</h3>
                  <p className="text-[11px] text-slate-500">Thành tích thi đua đã công nhận</p>
                </div>
              </div>
              <button
                onClick={() => openEditModal('achievement')}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer border border-amber-200"
              >
                <Award className="w-3.5 h-3.5 text-amber-700" />
                <span>+ Kê khai mới</span>
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/80 flex items-center gap-2.5">
                <Star className="w-4 h-4 text-amber-600 fill-amber-400 shrink-0" />
                <div>
                  <div className="font-bold text-amber-950 font-document text-[14px]">
                    Chiến sĩ thi đua cơ sở (Năm 2024)
                  </div>
                  <div className="text-[11px] text-amber-800">Cấp quyết định: Bộ Chỉ huy Quân sự Tỉnh Thừa Thiên Huế</div>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 italic">
                * Bấm nút "+ Kê khai mới" để gửi danh hiệu mới tới Bí thư Chi bộ phê duyệt.
              </p>
            </div>
          </div>

          {/* Section 4: Kỷ luật Đảng & Quân đội */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Kỷ Luật Đảng & Quân Đội</h3>
                  <p className="text-[11px] text-slate-500">Tình trạng chấp hành kỷ luật</p>
                </div>
              </div>
              <button
                onClick={() => openEditModal('discipline')}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer border border-slate-200"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Kê khai / Báo cáo</span>
              </button>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="text-emerald-900 font-medium">
                {member.discipline_record || 'Gương mẫu chấp hành điều lệnh. Không có hình thức kỷ luật nào.'}
              </div>
            </div>
          </div>
        </div>

        {/* 3. LỊCH SỬ & TIẾN ĐỘ CÁC YÊU CẦU CẬP NHẬT HỒ SƠ CỦA ĐỒNG CHÍ */}
        <div id="hoso-history" className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-800" />
              <h3 className="text-sm font-bold text-slate-900">
                Tiến Độ Các Yêu Cầu Cập Nhật Hồ Sơ Của Đồng Chí
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              Tổng số: <strong className="text-slate-800">{myUpdates.length}</strong> yêu cầu
            </span>
          </div>

          {myUpdates.length > 0 ? (
            <div className="space-y-2.5">
              {myUpdates.map((upd) => (
                <div
                  key={upd.id}
                  className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                    upd.trang_thai === 'pending'
                      ? 'bg-amber-50/70 border-amber-300'
                      : upd.trang_thai === 'approved'
                      ? 'bg-emerald-50/70 border-emerald-300'
                      : 'bg-red-50/70 border-red-300'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{upd.category_label}</span>
                      <span className="text-[10px] text-slate-500">({upd.requested_at})</span>
                    </div>

                    <div>
                      {upd.trang_thai === 'pending' && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-semibold text-[10.5px] border border-amber-300 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-700 animate-spin" />
                          <span>Chờ Bí thư phê duyệt</span>
                        </span>
                      )}
                      {upd.trang_thai === 'approved' && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-semibold text-[10.5px] border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          <span>Đã được Bí thư phê duyệt</span>
                        </span>
                      )}
                      {upd.trang_thai === 'rejected' && (
                        <span className="px-2 py-0.5 rounded-full bg-red-200 text-red-900 font-semibold text-[10.5px] border border-red-300 flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-red-700" />
                          <span>Bị từ chối</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Chi tiết các trường thay đổi */}
                  <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200 space-y-1">
                    {upd.changes.map((c, idx) => (
                      <div key={idx} className="flex flex-wrap items-center gap-1.5 text-[11.5px]">
                        <span className="font-semibold text-slate-700">{c.label}:</span>
                        <span className="line-through text-slate-400">{c.old_value}</span>
                        <span className="text-slate-400">→</span>
                        <strong className="text-red-900 font-bold">{c.new_value}</strong>
                      </div>
                    ))}
                  </div>

                  {/* Ghi chú duyệt nếu có */}
                  {upd.reviewed_by && (
                    <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1">
                      <span>Người duyệt: <strong>{upd.reviewed_by}</strong> ({upd.reviewed_at})</span>
                      {upd.review_note && (
                        <span className="text-red-700 italic">Lý do: "{upd.review_note}"</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-slate-400 text-xs">
              Đồng chí chưa gửi yêu cầu chỉnh sửa lý lịch nào.
            </div>
          )}
        </div>
      </div>

      {/* 4. MODAL YÊU CẦU CHỈNH SỬA (SELF-SERVICE REQUEST MODAL) */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs font-interface">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden space-y-4">
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-red-950 to-red-800 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">
                  Yêu Cầu Cập Nhật Hồ Sơ Đảng Viên
                </h3>
                <p className="text-[11px] text-red-200">
                  {editingCategory === 'education' && 'Trình độ học vấn & Lý luận chính trị'}
                  {editingCategory === 'contact' && 'Thông tin liên lạc & Chỗ ở'}
                  {editingCategory === 'achievement' && 'Đề xuất Khen thưởng & Danh hiệu mới'}
                  {editingCategory === 'discipline' && 'Kê khai kỷ luật'}
                </p>
              </div>
              <button
                onClick={() => setEditingCategory(null)}
                className="p-1 text-red-200 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Note về quy trình phê duyệt */}
            <div className="mx-5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11.5px] text-amber-950 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Lưu ý bảo mật:</strong> Dữ liệu mới sẽ được lưu vào bảng trung gian <code>hoso_updates</code> và gửi tới <strong>Bí thư Chi bộ</strong> phê duyệt trước khi ghi nhận chính thức.
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveRequest} className="px-5 pb-5 space-y-3.5 text-xs">
              {editingCategory === 'education' && (
                <>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Trình độ văn hóa phổ thông
                    </label>
                    <input
                      type="text"
                      value={formAcademic}
                      onChange={(e) => setFormAcademic(e.target.value)}
                      placeholder="VD: 12/12, Đại học Sĩ quan..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Lý luận chính trị
                    </label>
                    <select
                      value={formPolitical}
                      onChange={(e) => setFormPolitical(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    >
                      <option value="Sơ cấp">Sơ cấp</option>
                      <option value="Trung cấp">Trung cấp</option>
                      <option value="Cao cấp">Cao cấp</option>
                      <option value="Cử nhân Chính trị">Cử nhân Chính trị</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Chuyên môn nghiệp vụ
                    </label>
                    <input
                      type="text"
                      value={formSpecialized}
                      onChange={(e) => setFormSpecialized(e.target.value)}
                      placeholder="VD: Kỹ sư Cơ khí ô tô, Y sĩ Quân y..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Trình độ Ngoại ngữ
                    </label>
                    <input
                      type="text"
                      value={formLanguage}
                      onChange={(e) => setFormLanguage(e.target.value)}
                      placeholder="VD: Tiếng Anh B1, Không..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                </>
              )}

              {editingCategory === 'contact' && (
                <>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Số điện thoại cá nhân <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="09xx.xxx.xxx"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Nơi ở hiện nay <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={formResidence}
                      onChange={(e) => setFormResidence(e.target.value)}
                      placeholder="Số nhà, đường, phường, TP Huế..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Cự ly tới Ban CHQS TP Huế (km) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formDistance}
                      onChange={(e) => setFormDistance(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Khi cần liên hệ ai (Người thân & SĐT) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={formEmergency}
                      onChange={(e) => setFormEmergency(e.target.value)}
                      placeholder="Vợ: ..., Bố: ... - 09xx"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                      required
                    />
                  </div>
                </>
              )}

              {editingCategory === 'achievement' && (
                <>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Tên danh hiệu / Hình thức khen thưởng <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={formAwardTitle}
                      onChange={(e) => setFormAwardTitle(e.target.value)}
                      placeholder="VD: Chiến sĩ thi đua cơ sở"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Năm đạt được <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={formAwardYear}
                      onChange={(e) => setFormAwardYear(e.target.value)}
                      placeholder="2025"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Cấp ký quyết định công nhận <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={formAwardDecisionBy}
                      onChange={(e) => setFormAwardDecisionBy(e.target.value)}
                      placeholder="VD: Bộ Chỉ huy Quân sự Tỉnh Thừa Thiên Huế"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                      required
                    />
                  </div>
                </>
              )}

              {editingCategory === 'discipline' && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Nội dung kê khai kỷ luật (nếu có)
                  </label>
                  <textarea
                    rows={3}
                    value={formDisciplineText}
                    onChange={(e) => setFormDisciplineText(e.target.value)}
                    placeholder="Ghi rõ hình thức, năm, lý do (hoặc ghi 'Không có')..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-800 hover:bg-red-700 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5 text-amber-300" />
                  <span>{submitting ? 'Đang gửi yêu cầu...' : 'Lưu Thay Đổi (Gửi Bí thư)'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
