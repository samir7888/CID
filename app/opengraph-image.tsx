import { ImageResponse } from 'next/og';

export const alt = 'C.I.D. Game — Run from ACP Pradyuman! Free Online 3D Endless Runner';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #080b0c 0%, #11191a 50%, #0d1a1c 100%)',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Radial glow background */}
        <div
          style={{
            position: 'absolute',
            width: '700px',
            height: '700px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(228,85,74,0.25) 0%, transparent 70%)',
            top: '-100px',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        />
        {/* Pink accent glow */}
        <div
          style={{
            position: 'absolute',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,111,145,0.15) 0%, transparent 70%)',
            bottom: '-120px',
            right: '-80px',
          }}
        />

        {/* Kicker label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '3px',
              background: '#e8554a',
              borderRadius: '2px',
            }}
          />
          <span
            style={{
              fontSize: '20px',
              fontWeight: 700,
              letterSpacing: '0.25em',
              color: '#e8554a',
              textTransform: 'uppercase',
            }}
          >
            FREE BROWSER GAME
          </span>
          <div
            style={{
              width: '40px',
              height: '3px',
              background: '#e8554a',
              borderRadius: '2px',
            }}
          />
        </div>

        {/* Main title */}
        <div
          style={{
            fontSize: '100px',
            fontWeight: 900,
            letterSpacing: '0.04em',
            color: '#f8f4e8',
            lineHeight: 1,
            textTransform: 'uppercase',
            display: 'flex',
          }}
        >
          C.I.D.
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '28px',
            fontWeight: 600,
            color: '#9da6a8',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginTop: '12px',
            marginBottom: '36px',
          }}
        >
          CHODU INVESTIGATION DEPARTMENT
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: '26px',
            fontWeight: 500,
            color: '#c8d0d2',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: 1.5,
          }}
        >
          🏃 Run from ACP Pradyuman through chaotic Indian streets!
        </div>

        {/* Tags */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginTop: '40px',
          }}
        >
          {['3D ENDLESS RUNNER', 'FREE TO PLAY', 'PLAY IN BROWSER'].map((tag) => (
            <div
              key={tag}
              style={{
                padding: '8px 20px',
                borderRadius: '4px',
                border: '1px solid rgba(248,244,232,0.2)',
                fontSize: '16px',
                fontWeight: 700,
                color: '#f8f4e8',
                letterSpacing: '0.12em',
              }}
            >
              {tag}
            </div>
          ))}
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '36px',
            right: '48px',
            fontSize: '18px',
            color: '#4d5d60',
            letterSpacing: '0.05em',
          }}
        >
          choducid.basnetsameer.com.np
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
