import { supabase } from './supabaseClient';
import { PartyMember, SupabasePartyMemberRow } from '../types/partyMember';
import { getStoredMembers, saveStoredMembers, INITIAL_PARTY_MEMBERS } from './mockData';

export interface CloudFetchResult {
  members: PartyMember[];
  isCloudConnected: boolean;
  statusMessage: string;
}

// Convert Supabase database row (snake_case) to PartyMember interface
function mapRowToMember(row: SupabasePartyMemberRow, localMembersMap: Map<string, PartyMember>): PartyMember {
  const local = localMembersMap.get(row.id);
  return {
    id: row.id,
    full_name: row.full_name || '',
    birth_year: row.birth_year || '',
    citizen_id: row.citizen_id || '',
    military_rank: row.military_rank || 'Trung tá',
    position: row.position || 'Cán bộ',
    enlistment_date: row.enlistment_date || '',
    party_join_date: row.party_join_date || '',
    party_status: (row.party_status === 'Dự bị' ? 'Dự bị' : 'Chính thức'),
    phone: row.phone || '',
    emergency_contact: row.emergency_contact || '',
    hometown: row.hometown || '',
    current_residence: row.current_residence || '',
    distance_km: typeof row.distance_km === 'number' ? row.distance_km : 0,
    notes: row.notes || '',
    evaluations: local?.evaluations || [
      { year: 2024, grade: 'Hoàn thành tốt nhiệm vụ' },
      { year: 2025, grade: 'Hoàn thành tốt nhiệm vụ' }
    ],
    created_at: row.created_at,
  };
}

// Convert PartyMember to database row format
function mapMemberToRow(member: PartyMember): SupabasePartyMemberRow {
  return {
    id: member.id,
    full_name: member.full_name,
    birth_year: member.birth_year,
    citizen_id: member.citizen_id,
    military_rank: member.military_rank,
    position: member.position,
    enlistment_date: member.enlistment_date,
    party_join_date: member.party_join_date,
    party_status: member.party_status,
    phone: member.phone,
    emergency_contact: member.emergency_contact,
    hometown: member.hometown,
    current_residence: member.current_residence,
    distance_km: Number(member.distance_km) || 0,
    notes: member.notes || '',
  };
}

/**
 * Fetch Party Members with Hybrid Fallback
 * Tự động chuyển đổi giữa Supabase Cloud và Bộ nhớ Nội bộ an toàn tuyệt đối
 */
export async function fetchMembersFromCloud(): Promise<CloudFetchResult> {
  const localList = getStoredMembers();
  const localMap = new Map<string, PartyMember>(localList.map(m => [m.id, m]));

  try {
    const startTime = performance.now();
    const { data, error } = await supabase
      .from('party_members')
      .select('*')
      .order('id', { ascending: true });

    const latency = Math.round(performance.now() - startTime);

    if (error) {
      console.warn('Supabase query error, chuyển chế độ Nội bộ:', error.message);
      return {
        members: localList,
        isCloudConnected: false,
        statusMessage: `Lỗi kết nối Cloud: ${error.message}. Đã kích hoạt chế độ Nội bộ an toàn.`,
      };
    }

    if (data && Array.isArray(data) && data.length > 0) {
      const mapped = data.map(row => mapRowToMember(row as SupabasePartyMemberRow, localMap));
      saveStoredMembers(mapped);
      return {
        members: mapped,
        isCloudConnected: true,
        statusMessage: `Đã kết nối Supabase Cloud (${latency}ms) - Đồng bộ ${mapped.length} Đảng viên`,
      };
    }

    // Nếu bảng rỗng, đồng bộ danh sách 21 Đảng viên mẫu lên Cloud
    console.info('Supabase bảng rỗng, thực hiện nạp 21 Đảng viên khởi tạo...');
    const seedRows = INITIAL_PARTY_MEMBERS.map(mapMemberToRow);
    const { error: seedError } = await supabase.from('party_members').upsert(seedRows);

    if (!seedError) {
      saveStoredMembers(INITIAL_PARTY_MEMBERS);
      return {
        members: INITIAL_PARTY_MEMBERS,
        isCloudConnected: true,
        statusMessage: `Đã khởi tạo thành công 21 Đảng viên lên Supabase Cloud.`,
      };
    }

    return {
      members: localList,
      isCloudConnected: false,
      statusMessage: 'Cloud trống, chuyển sang dữ liệu nội bộ đơn vị.',
    };
  } catch (err: any) {
    // Bắt mọi lỗi DNS (ERR_NAME_NOT_RESOLVED), timeout hoặc mất mạng
    console.warn('Lỗi phân giải mạng/DNS Supabase:', err);
    return {
      members: localList,
      isCloudConnected: false,
      statusMessage: 'Chế độ Nội bộ (Offline) - Không thể phân giải DNS Cloud hoặc mạng cơ yếu bảo mật.',
    };
  }
}

