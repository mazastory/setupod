import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

app = FastAPI(title="Setupod AI Agency API")

# 웹앱에서 로컬 서버로 호출할 수 있도록 CORS 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    topic: str
    item_count: int

# Gemini API Client 초기화 (환경변수의 GEMINI_API_KEY 자동 사용)
client = genai.Client()

system_instruction = """
당신은 '셋업팟 마케팅 대행사'의 천재 수석 편집장 1인 군단입니다. 
당신은 트렌드 스카우터, 카피라이터, 디자인 디렉터, 퍼블리셔의 모든 역할을 혼자서 완벽하게(단 1초만에) 수행합니다.
주어진 주제(Topic)에 대해 인스타 바이럴 카드뉴스 데이터를 완벽하게 구조화된 JSON 형식으로 기획하세요.

JSON 구조는 무조건 다음 형식을 따라야 합니다:
{
  "template_type": "type_a", // "type_a"(2단리스트), "type_b"(썸네일가이드), "type_c"(다크네온갤러리), "type_d"(VS비교차트) 중 주제에 가장 어울리는 포맷 하나 선택
  "headerData": {
    "subtitle": "셋업팟 인사이트 등 카드뉴스 상단 서브타이틀",
    "title": "카드뉴스 메인 후킹 제목 (type_a,b,c 전용)",
    "titleLeft": "왼쪽 큰 제목 (type_d 전용. 예: 과거 목표)",
    "titleRight": "오른쪽 큰 제목 (type_d 전용. 예: 현재 시스템)",
    "leftHeader": "왼쪽 테이블 헤더 (type_d 전용)",
    "rightHeader": "오른쪽 테이블 헤더 (type_d 전용)",
    "footer1": "하단 메시지 1 (type_d 전용)",
    "footer2": "하단 메시지 2 (type_d 전용)"
  },
  "itemsData": [
    // 요청받은 항목 개수(item_count)만큼 배열 생성
    // type_a, b, c로 결정한 경우: 
    //   { "title": "핵심 키워드", "desc": "상세한 설명 (2~3줄)", "icon": "fa-star" (적절한 FontAwesome 아이콘), "badge": "HOT" (선택) }
    // type_d (VS비교)로 결정한 경우: 
    //   { "leftDesc": "과거/안좋은 예시", "leftIcon": "fa-xmark", "rightDesc": "현재/좋은 예시", "rightIcon": "fa-check" }
  ],
  "caption": "인스타 게시글 본문 (줄바꿈 및 이모지 적극 활용, 사람들을 홀리는 텍스트)",
  "hashtags": "#마인드셋 #동기부여 #셋업팟 등 관련 해시태그 10개 (띄어쓰기로 구분)"
}
"""

@app.post("/generate")
def generate_content(req: GenerateRequest):
    print(f"🚀 AI 대행사 가동: 주제 [{req.topic}], 분량 [{req.item_count}개]")
    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=f"주제: {req.topic}\n항목 개수: {req.item_count}개\n\n위 주제에 맞춰 인스타 바이럴 카드뉴스를 기획해 반드시 올바른 JSON 포맷으로 출력해줘.",
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
            ),
        )
        # JSON 텍스트 파싱하여 반환
        return json.loads(response.text)
    except Exception as e:
        print(f"❌ 에러 발생: {e}")
        raise HTTPException(status_code=500, detail=str(e))
