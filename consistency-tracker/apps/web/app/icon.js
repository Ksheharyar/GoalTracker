import { ImageResponse } from 'next/og';

export const size = {
  width: 64,
  height: 64,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '18px',
          background: 'linear-gradient(135deg, #67e8f9 0%, #5eead4 52%, #86efac 100%)',
          color: '#082f49',
        }}
      >
        <svg viewBox="0 0 48 48" width="42" height="42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 29.5C13 23.701 17.701 19 23.5 19H35" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M26.5 13.5L35.5 19L26.5 24.5" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 33.5L21 38.5L32.5 27" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    ),
    size
  );
}