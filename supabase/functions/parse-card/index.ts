import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { imageBase64 } = await req.json()

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: 'No image provided' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is missing' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
    
    const base64Data = imageBase64.includes('base64,') 
      ? imageBase64.split('base64,')[1] 
      : imageBase64;

    const payload = {
      contents: [
        {
          parts: [
            {
              text: `You are an expert business card data extractor. Extract the information from this business card image and format it as a valid JSON object. 
              Do not include markdown blocks like \`\`\`json. Return ONLY the raw JSON.
              Use the following keys:
              - name (string)
              - role (string, e.g., "CEO", "Manager")
              - company (string)
              - phone (string, format nicely like "010-1234-5678")
              - email (string)
              - slogan (string, a short 1-line catchy phrase representing the person or company based on the card's vibe or explicit text)
              - tagline (string, very short 2-3 word English tagline like "GLOBAL INNOVATION")
              
              If any information is missing, return an empty string. Make sure it's valid JSON.`
            },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json"
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API Error:", errText);
      throw new Error(`Gemini API responded with ${response.status}`);
    }

    const geminiData = await response.json();
    const resultText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) {
      throw new Error('No text returned from Gemini');
    }

    let parsedJson = {};
    try {
      parsedJson = JSON.parse(resultText.trim());
    } catch (e) {
      console.error("Failed to parse Gemini output as JSON:", resultText);
      throw new Error('Invalid JSON format returned from Gemini');
    }

    return new Response(JSON.stringify({ data: parsedJson }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