/**
 * Thêm Đảng viên mới (Hybrid Cloud + Local)
 */
export async function addPartyMember(
  newMember: PartyMember,
  currentMembers: PartyMember[]
): Promise<{ updatedList: PartyMember[]; success: boolean; message: string }> {
  const updatedList = [newMember, ...currentMembers];
  saveStoredMembers(updatedList);

  try {
    const row = mapMemberToRow(newMember);
    const { error } = await supabase.from('party_members').insert([row]);
    if (error) {
      return {
        updatedList,
        success: true,
        message: 'Đã lưu vào bộ nhớ nội bộ (Đồng bộ Cloud đang chờ).',
      };
    }
    return {
      updatedList,
      success: true,
      message: 'Đã thêm Đảng viên thành công lên Cloud và Thiết bị.',
    };
  } catch {
    return {
      updatedList,
      success: true,
      message: 'Đã lưu hồ sơ vào bộ nhớ nội bộ (Chế độ Offline).',
    };
  }
}

/**
 * Cập nhật thông tin Đảng viên
 */
export async function updatePartyMember(
  updatedMember: PartyMember,
  currentMembers: PartyMember[]
): Promise<{ updatedList: PartyMember[]; success: boolean; message: string }> {
  const updatedList = currentMembers.map(m => (m.id === updatedMember.id ? updatedMember : m));
  saveStoredMembers(updatedList);

  try {
    const row = mapMemberToRow(updatedMember);
    const { error } = await supabase
      .from('party_members')
      .update(row)
      .eq('id', updatedMember.id);

    if (error) {
      return {
        updatedList,
        success: true,
        message: 'Đã cập nhật nội bộ (Cloud tạm thời không phản hồi).',
      };
    }
    return {
      updatedList,
      success: true,
      message: 'Đã cập nhật hồ sơ Đảng viên thành công trên Cloud.',
    };
  } catch {
    return {
      updatedList,
      success: true,
      message: 'Đã cập nhật hồ sơ vào cơ sở dữ liệu nội bộ.',
    };
  }
}

/**
 * Xóa hồ sơ Đảng viên
 */
export async function deletePartyMember(
  memberId: string,
  currentMembers: PartyMember[]
): Promise<{ updatedList: PartyMember[]; success: boolean; message: string }> {
  const updatedList = currentMembers.filter(m => m.id !== memberId);
  saveStoredMembers(updatedList);

  try {
    const { error } = await supabase
      .from('party_members')
      .delete()
      .eq('id', memberId);

    if (error) {
      return {
        updatedList,
        success: true,
        message: 'Đã xóa hồ sơ trên máy nội bộ.',
      };
    }
    return {
      updatedList,
      success: true,
      message: 'Đã xóa hồ sơ Đảng viên khỏi Cloud và Thiết bị.',
    };
  } catch {
    return {
      updatedList,
      success: true,
      message: 'Đã xóa hồ sơ Đảng viên trên máy nội bộ.',
    };
  }
}

/**
 * Kiểm tra kết nối Supabase Cloud thực tế
 */
export async function checkCloudHealth(): Promise<{ isConnected: boolean; latencyMs: number; errorDetail?: string }> {
  const start = performance.now();
  try {
    const { error } = await supabase
      .from('party_members')
      .select('id')
      .limit(1);

    const latencyMs = Math.round(performance.now() - start);
    if (error) {
      return { isConnected: false, latencyMs, errorDetail: error.message };
    }
    return { isConnected: true, latencyMs };
  } catch (err: any) {
    return {
      isConnected: false,
      latencyMs: Math.round(performance.now() - start),
      errorDetail: err?.message || 'Không thể phân giải tên miền hoặc mạng không có kết nối ra Internet',
    };
  }
}

/**
 * Cưỡng bức đồng bộ toàn bộ dữ liệu nội bộ lên Supabase Cloud
 */
export async function pushAllToCloud(members: PartyMember[]): Promise<{ success: boolean; message: string }> {
  try {
    const rows = members.map(mapMemberToRow);
    const { error } = await supabase.from('party_members').upsert(rows);
    if (error) {
      return { success: false, message: `Lỗi đồng bộ: ${error.message}` };
    }
    return { success: true, message: `Đã đẩy thành công ${members.length} hồ sơ Đảng viên lên Cloud.` };
  } catch (err: any) {
    return { success: false, message: `Lỗi kết nối khi đồng bộ: ${err?.message || 'Không có tín hiệu mạng'}` };
  }
}
