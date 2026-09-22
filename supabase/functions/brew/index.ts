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

    const { memo, days } = await req.json();

    if (!memo || !days) {
      return new Response(JSON.stringify({ error: 'Missing memo or days' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call Gemini API
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not set');
    }

    const prompt = `
당신은 마케팅 카피라이터입니다. 다음 메모를 바탕으로 각 플랫폼 성격에 맞는 3가지 버전의 글을 작성해 주세요.
메모: "${memo}"

1. 스레드(Threads)용: 트렌디하고 짧은 호흡, 친근한 말투, 스레드 감성에 맞게.
2. 인스타그램 캡션용: 감성적이고 이모지와 해시태그를 적절히 활용.
3. 카카오톡 채널 공지용: 정중하고 정보 전달 위주, 혜택이나 내용을 명확하게.

응답은 반드시 아래 JSON 형식으로만 해주세요 (마크다운 포맷 기호 없이 순수 JSON만 반환).
{
  "threads": "스레드 내용",
  "insta": "인스타 내용",
  "kakao": "카카오톡 내용"
}
    `;

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
    unlockAt.setHours(unlockAt.getHours() + (days * 24)); // 1일 또는 3일 후

    // Insert into DB
    const { error: dbError } = await supabaseClient
      .from('brewoak_jobs')
      .insert({
        user_id: user.id,
        memo: memo,
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
