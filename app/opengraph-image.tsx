import { ImageResponse } from 'next/og';

// Image metadata
export const alt = 'Eredeti Csakra - Fedezd fel csakráid állapotát';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Image generation
export default async function Image() {
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
          background: 'linear-gradient(135deg, #7e22ce 0%, #9333ea 50%, #db2777 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '15%',
            right: '15%',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
            display: 'flex',
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px',
            textAlign: 'center',
          }}
        >
          {/* Logo/Icon placeholder */}
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              border: '4px solid rgba(255, 255, 255, 0.5)',
              marginBottom: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '60px',
            }}
          >
            ✨
          </div>

          {/* Main title */}
          <h1
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '24px',
              letterSpacing: '-2px',
              textShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              lineHeight: 1.2,
            }}
          >
            Eredeti Csakra
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '32px',
              color: 'rgba(255, 255, 255, 0.95)',
              marginBottom: '20px',
              fontWeight: '500',
              lineHeight: 1.4,
            }}
          >
            Fedezd fel csakráid állapotát
          </p>

          {/* Additional text */}
          <p
            style={{
              fontSize: '24px',
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: '400',
            }}
          >
            Ingyenes teszt • 3 perc • Azonnali eredmény
          </p>
        </div>

        {/* Bottom badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            background: 'rgba(255, 255, 255, 0.15)',
            padding: '12px 32px',
            borderRadius: '50px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: '20px',
              color: 'white',
              fontWeight: '600',
              letterSpacing: '1px',
            }}
          >
            eredeticsakra.hu
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
