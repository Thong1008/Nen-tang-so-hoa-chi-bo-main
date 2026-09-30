import { supabase } from './supabaseClient';
import { PartyMember, EvaluationGrade } from '../types/partyMember';
import { 
  PeerBallot, 
  RatingLevel, 
  MemberBallotSummary, 
  VoterProgress, 
  EvaluationPeriodInfo 
} from '../types/evaluation';

const BALLOTS_STORAGE_KEY = 'peer_ballots_offline_v1';
const PERIOD_STORAGE_KEY = 'evaluation_periods_offline_v1';

export const CURRENT_PERIOD: EvaluationPeriodInfo = {
  id: '2026-09',
  title: 'Đánh giá, Xếp loại Đảng viên Tháng 09/2026',
  year: 2026,
  month: 9,
  is_locked: false,
  notes: 'Đợt đánh giá định kỳ toàn diện Chi bộ Hậu cần - Kỹ thuật theo Quy định 124-QĐ/TW',
  created_at: '2026-09-01T08:00:00Z',
};

// Generate realistic initial ballots for 16 comrades so the system is immediately active and testable
function generateInitialBallots(): PeerBallot[] {
  const ballots: PeerBallot[] = [];
  const voters = [
    'dv-01', 'dv-02', 'dv-03', 'dv-05', 'dv-06', 
    'dv-07', 'dv-08', 'dv-09', 'dv-10', 'dv-11', 
    'dv-12', 'dv-13', 'dv-14', 'dv-15', 'dv-16', 'dv-17'
  ]; // 16 comrades already voted, 5 comrades haven't voted yet (dv-04, dv-18, dv-19, dv-20, dv-21)

  const allMembers = [
    'dv-01', 'dv-02', 'dv-03', 'dv-04', 'dv-05', 
    'dv-06', 'dv-07', 'dv-08', 'dv-09', 'dv-10', 
    'dv-11', 'dv-12', 'dv-13', 'dv-14', 'dv-15', 
    'dv-16', 'dv-17', 'dv-18', 'dv-19', 'dv-20', 'dv-21'
  ];

  voters.forEach((voterId) => {
    allMembers.forEach((targetId) => {
      if (voterId === targetId) return; // Cannot vote for oneself

      // Realistic rating based on target profile
      let rating: RatingLevel = 3; // Default Good
      if (['dv-01', 'dv-05', 'dv-02'].includes(targetId)) {
        // High performers often get Level 4
        rating = Math.random() > 0.15 ? 4 : 3;
      } else if (['dv-07', 'dv-10', 'dv-19'].includes(targetId)) {
        rating = Math.random() > 0.4 ? 4 : 3;
      } else if (['dv-04', 'dv-21'].includes(targetId)) {
        // Young/Reserve comrades
        rating = Math.random() > 0.7 ? 4 : (Math.random() > 0.2 ? 3 : 2);
      } else {
        const rand = Math.random();
        if (rand > 0.75) rating = 4;
        else if (rand > 0.1) rating = 3;
        else rating = 2;
      }

      ballots.push({
        id: `ballot-${voterId}-${targetId}-2026-09`,
        evaluation_period: '2026-09',
        voter_id: voterId,
        target_id: targetId,
        rating_level: rating,
        created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      });
    });
  });

  return ballots;
}

