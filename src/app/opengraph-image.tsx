import { ImageResponse } from 'next/og';

export const alt = 'KisanMitra by ANVAYA Agriculture OS';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const OG_COPY = {
  brand: 'ANVAYA · AGRICULTURE OS',
  title: 'KisanMitra',
  tagline: 'The right call, before the loss.',
  mark: 'AI',
} as const;

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          position: 'relative',
          display: 'flex',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          alignItems: 'center',
          background: 'linear-gradient(180deg, rgb(224 237 247), rgb(250 250 247) 45%, rgb(251 247 239))',
          color: 'rgb(26 31 26)',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -170,
            right: -80,
            width: 520,
            height: 520,
            borderRadius: 999,
            background: 'radial-gradient(circle, rgb(255 221 153 / 70%), rgb(255 221 153 / 0%) 68%)',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', width: 730, marginLeft: 96 }}>
          <div style={{ display: 'flex', color: 'rgb(20 107 50)', fontSize: 28, fontWeight: 700 }}>
            {OG_COPY.brand}
          </div>
          <div style={{ display: 'flex', marginTop: 18, fontSize: 96, fontWeight: 700, lineHeight: 1 }}>
            {OG_COPY.title}
          </div>
          <div style={{ display: 'flex', width: 118, height: 6, marginTop: 26, background: 'rgb(232 132 44)' }} />
          <div style={{ display: 'flex', marginTop: 28, color: 'rgb(61 69 61)', fontSize: 34 }}>
            {OG_COPY.tagline}
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            right: 92,
            bottom: 90,
            display: 'flex',
            width: 230,
            height: 230,
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid rgb(20 107 50 / 28%)',
            borderRadius: '50%',
            color: 'rgb(20 107 50)',
            fontSize: 108,
          }}
        >
          {OG_COPY.mark}
        </div>
        <div
          style={{
            position: 'absolute',
            left: -40,
            right: -40,
            bottom: 42,
            height: 100,
            borderTop: '3px solid rgb(20 107 50 / 24%)',
            borderRadius: '50% 50% 0 0',
          }}
        />
      </div>
    ),
    size,
  );
}
