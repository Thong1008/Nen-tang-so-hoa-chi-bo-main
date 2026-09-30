import React, { useState } from 'react';
import { PartyMember, EvaluationGrade } from '../types/partyMember';
import { 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileCheck, 
  Star, 
  UserCheck, 
  ChevronRight,
  Save
} from 'lucide-react';

interface EvaluationViewProps {
  members: PartyMember[];
  onUpdateMemberEvaluation: (memberId: string, year: number, grade: EvaluationGrade, commendation?: string) => void;
}

export const EvaluationView: React.FC<EvaluationViewProps> = ({
  members,
  onUpdateMemberEvaluation,
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [activeGradeFilter, setActiveGradeFilter] = useState<string>('all');
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingGrade, setEditingGrade] = useState<EvaluationGrade>('Hoàn thành tốt nhiệm vụ');
  const [editingCommendation, setEditingCommendation] = useState<string>('');

  const gradeOptions: EvaluationGrade[] = [
    'Hoàn thành xuất sắc nhiệm vụ',
    'Hoàn thành tốt nhiệm vụ',
    'Hoàn thành nhiệm vụ',
    'Không hoàn thành nhiệm vụ',
  ];

  // Map each member's evaluation for the selected year
  const memberEvaluations = members.map((member) => {
    const currentEval = member.evaluations?.find((e) => e.year === selectedYear);
    return {
      member,
      evaluation: currentEval || {
        year: selectedYear,
        grade: 'Hoàn thành tốt nhiệm vụ' as EvaluationGrade,
      },
    };
  });

  // Calculate tier counts
  const excellentCount = memberEvaluations.filter(
    (e) => e.evaluation.grade === 'Hoàn thành xuất sắc nhiệm vụ'
  ).length;
  const goodCount = memberEvaluations.filter(
    (e) => e.evaluation.grade === 'Hoàn thành tốt nhiệm vụ'
  ).length;
  const standardCount = memberEvaluations.filter(
    (e) => e.evaluation.grade === 'Hoàn thành nhiệm vụ'
  ).length;
  const incompleteCount = memberEvaluations.filter(
    (e) => e.evaluation.grade === 'Không hoàn thành nhiệm vụ'
  ).length;

  const filteredList = memberEvaluations.filter((item) => {
    if (activeGradeFilter === 'all') return true;
    return item.evaluation.grade === activeGradeFilter;
  });

  const handleStartEdit = (memberId: string, currentGrade: EvaluationGrade, currentCommendation?: string) => {
    setEditingMemberId(memberId);
    setEditingGrade(currentGrade);
    setEditingCommendation(currentCommendation || '');
  };

  const handleSaveEdit = (memberId: string) => {
    onUpdateMemberEvaluation(memberId, selectedYear, editingGrade, editingCommendation);
    setEditingMemberId(null);
  };

  return (
    <div className="space-y-6 font-interface">
      {/* Top Controls: Chọn Năm & Quy chế Đánh giá */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-red-700" />
            Đánh Giá & Phân Loại Chất Lượng Đảng Viên
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Căn cứ Quy định số 124-QĐ/TW của Bộ Chính trị về kiểm điểm và đánh giá, xếp loại chất lượng hằng năm
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-600">Năm đánh giá:</span>
          <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-50">
            {[2024, 2025, 2026].map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  selectedYear === yr
                    ? 'bg-red-800 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Năm {yr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Mức phân loại chuẩn TW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveGradeFilter(activeGradeFilter === 'Hoàn thành xuất sắc nhiệm vụ' ? 'all' : 'Hoàn thành xuất sắc nhiệm vụ')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeGradeFilter === 'Hoàn thành xuất sắc nhiệm vụ'
              ? 'bg-red-50/80 border-red-500 ring-2 ring-red-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Xuất sắc nhiệm vụ</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          </div>
          <div className="text-2xl font-bold text-red-900 mt-1 tabular-nums">
            {excellentCount} <span className="text-xs font-normal text-slate-500">đ/c</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Tối đa ≤ 20% tổng số HT tốt NV
          </div>
        </button>

        <button
          onClick={() => setActiveGradeFilter(activeGradeFilter === 'Hoàn thành tốt nhiệm vụ' ? 'all' : 'Hoàn thành tốt nhiệm vụ')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeGradeFilter === 'Hoàn thành tốt nhiệm vụ'
              ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Hoàn thành tốt NV</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-800 mt-1 tabular-nums">
            {goodCount} <span className="text-xs font-normal text-slate-500">đ/c</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Chiếm số lượng chủ lực trong đơn vị
          </div>
        </button>

        <button
          onClick={() => setActiveGradeFilter(activeGradeFilter === 'Hoàn thành nhiệm vụ' ? 'all' : 'Hoàn thành nhiệm vụ')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeGradeFilter === 'Hoàn thành nhiệm vụ'
              ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Hoàn thành nhiệm vụ</span>
            <FileCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900 mt-1 tabular-nums">
            {standardCount} <span className="text-xs font-normal text-slate-500">đ/c</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Đạt chỉ tiêu công tác thường xuyên
          </div>
        </button>

        <button
          onClick={() => setActiveGradeFilter(activeGradeFilter === 'Không hoàn thành nhiệm vụ' ? 'all' : 'Không hoàn thành nhiệm vụ')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeGradeFilter === 'Không hoàn thành nhiệm vụ'
              ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Không hoàn thành NV</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-700 mt-1 tabular-nums">
            {incompleteCount} <span className="text-xs font-normal text-slate-500">đ/c</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Yêu cầu tự kiểm điểm rèn luyện
          </div>
        </button>
      </div>

      {/* Danh sách Đảng viên và Phiếu điểm */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Bảng Đánh Giá Chi Tiết Năm {selectedYear} ({filteredList.length} Đảng viên)
          </div>
          {activeGradeFilter !== 'all' && (
            <button
              onClick={() => setActiveGradeFilter('all')}
              className="text-xs text-red-700 hover:text-red-900 font-medium"
            >
              Hiển thị tất cả
            </button>
          )}
        </div>

        <div className="divide-y divide-slate-200">
          {filteredList.map(({ member, evaluation }) => {
            const isEditing = editingMemberId === member.id;
            return (
              <div key={member.id} className="p-4 hover:bg-slate-50/70 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-[240px]">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-sm text-slate-700 shrink-0">
                      {member.full_name.slice(-2)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        {member.full_name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {member.military_rank} · {member.position}
                      </div>
                    </div>
                  </div>

                  {/* Trạng thái xếp loại */}
                  <div className="flex-1 max-w-md">
                    {isEditing ? (
                      <div className="space-y-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <select
                          value={editingGrade}
                          onChange={(e) => setEditingGrade(e.target.value as EvaluationGrade)}
                          className="w-full text-xs font-semibold px-2 py-1.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-red-600"
                        >
                          {gradeOptions.map((grade) => (
                            <option key={grade} value={grade}>
                              {grade}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={editingCommendation}
                          onChange={(e) => setEditingCommendation(e.target.value)}
                          placeholder="Danh hiệu thi đua / Khen thưởng (nếu có)..."
                          className="w-full text-xs px-2.5 py-1 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-red-600"
                        />
                      </div>
                    ) : (
                      <div>
                        <span
                          className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-md ${
                            evaluation.grade === 'Hoàn thành xuất sắc nhiệm vụ'
                              ? 'bg-red-100 text-red-900 border border-red-300'
                              : evaluation.grade === 'Hoàn thành tốt nhiệm vụ'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : evaluation.grade === 'Hoàn thành nhiệm vụ'
                              ? 'bg-blue-100 text-blue-900 border border-blue-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {evaluation.grade}
                        </span>
                        {evaluation.commendation && (
                          <div className="text-xs text-amber-800 font-medium mt-1">
                            ★ {evaluation.commendation}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Nút hành động */}
                  <div>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingMemberId(null)}
                          className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => handleSaveEdit(member.id)}
                          className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-red-800 hover:bg-red-700 rounded shadow-xs"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Lưu</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(member.id, evaluation.grade, evaluation.commendation)}
                        className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-red-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                      >
                        Chấm điểm / Xếp loại
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
