import React, { useState } from 'react';
import { HosoUpdateRecord } from '../types/hosoUpdate';
import { PartyMember } from '../types/partyMember';
import { 
  X, 
  Check, 
  XCircle, 
  Clock, 
  CheckCircle2, 
  User, 
  ShieldAlert, 
  AlertCircle,
  FileText
} from 'lucide-react';

interface HosoApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  hosoUpdates: HosoUpdateRecord[];
  onApprove: (updateId: string) => Promise<void>;
  onReject: (updateId: string, reason: string) => Promise<void>;
}

export const HosoApprovalModal: React.FC<HosoApprovalModalProps> = ({
  isOpen,
  onClose,
  hosoUpdates,
  onApprove,
  onReject,
}) => {
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [processingId, setProcessingId] = useState<string | null>(null);

   // SỬA CHUẨN: Dùng thuộc tính status gốc của đối tượng, không cần ép kiểu :any
const pendingList = hosoUpdates.filter((u) => u.trang_thai === 'Chờ duyệt');
const processedList = hosoUpdates.filter((u) => u.trang_thai !== 'Chờ duyệt');





  const handleConfirmApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await onApprove(id);
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReject = async (id: string) => {
    setProcessingId(id);
    try {
      await onReject(id, rejectReason);
      setRejectingId(null);
      setRejectReason('');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs font-interface overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950 to-amber-950 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-400 text-red-950 flex items-center justify-center font-bold shadow-md">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                Phê Duyệt Yêu Cầu Thay Đổi Hồ Sơ Đảng Viên
              </h2>
              <p className="text-xs text-amber-200/90">
                Thẩm quyền: Bí thư / Phó Bí thư Chi bộ ({pendingList.length} yêu cầu chờ duyệt)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung danh sách các yêu cầu */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
          {pendingList.length > 0 ? (
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Danh sách chờ xem xét & phê duyệt ({pendingList.length})</span>
              </div>

              {pendingList.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-amber-50/70 border border-amber-300 rounded-xl space-y-3 shadow-2xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-red-800 text-amber-300 font-bold text-xs flex items-center justify-center">
                        {item.member_name.slice(-2)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {item.military_rank} {item.member_name}{' '}
                          <span className="font-mono text-slate-500 text-[11px]">
                            ({item.member_id.toUpperCase()})
                          </span>
                        </div>
                        <div className="text-[11px] text-amber-900 font-medium">
                          Hạng mục: {item.category_label} · {item.requested_at}
                        </div>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10.5px] font-semibold border border-amber-300">
                      Chờ duyệt
                    </span>
                  </div>

                  {/* Chi tiết các trường thay đổi */}
                  <div className="space-y-1.5 bg-white p-3 rounded-lg border border-amber-200/80 text-xs">
                    {item.changes.map((c, idx) => (
                      <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-1 py-1 border-b border-slate-50 last:border-0">
                        <span className="text-slate-600 font-medium">{c.label}:</span>
                        <span className="line-through text-slate-400 text-[11.5px] truncate">
                          {c.old_value}
                        </span>
                        <strong className="text-red-900 font-bold text-[12px] truncate">
                          → {c.new_value}
                        </strong>
                      </div>
                    ))}
                  </div>

                  {/* Nút hành động phê duyệt hoặc từ chối */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] text-slate-500 italic">
                      * Dữ liệu hồ sơ chính thức sẽ tự động cập nhật ngay khi bấm Phê duyệt
                    </span>

                    {rejectingId === item.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Lý do từ chối..."
                          className="text-xs px-2.5 py-1.5 bg-white border border-red-300 rounded-lg w-48 text-slate-900"
                        />
                        <button
                          onClick={() => handleConfirmReject(item.id)}
                          disabled={processingId === item.id}
                          className="px-3 py-1.5 text-xs font-semibold bg-red-700 hover:bg-red-800 text-white rounded-lg cursor-pointer"
                        >
                          Xác nhận
                        </button>
                        <button
                          onClick={() => setRejectingId(null)}
                          className="px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setRejectingId(item.id);
                            setRejectReason('');
                          }}
                          disabled={processingId === item.id}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-red-50 text-red-700 border border-red-200 rounded-lg transition-colors cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Từ chối</span>
                        </button>

                        <button
                          onClick={() => handleConfirmApprove(item.id)}
                          disabled={processingId === item.id}
                          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>
                            {processingId === item.id ? 'Đang duyệt...' : 'Phê Duyệt & Ghi Nhận'}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <div className="font-semibold text-slate-800">
                Tất cả các yêu cầu thay đổi hồ sơ đã được xử lý xong!
              </div>
              <p className="text-slate-400 mt-1">
                Hiện không có yêu cầu nào từ Đảng viên đang ở trạng thái chờ duyệt.
              </p>
            </div>
          )}

          {/* Lịch sử đã duyệt gần đây */}
          {processedList.length > 0 && (
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Lịch sử đã xử lý gần đây ({processedList.length})
              </div>
              <div className="space-y-2">
                {processedList.slice(0, 5).map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">
                        {p.military_rank} {p.member_name} · {p.category_label}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Duyệt bởi: {p.reviewed_by} ({p.reviewed_at})
                        {p.review_note && <span className="text-red-700 ml-1">Lý do: {p.review_note}</span>}
                      </div>
                    </div>
                    <div>
                      {p.trang_thai === 'Đã duyệt' ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[10.5px]">
                          Đã duyệt
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-semibold text-[10.5px]">
                          Từ chối
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
