const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || "https://xhjauoabxybaksvbtcic.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoamF1b2FieHliYWtzdmJ0Y2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMzg0NzQsImV4cCI6MjEwNDYxNDQ3NH0.wBK3-8IIq3JKYbMrVlLtx6rRPRmhCblm74EwL_3PxBY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

module.exports = async (req, res) => {
  let { slug } = req.query;
  
  if (!slug) {
    slug = 'setupod'; // Default fallback
  }

  try {
    // 1. Fetch Pod Data
    const { data: pod } = await supabase
      .from('pods')
      .select('components_json')
      .eq('slug', slug)
      .single();

    let title = "SETUPOD 3D 명함";
    let subtitle = "All-in-one Business Asset";
    let company = "";

    if (pod && pod.components_json && pod.components_json.card) {
      const card = pod.components_json.card;
      title = card.name || title;
      subtitle = card.role || subtitle;
      company = card.company || company;
    }

    // 2. Read HTML template (card.html)
    const htmlPath = path.join(process.cwd(), 'card.html');
    let html = fs.readFileSync(htmlPath, 'utf8');

    // 3. Inject Meta Tags
    const ogImageUrl = `https://setupod.com/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(subtitle)}&company=${encodeURIComponent(company)}`;
    
    const metaTags = `
      <title>${title} | SETUPOD</title>
      <meta property="og:title" content="${title} - ${company}" />
      <meta property="og:description" content="${subtitle}" />
      <meta property="og:image" content="${ogImageUrl}" />
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:image" content="${ogImageUrl}" />
    `;

    // Inject before </head>
    html = html.replace('</head>', `${metaTags}\n</head>`);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate'); // CDN caching
    return res.status(200).send(html);
    
  } catch (err) {
    console.error("Render API Error:", err);
    // Even if it fails, serve the raw HTML so it doesn't break
    const htmlPath = path.join(process.cwd(), 'card.html');
    let html = fs.readFileSync(htmlPath, 'utf8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  }
};
