import React, { useState, useMemo } from 'react';
import { PartyMember, PartyStatus } from '../types/partyMember';
import { Achievement } from '../types/achievement';
import { 
  Search, 
  Phone, 
  MapPin, 
  Award, 
  Clock, 
  ChevronRight, 
  Edit3, 
  CheckCircle2, 
  Calendar,
  AlertCircle,
  FileDown
} from 'lucide-react';
import { exportPartyMembersToWord } from '../utils/exportWord';

interface MemberCardViewProps {
  members: PartyMember[];
  achievements?: Achievement[];
  onViewMember: (member: PartyMember) => void;
  onEditMember: (member: PartyMember) => void;
  onDeleteMember: (member: PartyMember) => void;
}

export const MemberCardView: React.FC<MemberCardViewProps> = ({
  members,
  achievements = [],
  onViewMember,
  onEditMember,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PartyStatus>('all');

  // Achievements map
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

  // Filtered list
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      if (statusFilter !== 'all' && member.party_status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        return (
          member.full_name.toLowerCase().includes(query) ||
          member.citizen_id.includes(query) ||
          member.phone.includes(query) ||
          member.military_rank.toLowerCase().includes(query) ||
          member.position.toLowerCase().includes(query) ||
          member.current_residence.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [members, searchQuery, statusFilter]);

  const totalPending = useMemo(() => {
    return achievements.filter(a => a.status === 'pending').length;
  }, [achievements]);

  return (
    <div className="space-y-3 font-interface">
      {/* Mobile Lean Search & Filter */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo họ tên, cấp bậc, chức vụ, SĐT..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white text-slate-900 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 p-1"
            >
              ✕
            </button>
          )}
        </div>

      </div>

      {/* Banner thông báo nếu có khen thưởng chờ duyệt */}
     
      {/* Subtext info */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
        <span>Hiển thị {filteredMembers.length} / {members.length} đồng chí</span>
        <span>Chạm thẻ để xem lý lịch & duyệt khen thưởng</span>
      </div>

      {/* Vertical Cards List */}
      <div className="space-y-2.5">
        {filteredMembers.length > 0 ? (
          filteredMembers.map((member, index) => {
            const achInfo = memberAchMap.get(member.id);
            const isSenior = member.military_rank.includes('Trung tá') || member.military_rank.includes('Thiếu tá');
            const isReserve = member.party_status === 'Dự bị';

            return (
              <div
                key={member.id}
                onClick={() => onViewMember(member)}
                className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs active:bg-amber-50/50 transition-colors cursor-pointer relative overflow-hidden"
              >
                {/* Active Indicator line if pending */}
                {achInfo && achInfo.pending > 0 && (
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-amber-500" />
                )}

                <div className="flex items-start justify-between gap-3">
                  {/* Left: Avatar + Details */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                          {member.id.toUpperCase()}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm truncate">
                          {member.full_name}
                        </h3>
                        {/* Status chip */}
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                            isReserve
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-red-50 text-red-800 border border-red-200'
                          }`}
                        >
                          {member.party_status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 mt-0.5 truncate">
                        <span className={`font-semibold ${isSenior ? 'text-red-900' : 'text-slate-800'}`}>
                          {member.military_rank}
                        </span>
                        <span className="mx-1 text-slate-300">·</span>
                        <span>{member.position}</span>
                      </div>

                      {/* Distance & Address info */}
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-700" />
                          <strong className="text-slate-800">{member.distance_km} km</strong> (Cự li đến cơ quan)
                        </span>

                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {member.birth_year}
                        </span>
                      </div>

                      {/* Achievements preview badge on card */}
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
                        {achInfo && achInfo.approved > 0 && (
                          <span className="text-[10.5px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                            <Award className="w-3 h-3 text-emerald-600" />
                            <span>{achInfo.approved} danh hiệu</span>
                          </span>
                        )}

                        {achInfo && achInfo.pending > 0 && (
                          <span className="text-[10.5px] font-bold text-amber-950 bg-amber-200/90 px-2 py-0.5 rounded border border-amber-300 flex items-center gap-1 animate-pulse">
                            <Clock className="w-3 h-3 text-amber-700" />
                            <span>{achInfo.pending} chờ duyệt</span>
                          </span>
                        )}

                        {(!achInfo || (achInfo.approved === 0 && achInfo.pending === 0)) && (
                          <span className="text-[10.5px] text-slate-400 italic">
                             
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-col items-end justify-between h-full space-y-2 shrink-0">
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                    
                    <a
                      href={`tel:${member.phone.replace(/[^0-9]/g, '')}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                      title="Gọi điện khẩn cấp"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-10 text-center bg-white rounded-xl border border-slate-200 p-4 text-slate-500 text-xs">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <div>Không tìm thấy Đảng viên phù hợp</div>
          </div>
        )}
      </div>

      {/* Nút xuất báo cáo Word tiện lợi ngay dưới danh sách di động */}
      <div className="pt-2 pb-6">
        <button
          onClick={() => exportPartyMembersToWord(filteredMembers, statusFilter === 'all' ? 'Toàn bộ Chi bộ' : statusFilter)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl shadow-2xs hover:bg-slate-50 active:bg-slate-100 cursor-pointer"
        >
          <FileDown className="w-4 h-4 text-red-800" />
          <span>Tải file Word danh sách trích ngang (.doc)</span>
        </button>
      </div>
    </div>
  );
};
