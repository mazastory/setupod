/**
 * SETUPOD 100 Matrix Pod Generator Data & 35 Premium Specialty Catalog
 * 10대 핵심 엔진 × 10대 버티컬 산업군 = 100개 독점 100% 무상 장학 팟
 * + 35개 알짜배기 고부가가치 마켓 프리미엄 팟 (25% 마자 중개 수수료)
 */

const ENGINES = [
  { id: 'margin', name: '마진/수익률 엔진', base: '/margin', icon: '📊' },
  { id: 'ratio', name: '용량/비율/타이머 엔진', base: '/brewoak', icon: '⏱️' },
  { id: 'tax', name: '세금/한도/절세 엔진', base: '/fx', icon: '💰' },
  { id: 'compound', name: '자산증식/D-Day 엔진', base: '/runway', icon: '📈' },
  { id: 'planner', name: '체크리스트/플래너 OS', base: '/planner', icon: '📝' },
  { id: 'cost', name: '생활비/견적 시뮬레이터', base: '/nomad', icon: '✈️' },
  { id: 'card3d', name: '3D 명함/쇼케이스 엔진', base: '/bizcard', icon: '💼' },
  { id: 'link', name: '인터랙티브 멀티링크 엔진', base: '/multilink', icon: '🔗' },
  { id: 'secret', name: '시크릿 룸/게이트웨이', base: '/secret_room', icon: '🔐' },
  { id: 'adsense', name: '트래픽/광고가치 엔진', base: '/adsense', icon: '🌐' }
];

