import asyncio
import os
from dotenv import load_dotenv
from google.antigravity import Agent, LocalAgentConfig, types

# .env 파일에서 환경변수 로드
load_dotenv()

async def run_marketing_agency():
    # 1. Antigravity Agent Configuration
    config = LocalAgentConfig(
        capabilities=types.CapabilitiesConfig(
            enable_subagents=True, # 핵심: 서브에이전트(직원) 생성 권한 부여
        ),
        system_instruction="""
당신은 '셋업팟 마케팅 에이전시(Setupod Marketing Agency)'의 수석 편집장(Chief Editor)입니다.
당신의 임무는 매일 인스타그램에 업로드할 고품질 바이럴 카드뉴스를 기획하고 최종 결과물을 제출하는 것입니다.
이 목표를 달성하기 위해, 당신은 반드시 다음 4명의 특수 목적 서브에이전트(Subagents)를 생성하고 업무를 지시해야 합니다:

1. 'Trend Scouter' (트렌드 스카우터): 오늘자 가장 핫한 마케팅/생산성/도메인 플립 주제를 하나 발굴하라고 지시하세요.
2. 'Copywriter' (카피라이터): 스카우터가 찾은 주제를 전달하고, 인스타에서 터질만한 5장 분량의 고밀도 카드뉴스 본문(후킹 타이틀, 서브타이틀, 5개의 리스트 항목)을 작성하라고 지시하세요.
3. 'Design Director' (디자인 디렉터): 작성된 원고를 바탕으로 가장 어울리는 템플릿(Type A: 2단 리스트, Type B: 썸네일 리스트, Type C: 네온 갤러리, Type D: VS 비교)을 결정하고, 썸네일에 들어갈 이미지 프롬프트를 작성하라고 지시하세요.
4. 'Publisher' (퍼블리셔): 완성된 기획안을 바탕으로 인스타그램 캡션(본문)과 트렌디한 해시태그 15개를 작성하라고 지시하세요.

반드시 순차적으로 업무를 지시하고, 이전 에이전트의 결과물을 다음 에이전트에게 전달하세요.
모든 작업이 완료되면, 최종 결과를 HTML 렌더러가 바로 읽을 수 있는 형태의 깔끔한 JSON 포맷으로 묶어서 출력하세요.
"""
    )

    print("🚀 셋업팟 무인 AI 마케팅 대행사 가동 시작...")
    print("🤖 수석 편집장(Chief Editor)이 직원들을 깨우고 업무를 할당합니다...\n")
    
    try:
        async with Agent(config) as agent:
            # 에이전트에게 업무 지시 (프롬프트)
            response = await agent.chat("오늘의 마케팅 워크플로우를 시작해. 타겟은 한국의 1인 창업가, 자기계발러들이야. 완성되면 최종 JSON을 리포트해줘.")
            
            print("\n=======================================================")
            print("✅ [업무 완료] 대행사 최종 산출물 (JSON Report):")
            print("=======================================================\n")
            print(await response.text())
            
    except Exception as e:
        print(f"\n❌ 에이전트 실행 중 오류 발생: {e}")
        print("💡 팁: 환경 변수(GEMINI_API_KEY)가 설정되어 있는지 확인해주세요!")

if __name__ == "__main__":
    asyncio.run(run_marketing_agency())
