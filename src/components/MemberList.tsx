import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../utils/supabaseClient';
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
import { approveAchievement } from '../utils/achievementService';

interface MemberListProps {
  members: PartyMember[];
  achievements?: Achievement[];
  onViewMember: (member: PartyMember) => void;
  onEditMember: (member: PartyMember) => void;
  onDeleteMember: (member: PartyMember) => void;
  currentUser: any;
  onOpenAddModal: () => void;
}

export const MemberList: React.FC<MemberListProps> = ({
  members,
  achievements = [],
  onViewMember,
  onEditMember,
  onDeleteMember,
  currentUser,
  onOpenAddModal,

}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PartyStatus>('all');
  // State lưu danh sách đề xuất thật lấy từ bảng party_award_proposals trên Supabase
  const [realProposals, setRealProposals] = useState<any[]>([]);

  // 1. Khai báo thêm State quản lý ẩn hiện Popup duyệt đơn hành chính
  const [showApprovalList, setShowApprovalList] = useState<boolean>(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchRealProposals = async () => {
    try {
      const { data, error } = await supabase
        .from('party_award_proposals')
        .select('*');

      if (error) throw error;

      // Chuẩn hóa dữ liệu: Đảm bảo chuyển đổi từ database sang thuộc tính giao diện đang dùng
      const normalizedData = (data || []).map(item => ({
        ...item,
        id: item.id.toString(),
        // Đồng bộ cả 2 thuộc tính để dù giao diện cũ gọi .status hay giao diện mới gọi .trang_thai đều chạy đúng
        status: item.status || 'Chờ duyệt',
        trang_thai: item.status || 'Chờ duyệt',
        // Đồng bộ thuộc tính hiển thị tên danh hiệu
        title: item.title || 'Khen thưởng',
        name: item.title || 'Khen thưởng' // Dự phòng nếu giao diện mobile dùng trường .name
      }));


      setRealProposals(normalizedData);
    } catch (err) {
      console.error("Lỗi khi tải danh sách đề xuất:", err);
    }
  };


  // 3. useEffect chỉ làm nhiệm vụ kích hoạt hàm fetch khi component mount hoặc đổi tài khoản
  useEffect(() => {
    fetchRealProposals();
  }, [currentUser?.id]);

  // 2. Bộ đếm đơn chờ duyệt tập trung - Tự động giảm khi danh sách biến động (Dùng chung cho cả Web và Mobile)
  const pendingTotal = useMemo(() => {
    if (!currentUser?.id) return 0;

    // Lọc danh sách đơn thực sự đang có trạng thái 'Chờ duyệt'
    const pendingProposals = realProposals.filter(a => a.trang_thai === 'Chờ duyệt');

    if (currentUser.id === 'dv-01') {
      // Bí thư: Đếm tổng toàn bộ đơn 'Chờ duyệt' trong hệ thống
      return pendingProposals.length;
    } else {
      // Đảng viên: Chỉ đếm những đơn 'Chờ duyệt' do chính mình gửi lên
      return pendingProposals.filter(a => a.member_id === currentUser.id).length;
    }
  }, [realProposals, currentUser?.id]);

  // Hàm xử lý phê duyệt danh hiệu (Đặt bên dưới useMemo trên)
  const handleApproveProposal = async (proposalId: string) => {
    const result = await approveAchievement(proposalId, currentUser?.id || 'dv-01', realProposals);

    if (result.success) {
      // Cập nhật state cục bộ -> Popup mất đơn, ô màu vàng tự động trừ số lượng
      setRealProposals(result.updatedList);
    } else {
      alert("Phê duyệt thất bại: " + result.message);
    }
  };
  // Map memberId to achievements counts - Đã đồng bộ chuẩn xác 100% dữ liệu thực tế
  const memberAchMap = useMemo(() => {
    const map = new Map<string, { approved: number; pending: number }>();

    // Set theo dõi ID duy nhất của dòng dữ liệu để tuyệt đối không đếm sót danh hiệu thật
    const idTracking = new Set<string>();

    if (!achievements || !Array.isArray(achievements)) return map;

    achievements.forEach(a => {
      // Đọc id dòng dữ liệu một cách an toàn
      const achId = a.id?.toString();
      if (!achId || idTracking.has(achId)) return;

      const current = map.get(a.member_id) || { approved: 0, pending: 0 };

      if (a.status === 'pending') {
        current.pending++;
        idTracking.add(achId);
      } else if (a.status === 'approved') {
        current.approved++;
        idTracking.add(achId); // Đánh dấu ID này đã được đếm
      }

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
      {/* BANNER THÔNG BÁO TẬP TRUNG: CHỈ VIẾT 1 NƠI - TỰ ĐỘNG HIỂN THỊ CẢ WEB & MOBILE */}
      {pendingTotal > 0 && (
        <div
          onClick={() => currentUser?.id === 'dv-01' && setShowApprovalList(true)}
          className={`bg-gradient-to-r from-amber-50 to-amber-100/70 border border-amber-300 p-3 rounded-xl flex items-center justify-between gap-3 shadow-sm select-none ${currentUser?.id === 'dv-01' ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
        >
          {/* Toàn bộ nội dung ruột thẻ con bên trong của bạn giữ nguyên vẹn 100% */}
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span className="text-xs text-amber-950">
              {currentUser?.id === 'dv-01' ? (
                // Dòng chữ hiển thị riêng cho tài khoản Bí thư
                <>Có <strong>{pendingTotal}</strong> đề xuất khen thưởng/danh hiệu mới đang chờ <strong>Bí thư chi bộ</strong> xem xét và phê duyệt.</>
              ) : (
                // Dòng chữ hiển thị riêng cho tài khoản Đảng viên thường
                <>Đồng chí đang có <strong>{pendingTotal}</strong> đề xuất khen thưởng đang chờ <strong>Bí thư chi bộ</strong> xét duyệt.</>
              )}
            </span>
          </div>
          {currentUser?.id === 'dv-01' && (
            <span className="text-[10px] font-bold text-amber-800 hidden sm:inline shrink-0">
              (Bấm vào bất kỳ dòng nào để xem hồ sơ & duyệt)
            </span>
          )}
        </div>
      )}

      {/* 1. GIAO DIỆN MOBILE-FIRST (< 768px): Thẻ danh sách Đảng viên */}
      <div className="block md:hidden">
        <MemberCardView
          members={members}
          achievements={achievements}
          onViewMember={onViewMember}
          onEditMember={onEditMember}
          onDeleteMember={onDeleteMember}
        />
      </div>

      {/* 2. GIAO DIỆN DESKTOP (>= 768px): Bảng trích ngang 13 cột */}
      <div className="hidden md:block space-y-4">
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
          <div className="hidden md:block overflow-x-auto custom-scrollbar">
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
                          <span className={`inline-block font-semibold ${member.military_rank.includes('Trung tá') || member.military_rank.includes('Thiếu tá')
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
                              className={`text-[11px] font-sans inline-flex items-center px-1.5 py-0.2 rounded ${isReserve
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
          {/* 📱 LUỒNG ĐIỀU PHỐI ĐIỆN THOẠI (DANH SÁCH THẺ CHUẨN CƠ SỞ DỮ LIỆU) */}
          <div className="block md:hidden space-y-3 p-4 bg-slate-50">
            {members.map((member) => (
              <div
                key={member.id}
                onClick={() => onViewMember(member)} // 🏛️ ĐỔI THÀNH HÀM CÓ SẴN: Dùng luôn hàm onViewMember đã khai báo ở Prop
                className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm active:bg-slate-50 transition-all flex justify-between items-center cursor-pointer"
              >
                <div>
                  <h3 className="font-semibold text-slate-900 text-base">{member.full_name || member.full_name}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {/* Sửa lỗi 2: Chuyển thành member.capbac viết liền */}
                    {member.military_rank && <span className="mr-2 font-medium text-slate-700">{member.military_rank}</span>}
                    {/* Sửa lỗi 3: Chuyển thành member.chucvu */}
                    {member.position || 'Đảng viên'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {/* Sửa lỗi 4: Khép góc chuẩn cú pháp JSX cho toán tử điều kiện */}
                  {(member.party_status as string) === 'pending' && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  )}

                  <span className="text-slate-400 text-sm font-medium">→</span>
                </div>
              </div>
            ))}
          </div>
          {/* ========================================================================= */}
          {/* POPUP DẠNG A: DANH SÁCH ĐỀ XUẤT CHỜ DUYỆT DÀNH RIÊNG CHO BÍ THƯ CHI BỘ */}
          {/* ========================================================================= */}
          {showApprovalList && currentUser?.id === 'dv-01' && createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[80vh]">

                {/* Header Popup */}
                <div className="bg-amber-950 text-white px-5 py-3.5 flex items-center justify-between">
                  <span className="font-bold text-sm tracking-wide">Danh Sách Đề Xuất Chờ Phê Duyệt</span>
                  <button
                    onClick={() => setShowApprovalList(false)}
                    className="text-white/70 hover:text-white font-medium text-base p-1 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-5 overflow-y-auto flex-1 space-y-3 bg-slate-50">
                  {realProposals.filter(p => p.trang_thai === 'Chờ duyệt').length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-10 italic">Hiện tại không còn đề xuất nào cần phê duyệt.</p>
                  ) : (
                    realProposals
                      .filter(p => p.trang_thai === 'Chờ duyệt')
                      .map((item) => {
                        const targetMember = members.find(m => m.id === item.member_id);

                        return (
                          <div key={item.id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs flex flex-col gap-3">
                            <div className="space-y-1">
                              <div className="text-xs text-slate-800 font-bold">
                                Đồng chí: <span className="text-amber-900">{targetMember ? targetMember.full_name : 'Chưa rõ danh tính'}</span>
                              </div>
                              <div className="text-xs text-slate-600">
                                Đề xuất danh hiệu: <strong className="text-slate-900">{item.title || item.name || 'Khen thưởng'}</strong>
                              </div>
                              <div className="text-sm text-slate-500 flex gap-4">
                                <span>Năm đạt: <strong className="text-slate-900">{item.year}</strong></span>
                                <span>Cấp công nhận: <strong className="text-slate-900">{item.decision_by || 'Chưa cập nhật'}</strong></span>
                              </div>
                              {item.notes && (
                                <div className="text-xs text-slate-500 bg-slate-50/60 p-2 rounded border border-dashed border-slate-200">
                                  Ghi chú: {item.notes}
                                </div>
                              )}
                            </div>

                            {/* Hàng nút bấm Thao tác hành chính công vụ */}
                            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                              {/* NÚT TỪ CHỐI */}
                              <button
                                type="button"
                                disabled={processingId !== null}
                                onClick={async () => {
                                  if (!window.confirm('Bạn có chắc chắn muốn Từ chối đề xuất này?')) return;
                                  setProcessingId(item.id);
                                  try {
                                    const { rejectAwardProposal } = await import('../utils/supabaseService');
                                    await rejectAwardProposal(item.id);
                                    alert('Đã từ chối đề xuất khen thưởng.');

                                    // Cập nhật State thời gian thực (Loại bỏ item vừa từ chối khỏi danh sách hiện tại)
                                    const updatedList = realProposals.filter(p => p.id.toString() !== item.id.toString());
                                    setRealProposals(updatedList);

                                    // Nếu hết sạch đơn chờ duyệt, đóng popup tự động
                                    if (updatedList.filter(p => p.trang_thai === 'Chờ duyệt').length === 0) {
                                      setShowApprovalList(false);
                                    }
                                  } catch (err: any) {
                                    alert('Thao tác thất bại: ' + err.message);
                                  } finally {
                                    setProcessingId(null);
                                  }
                                }}
                                className="px-2.5 py-1 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md border border-red-200 transition-colors cursor-pointer"
                              >
                                Từ chối
                              </button>

                              {/* NÚT PHÊ DUYỆT TRỰC TIẾP THỜI GIAN THỰC */}
                              <button
                                type="button"
                                disabled={processingId !== null}
                                onClick={async () => {
                                  if (!window.confirm(`Xác nhận phê duyệt danh hiệu cho đồng chí ${targetMember ? targetMember.full_name : ''}?`)) return;
                                  setProcessingId(item.id);
                                  try {
                                    const { approveAchievement } = await import('../utils/achievementService');
                                    const result = await approveAchievement(item.id, currentUser?.id || 'dv-01', realProposals);

                                    if (result.success) {
                                      alert('Phê duyệt và ghi nhận vào lý lịch Đảng viên thành công!');

                                      // ĐOẠN CODE NGUYÊN BẢN CHẠY TRƠN TRU LÚC TRƯỚC:
                                      const freshList = realProposals.filter(p => p.id.toString() !== item.id.toString());
                                      setRealProposals(freshList);

                                      if (freshList.filter(p => p.trang_thai === 'Chờ duyệt').length === 0) {
                                        setShowApprovalList(false);
                                      }
                                    } else {
                                      alert('Phê duyệt thất bại: ' + result.message);
                                    }
                                  } catch (err: any) {
                                    alert('Phê duyệt thất bại: ' + err.message);
                                  } finally {
                                    setProcessingId(null);
                                  }


                                }}
                                className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors cursor-pointer"
                              >
                                Phê duyệt
                              </button>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            </div>,
            document.body
          )}
        </div>
      </div>
    </div>
  );
};

