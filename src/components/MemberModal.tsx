import React, { useState, useEffect } from 'react';
import { PartyMember, PartyStatus } from '../types/partyMember';
import { MILITARY_RANKS, POSITIONS } from '../utils/mockData';
import { X, UserPlus, Save, AlertCircle } from 'lucide-react';
// Chèn vào dưới dòng import số 4 của bạn
import { insertAwardProposal, AwardProposalInput } from '../utils/supabaseService';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: PartyMember) => void;
  initialMember?: PartyMember | null;
  existingCount: number;
}

export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialMember,
  existingCount,
}) => {
  const isEditing = Boolean(initialMember);

  const [formData, setFormData] = useState<Partial<PartyMember>>({
    full_name: '',
    birth_year: '',
    citizen_id: '',
    military_rank: 'Thiếu tá QNCN',
    position: 'Trợ lý Hậu cần',
    enlistment_date: '',
    party_join_date: '',
    official_party_date: '',
    party_status: 'Chính thức',
    phone: '',
    emergency_contact: '',
    hometown: '',
    current_residence: '',
    distance_km: 2.0,
    notes: '',
  });
  const [awardType, setAwardType] = useState<string>('Chiến sĩ thi đua cơ sở');
  const [awardYear, setAwardYear] = useState<number>(2025);
  const [decisionLevel, setDecisionLevel] = useState<string>('Bộ Chỉ huy Quân sự Tỉnh Thừa Thiên Huế');
  const [summaryAchievement, setSummaryAchievement] = useState<string>('');
  const [isSubmittingProposal, setIsSubmittingProposal] = useState<boolean>(false);

  const handleSendProposal = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const currentMemberId = initialMember?.id;
    if (!currentMemberId) {
      alert('Không tìm thấy thông tin định danh của Đảng viên. Vui lòng thử lại!');
      return;
    }

    if (!awardType.trim() || !decisionLevel.trim()) {
      alert('Vui lòng hoàn thành đầy đủ các thông tin có đánh dấu dấu sao đỏ (*)');
      return;
    }

    setIsSubmittingProposal(true);

    try {
      const proposalData = {
        member_id: currentMemberId,
        title: awardType.trim(),
        year: Number(awardYear),
        decision_by: decisionLevel.trim(),
        notes: summaryAchievement.trim()
      };

      await insertAwardProposal(proposalData);
      alert(`Đã gửi thành công đề xuất danh hiệu của đồng chí ${formData.full_name || 'Đảng viên'} tới Bí thư Chi bộ!`);
      setSummaryAchievement('');

    } catch (error: any) {
      alert(`Gửi đề xuất thất bại: ${error.message || 'Lỗi hệ thống không xác định'}`);
    } finally {
      setIsSubmittingProposal(false);
    }
  };
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialMember) {
      setFormData({ ...initialMember });
    } else {
      const nextIndex = existingCount + 1;
      const autoId = `dv-${nextIndex.toString().padStart(2, '0')}`;
      setFormData({
        id: autoId,
        full_name: '',
        birth_year: '',
        citizen_id: '',
        military_rank: 'Thiếu tá',
        position: 'Trợ lý Hậu cần',
        enlistment_date: '09/2015',
        party_join_date: '19/05/2019',
        official_party_date: '19/05/2020',
        party_status: 'Chính thức',
        phone: '',
        emergency_contact: '',
        hometown: 'TP Huế, Thừa Thiên Huế',
        current_residence: 'TP Huế, Thừa Thiên Huế',
        distance_km: 3.0,
        notes: '',
      });
    }
    setErrors({});
  }, [initialMember, isOpen, existingCount]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.full_name?.trim()) {
      newErrors.full_name = 'Vui lòng nhập họ và tên';
    }
    if (!formData.birth_year?.trim()) {
      newErrors.birth_year = 'Vui lòng nhập ngày tháng năm sinh';
    }
    if (!formData.citizen_id?.trim()) {
      newErrors.citizen_id = 'Vui lòng nhập số CCCD';
    } else if (!/^\d{12}$/.test(formData.citizen_id.replace(/\s+/g, ''))) {
      newErrors.citizen_id = 'CCCD chuẩn gồm 12 chữ số';
    }
    if (!formData.phone?.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    }
    if (!formData.party_join_date?.trim()) {
      newErrors.party_join_date = 'Vui lòng nhập ngày vào Đảng';
    }
    if (!formData.current_residence?.trim()) {
      newErrors.current_residence = 'Vui lòng nhập nơi ở hiện nay';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalMember: PartyMember = {
      id: formData.id || `dv-${(existingCount + 1).toString().padStart(2, '0')}`,
      full_name: formData.full_name?.trim() || '',
      birth_year: formData.birth_year?.trim() || '',
      citizen_id: formData.citizen_id?.trim() || '',
      military_rank: formData.military_rank || 'Trung tá',
      position: formData.position || 'Cán bộ',
      enlistment_date: formData.enlistment_date?.trim() || '',
      party_join_date: formData.party_join_date?.trim() || '',
      official_party_date: formData.official_party_date?.trim() || '',
      party_status: (formData.party_status as PartyStatus) || 'Chính thức',
      phone: formData.phone?.trim() || '',
      emergency_contact: formData.emergency_contact?.trim() || '',
      hometown: formData.hometown?.trim() || '',
      current_residence: formData.current_residence?.trim() || '',
      distance_km: Number(formData.distance_km) || 0,
      notes: formData.notes?.trim() || '',
      evaluations: initialMember?.evaluations || [
        { year: 2024, grade: 'Hoàn thành tốt nhiệm vụ' },
        { year: 2025, grade: 'Hoàn thành tốt nhiệm vụ' }
      ]
    };

    onSave(finalMember);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs font-interface overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header Modal */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-800 flex items-center justify-center text-amber-300">
              {isEditing ? <Save className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-amber-400">
                {isEditing ? 'Cập Nhật Hồ Sơ Đảng Viên' : 'Thêm Mới Hồ Sơ Đảng Viên'}
              </h2>
              <p className="text-xs text-slate-300">
                Chi bộ Hậu cần - Kỹ thuật | LLVT TP Huế
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Hàng 1: Họ tên + Năm sinh */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Họ và tên đồng chí <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.full_name || ''}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="VD: Nguyễn Văn Thông"
                className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white text-slate-900 ${errors.full_name ? 'border-red-500' : 'border-slate-300'
                  }`}
              />
              {errors.full_name && (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.full_name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngày sinh / Năm sinh <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.birth_year || ''}
                onChange={(e) => setFormData({ ...formData, birth_year: e.target.value })}
                placeholder="VD: 10/08/1999"
                className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white text-slate-900 ${errors.birth_year ? 'border-red-500' : 'border-slate-300'
                  }`}
              />
              {errors.birth_year && (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.birth_year}
                </p>
              )}
            </div>
          </div>

          {/* Hàng 2: Số CCCD + Cấp bậc + Chức vụ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số CCCD (12 số) <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                maxLength={12}
                value={formData.citizen_id || ''}
                onChange={(e) => setFormData({ ...formData, citizen_id: e.target.value })}
                placeholder="VD: 046199009873"
                className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white text-slate-900 font-mono ${errors.citizen_id ? 'border-red-500' : 'border-slate-300'
                  }`}
              />
              {errors.citizen_id && (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.citizen_id}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cấp bậc quân hàm
              </label>
              <select
                value={formData.military_rank || 'Thiếu tá QNCN'}
                onChange={(e) => setFormData({ ...formData, military_rank: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white text-slate-900"
              >
                {MILITARY_RANKS.map((rank) => (
                  <option key={rank} value={rank}>
                    {rank}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chức vụ đảm nhiệm
              </label>
              <input
                type="text"
                list="positions-list"
                value={formData.position || ''}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="VD: Trợ lý Hậu cần"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white text-slate-900"
              />
              <datalist id="positions-list">
                {POSITIONS.map((pos) => (
                  <option key={pos} value={pos} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Hàng 3: Nhập ngũ + Ngày vào Đảng + Tình trạng */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Thời gian nhập ngũ
              </label>
              <input
                type="text"
                value={formData.enlistment_date || ''}
                onChange={(e) => setFormData({ ...formData, enlistment_date: e.target.value })}
                placeholder="VD: 09/2017"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngày vào Đảng <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.party_join_date || ''}
                onChange={(e) => setFormData({ ...formData, party_join_date: e.target.value })}
                placeholder="VD: 19/05/2021"
                className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white text-slate-900 ${errors.party_join_date ? 'border-red-500' : 'border-slate-300'
                  }`}
              />
              {errors.party_join_date && (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.party_join_date}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tình trạng Đảng viên
              </label>
              <div className="flex items-center gap-2 pt-1.5">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="party_status"
                    value="Chính thức"
                    checked={formData.party_status === 'Chính thức'}
                    onChange={() => setFormData({ ...formData, party_status: 'Chính thức' })}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <span>Chính thức</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer ml-4">
                  <input
                    type="radio"
                    name="party_status"
                    value="Dự bị"
                    checked={formData.party_status === 'Dự bị'}
                    onChange={() => setFormData({ ...formData, party_status: 'Dự bị' })}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span>Dự bị</span>
                </label>
              </div>
            </div>
          </div>

          {/* Hàng 4: SĐT + Người liên hệ khẩn cấp */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số điện thoại liên lạc <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="VD: 0935.667.891"
                className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white text-slate-900 font-mono ${errors.phone ? 'border-red-500' : 'border-slate-300'
                  }`}
              />
              {errors.phone && (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.phone}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Khi cần báo tin cho ai (Họ tên, quan hệ, SĐT)
              </label>
              <input
                type="text"
                value={formData.emergency_contact || ''}
                onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                placeholder="VD: Vợ: Trần Thị Mai - 0905.334.221"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white text-slate-900"
              />
            </div>
          </div>

          {/* Hàng 5: Quê quán + Nơi ở + Cự ly */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quê quán
              </label>
              <input
                type="text"
                value={formData.hometown || ''}
                onChange={(e) => setFormData({ ...formData, hometown: e.target.value })}
                placeholder="VD: Huyện Quảng Điền, Thừa Thiên Huế"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nơi ở hiện nay <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.current_residence || ''}
                onChange={(e) => setFormData({ ...formData, current_residence: e.target.value })}
                placeholder="VD: Đường Lê Huân, P. Thuận Hòa, TP Huế"
                className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white text-slate-900 ${errors.current_residence ? 'border-red-500' : 'border-slate-300'
                  }`}
              />
              {errors.current_residence && (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.current_residence}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cự ly đến đơn vị (km)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.distance_km ?? 2.0}
                onChange={(e) => setFormData({ ...formData, distance_km: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white text-slate-900 tabular-nums"
              />
            </div>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ghi chú lý lịch / Khen thưởng / Nhiệm vụ đặc biệt
            </label>
            <textarea
              rows={2}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="VD: Chi ủy viên, Quản trị viên hệ thống công nghệ thông tin Chi bộ..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white text-slate-900 resize-none"
            />
          </div>

          {/* Nút hành động */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-red-800 hover:bg-red-700 active:bg-red-900 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Lưu Thay Đổi' : 'Thêm Đảng Viên'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
