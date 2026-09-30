import React, { useState, useMemo } from 'react';
import { PartyMember, PartyStatus } from '../types/partyMember';
import { Achievement } from '../types/achievement';
import { exportPartyMembersToWord } from '../utils/exportWord';
import { MemberCardView } from './MemberCardView';
import { 
  Search, 
  FileDown, 
  Edit3, 
  Trash2, 
  Eye, 
  UserCheck, 
  Clock, 
  Award, 
  Medal, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface MemberListProps {
  members: PartyMember[];
  achievements?: Achievement[];
  onViewMember: (member: PartyMember) => void;
  onEditMember: (member: PartyMember) => void;
  onDeleteMember: (member: PartyMember) => void;
}

export const MemberList: React.FC<MemberListProps> = ({
  members,
  achievements = [],
  onViewMember,
  onEditMember,
  onDeleteMember,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PartyStatus>('all');

  // Pending count for the whole unit
  const pendingTotal = useMemo(() => {
    return achievements.filter(a => a.status === 'pending').length;
  }, [achievements]);

  // Map memberId to achievements counts
  const memberAchMap = useMemo(() => {
    const map = new Map<string, { approved: number; pending: number }>();
    achievements.forEach(a => {
      const current = map.get(a.member_id) || { approved: 0, pending: 0 };
      if (a.status === 'approved') current.approved++;
      if (a.status === 'pending') current.pending++;
      map.set(a.member_id, current);
    });
    return map;
  }, [achievements]);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      // Status filter
      if (statusFilter !== 'all' && member.party_status !== statusFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const matchName = member.full_name.toLowerCase().includes(query);
        const matchCccd = member.citizen_id.includes(query);
        const matchPhone = member.phone.includes(query);
        const matchRank = member.military_rank.toLowerCase().includes(query);
        const matchPos = member.position.toLowerCase().includes(query);
        const matchRes = member.current_residence.toLowerCase().includes(query);
        const matchHome = member.hometown.toLowerCase().includes(query);

        return matchName || matchCccd || matchPhone || matchRank || matchPos || matchRes || matchHome;
      }

      return true;
    });
  }, [members, searchQuery, statusFilter]);

  const officialCount = useMemo(() => members.filter(m => m.party_status === 'Chính thức').length, [members]);
  const reserveCount = useMemo(() => members.filter(m => m.party_status === 'Dự bị').length, [members]);

  const handleExportWord = () => {
    const filterText = statusFilter === 'all' 
      ? 'Toàn bộ Chi bộ' 
      : `Đảng viên ${statusFilter}`;
    exportPartyMembersToWord(filteredMembers, filterText);
  };

  return (
    <div className="space-y-4">
      {/* 1. GIAO DIỆN MOBILE-FIRST (< 768px): Thẻ danh sách Đảng viên (Member Cards) vuốt dọc */}
      <div className="block md:hidden">
        <MemberCardView
          members={members}
          achievements={achievements}
          onViewMember={onViewMember}
          onEditMember={onEditMember}
          onDeleteMember={onDeleteMember}
        />
      </div>

      {/* 2. GIAO DIỆN DESKTOP (>= 768px): Bảng trích ngang 13 cột chuẩn Hướng dẫn 05-HD/VPTW */}
      <div className="hidden md:block space-y-4">
        {/* Banner thông báo đề xuất khen thưởng đang chờ Bí thư xử lý */}
      {pendingTotal > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-amber-100/70 border border-amber-300 p-3 rounded-xl flex items-center justify-between gap-3 text-xs shadow-2xs font-interface">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span className="text-amber-950">
              Có <strong>{pendingTotal}</strong> đề xuất khen thưởng/danh hiệu mới đang chờ <strong>Bí thư Chi bộ</strong> xem xét và phê duyệt.
            </span>
          </div>
          <span className="text-[11px] font-semibold text-amber-800 hidden sm:inline">
            (Bấm vào bất kỳ dòng nào để xem hồ sơ & duyệt)
          </span>
        </div>
      )}

      {/* Duy nhất 1 thanh công cụ tinh gọn (Font Sans-serif) */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 font-interface">
        {/* Ô tìm kiếm từ khóa */}
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo họ tên, CCCD, cấp bậc, chức vụ, SĐT..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white text-slate-800 transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-1 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Bộ lọc phân loại (Tất cả / Chính thức / Dự bị) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/60 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả ({members.length})
          </button>
          <button
            onClick={() => setStatusFilter('Chính thức')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
              statusFilter === 'Chính thức'
                ? 'bg-red-800 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-red-800'
            }`}
          >
            Chính thức ({officialCount})
          </button>
          <button
            onClick={() => setStatusFilter('Dự bị')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
              statusFilter === 'Dự bị'
                ? 'bg-amber-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-amber-700'
            }`}
          >
            Dự bị ({reserveCount})
          </button>
        </div>

        {/* Nút xuất Word */}
        <button
          onClick={handleExportWord}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
          title="Xuất bảng trích ngang hiện hành ra file Word"
        >
          <FileDown className="w-4 h-4 text-red-700" />
          <span>Xuất Word (.doc)</span>
        </button>
      </div>

      {/* Thông tin số lượng hiển thị */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-interface">
        <div>
          Đang hiển thị <span className="font-semibold text-slate-800 tabular-nums">{filteredMembers.length}</span> / {members.length} đồng chí
          {searchQuery && <span className="ml-1 text-slate-500">với từ khóa "{searchQuery}"</span>}
        </div>
      </div>

      {/* Bảng trích ngang 13 cột chuẩn thể thức font Times New Roman */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse font-document text-[13.5px] leading-normal min-w-[1300px]">
            {/* Header hàng 1 & hàng 2 đánh số chỉ số cột */}
            <thead>
              <tr className="bg-slate-100 text-slate-900 border-b border-slate-300 font-bold text-center">
                <th className="py-2.5 px-2 border-r border-slate-300 w-10">STT</th>
                <th className="py-2.5 px-3 border-r border-slate-300 text-left min-w-[190px]">Họ và tên</th>
                <th className="py-2.5 px-2 border-r border-slate-300 w-24">Năm sinh</th>
                <th className="py-2.5 px-2 border-r border-slate-300 w-28">Số CCCD</th>
                <th className="py-2.5 px-2 border-r border-slate-300 w-24">Cấp bậc</th>
                <th className="py-2.5 px-3 border-r border-slate-300 text-left min-w-[180px]">Chức vụ</th>
                <th className="py-2.5 px-2 border-r border-slate-300 w-20">Nhập ngũ</th>
                <th className="py-2.5 px-2 border-r border-slate-300 min-w-[130px]">Ngày vào Đảng</th>
                <th className="py-2.5 px-2 border-r border-slate-300 w-28">Số điện thoại</th>
                <th className="py-2.5 px-3 border-r border-slate-300 text-left min-w-[170px]">Khi cần liên hệ ai</th>
                <th className="py-2.5 px-3 border-r border-slate-300 text-left min-w-[180px]">Quê quán</th>
                <th className="py-2.5 px-3 border-r border-slate-300 text-left min-w-[200px]">Nơi ở & cự ly</th>
                <th className="py-2.5 px-2 text-center w-24 font-interface text-xs">Thao tác</th>
              </tr>
            </thead>

            {/* Dữ liệu các dòng */}
            <tbody className="divide-y divide-slate-200">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member, index) => {
                  const isReserve = member.party_status === 'Dự bị';
                  const achInfo = memberAchMap.get(member.id);

                  return (
                    <tr
                      key={member.id}
                      onClick={() => onViewMember(member)}
                      className="hover:bg-amber-50/60 transition-colors group cursor-pointer"
                      title="Nhấp chuột để mở Hồ sơ Đảng viên chi tiết"
                    >
                      {/* 1. STT */}
                      <td className="py-2.5 px-2 text-center text-slate-700 font-medium border-r border-slate-200">
                        {index + 1}
                      </td>

                      {/* 2. Họ và tên */}
                      <td className="py-2.5 px-3 border-r border-slate-200">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 group-hover:text-red-900 transition-colors">
                            {member.full_name}
                          </span>
                          {/* Badge hiển thị nếu có đề xuất đang chờ duyệt */}
                          {achInfo && achInfo.pending > 0 && (
                            <span
                              className="font-interface text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-400 text-red-950 inline-flex items-center gap-0.5 shadow-2xs"
                              title={`${achInfo.pending} đề xuất khen thưởng đang chờ phê duyệt`}
                            >
                              ⏳ {achInfo.pending}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-0.5">
                          {achInfo && achInfo.approved > 0 && (
                            <span className="font-interface text-[10px] font-semibold text-emerald-700 inline-flex items-center gap-0.5">
                              🎖️ {achInfo.approved} danh hiệu
                            </span>
                          )}
                          {member.notes && (
                            <span className="text-[11.5px] text-slate-500 italic line-clamp-1">
                              {member.notes}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 3. Năm sinh */}
                      <td className="py-2.5 px-2 text-center text-slate-800 border-r border-slate-200 whitespace-nowrap">
                        {member.birth_year}
                      </td>

                      {/* 4. Số CCCD */}
                      <td className="py-2.5 px-2 text-center text-slate-700 border-r border-slate-200 font-mono text-[12.5px] tabular-nums whitespace-nowrap">
                        {member.citizen_id}
                      </td>

                      {/* 5. Cấp bậc */}
                      <td className="py-2.5 px-2 text-center border-r border-slate-200 whitespace-nowrap">
                        <span className={`inline-block font-semibold ${
                          member.military_rank.includes('Trung tá') || member.military_rank.includes('Thiếu tá')
                            ? 'text-red-900'
                            : 'text-slate-800'
                        }`}>
                          {member.military_rank}
                        </span>
                      </td>

                      {/* 6. Chức vụ */}
                      <td className="py-2.5 px-3 text-slate-800 border-r border-slate-200">
                        {member.position}
                      </td>

                      {/* 7. Nhập ngũ */}
                      <td className="py-2.5 px-2 text-center text-slate-700 border-r border-slate-200 whitespace-nowrap">
                        {member.enlistment_date}
                      </td>

                      {/* 8. Ngày vào Đảng */}
                      <td className="py-2.5 px-2 text-center border-r border-slate-200">
                        <div className="text-slate-900 font-medium whitespace-nowrap">
                          {member.party_join_date}
                        </div>
                        <div className="mt-0.5">
                          <span
                            className={`text-[11px] font-sans inline-flex items-center px-1.5 py-0.2 rounded ${
                              isReserve
                                ? 'bg-amber-100 text-amber-900 border border-amber-300 font-medium'
                                : 'bg-red-50 text-red-800 font-medium'
                            }`}
                          >
                            {isReserve ? 'Dự bị' : 'Chính thức'}
                          </span>
                        </div>
                      </td>

                      {/* 9. Số điện thoại */}
                      <td className="py-2.5 px-2 text-center text-slate-700 border-r border-slate-200 font-mono text-[12.5px] tabular-nums whitespace-nowrap">
                        {member.phone}
                      </td>

                      {/* 10. Khi cần liên hệ ai */}
                      <td className="py-2.5 px-3 text-slate-700 border-r border-slate-200 text-[12.5px]">
                        {member.emergency_contact}
                      </td>

                      {/* 11. Quê quán */}
                      <td className="py-2.5 px-3 text-slate-700 border-r border-slate-200 text-[12.5px]">
                        {member.hometown}
                      </td>

                      {/* 12. Nơi ở & cự ly */}
                      <td className="py-2.5 px-3 text-slate-800 border-r border-slate-200 text-[12.5px]">
                        <div>{member.current_residence}</div>
                        <div className="text-[11.5px] text-slate-500 font-sans font-medium mt-0.5">
                          Cự ly: <span className="text-slate-800 font-bold tabular-nums">{member.distance_km}</span> km
                        </div>
                      </td>

                      {/* 13. Thao tác */}
                      <td 
                        className="py-2 px-2 text-center font-interface"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onViewMember(member)}
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                            title="Xem hồ sơ tương tác & khen thưởng"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditMember(member)}
                            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors cursor-pointer"
                            title="Sửa thông tin lý lịch"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteMember(member)}
                            className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Xóa hồ sơ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-slate-500 font-interface">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <div className="text-sm font-medium text-slate-700">Không tìm thấy Đảng viên phù hợp</div>
                    <div className="text-xs text-slate-400 mt-1">
                      Thử điều chỉnh lại từ khóa tìm kiếm hoặc chọn bộ lọc "Tất cả"
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
};