// =========================================================================
// 1. 100대 무상 장학 팟 (10대 카테고리 × 10대 니치 = 100개 완전 분산)
// =========================================================================
const VERTICALS = [
  {
    cat: 'ecommerce',
    catName: '이커머스 & 쇼핑몰',
    niches: [
      { id: 'smartstore_margin', engine: 'margin', name: '스마트스토어·쿠팡 로켓 마진 1초 계산기', gift: '스마트스토어 마진 엑셀 템플릿' },
      { id: 'baking_ratio', engine: 'ratio', name: '베이커스 퍼센트 밀가루 수분율 & 배합 타이머', gift: '홈베이킹 황금 레시피 치트시트' },
      { id: 'tariff_customs', engine: 'tax', name: '해외직구 1초 관부가세 & 카드 수수료 계산기', gift: '2026 무관세 직구 절세 가이드북' },
      { id: 'delivery_tip_split', engine: 'cost', name: '배달의민족/쿠팡이츠 배달비 N분의 1 더치페이 계산기', gift: '배달 플랫폼 할인쿠폰 모음' },
      { id: 'seller_planner', engine: 'planner', name: '월 1억 쇼핑몰 일일 소싱 & 발주 루틴 플래너', gift: '탑셀러 1년 루틴 다이어리' },
      { id: 'shipping_cost', engine: 'cost', name: '택배 3사 배송비 & 포장 부자재 원가 시뮬레이터', gift: '쇼핑몰 포장 부자재 최저가 단가표' },
      { id: 'seller_bizcard', engine: 'card3d', name: '쇼핑몰 대표 & MD 3D 인터랙티브 비즈니스 명함', gift: '바이어 미팅 100% 성사 제안서' },
      { id: 'group_buy_link', engine: 'link', name: '인스타 공구 셀러 VIP 멀티링크 & 입금 확인 팟', gift: '공구 전환율 5배 카피라이팅 50선' },
      { id: 'used_phone_price_guide', engine: 'compound', name: '중고폰·전자기기 감가상각 & 시세 가이드 팟', gift: '중고거래 사기 방지 5대 수칙' },
      { id: 'convenience_lunch_box', engine: 'ratio', name: '편의점 도시락 가성비 & 단백질 함량 비교표', gift: '직장인 알뜰 식비 절약 팁' }
    ]
  },
  {
    cat: 'real_estate',
    catName: '부동산 & 인테리어',
    niches: [
      { id: 'brokerage_fee', engine: 'margin', name: '부동산 중개보수(복비) & 부가세 1초 계산기', gift: '2026 전세사기 100% 예방 체크리스트' },
      { id: 'interior_paint_ratio', engine: 'ratio', name: '셀프 인테리어 평당 페인트/벽지 소요량 계산기', gift: '평당 인테리어 자재 소요량 공식집' },
      { id: 'electric_bill_sim', engine: 'tax', name: '에어컨 누진세 폭탄 방지 전기세 시뮬레이터', gift: '전기요금 30% 절감 실천 가이드' },
      { id: 'mortgage_dday', engine: 'compound', name: '주택담보대출 원리금 균등상환 & 만기 예측기', gift: '주담대 금리 0.5% 깎는 은행 협상법' },
      { id: 'moving_checklist', engine: 'planner', name: '이사 30일 전 D-Day 올인원 체크리스트 플래너', gift: '이사 당일 필수 행정처리 체크리스트' },
      { id: 'airbnb_profit', engine: 'cost', name: '에어비앤비 객실 가동률 & 순수익 시뮬레이터', gift: '공유숙박 합법 창업 턴키 가이드' },
      { id: 'minimal_clutter_test', engine: 'planner', name: '우리 집 미니멀 라이프 지수 진단 체크리스트', gift: '비우기 30일 챌린지 시트' },
      { id: 'property_multilink', engine: 'link', name: '분양 현장 VIP 매물 브리핑 & 전화 연결 팟', gift: '분양 대행사 문자 템플릿' },
      { id: 'taxi_vs_subway_cost', engine: 'cost', name: '심야 택시비 vs 첫차 대기 가성비 비교기', gift: '대중교통 알뜰교통카드 환급 팁' },
      { id: 'room_cleaning_dday', engine: 'ratio', name: '주말 방 대청소 1시간 타임어택 플래너', gift: '공간별 정리수납 꿀팁 30선' }
    ]
  },
  {
    cat: 'food_beverage',
    catName: '카페 & 식음료 & 외식',
    niches: [
      { id: 'dish_margin', engine: 'margin', name: '외식업 메뉴 원가율(30%룰) & 마진율 1초 계산기', gift: '요식업 식자재 원가관리 엑셀 시트' },
      { id: 'coffee_brewing', engine: 'ratio', name: '스페셜티 원두 골든 브루잉 & 디개싱 타이머', gift: '원두별 브루잉 레시피 치트시트' },
      { id: 'coffee_caffeine_tracker', engine: 'ratio', name: '오늘 마신 커피 총 카페인 & 수면 방해 시간 계산기', gift: '숙면을 위한 카페인 컷오프 가이드' },
      { id: 'beverage_break_even', engine: 'compound', name: '카페 손익분기점(BEP) 월 잔여 잔수 계산기', gift: '개인카페 창업 생존 매뉴얼' },
      { id: 'cafe_opening_prep', engine: 'planner', name: '카페 창업 인테리어 & 위생 점검 체크리스트', gift: '보건증·영업신고 인허가 타임라인' },
      { id: 'delivery_platform_fee', engine: 'cost', name: '배민/쿠팡이츠 배달 수수료 비교 시뮬레이터', gift: '배달 플랫폼 깃발 꽂기 가성비 전략' },
      { id: 'barista_bizcard', engine: 'card3d', name: '로스터리 대표 & 바리스타 3D 감성 명함 팟', gift: '스페셜티 커피 테이스팅 휠 노트' },
      { id: 'cafe_order_link', engine: 'link', name: '디저트 카페 사전예약 & 픽업 멀티링크 팟', gift: '단체 주문 유치 B2B 영업 제안서' },
      { id: 'drinking_soju_recovery', engine: 'compound', name: '소주/맥주 알코올 분해 소요 시간 & 숙취 해소 계산기', gift: '음주 전후 간 보호 음식 리스트' },
      { id: 'lunch_menu_roulette', engine: 'link', name: '오늘 점심 뭐 먹지? 1초 메뉴 결정 룰렛 팟', gift: '직장인 점심 맛집 추천 치트시트' }
    ]
  },
  {
    cat: 'fitness_health',
    catName: '헬스 & 피트니스 & 웰니스',
    niches: [
      { id: 'running_pace_calc', engine: 'margin', name: '러닝 10km/하프 마라톤 목표 페이스 1초 계산기', gift: '초보 러너 4주 완성 훈련표' },
      { id: 'bmr_macro_ratio', engine: 'ratio', name: '기초대사량(BMR) & 탄단지 매크로 영양 계산기', gift: '직장인 4주 탄단지 식단표 PDF' },
      { id: 'medical_tax_deduct', engine: 'tax', name: '의료비 연말정산 공제율 자동 계산기', gift: '연말정산 의료비 환급 극대화 팁' },
      { id: 'daily_water_intake', engine: 'compound', name: '체중·활동량 맞춤 오늘 하루 물 권장 섭취량 체크기', gift: '수분 충전 건강 습관 가이드' },
      { id: 'workout_routine_os', engine: 'planner', name: '3분할/4분할 점진적 과부하 운동 루틴 플래너', gift: '부위별 근비대 운동 루틴 노트' },
      { id: 'gym_membership_cost', engine: 'cost', name: '필라테스 vs 헬스장 1회당 실질 레슨비 비교기', gift: '피트니스 회원권 환불 규정 법률 가이드' },
      { id: 'trainer_bizcard', engine: 'card3d', name: '헬스 트레이너 & 필라테스 원장 3D 프로필 명함', gift: '체형 분석 상담 시트 템플릿' },
      { id: 'pt_booking_link', engine: 'link', name: 'PT 무료 체험 수업 신청 인터랙티브 예약 팟', gift: '체험 수업 등록 전환율 90% 상담법' },
      { id: 'sleep_cycle_timer', engine: 'ratio', name: '렘수면 90분 주기 최적 기상 시간 알람 팟', gift: '꿀잠 수면 환경 세팅 가이드' },
      { id: 'smoking_quit_savings', engine: 'cost', name: '금연 n일차 절약한 담뱃값 & 수명 연장 타이머', gift: '금단현상 극복 7일 수칙' }
    ]
  },
  {
    cat: 'finance_wealth',
    catName: '재테크 & 금융 & 절세',
    niches: [
      { id: 'interest_day_calc', engine: 'margin', name: '예금/적금 만기 해지 시 하루치 이자 계산기', gift: '파킹통장 금리 비교표 2026' },
      { id: 'isa_irp_ratio', engine: 'ratio', name: 'ISA vs IRP 절세 계좌 세액공제 최적 분배기', gift: '연말정산 148만원 돌려받는 IRP 가이드' },
      { id: 'hourly_wage_parttime', engine: 'tax', name: '2026 최저임금 기준 주휴수당 & 알바 실수령액 계산기', gift: '알바 노동법 10문 10답' },
      { id: 'snowball_100m_dday', engine: 'compound', name: '사회초년생 종잣돈 1억 달성 D-Day 시뮬레이터', gift: '1억 모으기 가계부 엑셀 템플릿' },
      { id: 'monthly_budget_os', engine: 'planner', name: '고정지출 제로화 50/30/20 월간 예산 플래너', gift: '통장 쪼개기 4대 원칙 매뉴얼' },
      { id: 'loan_interest_compare', engine: 'cost', name: '고정금리 vs 변동금리 이자 비용 시뮬레이터', gift: '대환대출 최저금리 갈아타기 체크리스트' },
      { id: 'ott_sub_saver', engine: 'cost', name: '넷플릭스·디즈니·유튜브 파티 매칭 절감액 계산기', gift: '구독 다이어트 체크리스트' },
      { id: 'financial_consult_link', engine: 'link', name: '재테크 상담 예약 & 무료 진단지 멀티링크', gift: '보험 다이어트 셀프 진단표' },
      { id: 'lotto_random_smart', engine: 'link', name: '행운의 추천 로또 번호 1초 자동 추첨 팟', gift: '역대 로또 당첨 통계 리포트' },
      { id: 'salary_raise_negotiator', engine: 'compound', name: '희망 연봉 인상률(%) 입력 시 월 실수령액 차액 계산기', gift: '연봉 협상 성공 멘트 5선' }
    ]
  },
  {
    cat: 'pet_lifestyle',
    catName: '반려동물 & 펫 라이프',
    niches: [
      { id: 'pet_food_margin', engine: 'margin', name: '수제 간식 공방 원가율 & 판매 마진 계산기', gift: '수제 간식 창업 원가 계산 시트' },
      { id: 'dog_food_serving_ratio', engine: 'ratio', name: '반려견 체중별 맞춤 사료 급여량 & 칼로리 계산기', gift: '견종별 생애주기 영양 가이드북' },
      { id: 'plant_watering_dday', engine: 'ratio', name: '반려식물(몬스테라/다육이 등) 물주기 주기 타이머', gift: '초보 식집사 식물 관리 노트' },
      { id: 'pet_age_dday', engine: 'compound', name: '강아지·고양이 사람 나이 환산 & 건강검진 D-Day', gift: '노령견 케어 체크리스트' },
      { id: 'puppy_vaccine_planner', engine: 'planner', name: '초보 집사 강아지 예방접종 & 훈련 타임라인', gift: '배변 훈련 7일 완성 매뉴얼' },
      { id: 'pet_hotel_cost', engine: 'cost', name: '펫호텔 vs 펫시터 일일 위탁 비용 비교기', gift: '반려동물 동반 여행 숙소 리스트' },
      { id: 'groomer_bizcard', engine: 'card3d', name: '반려견 미용실 원장 & 훈련사 3D 명함 팟', gift: '미용 전 견주 문진표 서식' },
      { id: 'pet_booking_link', engine: 'link', name: '애견 미용 & 호텔 1초 예약 멀티링크 팟', gift: '노쇼 방지 예약금 안내문 템플릿' },
      { id: 'pet_human_age_fun', engine: 'link', name: '강아지·고양이 감정 상태 & 꼬리 언어 1초 퀴즈', gift: '반려동물 바디랭귀지 일러스트' },
      { id: 'pet_walking_calorie', engine: 'margin', name: '반려견 산책 30분 보호자 & 댕댕이 소모 칼로리 계산기', gift: '산책 에티켓 & 필수 준비물' }
    ]
  },
  {
    cat: 'travel_global',
    catName: '여행 & 글로벌 & 항공',
    niches: [
      { id: 'fishing_tide_time', engine: 'ratio', name: '바다낚시 물때 & 간조/만조 기본 시간 안내 팟', gift: '초보 낚시 포인트 가이드' },
      { id: 'packing_weight_ratio', engine: 'ratio', name: '항공사별 수하물 무게 제한 & 초과요금 계산기', gift: '해외여행 짐싸기 황금 체크리스트' },
      { id: 'tax_free_refund', engine: 'tax', name: '해외 쇼핑 택스리펀(Tax Refund) 환급액 계산기', gift: '주요국 택스리펀 신청 절차 매뉴얼' },
      { id: 'flight_mileage_dday', engine: 'compound', name: '항공 마일리지 적립 & 비즈니스 승급 D-Day', gift: '마일리지 200% 활용 극대화 팁' },
      { id: 'euro_travel_planner', engine: 'planner', name: '유럽 2주 배낭여행 일자별 루트 & 예산 플래너', gift: '유럽 기차 패스 비교 가이드' },
      { id: 'nomad_city_compare', engine: 'cost', name: '전 세계 10대 거점 도시 한 달 살기 생활비 비교기', gift: '발리·방콕 노마드 거주 가이드북' },
      { id: 'guide_bizcard', engine: 'card3d', name: '현지 가이드 & 여행 크리에이터 3D 감성 명함', gift: '인생샷 스팟 GPS 좌표 지도' },
      { id: 'travel_consult_link', engine: 'link', name: '맞춤 여행 일정표 신청 & 견적 멀티링크', gift: '동행자 여행 취향 설문지' },
      { id: 'travel_packing_helper', engine: 'planner', name: '해외여행(동남아/일본/유럽) 캐리어 짐싸기 체크리스트', gift: '여행 상비약 & 필수 어플 리스트' },
      { id: 'camping_pack_checklist', engine: 'link', name: '오토캠핑 계절별(동계/하계) 필수 준비물 체크리스트', gift: '캠핑 감성 요리 레시피 10선' }
    ]
  },
  {
    cat: 'creator_education',
    catName: '지식창업 & 강의 & 프리랜서',
    niches: [
      { id: 'word_char_counter', engine: 'margin', name: '자소서·블로그 글자 수(공백 포함/제외) 실시간 카운터', gift: '합격 자소서 작성 템플릿' },
      { id: 'pomodoro_study_ratio', engine: 'ratio', name: '50분 몰입 10분 휴식 뽀모도로 수험 타이머', gift: '기출문제 3회독 스터디 플래너' },
      { id: 'pomodoro_focus_lite', engine: 'ratio', name: '25분 집중 5분 휴식 뽀모도로 브라우저 타이머', gift: '일일 생산성 2배 루틴 노트' },
      { id: 'subscriber_goal_dday', engine: 'compound', name: '유튜브/인스타 1만 팔로워 달성 D-Day 시뮬레이터', gift: '릴스 떡상 알고리즘 7대 법칙' },
      { id: 'course_curriculum_os', engine: 'planner', name: '4주 완성 VOD 강의 커리큘럼 설계 플래너', gift: '완판 강의 기획서 템플릿' },
      { id: 'hourly_rate_calc', engine: 'cost', name: '프리랜서 목표 연봉 기준 시간당 단가 산출기', gift: '외주 단가 2배 올리는 견적서 양식' },
      { id: 'creator_3d_card', engine: 'card3d', name: '강사 & 전문직 3D 포트폴리오 홀로그램 명함', gift: '강의 섭외 100% 프로필 양식' },
      { id: 'lead_magnet_multilink', engine: 'link', name: '전자책 무료 다운로드 & 뉴스레터 구독 멀티링크', gift: '뉴스레터 오픈율 40% 제목 30선' },
      { id: 'gpa_credit_converter', engine: 'cost', name: '대학교 학점 4.5 ➔ 4.3 ➔ 백분율 1초 환산기', gift: '취업 스펙 환산 가이드' },
      { id: 'youtube_speed_timer', engine: 'compound', name: '1.25배속 / 1.5배속 시청 시 영상 절약 시간 계산기', gift: '시간 절약 유튜브 학습법' }
    ]
  },
  {
    cat: 'automotive_mobility',
    catName: '자동차 & 모빌리티',
    niches: [
      { id: 'car_fuel_trip_cost', engine: 'margin', name: '출발지-도착지 왕복 기름값 + 톨비 1초 계산기', gift: '연비 20% 높이는 운전 습관' },
      { id: 'engine_oil_change_ratio', engine: 'ratio', name: '주행거리별 엔진오일 교환 & 소모품 교체 타이머', gift: '차종별 소모품 주기 다이어리' },
      { id: 'car_registration_tax', engine: 'tax', name: '신차·중고차 취등록세 & 공채할인 1초 계산기', gift: '신차 출고 취등록세 감면 혜택 가이드' },
      { id: 'commute_stress_test', engine: 'compound', name: '출퇴근 편도 소요 시간으로 보는 연간 낭비 시간 계산기', gift: '통근 시간 자기계발 꿀팁' },
      { id: 'car_maintenance_planner', engine: 'planner', name: '1년 차량 유지비 & 자동차세 연납 절세 플래너', gift: '차계부 엑셀 템플릿' },
      { id: 'ev_charging_cost', engine: 'cost', name: '전기차 vs 가솔린 10만km 주행 유류비 비교기', gift: '전기차 보조금 신청 타임라인' },
      { id: 'car_dealer_bizcard', engine: 'card3d', name: '자동차 딜러 & 디테일링 샵 3D 프리미엄 명함', gift: '출고 고객 감동 사은품 리스트' },
      { id: 'car_quote_multilink', engine: 'link', name: '차량 견적 문의 & 시승 신청 인터랙티브 멀티링크', gift: '리스 렌트 비교 견적서 샘플' },
      { id: 'car_tire_air_timer', engine: 'ratio', name: '계절별 타이어 적정 공기압 & 마모도 체크 타이머', gift: '타이어 수명 2배 연장 관리법' },
      { id: 'drive_music_curation', engine: 'link', name: '비오는날·야간 드라이브 추천 플레이리스트 링크', gift: '드라이브 감성 명곡 50선' }
    ]
  },
  {
    cat: 'wedding_event',
    catName: '웨딩 & 파티 & 기념일',
    niches: [
      { id: 'wedding_hall_margin', engine: 'margin', name: '웨딩홀 대관료 & 식대 골든타임 마진 계산기', gift: '웨딩홀 계약 전 필수 체크리스트 50선' },
      { id: 'guest_rsvp_ratio', engine: 'ratio', name: '하객 수 대비 식대 보증인원 황금 비율 계산기', gift: '하객 식대 손실 방지 공식 시트' },
      { id: 'dating_anniversary_dday', engine: 'compound', name: '연인 100일/1주년/크리스마스 D-Day 카운트다운', gift: '기념일 감동 선물 아이디어 30선' },
      { id: 'wedding_dday_counter', engine: 'compound', name: '결혼식 180일 전 타임라인 D-Day 시뮬레이터', gift: '예신예랑 스드메 일정표 엑셀' },
      { id: 'sdm_budget_os', engine: 'planner', name: '스드메 추가금 0원 방어 예산 분배 플래너', gift: '스드메 추가금 방어 계약서 특약집' },
      { id: 'honeymoon_cost_calc', engine: 'cost', name: '하와이 vs 발리 신혼여행 견적 비교기', gift: '신행 항공권 최저가 발권 노하우' },
      { id: 'planner_wedding_bizcard', engine: 'card3d', name: '웨딩플래너 & 스튜디오 작가 3D 감성 명함', gift: '스튜디오 촬영 포즈 가이드북' },
      { id: 'mobile_invitation_link', engine: 'link', name: '모바일 청첩장 & 참석 여부 RSVP 인터랙티브 링크', gift: '모바일 청첩장 문구 30선' },
      { id: 'meeting_cost_ticker', engine: 'cost', name: '회의 참석자 n명 기준 실시간 버려지는 인건비 타이머', gift: '30분 컷 효율적 회의 진행법' },
      { id: 'wedding_budget_sim', engine: 'margin', name: '신혼 가전·가구 혼수 총예산 견적 시뮬레이터', gift: '백화점 혼수 졸업 견적표' }
    ]
  }
];

