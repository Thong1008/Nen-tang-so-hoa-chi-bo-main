import React, { useState } from 'react';
import { ActiveTab, PartyMember } from '../types/partyMember';
import { exportPartyMembersToWord } from '../utils/exportWord';
import { 
  Users, 
  BarChart3, 
  Award, 
  Settings, 
  FileDown, 
  ShieldAlert, 
  Cloud, 
  CloudOff,
  Star
} from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isCloudConnected: boolean;
  totalMembers: number;
  members: PartyMember[];
  pendingAchievementsCount?: number;
  onOpenAddModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCloudConnected,
  totalMembers,
  members,
  pendingAchievementsCount = 0,
}) => {
  const [imageError, setImageError] = useState(false);

  const navItems = [
    {
      id: 'list' as ActiveTab,
      label: 'Danh sách trích ngang',
      sublabel: `Hồ sơ ${totalMembers} Đảng viên (HD 05)`,
      icon: Users,
      badge: pendingAchievementsCount > 0 ? `${pendingAchievementsCount} chờ duyệt` : undefined,
    },
    {
      id: 'analytics' as ActiveTab,
      label: 'Phân tích & Thống kê',
      sublabel: 'Cơ cấu tuổi, bậc, cự ly',
      icon: BarChart3,
    },
    {
      id: 'evaluation' as ActiveTab,
      label: 'Đánh giá & Bỏ phiếu tín nhiệm',
      sublabel: 'Bỏ phiếu 4 mức & Xếp hạng',
      icon: Award,
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Cài đặt & Đồng bộ',
      sublabel: 'Supabase Cloud & Bộ nhớ',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col h-screen shrink-0 border-r border-slate-800 shadow-xl select-none z-20">
      {/* Header Sidebar */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-3">
          {/* Circular logo with delicate gold border & fallback icon */}
          <div className="relative w-12 h-12 rounded-full ring-2 ring-amber-400/80 ring-offset-2 ring-offset-slate-900 bg-red-800 flex items-center justify-center shrink-0 overflow-hidden shadow-md">
            {!imageError ? (
              <img
                src="/logo.jpg"
                alt="Huy hiệu LLVT TP Huế"
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-red-700 via-red-800 to-amber-900 flex items-center justify-center text-amber-300">
                <Star className="w-6 h-6 fill-amber-300" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-xs font-bold tracking-wider text-amber-400 uppercase truncate">
              LLVT THÀNH PHỐ HUẾ
            </h1>
            <p className="text-[13px] font-semibold text-slate-200 tracking-tight leading-tight line-clamp-1 mt-0.5">
              CHI BỘ HẬU CẦN - KỸ THUẬT
            </p>
          </div>
        </div>

        {/* Cloud Connection Badge */}
        <div className="mt-3.5 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 transition-colors ${
                isCloudConnected
                  ? 'bg-emerald-400 ring-4 ring-emerald-500/20 animate-pulse'
                  : 'bg-amber-400 ring-4 ring-amber-500/20'
              }`}
            />
            <span className={`text-[11px] font-medium ${isCloudConnected ? 'text-emerald-300' : 'text-amber-300'}`}>
              {isCloudConnected ? 'Đã kết nối Cloud' : 'Chế độ Nội bộ (Offline)'}
            </span>
          </div>

          <span className="text-[11px] text-slate-400 tabular-nums">
            {totalMembers} đ/c
          </span>
        </div>
      </div>

      {/* Main Navigation Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        <div className="px-2 pb-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Mục Quản Trị
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 group relative ${
                isActive
                  ? 'bg-red-950/70 text-amber-300 border-l-4 border-amber-400 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border-l-4 border-transparent'
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-colors ${
                  isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-sm font-semibold truncate leading-snug">
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-red-950 font-bold text-[10px] shrink-0 shadow-2xs">
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className={`text-[11px] truncate ${isActive ? 'text-amber-300/80' : 'text-slate-400'}`}>
                  {item.sublabel}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer Sidebar */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950/60 space-y-2">
        <button
          onClick={() => exportPartyMembersToWord(members, 'Toàn bộ Chi bộ')}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-lg border border-slate-700 transition-colors shadow-sm cursor-pointer"
          title="Xuất danh sách trích ngang chuẩn thể thức Hướng dẫn 05-HD/VPTW sang định dạng Microsoft Word"
        >
          <FileDown className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Xuất Báo Cáo Word (.doc)</span>
        </button>

        <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
          <span>Phiên bản v1.0 Chính quy</span>
          <span className="font-mono">BCHQS TP Huế</span>
        </div>
      </div>
    </aside>
  );
};
