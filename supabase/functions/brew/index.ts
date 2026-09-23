// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } },
      }
    );

    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { memo, barrelType } = await req.json();

    if (!memo || !barrelType) {
      return new Response(JSON.stringify({ error: 'Missing memo or barrelType' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call Gemini API
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not set');
    }

    let prompt = "";
    let days = 1;
    
    if (barrelType === 'emotion') {
      days = 1;
      prompt = `
당신은 위기 관리 전문가이자 이성적인 커뮤니케이터입니다. 다음 홧김에 쓰여진 감정적인 메모를 바탕으로, 감정을 배제하고 핵심(불만/요구사항)만 추출하여 정중하고 논리적인 3가지 포맷으로 재작성해 주세요.
메모: "${memo}"

1. 스레드(Threads)용: 너무 딱딱하지 않지만 정중하고 이성적인 어조.
2. 인스타그램 캡션용: 차분한 감성과 객관적인 사실 위주의 내용.
3. 카카오톡/이메일 전송용: 상대방을 논리적으로 압도하면서도 프로페셔널한 정중한 메시지.

응답은 반드시 아래 JSON 형식으로만 해주세요.
{ "threads": "스레드 내용", "insta": "인스타 내용", "kakao": "카카오톡 내용" }
      `;
    } else if (barrelType === 'knowledge') {
      days = 3;
      prompt = `
당신은 업계 최고 수준의 비즈니스 컨설턴트이자 칼럼니스트입니다. 다음 얕고 파편적인 아이디어 메모를 심도 있는 인사이트가 담긴 3가지 포맷의 기획서/칼럼으로 확장해 주세요.
메모: "${memo}"

1. 스레드(Threads)용: 핵심 인사이트를 요약하여 호기심을 유발하는 어조.
2. 인스타그램 캡션용: 정보 전달력을 높이는 전문적인 비즈니스 톤 앤 매너.
3. 카카오톡 채널/이메일 폼: 엘리베이터 피치 형식의 완벽한 사업 기획서 또는 제안서 요약.

응답은 반드시 아래 JSON 형식으로만 해주세요.
{ "threads": "스레드 내용", "insta": "인스타 내용", "kakao": "카카오톡 내용" }
      `;
    } else if (barrelType === 'time') {
      days = 7;
      prompt = `
당신은 심리 상담가이자 따뜻한 에세이스트입니다. 다음 파편적인 일상 메모를 제3자의 관점에서 해석하여 깊이 있고 따뜻한 위로를 주는 3가지 포맷의 에세이로 작성해 주세요.
메모: "${memo}"

1. 스레드(Threads)용: 깊은 여운을 남기는 감성적인 짧은 글.
2. 인스타그램 캡션용: 따뜻한 위로와 성찰이 담긴 감성 에세이 캡션.
3. 카카오톡/개인 기록용: 스스로를 토닥여주는 따뜻하고 통찰력 있는 긴 회고록 형식.

응답은 반드시 아래 JSON 형식으로만 해주세요.
{ "threads": "스레드 내용", "insta": "인스타 내용", "kakao": "카카오톡 내용" }
      `;
    } else {
      throw new Error('Invalid barrelType');
    }

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json" }
      })
    });

    if (!geminiRes.ok) {
        const errText = await geminiRes.text();
        console.error("Gemini API Error:", errText);
        throw new Error('LLM Generation Failed');
    }

    const geminiData = await geminiRes.json();
    let resultJson = geminiData.candidates[0].content.parts[0].text;
    
    // Parse result
    const parsed = JSON.parse(resultJson);

    // Calculate unlock_at
    const unlockAt = new Date();
    unlockAt.setHours(unlockAt.getHours() + (days * 24)); // 오크통 타입별 1, 3, 7일 숙성

    // Insert into DB
    const { error: dbError } = await supabaseClient
      .from('brewoak_jobs')
      .insert({
        user_id: user.id,
        memo: memo,
        barrel_type: barrelType,
        target_days: days,
        threads_out: parsed.threads,
        insta_out: parsed.insta,
        kakao_out: parsed.kakao,
        unlock_at: unlockAt.toISOString(),
      });

    if (dbError) throw dbError;

    return new Response(JSON.stringify({ success: true, unlock_at: unlockAt }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