// =========================================================================
// 2. 35대 고부가가치 마켓 프리미엄 팟 (실전 수임, 자산평가, VIP 시크릿룸)
// =========================================================================
const PREMIUM_35_NICHES = [
  // 1. 고단가 자산평가 & 금융 자산
  { id: 'building_roi_calc', cat: 'real_estate', catName: '부동산', engine: 'adsense', name: '꼬마빌딩 임대수익률(Cap Rate) & 자산 매각가치 계산기', price: 49000, gift: '수익형 부동산 밸류에이션 리포트', icon: '🏢' },
  { id: 'acquisition_tax', cat: 'real_estate', catName: '부동산', engine: 'tax', name: '주택 취득세·양도소득세 1초 자동 시뮬레이터', price: 39000, gift: '다주택자 절세 합법 가이드', icon: '📑' },
  { id: 'fin_traffic_valuation', cat: 'finance_wealth', catName: '재테크', engine: 'adsense', name: '금융 경제 블로그 트래픽 자산가치 산출기', price: 49000, gift: '금융 키워드 CPC $10+ 키워드북', icon: '💰' },
  { id: 'stock_compound_margin', cat: 'finance_wealth', catName: '재테크', engine: 'margin', name: '미국 배당주 재투자(DRIP) 복리 수익률 계산기', price: 39000, gift: '월배당 포트폴리오 노션 템플릿', icon: '📈' },
  { id: 'crypto_tax_calc', cat: 'finance_wealth', catName: '재테크', engine: 'tax', name: '가상자산 해외 코인 양도소득세 1초 계산기', price: 39000, gift: '코인 과세 대비 절세 체크리스트', icon: '🪙' },
  { id: 'store_traffic_val', cat: 'ecommerce', catName: '이커머스', engine: 'adsense', name: '스마트스토어 유입 트래픽 가치 산출기', price: 39000, gift: '네이버 쇼핑 검색노출 SEO 비법서', icon: '🛍️' },
  { id: 'inventory_runway', cat: 'ecommerce', catName: '이커머스', engine: 'compound', name: '이커머스 재고 소진 & 발주 D-Day 예측기', price: 39000, gift: '재고관리 턴키 엑셀 시트', icon: '📦' },

  // 2. 전문직 수임 & B2B 사업자 도구
  { id: 'franchise_roi', cat: 'food_beverage', catName: '외식업', engine: 'adsense', name: '프랜차이즈 가맹점 예상 권리금 자산가치 계산기', price: 49000, gift: '상가 권리금 계약서 특약 체크리스트', icon: '☕' },
  { id: 'restaurant_vat', cat: 'food_beverage', catName: '외식업', engine: 'tax', name: '식당 의제매입세액 공제 & 부가세 절세 계산기', price: 39000, gift: '외식업 세무 조사 방어 절세 가이드', icon: '🧾' },
  { id: 'gym_brand_traffic', cat: 'fitness_health', catName: '피트니스', engine: 'adsense', name: '피트니스 블로그 건강 정보 트래픽 가치 산출기', price: 39000, gift: '건강 블로그 애드센스 고수익 키워드', icon: '🏋️' },
  { id: 'bodyfat_target_dday', cat: 'fitness_health', catName: '피트니스', engine: 'compound', name: '바디프로필 목표 체지방률 D-Day 플래너', price: 29000, gift: '바프 100일 감량 타임라인', icon: '🎯' },
  { id: 'pt_lesson_margin', cat: 'fitness_health', catName: '피트니스', engine: 'margin', name: '피트니스 센터 PT 강사 셰어 & 마진 계산기', price: 39000, gift: 'PT 스튜디오 운영 관리 시트', icon: '💪' },
  { id: 'pet_traffic_val', cat: 'pet_lifestyle', catName: '반려동물', engine: 'adsense', name: '반려동물 블로그 제휴 마케팅 트래픽 가치 산출기', price: 39000, gift: '쿠팡 파트너스 펫용품 고수익 키워드', icon: '🐶' },
  { id: 'pet_insurance_deduct', cat: 'pet_lifestyle', catName: '반려동물', engine: 'tax', name: '펫보험 자기부담금 vs 병원비 실수령 계산기', price: 39000, gift: '펫보험 3사 보장 비교표', icon: '🏥' },
  { id: 'travel_blog_val', cat: 'travel_global', catName: '여행', engine: 'adsense', name: '여행 블로그 트래픽 & 아고다 제휴 수익 산출기', price: 39000, gift: '호텔 제휴마케팅 수익화 치트시트', icon: '✈️' },
  { id: 'tour_package_margin', cat: 'travel_global', catName: '여행', engine: 'margin', name: '맞춤형 프라이빗 투어 마진 & 견적 계산기', price: 39000, gift: '현지 여행사 B2B 원가표', icon: '🗺️' },
  { id: 'edu_traffic_val', cat: 'creator_education', catName: '지식창업', engine: 'adsense', name: '지식 블로그 애드센스 & 코칭 제안 가치 산출기', price: 39000, gift: '지식 블로그 브랜딩 로드맵', icon: '🎓' },
  { id: 'course_launch_margin', cat: 'creator_education', catName: '지식창업', engine: 'margin', name: '전자책/강의 런칭 순수익 & 플랫폼 수수료 계산기', price: 49000, gift: '전자책 1권으로 1000만원 버는 법', icon: '📚' },
  { id: 'freelance_withholding_tax', cat: 'creator_education', catName: '지식창업', engine: 'tax', name: '3.3% 원천징수 프리랜서 종합소득세 환급 계산기', price: 39000, gift: '프리랜서 3.3% 100% 환급 매뉴얼', icon: '💻' },
  { id: 'car_traffic_val', cat: 'automotive_mobility', catName: '자동차', engine: 'adsense', name: '자동차 시승기 블로그 트래픽 가치 산출기', price: 39000, gift: '자동차 블로그 고단가 CPC 키워드', icon: '🚗' },
  { id: 'used_car_margin', cat: 'automotive_mobility', catName: '자동차', engine: 'margin', name: '중고차 딜러 실매입가 & 상사 매도 마진 계산기', price: 49000, gift: '중고차 침수차 구별 5대 체크포인트', icon: '🚘' },
  { id: 'lease_vs_rent_dday', cat: 'automotive_mobility', catName: '자동차', engine: 'compound', name: '장기렌트 vs 운용리스 총비용 비교 시뮬레이터', price: 39000, gift: '장기렌트 계약 전 특약 체크리스트', icon: '📋' },
  { id: 'wedding_traffic_val', cat: 'wedding_event', catName: '웨딩', engine: 'adsense', name: '결혼 준비 블로그 제휴 마케팅 가치 산출기', price: 39000, gift: '웨딩 카페 바이럴 마케팅 매뉴얼', icon: '💍' },
  { id: 'wedding_gift_tax', cat: 'wedding_event', catName: '웨딩', engine: 'tax', name: '신혼부부 혼수·증여세 1억 비과세 절세 계산기', price: 39000, gift: '혼수 증여세 합법 비과세 가이드', icon: '👰' },

  // 3. VIP 프라이빗 시크릿 룸 & 도어락 엔진
  { id: 'secret_listing', cat: 'real_estate', catName: '부동산', engine: 'secret', name: 'VIP 전용 급매물 정보 열람 시크릿 룸', price: 39000, gift: '경매 급매물 선별 노하우 리포트', icon: '🔐' },
  { id: 'secret_coupon', cat: 'ecommerce', catName: '이커머스', engine: 'secret', name: '단골 고객 전용 시크릿 할인코드 & 히든 룸 팟', price: 29000, gift: '재구매율 80% 고객 락인 매뉴얼', icon: '🏷️' },
  { id: 'secret_recipe_room', cat: 'food_beverage', catName: '외식업', engine: 'secret', name: '단골 전용 시크릿 시즌 한정 메뉴 룸', price: 29000, gift: '시그니처 음료 베이스 레시피 5선', icon: '🍹' },
  { id: 'secret_vip_workout', cat: 'fitness_health', catName: '피트니스', engine: 'secret', name: 'VIP 회원 전용 홈트 루틴 비디오 히든 룸', price: 29000, gift: '통증 완화 스트레칭 10선 영상 리스트', icon: '🧘' },
  { id: 'secret_stock_report', cat: 'finance_wealth', catName: '재테크', engine: 'secret', name: 'VIP 구독자 전용 히든 종목 분석 리포트 룸', price: 49000, gift: '기관 수급 분석 치트시트', icon: '📊' },
  { id: 'secret_snack_recipe', cat: 'pet_lifestyle', catName: '반려동물', engine: 'secret', name: '단골 반려인 전용 자연식 시크릿 레시피 룸', price: 29000, gift: '알러지 프리 자연식 레시피 3선', icon: '🍖' },
  { id: 'secret_travel_spot', cat: 'travel_global', catName: '여행', engine: 'secret', name: '현지인만 아는 시크릿 숨은 맛집 히든 룸', price: 29000, gift: '로컬 노포 맛집 비밀 지도 PDF', icon: '🧭' },
  { id: 'secret_vip_webinar', cat: 'creator_education', catName: '지식창업', engine: 'secret', name: 'VIP 수강생 전용 비밀 라이브 웨비나 룸', price: 39000, gift: '비공개 Q&A 녹화본 리스트', icon: '🎥' },
  { id: 'secret_discount_car', cat: 'automotive_mobility', catName: '자동차', engine: 'secret', name: '이달의 비공식 프로모션 할인 재고 시크릿 룸', price: 29000, gift: '수입차 비공식 할인 공략법', icon: '🏎️' },
  { id: 'secret_wedding_coupon', cat: 'wedding_event', catName: '웨딩', engine: 'secret', name: '제휴 혼수 가전 VIP 추가 할인 시크릿 룸', price: 29000, gift: '백화점 가전 졸업 견적표', icon: '🎁' },

  // 4. 프리미엄 3D 신뢰 명함 팟
  { id: 'realtor_bizcard', cat: 'real_estate', catName: '부동산', engine: 'card3d', name: '공인중개사 & 분양상담사 3D 신뢰 명함 팟', price: 29000, gift: '우수 중개사 매물 브리핑 양식', icon: '🏡' },
  { id: 'planner_fp_bizcard', cat: 'finance_wealth', catName: '재테크', engine: 'card3d', name: '재무설계사 & 세무사 3D 신뢰 자산 명함 팟', price: 29000, gift: '재무 진단 초기 인터뷰 양식', icon: '💼' }
];