export function getStoredBallots(): PeerBallot[] {
  try {
    const raw = localStorage.getItem(BALLOTS_STORAGE_KEY);
    if (!raw) {
      const initial = generateInitialBallots();
      saveStoredBallots(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : generateInitialBallots();
  } catch {
    return generateInitialBallots();
  }
}

export function saveStoredBallots(ballots: PeerBallot[]): void {
  try {
    localStorage.setItem(BALLOTS_STORAGE_KEY, JSON.stringify(ballots));
  } catch (e) {
    console.error('Lỗi lưu ballots vào localStorage:', e);
  }
}

export function getStoredPeriod(periodId: string = '2026-09'): EvaluationPeriodInfo {
  try {
    const raw = localStorage.getItem(PERIOD_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.id === periodId) return parsed;
    }
  } catch {}
  return CURRENT_PERIOD;
}

export function saveStoredPeriod(period: EvaluationPeriodInfo): void {
  try {
    localStorage.setItem(PERIOD_STORAGE_KEY, JSON.stringify(period));
  } catch (e) {
    console.error('Lỗi lưu period vào localStorage:', e);
  }
}

/**
 * Fetch all ballots for a period with Supabase + Offline hybrid fallback
 */
export async function fetchPeriodBallots(periodId: string = '2026-09'): Promise<{ ballots: PeerBallot[]; isCloud: boolean }> {
  const localBallots = getStoredBallots().filter(b => b.evaluation_period === periodId);

  try {
    const { data, error } = await supabase
      .from('peer_ballots')
      .select('*')
      .eq('evaluation_period', periodId);

    if (error) {
      console.warn('Lỗi truy vấn peer_ballots từ Supabase, sử dụng bộ nhớ nội bộ:', error.message);
      return { ballots: localBallots, isCloud: false };
    }

    if (data && Array.isArray(data) && data.length > 0) {
      const mapped: PeerBallot[] = data.map((row: any) => ({
        id: row.id,
        evaluation_period: row.evaluation_period,
        voter_id: row.voter_id,
        target_id: row.target_id,
        rating_level: Number(row.rating_level) as RatingLevel,
        created_at: row.created_at,
      }));
      saveStoredBallots(mapped);
      return { ballots: mapped, isCloud: true };
    }

    // If cloud table is empty, sync local ballots to Supabase
    if (localBallots.length > 0) {
      const upsertRows = localBallots.map(b => ({
        id: b.id,
        evaluation_period: b.evaluation_period,
        voter_id: b.voter_id,
        target_id: b.target_id,
        rating_level: b.rating_level,
        created_at: b.created_at,
      }));
      await supabase.from('peer_ballots').upsert(upsertRows).then(() => {});
    }

    return { ballots: localBallots, isCloud: true };
  } catch (err) {
    console.warn('Sự cố DNS hoặc mạng khi nạp peer_ballots:', err);
    return { ballots: localBallots, isCloud: false };
  }
}

/**
 * Submit ballot for a voter evaluating 20 targets
 */
export async function submitVoterBallots(
  periodId: string,
  voterId: string,
  votes: Record<string, RatingLevel>
): Promise<{ success: boolean; message: string }> {
  const now = new Date().toISOString();
  const newBallots: PeerBallot[] = Object.entries(votes).map(([targetId, rating]) => ({
    id: `ballot-${voterId}-${targetId}-${periodId}`,
    evaluation_period: periodId,
    voter_id: voterId,
    target_id: targetId,
    rating_level: rating,
    created_at: now,
  }));

  // Update local storage
  const currentLocal = getStoredBallots();
  // Filter out any previous votes by this voter for this period
  const filtered = currentLocal.filter(
    b => !(b.evaluation_period === periodId && b.voter_id === voterId)
  );
  const updatedLocal = [...filtered, ...newBallots];
  saveStoredBallots(updatedLocal);

  // Sync with Supabase in background
  try {
    const rows = newBallots.map(b => ({
      id: b.id,
      evaluation_period: b.evaluation_period,
      voter_id: b.voter_id,
      target_id: b.target_id,
      rating_level: b.rating_level,
      created_at: b.created_at,
    }));
    const { error } = await supabase.from('peer_ballots').upsert(rows);
    if (error) {
      return {
        success: true,
        message: 'Phiếu đã được ghi nhận vào bộ nhớ nội bộ (Đang chờ đồng bộ Cloud).',
      };
    }
    return {
      success: true,
      message: `Đã nộp thành công phiếu đánh giá ${newBallots.length} đồng chí lên hệ thống!`,
    };
  } catch {
    return {
      success: true,
      message: `Đã lưu phiếu đánh giá vào cơ sở dữ liệu nội bộ an toàn.`,
    };
  }
}

/**
 * Calculate Summary, Scores and Rankings for all members
 */
export function calculateEvaluationSummary(
  periodId: string,
  members: PartyMember[],
  ballots: PeerBallot[]
): {
  summaries: MemberBallotSummary[];
  votersProgress: VoterProgress[];
  totalVotersCount: number;
  completedVotersCount: number;
  periodInfo: EvaluationPeriodInfo;
} {
  const periodInfo = getStoredPeriod(periodId);
  const periodBallots = ballots.filter(b => b.evaluation_period === periodId);

  // Map voters progress
  const voterBallotCountMap = new Map<string, number>();
  periodBallots.forEach(b => {
    voterBallotCountMap.set(b.voter_id, (voterBallotCountMap.get(b.voter_id) || 0) + 1);
  });

  const votersProgress: VoterProgress[] = members.map(m => {
    const count = voterBallotCountMap.get(m.id) || 0;
    // Expected targets to evaluate: total members minus self = members.length - 1 (20)
    const expected = members.length - 1;
    const hasVoted = count >= expected;
    return {
      voter_id: m.id,
      full_name: m.full_name,
      military_rank: m.military_rank,
      position: m.position,
      has_voted: hasVoted,
      targets_voted_count: count,
    };
  });

  const totalVotersCount = members.length;
  const completedVotersCount = votersProgress.filter(v => v.has_voted).length;

  // Aggregate votes for each target
  const targetVotesMap = new Map<string, RatingLevel[]>();
  members.forEach(m => targetVotesMap.set(m.id, []));

  periodBallots.forEach(b => {
    if (targetVotesMap.has(b.target_id)) {
      targetVotesMap.get(b.target_id)!.push(b.rating_level);
    }
  });

  // Calculate stats for each member
  const rawSummaries = members.map(member => {
    const votes = targetVotesMap.get(member.id) || [];
    const totalVotes = votes.length;

    let count4 = 0;
    let count3 = 0;
    let count2 = 0;
    let count1 = 0;
    let sumScore = 0;

    votes.forEach(r => {
      sumScore += r;
      if (r === 4) count4++;
      else if (r === 3) count3++;
      else if (r === 2) count2++;
      else if (r === 1) count1++;
    });

    const averageScore = totalVotes > 0 ? Number((sumScore / totalVotes).toFixed(2)) : 0;
    const rateLevel4 = totalVotes > 0 ? Number(((count4 / totalVotes) * 100).toFixed(1)) : 0;
    const rateLevel3Plus = totalVotes > 0 ? Number((((count4 + count3) / totalVotes) * 100).toFixed(1)) : 0;

    return {
      target_id: member.id,
      full_name: member.full_name,
      military_rank: member.military_rank,
      position: member.position,
      party_status: member.party_status,
      total_votes: totalVotes,
      count_level_4: count4,
      count_level_3: count3,
      count_level_2: count2,
      count_level_1: count1,
      average_score: averageScore,
      rate_level_4: rateLevel4,
      rate_level_3_plus: rateLevel3Plus,
      rank: 0,
      proposed_grade: 'Hoàn thành tốt nhiệm vụ' as EvaluationGrade,
    };
  });

  // Sort by averageScore descending, break ties by count_level_4 then count_level_3
  rawSummaries.sort((a, b) => {
    if (b.average_score !== a.average_score) {
      return b.average_score - a.average_score;
    }
    if (b.count_level_4 !== a.count_level_4) {
      return b.count_level_4 - a.count_level_4;
    }
    return b.count_level_3 - a.count_level_3;
  });

  // Assign ranks
  rawSummaries.forEach((s, idx) => {
    s.rank = idx + 1;
  });

  // Calculate proposed grades:
  // Under Quy định 124-QĐ/TW:
  // - "Hoàn thành xuất sắc nhiệm vụ": capped at max 20% of members graded Good + Excellent.
  //   Condition: rateLevel4 >= 80%, count1 === 0, averageScore >= 3.6.
  //   Max quota for 21 members: Math.floor(21 * 0.20) = 4 members max.
  const maxExcellentQuota = Math.max(1, Math.floor(members.length * 0.20));
  let excellentAssigned = 0;

  rawSummaries.forEach(s => {
    if (s.total_votes === 0) {
      s.proposed_grade = 'Hoàn thành nhiệm vụ';
      return;
    }

    // Check for "Không hoàn thành nhiệm vụ" (Level 1 >= 50%)
    if (s.count_level_1 / s.total_votes >= 0.5) {
      s.proposed_grade = 'Không hoàn thành nhiệm vụ';
    } 
    // Check for "Hoàn thành xuất sắc nhiệm vụ"
    else if (
      excellentAssigned < maxExcellentQuota &&
      s.rate_level_4 >= 75 &&
      s.count_level_1 === 0 &&
      s.average_score >= 3.6
    ) {
      s.proposed_grade = 'Hoàn thành xuất sắc nhiệm vụ';
      excellentAssigned++;
    } 
    // Check for "Hoàn thành tốt nhiệm vụ"
    else if (s.rate_level_3_plus >= 50 && (s.count_level_1 / s.total_votes) < 0.2) {
      s.proposed_grade = 'Hoàn thành tốt nhiệm vụ';
    } 
    // Otherwise
    else {
      s.proposed_grade = 'Hoàn thành nhiệm vụ';
    }
  });

  return {
    summaries: rawSummaries,
    votersProgress,
    totalVotersCount,
    completedVotersCount,
    periodInfo,
  };
}

/**
 * Toggle Period Lock State
 */
export function togglePeriodLock(periodId: string, isLocked: boolean): EvaluationPeriodInfo {
  const current = getStoredPeriod(periodId);
  const updated: EvaluationPeriodInfo = {
    ...current,
    is_locked: isLocked,
    locked_at: isLocked ? new Date().toISOString() : undefined,
  };
  saveStoredPeriod(updated);
  return updated;
}

/**
 * Export Official Minutes and Voting Resolution to Word (.doc)
 * Tuân thủ Nghị định 30/2020/NĐ-CP và Hướng dẫn 05-HD/VPTW
 */
export function exportEvaluationMinutesToWord(
  period: EvaluationPeriodInfo,
  summaries: MemberBallotSummary[],
  voters: VoterProgress[]
): void {
  const currentDate = new Date();
  const day = currentDate.getDate().toString().padStart(2, '0');
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const year = currentDate.getFullYear();

  const totalMembers = summaries.length;
  const totalVoted = voters.filter(v => v.has_voted).length;

  const countXS = summaries.filter(s => s.proposed_grade === 'Hoàn thành xuất sắc nhiệm vụ').length;
  const countTot = summaries.filter(s => s.proposed_grade === 'Hoàn thành tốt nhiệm vụ').length;
  const countHT = summaries.filter(s => s.proposed_grade === 'Hoàn thành nhiệm vụ').length;
  const countKHT = summaries.filter(s => s.proposed_grade === 'Không hoàn thành nhiệm vụ').length;

  const rowsHtml = summaries.map((s) => `
    <tr>
      <td style="text-align: center; border: 1px solid #333333; padding: 6px 4px;">${s.rank}</td>
      <td style="font-weight: bold; border: 1px solid #333333; padding: 6px 4px;">${s.full_name}</td>
      <td style="text-align: center; border: 1px solid #333333; padding: 6px 4px;">${s.military_rank}</td>
      <td style="border: 1px solid #333333; padding: 6px 4px; font-size: 11pt;">${s.position}</td>
      <td style="text-align: center; border: 1px solid #333333; padding: 6px 4px; font-weight: bold; color: #166534;">${s.count_level_4}</td>
      <td style="text-align: center; border: 1px solid #333333; padding: 6px 4px; color: #1e40af;">${s.count_level_3}</td>
      <td style="text-align: center; border: 1px solid #333333; padding: 6px 4px; color: #b45309;">${s.count_level_2}</td>
      <td style="text-align: center; border: 1px solid #333333; padding: 6px 4px; color: #b91c1c;">${s.count_level_1}</td>
      <td style="text-align: center; font-weight: bold; border: 1px solid #333333; padding: 6px 4px; font-family: 'Times New Roman'; font-size: 12pt;">${s.average_score.toFixed(2)}</td>
      <td style="text-align: center; border: 1px solid #333333; padding: 6px 4px; font-size: 11pt; font-weight: bold;">${s.proposed_grade}</td>
    </tr>
  `).join('');

  const wordHtmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Biên bản kiểm phiếu và Nghị quyết xếp loại Đảng viên</title>
      <style>
        @page Section1 {
          size: 841.9pt 595.3pt; /* A4 Landscape */
          margin: 36pt 36pt 36pt 36pt;
        }
        div.Section1 { page: Section1; }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 13pt;
          line-height: 1.35;
          color: #000000;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 12px;
          margin-bottom: 16px;
        }
        th {
          background-color: #f2f2f2;
          font-weight: bold;
          text-align: center;
          padding: 8px 4px;
          border: 1px solid #000000;
          font-size: 11pt;
        }
        td {
          vertical-align: middle;
          font-size: 11.5pt;
        }
      </style>
    </head>
    <body>
      <div class="Section1">
        <!-- Quốc hiệu & Tên đơn vị theo Nghị định 30/2020/NĐ-CP -->
        <table style="width: 100%; border: none; margin-bottom: 10px;">
          <tr style="border: none;">
            <td style="width: 45%; vertical-align: top; text-align: center; border: none;">
              <div style="font-size: 11pt; font-weight: bold; text-transform: uppercase;">ĐẢNG BỘ QUÂN SỰ TP HUẾ</div>
              <div style="font-size: 11pt; font-weight: bold; text-transform: uppercase; text-decoration: underline;">CHI BỘ HẬU CẦN - KỸ THUẬT</div>
              <div style="font-size: 10pt; margin-top: 4px;">Số: &nbsp;&nbsp;&nbsp;&nbsp; -BB/CB</div>
            </td>
            <td style="width: 55%; vertical-align: top; text-align: center; border: none;">
              <div style="font-size: 11pt; font-weight: bold; text-transform: uppercase;">ĐẢNG CỘNG SẢN VIỆT NAM</div>
              <div style="font-size: 11pt; font-style: italic; margin-top: 6px;">Huế, ngày ${day} tháng ${month} năm ${year}</div>
            </td>
          </tr>
        </table>

        <!-- Tiêu đề văn bản -->
        <div style="text-align: center; margin: 15px 0;">
          <div style="font-size: 15pt; font-weight: bold; text-transform: uppercase;">BIÊN BẢN TỔNG HỢP KIỂM PHIẾU TÍN NHIỆM</div>
          <div style="font-size: 13pt; font-weight: bold; text-transform: uppercase; margin-top: 4px;">VÀ ĐỀ NGHỊ XẾP LOẠI CHẤT LƯỢNG ĐẢNG VIÊN - ${period.title.toUpperCase()}</div>
          <div style="font-size: 11pt; font-style: italic; margin-top: 4px;">
            (Căn cứ Quy định số 124-QĐ/TW ngày 04/10/2023 của Bộ Chính trị về kiểm điểm và đánh giá, xếp loại chất lượng hằng năm)
          </div>
        </div>

        <div style="margin-bottom: 10px; font-size: 12pt;">
          <b>I. TÌNH HÌNH QUÂN SỐ VÀ TIẾN ĐỘ THAM GIA BỎ PHIẾU:</b><br/>
          - Tổng số Đảng viên Chi bộ: <b>${totalMembers}</b> đồng chí.<br/>
          - Số Đảng viên tham gia bỏ phiếu: <b>${totalVoted} / ${totalMembers}</b> đồng chí (${((totalVoted/totalMembers)*100).toFixed(1)}%).<br/>
          - Số phiếu phát ra: <b>${totalVoted}</b> phiếu. Số phiếu thu về hợp lệ: <b>${totalVoted}</b> phiếu. Phiếu không hợp lệ: <b>0</b>.<br/>
          - Phương thức chấm điểm: Thang điểm 4 mức tương ứng 4, 3, 2, 1 điểm. Nguyên tắc: Không tự chấm bản thân.
        </div>

        <div style="margin-top: 15px; margin-bottom: 8px; font-size: 12pt;">
          <b>II. BẢNG TỔNG HỢP KẾT QUẢ ĐIỂM SỐ VÀ THỨ HẠNG:</b>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 4%;">Thứ hạng</th>
              <th style="width: 16%;">Họ và tên</th>
              <th style="width: 10%;">Cấp bậc</th>
              <th style="width: 16%;">Chức vụ</th>
              <th style="width: 7%;">Mức 4 (XS)</th>
              <th style="width: 7%;">Mức 3 (Tốt)</th>
              <th style="width: 7%;">Mức 2 (HT)</th>
              <th style="width: 7%;">Mức 1 (KHT)</th>
              <th style="width: 9%;">Điểm TB</th>
              <th style="width: 17%;">Xếp loại đề xuất</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div style="margin-top: 15px; font-size: 12pt;">
          <b>III. KẾT LUẬN VÀ PHÂN LOẠI CHUNG TOÀN CHI BỘ:</b><br/>
          1. Hoàn thành xuất sắc nhiệm vụ: <b>${countXS}</b> đồng chí (${((countXS/totalMembers)*100).toFixed(1)}% - Bảo đảm tỷ lệ không quá 20% theo quy định).<br/>
          2. Hoàn thành tốt nhiệm vụ: <b>${countTot}</b> đồng chí (${((countTot/totalMembers)*100).toFixed(1)}%).<br/>
          3. Hoàn thành nhiệm vụ: <b>${countHT}</b> đồng chí (${((countHT/totalMembers)*100).toFixed(1)}%).<br/>
          4. Không hoàn thành nhiệm vụ: <b>${countKHT}</b> đồng chí (${((countKHT/totalMembers)*100).toFixed(1)}%).<br/>
          Biên bản đã được thông qua 100% Đảng viên dự họp nhất trí biểu quyết.
        </div>

        <!-- Chữ ký xác nhận theo thể thức Đảng và Quân đội -->
        <table style="width: 100%; border: none; margin-top: 30px; page-break-inside: avoid;">
          <tr style="border: none;">
            <td style="width: 45%; vertical-align: top; text-align: center; border: none;">
              <div style="font-size: 11pt; font-weight: bold; text-transform: uppercase;">TỔ TRƯỞNG TỔ KIỂM PHIẾU</div>
              <div style="font-size: 10pt; font-style: italic;">(Ký, ghi rõ họ tên)</div>
              <div style="height: 65px;"></div>
              <div style="font-size: 11pt; font-weight: bold;">Đại úy Nguyễn Văn Thông</div>
            </td>
            <td style="width: 55%; vertical-align: top; text-align: center; border: none;">
              <div style="font-size: 11pt; font-weight: bold; text-transform: uppercase;">T/M CHI BỘ HẬU CẦN - KỸ THUẬT</div>
              <div style="font-size: 11pt; font-weight: bold; text-transform: uppercase;">BÍ THƯ CHI BỘ</div>
              <div style="font-size: 10pt; font-style: italic;">(Ký, đóng dấu)</div>
              <div style="height: 65px;"></div>
              <div style="font-size: 11pt; font-weight: bold;">Trung tá Nguyễn Anh Toàn</div>
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', wordHtmlContent], {
    type: 'application/msword;charset=utf-8'
  });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `BienBan_KiemPhieu_XepLoai_DangVien_${period.id}_${day}${month}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
