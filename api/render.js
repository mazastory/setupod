const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || "https://xhjauoabxybaksvbtcic.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoamF1b2FieHliYWtzdmJ0Y2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMzg0NzQsImV4cCI6MjEwNDYxNDQ3NH0.wBK3-8IIq3JKYbMrVlLtx6rRPRmhCblm74EwL_3PxBY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

module.exports = async (req, res) => {
  let { slug } = req.query;
  
  const reqUrl = req.url || '';
  if ((slug && (slug.startsWith('embed') || slug.includes('embed'))) || reqUrl.includes('embed')) {
    const embedHtmlPath = path.join(process.cwd(), 'embed', 'index.html');
    if (fs.existsSync(embedHtmlPath)) {
      const html = fs.readFileSync(embedHtmlPath, 'utf8');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }
  }

  if ((slug && (slug.startsWith('dashboard') || slug.includes('dashboard'))) || reqUrl.includes('dashboard')) {
    const dashHtmlPath = path.join(process.cwd(), 'dashboard', 'index.html');
    if (fs.existsSync(dashHtmlPath)) {
      const html = fs.readFileSync(dashHtmlPath, 'utf8');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }
  }

  if (!slug) {
    slug = 'setupod'; // Default fallback
  }

  return res.redirect(301, 'https://toomcard.com/card?id=' + encodeURIComponent(slug));
};