function generate100Products() {
  const allProducts = [];
  let index = 1;

  for (const vert of VERTICALS) {
    for (const niche of vert.niches) {
      const eng = ENGINES.find(e => e.id === niche.engine) || ENGINES[0];

      allProducts.push({
        matrix_index: index,
        id: niche.id,
        category: vert.cat,
        category_name: vert.catName,
        engine_type: niche.engine,
        tier: 'scholarship_free',
        name: niche.name,
        tagline: `${vert.catName} 특화 1초 인터랙티브 솔루션`,
        desc: `${niche.name} 도구입니다. 웹사이트 방문자 체류시간을 극대화하고 리드를 수집합니다. 100인 도메인 장학 100% 무상 배정 팟.`,
        price: 0,
        original_value: 100000,
        commission_rate: 0.25,
        maza_commission: 0,
        setupod_payout: 0,
        free_gift: {
          title: niche.gift,
          url: `https://setupod.com/leads/setupod_starter_kit.html?niche=${encodeURIComponent(niche.id)}`
        },
        preview_url: `https://setupod.com${eng.base}?niche=${encodeURIComponent(niche.id)}`,
        embed_url: `https://setupod.com/embed/${eng.base.replace('/', '')}?niche=${encodeURIComponent(niche.id)}`,
        badge: '🎓 100% 무상 장학 팟',
        icon: eng.icon
      });
      index++;
    }
  }

  return allProducts;
}

