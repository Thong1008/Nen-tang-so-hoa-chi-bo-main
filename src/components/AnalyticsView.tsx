import React, { useMemo } from 'react';
import { PartyMember } from '../types/partyMember';
import { 
  BarChart3, 
  Users, 
  Shield, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  PieChart,
  Navigation
} from 'lucide-react';

interface AnalyticsViewProps {
  members: PartyMember[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ members }) => {
  const currentYear = new Date().getFullYear();

  // Metrics calculation
  const stats = useMemo(() => {
    const total = members.length;
    const officialCount = members.filter(m => m.party_status === 'Chính thức').length;
    const reserveCount = members.filter(m => m.party_status === 'Dự bị').length;
    
    // Sĩ quan vs QNCN
    const qncnCount = members.filter(m => m.military_rank.includes('QNCN')).length;
    const officerCount = total - qncnCount;

    // Cự ly
    const totalDistance = members.reduce((acc, m) => acc + (m.distance_km || 0), 0);
    const avgDistance = total > 0 ? (totalDistance / total).toFixed(1) : '0';
    const closeDistanceCount = members.filter(m => (m.distance_km || 0) <= 3).length;
    const mediumDistanceCount = members.filter(m => (m.distance_km || 0) > 3 && (m.distance_km || 0) <= 6).length;
    const farDistanceCount = members.filter(m => (m.distance_km || 0) > 6).length;

    // Cơ cấu độ tuổi
    let under30 = 0;
    let age30to39 = 0;
    let age40to49 = 0;
    let over50 = 0;

    members.forEach(m => {
      // trích xuất năm từ birth_year
      const parts = m.birth_year.split('/');
      const yearStr = parts.length === 3 ? parts[2] : m.birth_year;
      const birthY = parseInt(yearStr, 10);
      if (!isNaN(birthY)) {
        const age = currentYear - birthY;
        if (age < 30) under30++;
        else if (age <= 39) age30to39++;
        else if (age <= 49) age40to49++;
        else over50++;
      }
    });

    // Thống kê theo cấp bậc
    const rankMap: Record<string, number> = {};
    members.forEach(m => {
      rankMap[m.military_rank] = (rankMap[m.military_rank] || 0) + 1;
    });

    // Tuổi Đảng
    let partyAgeUnder5 = 0;
    let partyAge5to15 = 0;
    let partyAgeOver15 = 0;

    members.forEach(m => {
      const parts = m.party_join_date.split('/');
      const yearStr = parts.length === 3 ? parts[2] : m.party_join_date;
      const joinY = parseInt(yearStr, 10);
      if (!isNaN(joinY)) {
        const partyAge = currentYear - joinY;
        if (partyAge < 5) partyAgeUnder5++;
        else if (partyAge <= 15) partyAge5to15++;
        else partyAgeOver15++;
      }
    });

    return {
      total,
      officialCount,
      reserveCount,
      qncnCount,
      officerCount,
      avgDistance,
      closeDistanceCount,
      mediumDistanceCount,
      farDistanceCount,
      under30,
      age30to39,
      age40to49,
      over50,
      rankMap,
      partyAgeUnder5,
      partyAge5to15,
      partyAgeOver15,
    };
  }, [members, currentYear]);

  return (
    <div className="space-y-6 font-interface">
      {/* 4 Chỉ số KPI đầu bảng */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tổng quân số */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Tổng quân số Chi bộ</span>
            <Users className="w-4 h-4 text-red-700" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">
            {stats.total} <span className="text-xs font-normal text-slate-500">đồng chí</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            100% là Đảng viên Đảng CSVN
          </div>
        </div>

        {/* Tỷ lệ Chính thức / Dự bị */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Đảng viên chính thức</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700 tabular-nums">
            {stats.officialCount} <span className="text-xs font-normal text-slate-500">/ {stats.total}</span>
          </div>
          <div className="mt-1 text-xs text-slate-500 flex items-center justify-between">
            <span>Dự bị: <strong className="text-amber-700">{stats.reserveCount}</strong> đ/c</span>
            <span className="font-semibold text-slate-700">
              {stats.total > 0 ? ((stats.officialCount / stats.total) * 100).toFixed(0) : 0}%
            </span>
          </div>
        </div>

        {/* Cơ cấu Sĩ quan / QNCN */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Cơ cấu Quân hàm</span>
            <Shield className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">
            {stats.officerCount} <span className="text-xs font-normal text-slate-500">SQ / {stats.qncnCount} QNCN</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {stats.total > 0 ? ((stats.qncnCount / stats.total) * 100).toFixed(0) : 0}% là Quân nhân chuyên nghiệp
          </div>
        </div>

        {/* Cự ly cơ động sẵn sàng chiến đấu */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Cự ly trung bình về cơ quan</span>
            <Navigation className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-800 tabular-nums">
            {stats.avgDistance} <span className="text-xs font-normal text-slate-500">km</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            <span className="font-semibold text-emerald-700">{stats.closeDistanceCount}</span> đ/c cư trú trong bán kính ≤ 3km
          </div>
        </div>
      </div>

      {/* Grid 2 cột: Cơ cấu tuổi & Cấp bậc */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cơ cấu độ tuổi */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Phân Bổ Độ Tuổi Đảng Viên</h3>
              <p className="text-xs text-slate-500">Thống kê theo 4 nhóm tuổi công tác</p>
            </div>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">Dưới 30 tuổi (Cán bộ trẻ)</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {stats.under30} đ/c ({stats.total > 0 ? ((stats.under30 / stats.total) * 100).toFixed(0) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.total > 0 ? (stats.under30 / stats.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">Từ 30 đến 39 tuổi</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {stats.age30to39} đ/c ({stats.total > 0 ? ((stats.age30to39 / stats.total) * 100).toFixed(0) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.total > 0 ? (stats.age30to39 / stats.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">Từ 40 đến 49 tuổi (Nòng cốt kỹ thuật)</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {stats.age40to49} đ/c ({stats.total > 0 ? ((stats.age40to49 / stats.total) * 100).toFixed(0) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.total > 0 ? (stats.age40to49 / stats.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">Từ 50 tuổi trở lên</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {stats.over50} đ/c ({stats.total > 0 ? ((stats.over50 / stats.total) * 100).toFixed(0) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.total > 0 ? (stats.over50 / stats.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cơ cấu cấp bậc quân hàm */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Cơ Cấu Cấp Bậc Quân Hàm</h3>
              <p className="text-xs text-slate-500">Phân bổ sĩ quan chỉ huy và nhân viên chuyên môn</p>
            </div>
            <Shield className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-2.5 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
            {Object.entries(stats.rankMap)
              .sort((a, b) => b[1] - a[1])
              .map(([rank, count]) => {
                const percent = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={rank} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                    <span className="font-medium text-slate-700">{rank}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-red-800 h-full rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-900 tabular-nums w-12 text-right">
                        {count} đ/c
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Grid 2 cột: Cự ly sẵn sàng chiến đấu & Tuổi Đảng */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Phân bố cự ly cơ động sẵn sàng chiến đấu */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Khả Năng Cơ Động Theo Cự Ly Nơi Ở</h3>
              <p className="text-xs text-slate-500">Thời gian cơ động tập trung về cơ quan khi có lệnh</p>
            </div>
            <MapPin className="w-4 h-4 text-slate-400" />
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="text-xs text-emerald-800 font-medium">Bán kính ≤ 3 km</div>
              <div className="text-xl font-bold text-emerald-900 mt-1 tabular-nums">
                {stats.closeDistanceCount}
              </div>
              <div className="text-[11px] text-emerald-700 mt-0.5">Cơ động dưới 15 phút</div>
            </div>

            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
              <div className="text-xs text-blue-800 font-medium">Từ 3.1 - 6 km</div>
              <div className="text-xl font-bold text-blue-900 mt-1 tabular-nums">
                {stats.mediumDistanceCount}
              </div>
              <div className="text-[11px] text-blue-700 mt-0.5">Cơ động 15 - 25 phút</div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
              <div className="text-xs text-amber-800 font-medium">Trên 6 km</div>
              <div className="text-xl font-bold text-amber-900 mt-1 tabular-nums">
                {stats.farDistanceCount}
              </div>
              <div className="text-[11px] text-amber-700 mt-0.5">Cơ động trên 25 phút</div>
            </div>
          </div>

          <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            * 100% Đảng viên Chi bộ đăng ký số điện thoại đường dây nóng và phương tiện cá nhân bảo đảm sẵn sàng thực hiện nhiệm vụ phòng chống thiên tai, cứu hộ cứu nạn và tác chiến phòng thủ.
          </p>
        </div>

        {/* Thống kê thâm niên tuổi Đảng */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Thâm Niên Tuổi Đảng</h3>
              <p className="text-xs text-slate-500">Kinh nghiệm rèn luyện trong hàng ngũ Đảng CSVN</p>
            </div>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <div>
                <div className="font-semibold text-slate-800">Dưới 5 năm tuổi Đảng</div>
                <div className="text-slate-500 text-[11px]">Đảng viên trẻ và dự bị</div>
              </div>
              <span className="text-base font-bold text-slate-900 tabular-nums">
                {stats.partyAgeUnder5} <span className="text-xs font-normal">đồng chí</span>
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <div>
                <div className="font-semibold text-slate-800">Từ 5 đến 15 năm tuổi Đảng</div>
                <div className="text-slate-500 text-[11px]">Lực lượng nòng cốt cấp Chi ủy, chuyên môn vững vàng</div>
              </div>
              <span className="text-base font-bold text-slate-900 tabular-nums">
                {stats.partyAge5to15} <span className="text-xs font-normal">đồng chí</span>
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <div>
                <div className="font-semibold text-slate-800">Trên 15 năm tuổi Đảng</div>
                <div className="text-slate-500 text-[11px]">Cán bộ dày dặn kinh nghiệm, huy hiệu Đảng</div>
              </div>
              <span className="text-base font-bold text-slate-900 tabular-nums">
                {stats.partyAgeOver15} <span className="text-xs font-normal">đồng chí</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
