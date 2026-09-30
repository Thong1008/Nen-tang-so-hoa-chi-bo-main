import { PartyMember } from '../types/partyMember';

export const MILITARY_RANKS = [
  'Đại tá',
  'Thượng tá',
  'Trung tá',
  'Thiếu tá',
  'Đại úy',
  'Thượng úy',
  'Trung úy',
  'Thiếu úy',
  'Thượng tá QNCN',
  'Trung tá QNCN',
  'Thiếu tá QNCN',
  'Đại úy QNCN',
  'Thượng úy QNCN',
  'Trung úy QNCN',
  'Thiếu úy QNCN',
] as const;

export const POSITIONS = [
  'Bí thư Chi bộ - Chủ nhiệm Hậu cần - Kỹ thuật',
  'Phó Bí thư Chi bộ - Phó Chủ nhiệm HC-KT',
  'Chi ủy viên - Trợ lý Hậu cần',
  'Chi ủy viên - Trợ lý Quân khí',
  'Trợ lý Kỹ thuật xe máy',
  'Trợ lý Doanh trại',
  'Trợ lý Quân nhu',
  'Bệnh xá trưởng - Bác sĩ Quân y',
  'Y sĩ Quân y',
  'Thủ kho Quân khí - Đạn',
  'Thủ kho Quân nhu - Doanh cụ',
  'Thủ kho Xăng dầu',
  'Thợ sửa chữa vũ khí - khí tài',
  'Thợ kỹ thuật xe - máy',
  'Lái xe kiêm nhân viên vận tải',
  'Nhân viên Nuôi quân',
] as const;

