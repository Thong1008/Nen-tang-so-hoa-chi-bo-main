import React, { useState } from 'react';
import { PartyMember } from '../types/partyMember';
import { SUPABASE_URL } from '../utils/supabaseClient';
import { checkCloudHealth, pushAllToCloud } from '../utils/supabaseService';
import { 
  Settings, 
  Cloud, 
  RefreshCw, 
  UploadCloud, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Database,
  Lock
} from 'lucide-react';

interface SettingsViewProps {
  members: PartyMember[];
  isCloudConnected: boolean;
  onForceReload: () => Promise<void>;
  onResetToDefault: () => void;
  onRestoreBackup: (members: PartyMember[]) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  members,
  isCloudConnected,
  onForceReload,
  onResetToDefault,
  onRestoreBackup,
}) => {
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{
    tested: boolean;
    success: boolean;
    latency?: number;
    error?: string;
  } | null>(null);

  const [syncingCloud, setSyncingCloud] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  // Test Cloud Connection
  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionResult(null);
    try {
      const res = await checkCloudHealth();
      setConnectionResult({
        tested: true,
        success: res.isConnected,
        latency: res.latencyMs,
        error: res.errorDetail,
      });
    } catch (e: any) {
      setConnectionResult({
        tested: true,
        success: false,
        error: e?.message || 'Không thể thiết lập kết nối socket',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  // Push local data to Cloud
  const handlePushToCloud = async () => {
    setSyncingCloud(true);
    setSyncMessage(null);
    try {
      const res = await pushAllToCloud(members);
      setSyncMessage(res.message);
    } catch (e: any) {
      setSyncMessage(`Lỗi đồng bộ: ${e.message}`);
    } finally {
      setSyncingCloud(false);
    }
  };

  // Export JSON Backup
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(members, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `SaoLuu_ChiBo_LLVT_Hue_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON Backup
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          onRestoreBackup(parsed);
          alert(`Đã khôi phục thành công ${parsed.length} Đảng viên từ tệp sao lưu!`);
        } else {
          alert('Tệp dữ liệu không hợp lệ!');
        }
      } catch {
        alert('Lỗi định dạng tệp JSON!');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 font-interface max-w-5xl">
      {/* Tiêu đề mục */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Quản Trị Cơ Sở Dữ Liệu & Đồng Bộ Cloud
            </h2>
            <p className="text-xs text-slate-500">
              Kiến trúc Hybrid an toàn: Kết nối Supabase Cloud & Bộ nhớ Nội bộ chống nghẽn mạng quân sự
            </p>
          </div>
        </div>
      </div>

      {/* Khối 1: Thông tin Supabase Cloud */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-red-800" />
            <h3 className="text-sm font-bold text-slate-900">Thông Số Kết Nối Supabase Cloud</h3>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isCloudConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="text-xs font-semibold text-slate-700">
              {isCloudConnected ? 'Đã kết nối máy chủ Cloud' : 'Chế độ Nội bộ an toàn'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium">Supabase Project URL:</span>
            <div className="font-mono text-slate-800 font-semibold mt-1 select-all break-all">
              {SUPABASE_URL}
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium">Bảng dữ liệu (Table):</span>
            <div className="font-mono text-slate-800 font-semibold mt-1">
              public.party_members (15 trường chuẩn)
            </div>
          </div>
        </div>

        {/* Nút kiểm tra & cưỡng bức tải lại */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={handleTestConnection}
            disabled={testingConnection}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <Cloud className="w-4 h-4 text-blue-600" />
            <span>{testingConnection ? 'Đang kiểm tra kết nối...' : 'Kiểm tra tín hiệu Supabase'}</span>
          </button>

          <button
            onClick={onForceReload}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span>Cưỡng Bức Nạp Lại Dữ Liệu</span>
          </button>

          <button
            onClick={handlePushToCloud}
            disabled={syncingCloud}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-red-800 hover:bg-red-700 active:bg-red-900 rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            <UploadCloud className="w-4 h-4 text-white" />
            <span>{syncingCloud ? 'Đang đẩy lên...' : 'Đẩy Toàn Bộ Lên Cloud'}</span>
          </button>
        </div>

        {/* Kết quả kiểm tra */}
        {connectionResult && (
          <div
            className={`p-3 rounded-lg text-xs border ${
              connectionResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            {connectionResult.success ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Kết nối máy chủ Supabase thành công! Độ trễ phản hồi:{' '}
                  <strong>{connectionResult.latency} ms</strong>
                </span>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Không thể kết nối đến máy chủ Supabase</span>
                </div>
                <div className="text-[11px] text-amber-800 pl-6">
                  Chi tiết: {connectionResult.error}
                </div>
                <div className="text-[11px] text-slate-600 pl-6">
                  Hệ thống đang chạy ổn định ở <strong>Chế độ Nội bộ</strong> với đầy đủ dữ liệu 21 đồng chí.
                </div>
              </div>
            )}
          </div>
        )}

        {syncMessage && (
          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 text-xs rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{syncMessage}</span>
          </div>
        )}
      </div>

      {/* Khối 2: Quản lý Bản ghi & Khôi phục gốc */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-red-800" />
            <h3 className="text-sm font-bold text-slate-900">Sao Lưu & Khôi Phục Dữ Liệu</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {members.length} bản ghi hiện hành
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tải về bản sao lưu JSON */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="font-semibold text-xs text-slate-800 flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-700" />
              Xuất tệp sao lưu dự phòng (JSON)
            </div>
            <p className="text-[11px] text-slate-500">
              Lưu giữ toàn bộ 21 hồ sơ Đảng viên về máy tính nội bộ dưới định dạng JSON an toàn.
            </p>
            <button
              onClick={handleExportJSON}
              className="mt-1 px-3 py-1.5 text-xs font-semibold text-blue-800 bg-blue-100/70 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
            >
              Tải tệp sao lưu (.json)
            </button>
          </div>

          {/* Phục hồi từ tệp JSON */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="font-semibold text-xs text-slate-800 flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-700" />
              Nạp dữ liệu từ tệp sao lưu
            </div>
            <p className="text-[11px] text-slate-500">
              Phục hồi danh sách hồ sơ Đảng viên từ tệp JSON đã lưu trữ trước đó.
            </p>
            <label className="inline-block mt-1 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100/70 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer">
              Chọn tệp để phục hồi
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Khôi phục danh sách mặc định 21 đồng chí */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-800">
              Khôi phục danh sách chuẩn 21 đồng chí đơn vị
            </div>
            <div className="text-[11px] text-slate-500">
              Đặt lại toàn bộ dữ liệu về danh sách gốc do Chi ủy phê duyệt (dv-01 đến dv-21).
            </div>
          </div>

          {!confirmResetOpen ? (
            <button
              onClick={() => setConfirmResetOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer"
            >
              Khôi phục gốc
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-700 font-semibold">Xác nhận đặt lại?</span>
              <button
                onClick={() => {
                  onResetToDefault();
                  setConfirmResetOpen(false);
                }}
                className="px-3 py-1 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded transition-colors cursor-pointer"
              >
                Đồng ý
              </button>
              <button
                onClick={() => setConfirmResetOpen(false)}
                className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded transition-colors cursor-pointer"
              >
                Hủy
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Khối 3: Nguyên tắc An toàn & Quy chuẩn Thể thức */}
      <div className="p-4 bg-slate-900 text-slate-300 rounded-xl border border-slate-800 text-xs space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold">
          <Lock className="w-4 h-4" />
          <span>Quy Định Về Bảo Mật Dữ Liệu Hồ Sơ Quân Sự</span>
        </div>
        <p className="text-[11.5px] leading-relaxed text-slate-400">
          Hệ thống được thiết kế với cơ chế tự phòng vệ (Fail-Safe Defense): Mọi truy vấn nếu gặp sự cố kết nối Internet hoặc phân giải tên miền DNS sẽ tự động chuyển sang chế độ Nội bộ (Offline Cache). Thông tin trích ngang tuân thủ nguyên tắc "Bảo đảm bí mật số lượng, vị trí đóng quân và khả năng sẵn sàng chiến đấu của LLVT TP Huế".
        </p>
      </div>
    </div>
  );
};
