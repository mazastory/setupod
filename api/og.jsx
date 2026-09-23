import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'SETUPOD';
    const subtitle = searchParams.get('subtitle') || '3D 명함 플랫폼';
    const company = searchParams.get('company') || '';
    
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#09090b',
            color: 'white',
            fontFamily: 'sans-serif',
            backgroundImage: 'radial-gradient(circle at 25px 25px, #27272a 2%, transparent 0%), radial-gradient(circle at 75px 75px, #27272a 2%, transparent 0%)',
            backgroundSize: '100px 100px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', padding: '60px 80px', background: 'rgba(255,255,255,0.03)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', maxWidth: '900px', width: '90%' }}>
            {company && <h2 style={{ fontSize: '36px', color: '#c084fc', margin: '0 0 20px 0', fontWeight: '600' }}>{company}</h2>}
            <h1 style={{ fontSize: '72px', margin: '0 0 24px 0', fontWeight: '800', background: 'linear-gradient(90deg, #a855f7, #ec4899)', backgroundClip: 'text', color: 'transparent' }}>{title}</h1>
            <p style={{ fontSize: '32px', color: '#a1a1aa', margin: 0, fontWeight: '500' }}>{subtitle}</p>
          </div>
          
          <div style={{ position: 'absolute', bottom: '40px', right: '50px', fontSize: '24px', color: '#52525b', fontWeight: 'bold' }}>
            SETUPOD
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error(e);
    return new Response(`Failed to generate the image`, { status: 500 });
  }
}
