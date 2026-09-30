import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ActiveTab, PartyMember } from './types/partyMember';
import { Achievement, CreateAchievementDTO } from './types/achievement';
import { AuthUser, HosoUpdateRecord } from './types/hosoUpdate';
import { Navigation } from './components/Navigation';
import { MemberList } from './components/MemberList';
import { MemberModal } from './components/MemberModal';
import { MemberDetailModal } from './components/MemberDetailModal';
import { AnalyticsView } from './components/AnalyticsView';
import { EvaluationModule } from './components/EvaluationModule';
import { SettingsView } from './components/SettingsView';
import { LoginView } from './components/LoginView';
import { HosoApprovalModal } from './components/HosoApprovalModal';
import { 
  getStoredAuthUser, 
  logoutPartyMember 
} from './utils/authService';
import { 
  fetchHosoUpdates, 
  approveHosoUpdateRequest, 
  rejectHosoUpdateRequest 
} from './utils/hosoUpdateService';
import { 
  fetchMembersFromCloud, 
  addPartyMember, 
  updatePartyMember, 
  deletePartyMember 
} from './utils/supabaseService';
import { 
  getStoredMembers, 
  saveStoredMembers, 
  resetToDefaultMembers 
} from './utils/mockData';
import { 
  fetchAllAchievements, 
  submitAchievementRequest, 
  approveAchievement, 
  rejectAchievement, 
  countPendingAchievements 
} from './utils/achievementService';
import { 
  UserPlus, 
  RefreshCw, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  ShieldAlert,
  LogOut,
  Bell,
  UserCheck
} from 'lucide-react';