function generate35PremiumProducts() {
  const premiumList = [];

  for (const item of PREMIUM_35_NICHES) {
    const eng = ENGINES.find(e => e.id === item.engine) || ENGINES[0];
    const price = item.price;
    const mazaFee = Math.round(price * 0.25);
    const setupodPay = Math.round(price * 0.75);

    premiumList.push({
      id: item.id,
      category: item.cat,
      category_name: item.catName,
      engine_type: item.engine,
      tier: 'premium',
      name: item.name,
      tagline: `${item.catName} 고수익·고가치 프리미엄 솔루션`,
      desc: `${item.name}. 고단가 리드 수집 및 웹사이트 매각 가치를 극대화하는 실전 비즈니스 팟.`,
      price: price,
      commission_rate: 0.25,
      maza_commission: mazaFee,
      setupod_payout: setupodPay,
      free_gift: {
        title: item.gift,
        url: `https://setupod.com/leads/setupod_starter_kit.html?niche=${encodeURIComponent(item.id)}`
      },
      preview_url: `https://setupod.com${eng.base}?niche=${encodeURIComponent(item.id)}`,
      embed_url: `https://setupod.com/embed/${eng.base.replace('/', '')}?niche=${encodeURIComponent(item.id)}`,
      badge: '💎 마켓 프리미엄 팟',
      icon: item.icon || eng.icon
    });
  }

  return premiumList;
}

module.exports = {
  ENGINES,
  VERTICALS,
  PREMIUM_35_NICHES,
  generate100Products,
  generate35PremiumProducts
};