export const INITIAL_PARTY_MEMBERS: PartyMember[] = [
  {
    id: 'dv-01',
    full_name: 'Nguyễn Anh Toàn',
    birth_year: '06/07/1988',
    citizen_id: '046088001248',
    military_rank: 'Trung tá',
    position: 'Bí thư Chi bộ - Chủ nhiệm Hậu cần - Kỹ thuật',
    enlistment_date: '09/2006',
    party_join_date: '19/05/2010',
    official_party_date: '19/05/2011',
    party_status: 'Chính thức',
    phone: '0914.288.765',
    emergency_contact: 'Vợ: Trần Thị Mai - 0905.334.221',
    hometown: 'Xã Hương Thọ, TP Huế, Thừa Thiên Huế',
    current_residence: 'Số 42 Đinh Tiên Hoàng, P. Thuận Thành, TP Huế',
    distance_km: 2.5,
    notes: 'Chi ủy viên, Đảng ủy viên BCH Quân sự TP Huế',
    evaluations: [
      { year: 2024, grade: 'Hoàn thành xuất sắc nhiệm vụ', commendation: 'Chiến sĩ thi đua cơ sở' },
      { year: 2025, grade: 'Hoàn thành xuất sắc nhiệm vụ' }
    ]
  },
  {
    id: 'dv-02',
    full_name: 'Lê Văn Đức',
    birth_year: '12/01/1988',
    citizen_id: '046088003412',
    military_rank: 'Thiếu tá',
    position: 'Phó Bí thư Chi bộ - Phó Chủ nhiệm HC-KT',
    enlistment_date: '09/2007',
    party_join_date: '03/02/2012',
    official_party_date: '03/02/2013',
    party_status: 'Chính thức',
    phone: '0983.112.569',
    emergency_contact: 'Vợ: Lê Thị Thảo - 0974.223.145',
    hometown: 'Xã Phú Dương, TP Huế, Thừa Thiên Huế',
    current_residence: 'Kiệt 131 Trần Phú, P. Phước Vĩnh, TP Huế',
    distance_km: 3.2,
    notes: 'Phụ trách công tác Kỹ thuật xe máy đơn vị',
    evaluations: [
      { year: 2024, grade: 'Hoàn thành tốt nhiệm vụ' },
      { year: 2025, grade: 'Hoàn thành xuất sắc nhiệm vụ' }
    ]
  },
  {
    id: 'dv-03',
    full_name: 'Nguyễn Việt Hà',
    birth_year: '26/08/1974',
    citizen_id: '046074005891',
    military_rank: 'Trung tá',
    position: 'Chi ủy viên - Trợ lý Kỹ thuật xe máy',
    enlistment_date: '03/1993',
    party_join_date: '22/12/1998',
    official_party_date: '22/12/1999',
    party_status: 'Chính thức',
    phone: '0905.882.114',
    emergency_contact: 'Vợ: Hoàng Thị Cúc - 0914.556.789',
    hometown: 'Huyện Phú Vang, Thừa Thiên Huế',
    current_residence: 'Đường Nguyễn Huệ, P. Vĩnh Ninh, TP Huế',
    distance_km: 2.0,
    notes: 'Huy hiệu 25 năm tuổi Đảng, kinh nghiệm dày dặn',
    evaluations: [
      { year: 2024, grade: 'Hoàn thành tốt nhiệm vụ' },
      { year: 2025, grade: 'Hoàn thành tốt nhiệm vụ' }
    ]
  },
  {
    id: 'dv-04',
    full_name: 'Trần Văn Linh',
    birth_year: '14/02/2002',
    citizen_id: '046202008711',
    military_rank: 'Thượng úy',
    position: 'Trợ lý Quân khí',
    enlistment_date: '09/2020',
    party_join_date: '02/09/2024',
    official_party_date: '02/09/2025',
    party_status: 'Dự bị',
    phone: '0389.445.672',
    emergency_contact: 'Bố: Trần Văn Hải - 0982.113.447',
    hometown: 'Xã Lộc An, Huyện Phú Lộc, Thừa Thiên Huế',
    current_residence: 'Khu tập thể BCHQS TP Huế, P. Tây Lộc, TP Huế',
    distance_km: 1.0,
    notes: 'Đảng viên mới kết nạp năm 2024, cán bộ trẻ triển vọng',
    evaluations: [
      { year: 2024, grade: 'Hoàn thành tốt nhiệm vụ' },
      { year: 2025, grade: 'Hoàn thành tốt nhiệm vụ' }
    ]
  },
  {
    id: 'dv-05',
    full_name: 'Nguyễn Văn Thông',
    birth_year: '10/08/1999',
    citizen_id: '046199009873',
    military_rank: 'Đại úy',
    position: 'Trợ lý Hậu cần',
    enlistment_date: '09/2017',
    party_join_date: '19/05/2021',
    official_party_date: '19/05/2022',
    party_status: 'Chính thức',
    phone: '0935.667.891',
    emergency_contact: 'Mẹ: Lê Thị Tuyết - 0905.123.987',
    hometown: 'Huyện Quảng Điền, Thừa Thiên Huế',
    current_residence: 'Đường Lê Huân, P. Thuận Hòa, TP Huế',
    distance_km: 1.8,
    notes: 'Quản trị viên hệ thống công nghệ thông tin Chi bộ',
    evaluations: [
      { year: 2024, grade: 'Hoàn thành xuất sắc nhiệm vụ', commendation: 'Bằng khen Quân khu' },
      { year: 2025, grade: 'Hoàn thành xuất sắc nhiệm vụ' }
    ]
  },
  {
    id: 'dv-06',
    full_name: 'Phan Hoài Sơn',
    birth_year: '21/01/1997',
    citizen_id: '046197004561',
    military_rank: 'Đại úy',
    position: 'Trợ lý Doanh trại',
    enlistment_date: '09/2015',
    party_join_date: '03/02/2019',
    official_party_date: '03/02/2020',
    party_status: 'Chính thức',
    phone: '0978.441.229',
    emergency_contact: 'Vợ: Phan Thị Ngọc - 0989.667.112',
    hometown: 'Thị xã Hương Thủy, Thừa Thiên Huế',
    current_residence: 'Phường Thủy Dương, TX Hương Thủy, Thừa Thiên Huế',
    distance_km: 8.5,
    notes: 'Phụ trách công tác xây dựng cơ bản, doanh trại chính quy',
    evaluations: [
      { year: 2024, grade: 'Hoàn thành tốt nhiệm vụ' },
      { year: 2025, grade: 'Hoàn thành tốt nhiệm vụ' }
    ]
  },
  {
    id: 'dv-07',
    full_name: 'Trần Xuân Thắng',
    birth_year: '31/10/1976',
    citizen_id: '046076002134',
    military_rank: 'Thiếu tá QNCN',
    position: 'Bệnh xá trưởng - Bác sĩ Quân y',
    enlistment_date: '02/1996',
    party_join_date: '27/07/2003',
    official_party_date: '27/07/2004',
    party_status: 'Chính thức',
    phone: '0913.447.881',
    emergency_contact: 'Vợ: Đỗ Thị Minh - 0903.551.442',
    hometown: 'Xã Phong Hiền, Huyện Phong Điền, Thừa Thiên Huế',
    current_residence: 'Đường Chi Lăng, P. Phú Cát, TP Huế',
    distance_km: 3.8,
    notes: 'Quản lý sức khỏe 100% quân số cơ quan và đơn vị',
    evaluations: [
      { year: 2024, grade: 'Hoàn thành xuất sắc nhiệm vụ' },
      { year: 2025, grade: 'Hoàn thành tốt nhiệm vụ' }
    ]
  },
  {
    id: 'dv-08',
    full_name: 'Hồ Minh Văn',
    birth_year: '10/04/1981',
    citizen_id: '046081006542',
    military_rank: 'Thiếu tá QNCN',
    position: 'Thủ kho Quân khí - Đạn',
    enlistment_date: '03/2000',
    party_join_date: '22/12/2008',
    official_party_date: '22/12/2009',
    party_status: 'Chính thức',
    phone: '0984.773.120',
    emergency_contact: 'Vợ: Nguyễn Thị Hồng - 0972.889.331',
    hometown: 'Huyện A Lưới, Thừa Thiên Huế',
    current_residence: 'Phường Kim Long, TP Huế',
    distance_km: 4.2,
    notes: 'Giữ kho an toàn tuyệt đối 15 năm liên tục',
    evaluations: [
      { year: 2024, grade: 'Hoàn thành tốt nhiệm vụ' },
      { year: 2025, grade: 'Hoàn thành tốt nhiệm vụ' }
    ]
  },
  {
    id: 'dv-09',
    full_name: 'Hồ Đức Chinh',
    birth_year: '14/11/1981',
    citizen_id: '046081009832',
    military_rank: 'Thiếu tá QNCN',
    position: 'Thủ kho Xăng dầu',
    enlistment_date: '03/2001',
    party_join_date: '03/02/2009',
    official_party_date: '03/02/2010',
    party_status: 'Chính thức',
    phone: '0905.334.887',
    emergency_contact: 'Vợ: Trần Thị Sen - 0914.225.663',
    hometown: 'Huyện Nam Đông, Thừa Thiên Huế',
    current_residence: 'Phường An Đông, TP Huế',
    distance_km: 5.5,
    notes: 'Bảo đảm định mức cấp phát xăng dầu sẵn sàng chiến đấu',
    evaluations: [
      { year: 2024, grade: 'Hoàn thành tốt nhiệm vụ' },
      { year: 2025, grade: 'Hoàn thành tốt nhiệm vụ' }
    ]
  },
  {
    id: 'dv-10',
    full_name: 'Nguyễn Phi Toàn',
    birth_year: '19/04/1992',
    citizen_id: '046192007812',
    military_rank: 'Thiếu tá QNCN',
    position: 'Thợ sửa chữa vũ khí - khí tài',
    enlistment_date: '09/2010',
    party_join_date: '19/05/2016',
    official_party_date: '19/05/2017',
    party_status: 'Chính thức',
    phone: '0979.662.314',
    emergency_contact: 'Vợ: Lê Thị Thúy - 0988.112.990',
    hometown: 'Thị xã Hương Trà, Thừa Thiên Huế',
    current_residence: 'Phường Hương Sơ, TP Huế',
    distance_km: 6.0,
    notes: 'Đoạt giải Hội thi Kỹ thuật cấp Bộ CHQS Tỉnh',
    evaluations: [
      { year: 2024, grade: 'Hoàn thành xuất sắc nhiệm vụ' },
      { year: 2025, grade: 'Hoàn thành tốt nhiệm vụ' }
    ]
  },
  {
    id: 'dv-11',
    full_name: 'Nguyễn H Đình Phúc',
    birth_year: '16/07/2000',
    citizen_id: '046200003451',
    military_rank: 'Thiếu úy QNCN',
    position: 'Y sĩ Quân y',
    enlistment_date: '02/2019',
    party_join_date: '02/09/2023',
    official_party_date: '02/09/2024',
    party_status: 'Chính thức',
    phone: '0398.224.551',
    emergency_contact: 'Bố: Nguyễn Đình Tuấn - 0914.778.990',
    hometown: 'Phường Thuận An, TP Huế, Thừa Thiên Huế',
    current_residence: 'Đường Phạm Văn Đồng, P. Vỹ Dạ, TP Huế',
    distance_km: 4.8,
    notes: 'Phụ trách công tác phòng chống dịch bệnh và vệ sinh quân y',
    evaluations: [
      { year: 2024, grade: 'Hoàn thành tốt nhiệm vụ' },
      { year: 2025, grade: 'Hoàn thành tốt nhiệm vụ' }
    ]
  },
  {
    id: 'dv-12',
    full_name: 'Chu Văn Lâm',
    birth_year: '06/10/1981',
    citizen_id: '046081001198',
    military_rank: 'Thiếu tá QNCN',
    position: 'Thợ kỹ thuật xe - máy',
    enlistment_date: '03/2001',
    party_join_date: '22/12/2007',
    official_party_date: '22/12/2008',
    party_status: 'Chính thức',
    phone: '0903.551.782',
    emergency_contact: 'Vợ: Hoàng Thị Nga - 0912.883.441',
    hometown: 'Xã Vinh An, Huyện Phú Vang, Thừa Thiên Huế',
    current_residence: 'Đường Tăng Bạt Hổ, P. Tây Lộc, TP Huế',
    distance_km: 1.5,
    notes: 'Thợ bậc cao chuyên ngành sửa chữa động cơ xe quân sự',
    evaluations: [
      { year: 2024, grade: 'Hoàn thành tốt nhiệm vụ' },
      { year: 2025, grade: 'Hoàn thành tốt nhiệm vụ' }
    ]
  },
  {
    id: 'dv-13',
    full_name: 'Phạm Quốc Khánh',
    birth_year: '02/09/1978',
    citizen_id: '046078004512',
    military_rank: 'Trung tá QNCN',
    position: 'Thủ kho Quân nhu - Doanh cụ',
    enlistment_date: '02/1998',
    party_join_date: '19/05/2005',
    official_party_date: '19/05/2006',
    party_status: 'Chính thức',
    phone: '0914.882.339',
    emergency_contact: 'Vợ: Phan Thị Lan - 0905.771.228',
    hometown: 'Xã Phong Hòa, Huyện Phong Điền, Thừa Thiên Huế',
    current_residence: 'Phường Vỹ Dạ, TP Huế',
    distance_km: 4.5,
    notes: 'Đảm bảo quân tư trang và chế độ tiêu chuẩn cho đơn vị',
    evaluations: [
      { year: 2024, grade: 'Hoàn thành tốt nhiệm vụ' },
      { year: 2025, grade: 'Hoàn thành tốt nhiệm vụ' }
    ]
  },
  {
    id: 'dv-14',
    full_name: 'Hoàng Ngọc Sơn',
    birth_year: '15/05/1983',
    citizen_id: '046083002341',
    military_rank: 'Thiếu tá QNCN',
    position: 'Lái xe kiêm nhân viên vận tải',
    enlistment_date: '03/2003',
    party_join_date: '03/02/2011',
    official_party_date: '03/02/2012',
    party_status: 'Chính thức',
    phone: '0977.332.115',
    emergency_contact: 'Vợ: Nguyễn Thị Huệ - 0984.551.662',
    hometown: 'Thị trấn Phú Lộc, Huyện Phú Lộc, Thừa Thiên Huế',
    current_residence: 'Khu quy hoạch Hương Sơ, TP Huế',
    distance_km: 6.5,
    notes: 'Lái xe an toàn trên 200.000 km, sẵn sàng cơ động cao',
    evaluations: [
      { year: 2024, grade: 'Hoàn thành tốt nhiệm vụ' },
      { year: 2025, grade: 'Hoàn thành tốt nhiệm vụ' }
    ]
  },
  {
    id: 'dv-15',
    full_name: 'Đặng Văn Dũng',
    birth_year: '20/11/1985',
    citizen_id: '046085006712',
    military_rank: 'Đại úy QNCN',
    position: 'Thợ sửa chữa vũ khí - khí tài',
    enlistment_date: '09/2005',
    party_join_date: '22/12/2013',
    official_party_date: '22/12/2014',
    party_status: 'Chính thức',
    phone: '0934.112.890',
    emergency_contact: 'Vợ: Trần Thị Dung - 0915.228.337',
    hometown: 'Xã Hải Dương, TP Huế, Thừa Thiên Huế',
    current_residence: 'Đường Bùi Thị Xuân, P. Phường Đúc, TP Huế',
    distance_km: 3.5,
    notes: 'Bảo quản vũ khí khí tài sẵn sàng chiến đấu loại 1',
    evaluations: [
      { year: 2024, grade: 'Hoàn thành tốt nhiệm vụ' },
      { year: 2025, grade: 'Hoàn thành tốt nhiệm vụ' }
    ]
  },
  {
    id: 'dv-16',
    full_name: 'Võ Văn Tuấn',
    birth_year: '12/03/1982',
    citizen_id: '046082008891',
    military_rank: 'Thiếu tá QNCN',
    position: 'Lái xe kiêm nhân viên vận tải',
    enlistment_date: '03/2002',
    party_join_date: '19/05/2010',
    official_party_date: '19/05/2011',
    party_status: 'Chính thức',
    phone: '0982.441.776',
    emergency_contact: 'Vợ: Lê Thị Thảo - 0973.112.554',
    hometown: 'Xã Phong An, Huyện Phong Điền, Thừa Thiên Huế',
    current_residence: 'Đường Điện Biên Phủ, P. Trường An, TP Huế',
    distance_km: 4.0,
    notes: 'Phục vụ các đợt diễn tập phòng thủ khu vực xuất sắc',
    evaluations: [
      { year: 2024, grade: 'Hoàn thành tốt nhiệm vụ' },
      { year: 2025, grade: 'Hoàn thành tốt nhiệm vụ' }
    ]
  },
  {
    id: 'dv-17',
    full_name: 'Trần Đình Quốc',
    birth_year: '05/08/1987',
    citizen_id: '046087003429',
    military_rank: 'Đại úy QNCN',
    position: 'Trợ lý Doanh trại',
    enlistment_date: '09/2007',
    party_join_date: '02/09/2015',
    official_party_date: '02/09/2016',
    party_status: 'Chính thức',
    phone: '0905.667.123',
    emergency_contact: 'Vợ: Nguyễn Thị Hà - 0914.889.001',
    hometown: 'Xã Điền Hải, Huyện Phong Điền, Thừa Thiên Huế',
    current_residence: 'Đường Lê Thánh Tôn, P. Thuận Thành, TP Huế',
    distance_km: 2.2,
    notes: 'Quản lý tốt hệ thống điện nước, doanh cụ doanh trại',
    evaluations: [
      { year: 2024, grade: 'Hoàn thành tốt nhiệm vụ' },
      { year: 2025, grade: 'Hoàn thành tốt nhiệm vụ' }
    ]
  },
  {
    id: 'dv-18',
    full_name: 'Lê Hữu Thành',
    birth_year: '18/09/1994',
    citizen_id: '046194002381',
    military_rank: 'Thượng úy QNCN',
    position: 'Thủ kho Xăng dầu',
    enlistment_date: '02/2014',
    party_join_date: '03/02/2018',
    official_party_date: '03/02/2019',
    party_status: 'Chính thức',
    phone: '0971.229.445',
    emergency_contact: 'Mẹ: Hoàng Thị Nhàn - 0989.334.112',
    hometown: 'Xã Quảng Thái, Huyện Quảng Điền, Thừa Thiên Huế',
    current_residence: 'Phường An Hòa, TP Huế',
    distance_km: 5.2,
    notes: 'Đoàn viên chi đoàn xuất sắc chuyển đảng chính thức',
    evaluations: [
      { year: 2024, grade: 'Hoàn thành tốt nhiệm vụ' },
      { year: 2025, grade: 'Hoàn thành tốt nhiệm vụ' }
    ]
  },
  {
    id: 'dv-19',
    full_name: 'Nguyễn Đình Dũng',
    birth_year: '25/12/1993',
    citizen_id: '046193005521',
    military_rank: 'Thượng úy QNCN',
    position: 'Nhân viên Nuôi quân',
    enlistment_date: '09/2013',
    party_join_date: '19/05/2017',
    official_party_date: '19/05/2018',
    party_status: 'Chính thức',
    phone: '0945.881.234',
    emergency_contact: 'Vợ: Trương Thị Kim - 0914.773.882',
    hometown: 'Thị xã Hương Trà, Thừa Thiên Huế',
    current_residence: 'Xã Hương Vinh, TP Huế',
    distance_km: 7.0,
    notes: 'Bếp ăn đạt danh hiệu "Bếp nuôi quân giỏi, quản lý tốt"',
    evaluations: [
      { year: 2024, grade: 'Hoàn thành xuất sắc nhiệm vụ' },
      { year: 2025, grade: 'Hoàn thành tốt nhiệm vụ' }
    ]
  },
  {
    id: 'dv-20',
    full_name: 'Trương Công Hùng',
    birth_year: '10/06/1998',
    citizen_id: '046198007712',
    military_rank: 'Trung úy QNCN',
    position: 'Thợ kỹ thuật xe - máy',
    enlistment_date: '02/2018',
    party_join_date: '22/12/2022',
    official_party_date: '22/12/2023',
    party_status: 'Chính thức',
    phone: '0367.882.119',
    emergency_contact: 'Bố: Trương Công Định - 0984.221.776',
    hometown: 'Huyện Phú Lộc, Thừa Thiên Huế',
    current_residence: 'Kiệt 68 Mai Thúc Loan, P. Thuận Lộc, TP Huế',
    distance_km: 2.1,
    notes: 'Kỹ thuật viên lành nghề trẻ, năng nổ nhiệt tình',
    evaluations: [
      { year: 2024, grade: 'Hoàn thành tốt nhiệm vụ' },
      { year: 2025, grade: 'Hoàn thành tốt nhiệm vụ' }
    ]
  },
  {
    id: 'dv-21',
    full_name: 'Trần Văn Bảo',
    birth_year: '15/04/2001',
    citizen_id: '046201004498',
    military_rank: 'Trung úy',
    position: 'Trợ lý Quân nhu',
    enlistment_date: '09/2019',
    party_join_date: '03/02/2024',
    official_party_date: '03/02/2025',
    party_status: 'Dự bị',
    phone: '0356.119.882',
    emergency_contact: 'Mẹ: Phan Thị Hiền - 0905.441.993',
    hometown: 'Xã Phú Mỹ, Huyện Phú Vang, Thừa Thiên Huế',
    current_residence: 'Khu tập thể BCH Quân sự TP Huế, P. Tây Lộc, TP Huế',
    distance_km: 1.0,
    notes: 'Đảng viên dự bị, phụ trách tăng gia sản xuất và quân trang',
    evaluations: [
      { year: 2024, grade: 'Hoàn thành tốt nhiệm vụ' },
      { year: 2025, grade: 'Hoàn thành tốt nhiệm vụ' }
    ]
  }
];

const LOCAL_STORAGE_KEY = 'llvt_hue_party_members_v1';

export function getStoredMembers(): PartyMember[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      saveStoredMembers(INITIAL_PARTY_MEMBERS);
      return INITIAL_PARTY_MEMBERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_PARTY_MEMBERS;
  } catch (e) {
    console.warn('Lỗi đọc LocalStorage, khôi phục danh sách mặc định', e);
    return INITIAL_PARTY_MEMBERS;
  }
}

export function saveStoredMembers(members: PartyMember[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(members));
  } catch (e) {
    console.error('Lỗi lưu LocalStorage:', e);
  }
}

export function resetToDefaultMembers(): PartyMember[] {
  saveStoredMembers(INITIAL_PARTY_MEMBERS);
  return INITIAL_PARTY_MEMBERS;
}