export default function App() {
  // 1. Quản lý trạng thái Đăng nhập
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getStoredAuthUser());

  // 2. Dữ liệu chính Chi bộ
  const [activeTab, setActiveTab] = useState<ActiveTab>('list');
  const [members, setMembers] = useState<PartyMember[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [hosoUpdates, setHosoUpdates] = useState<HosoUpdateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCloudConnected, setIsCloudConnected] = useState(false);

  // 3. Quản lý Modal
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<PartyMember | null>(null);
  const [viewingMember, setViewingMember] = useState<PartyMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<PartyMember | null>(null);
  const [isHosoApprovalModalOpen, setIsHosoApprovalModalOpen] = useState(false);

  // 4. Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // Nạp dữ liệu đồng bộ
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [membersResult, achResult, hosoResult] = await Promise.all([
        fetchMembersFromCloud(),
        fetchAllAchievements(),
        fetchHosoUpdates(),
      ]);

      setMembers(membersResult.members);
      setAchievements(achResult.achievements);
      setHosoUpdates(hosoResult.updates);
      setIsCloudConnected(membersResult.isCloudConnected);
      
      if (!membersResult.isCloudConnected) {
        showToast('Đang hoạt động ở Chế độ Nội bộ (Offline)', 'info');
      }
    } catch {
      const fallbackList = getStoredMembers();
      setMembers(fallbackList);
      setIsCloudConnected(false);
      showToast('Đã nạp dữ liệu từ bộ nhớ nội bộ', 'info');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Đăng xuất
  const handleLogout = async () => {
    await logoutPartyMember();
    setCurrentUser(null);
    showToast('Đã đăng xuất khỏi hệ thống', 'info');
  };

  // Đăng nhập thành công
  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    showToast(`Chào mừng đồng chí ${user.military_rank} ${user.full_name}`, 'success');
  };

  // Số lượng yêu cầu thay đổi hồ sơ đang chờ duyệt
  const pendingHosoUpdatesCount = useMemo(() => {
    return hosoUpdates.filter((u) => u.trang_thai === 'pending').length;
  }, [hosoUpdates]);

  // Phê duyệt yêu cầu thay đổi hồ sơ
  const handleApproveHosoUpdate = async (updateId: string) => {
    const res = await approveHosoUpdateRequest(
      updateId,
      currentUser?.full_name ? `${currentUser.military_rank} ${currentUser.full_name}` : 'Bí thư Chi bộ',
      hosoUpdates,
      members
    );
    if (res.success) {
      setHosoUpdates(res.updatedUpdates);
      setMembers(res.updatedMembers);
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  // Từ chối yêu cầu thay đổi hồ sơ
  const handleRejectHosoUpdate = async (updateId: string, reason: string) => {
    const res = await rejectHosoUpdateRequest(
      updateId,
      currentUser?.full_name ? `${currentUser.military_rank} ${currentUser.full_name}` : 'Bí thư Chi bộ',
      reason,
      hosoUpdates
    );
    if (res.success) {
      setHosoUpdates(res.updatedUpdates);
      showToast(res.message, 'info');
    } else {
      showToast(res.message, 'error');
    }
  };

  // Khen thưởng Workflow Handlers
  const handleSubmitAchievement = async (dto: CreateAchievementDTO) => {
    const res = await submitAchievementRequest(dto, achievements);
    setAchievements(res.updatedList);
    showToast(res.message, res.success ? 'success' : 'info');
  };

  const handleApproveAchievement = async (achievementId: string) => {
    const res = await approveAchievement(achievementId, 'dv-01', achievements);
    setAchievements(res.updatedList);
    showToast(res.message, 'success');
  };

  const handleRejectAchievement = async (achievementId: string, reason: string) => {
    const res = await rejectAchievement(achievementId, reason, achievements);
    setAchievements(res.updatedList);
    showToast(res.message, 'info');
  };

  // Thêm / Sửa Đảng viên
  const handleSaveMember = async (savedMember: PartyMember) => {
    if (editingMember) {
      const res = await updatePartyMember(savedMember, members);
      setMembers(res.updatedList);
      showToast(res.message, res.success ? 'success' : 'info');
    } else {
      const res = await addPartyMember(savedMember, members);
      setMembers(res.updatedList);
      showToast(res.message, res.success ? 'success' : 'info');
    }
    setIsAddEditModalOpen(false);
    setEditingMember(null);
  };

  // Xóa Đảng viên
  const confirmDeleteMember = async () => {
    if (!deletingMember) return;
    const res = await deletePartyMember(deletingMember.id, members);
    setMembers(res.updatedList);
    showToast(`Đã xóa đồng chí ${deletingMember.full_name}`, 'info');
    setDeletingMember(null);
  };

  // Khôi phục dữ liệu gốc
  const handleResetToDefault = () => {
    const defaultList = resetToDefaultMembers();
    setMembers(defaultList);
    showToast('Đã khôi phục danh sách chuẩn 21 đồng chí', 'info');
  };

  // Khôi phục từ backup
  const handleRestoreBackup = (backupMembers: PartyMember[]) => {
    setMembers(backupMembers);
    saveStoredMembers(backupMembers);
    showToast(`Đã khôi phục ${backupMembers.length} hồ sơ Đảng viên`, 'success');
  };

  // Tiêu đề các tab đồng nhất cho toàn bộ hệ thống
  const tabTitles: Record<ActiveTab, { title: string; subtitle?: string }> = {
    list: {
      title: 'Danh Sách Trích Ngang Toàn Chi Bộ',
    },
    analytics: {
      title: 'Báo Cáo Phân Tích & Thống Kê Cơ Cấu',
      subtitle: 'Phân tích nhân sự, độ tuổi, cấp bậc quân hàm và khả năng cơ động chiến đấu',
    },
    evaluation: {
      title: 'Đánh Giá, Xếp Loại Đảng Viên & Bỏ Phiếu Tín Nhiệm',
      subtitle: 'Bỏ phiếu tín nhiệm 4 mức & bảng tổng hợp xếp hạng tự động theo Quy định 124-QĐ/TW',
    },
    settings: {
      title: 'Cài Đặt Hệ Thống & Đồng Bộ Cơ Sở Dữ Liệu',
      subtitle: 'Cấu hình Supabase Cloud, kiểm tra tín hiệu mạng và sao lưu dự phòng',
    },
  };

  // =========================================================================
  // TRƯỜNG HỢP: CHƯA ĐĂNG NHẬP -> HIỂN THỊ GIAO DIỆN LOGIN
  // =========================================================================
  if (!currentUser) {
    return (
      <>
        <LoginView members={members} onLoginSuccess={handleLoginSuccess} />
        {toast && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold text-white transition-all bg-slate-900 border border-slate-700">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        )}
      </>
    );
  }

  // =========================================================================
  // GIAO DIỆN HỢP NHẤT DUY NHẤT (SINGLE UNIFIED PORTAL)
  // Đồng nhất 100% giao diện giữa Đảng viên và Bí thư
  // =========================================================================
  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-slate-100 font-interface">
      {/* 1. THANH ĐIỀU HƯỚNG TỔNG THỂ */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCloudConnected={isCloudConnected}
        totalMembers={members.length}
        members={members}
        pendingAchievementsCount={countPendingAchievements(achievements) + pendingHosoUpdatesCount}
        onOpenAddModal={() => {
          setEditingMember(null);
          setIsAddEditModalOpen(true);
        }}
        currentUser={currentUser}
      />

      {/* 2. VÙNG NỘI DUNG CHÍNH (Main Content Area) */}
      <main className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-slate-50/70">
        {/* Header trên Mobile (< 768px) */}
        <header className="md:hidden h-12 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between shrink-0 z-30 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-red-800 ring-1 ring-amber-400/80 flex items-center justify-center overflow-hidden shrink-0">
              <img
                src="/logo.jpg"
                alt="Logo"
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-400 tracking-wider">CHI BỘ BAN HC-KT</span>
              <span className="text-[10px] text-slate-400 block -mt-0.5">Đảng bộ Trung đoàn 6</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pendingHosoUpdatesCount > 0 && (
              <button
                onClick={() => setIsHosoApprovalModalOpen(true)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-400 text-red-950 font-bold text-[10.5px] shadow-xs animate-pulse"
                title={`${pendingHosoUpdatesCount} yêu cầu cập nhật hồ sơ chờ duyệt`}
              >
                <Bell className="w-3 h-3" />
                <span>{pendingHosoUpdatesCount}</span>
              </button>
            )}

            {activeTab === 'list' && (
              <button
                onClick={() => {
                  setEditingMember(null);
                  setIsAddEditModalOpen(true);
                }}
                className="p-1.5 rounded-lg bg-red-800 text-white hover:bg-red-700 active:bg-red-900 transition-colors shadow-2xs"
                title="Thêm Đảng viên"
              >
                <UserPlus className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Header trên Desktop (>= 768px): Tinh gọn, trang trọng, đồng nhất */}
        <header className="hidden md:flex h-16 bg-white border-b border-slate-200/90 px-6 items-center justify-between shrink-0 shadow-2xs z-10">
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              {tabTitles[activeTab].title}
            </h1>
            {tabTitles[activeTab].subtitle && (
              <p className="text-xs text-slate-500 line-clamp-1">
                {tabTitles[activeTab].subtitle}
              </p>
            )}
          </div>

          {/* Công cụ & Primary Action đồng nhất */}
          <div className="flex items-center gap-3">
            {/* Nút xem xét yêu cầu thay đổi lý lịch Đảng viên nếu có pending */}
            {pendingHosoUpdatesCount > 0 && (
              <button
                onClick={() => setIsHosoApprovalModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 transition-all cursor-pointer shadow-2xs animate-pulse"
                title="Nhấp để xem xét và phê duyệt các yêu cầu thay đổi hồ sơ"
              >
                <Bell className="w-3.5 h-3.5 text-amber-700" />
                <span>{pendingHosoUpdatesCount} Yêu cầu sửa hồ sơ</span>
              </button>
            )}

            {/* Thông tin định danh đồng chí đang đăng nhập */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-800">
              <UserCheck className="w-3.5 h-3.5 text-red-800" />
              <span>
                Đồng chí: <strong className="text-slate-900">{currentUser.military_rank} {currentUser.full_name}</strong> ({currentUser.position})
              </span>
            </div>

            {/* Nút Thêm mới tại tab Hồ sơ */}
            {activeTab === 'list' && (
              <button
                onClick={() => {
                  setEditingMember(null);
                  setIsAddEditModalOpen(true);
                }}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-red-800 hover:bg-red-700 active:bg-red-900 rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Thêm Đảng Viên</span>
              </button>
            )}

            {/* Nút Làm Mới tại tab Cài đặt */}
            {activeTab === 'settings' && (
              <button
                onClick={loadData}
                disabled={loading}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg border border-slate-200 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-700' : ''}`} />
                <span>Làm Mới</span>
              </button>
            )}

            {/* Nút Đăng xuất */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 transition-colors cursor-pointer"
              title="Đăng xuất khỏi hệ thống"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </header>

        {/* Khối Nội Dung Tab chính (Đồng nhất cho tất cả tài khoản) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 pb-24 md:pb-6 custom-scrollbar">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-red-700" />
              <div className="text-sm font-medium text-slate-600">
                Đang nạp hồ sơ Chi bộ...
              </div>
            </div>
          ) : (
            <>
              {/* TAB 1: DANH SÁCH TRÍCH NGANG ĐẢNG VIÊN */}
              {activeTab === 'list' && (
                <MemberList
                  members={members}
                  achievements={achievements}
                  onViewMember={(member) => setViewingMember(member)}
                  onEditMember={(member) => {
                    setEditingMember(member);
                    setIsAddEditModalOpen(true);
                  }}
                  onDeleteMember={(member) => setDeletingMember(member)}
                />
              )}

              {/* TAB 2: BÁO CÁO PHÂN TÍCH & THỐNG KÊ */}
              {activeTab === 'analytics' && (
                <AnalyticsView members={members} />
              )}

              {/* TAB 3: ĐÁNH GIÁ, XẾP LOẠI & BỎ PHIẾU TÍN NHIỆM */}
              {activeTab === 'evaluation' && (
                <EvaluationModule 
                  members={members} 
                  currentUser={currentUser}
                  isAdmin={true}
                />
              )}

              {/* TAB 4: CÀI ĐẶT HỆ THỐNG & ĐỒNG BỘ */}
              {activeTab === 'settings' && (
                <SettingsView
                  members={members}
                  isCloudConnected={isCloudConnected}
                  onForceReload={loadData}
                  onResetToDefault={handleResetToDefault}
                  onRestoreBackup={handleRestoreBackup}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Modal: Thêm / Sửa Đảng viên */}
      <MemberModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setEditingMember(null);
        }}
        onSave={handleSaveMember}
        initialMember={editingMember}
        existingCount={members.length}
      />

      {/* Modal: Phê duyệt Yêu cầu thay đổi hồ sơ */}
      <HosoApprovalModal
        isOpen={isHosoApprovalModalOpen}
        onClose={() => setIsHosoApprovalModalOpen(false)}
        hosoUpdates={hosoUpdates}
        onApprove={handleApproveHosoUpdate}
        onReject={handleRejectHosoUpdate}
      />

      {/* Modal: Xem trích lục chi tiết & Phê duyệt Khen thưởng tương tác */}
      <MemberDetailModal
        member={viewingMember}
        onClose={() => setViewingMember(null)}
        onEdit={(member) => {
          setViewingMember(null);
          setEditingMember(member);
          setIsAddEditModalOpen(true);
        }}
        achievements={achievements}
        isSecretary={true}
        onSubmitAchievement={handleSubmitAchievement}
        onApproveAchievement={handleApproveAchievement}
        onRejectAchievement={handleRejectAchievement}
      />

      {/* Modal: Xác nhận xóa */}
      {deletingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs font-interface">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-red-700">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Xác Nhận Xóa Hồ Sơ
                </h3>
                <p className="text-xs text-slate-500">
                  Hành động này sẽ loại bỏ đồng chí khỏi danh sách Chi bộ
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
              Bạn có chắc chắn muốn xóa hồ sơ đồng chí{' '}
              <strong className="text-red-900">{deletingMember.full_name}</strong> ({deletingMember.military_rank} - {deletingMember.position})?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingMember(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmDeleteMember}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast thông báo góc dưới bên phải */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold text-white transition-all bg-slate-900 border border-slate-700">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : toast.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
