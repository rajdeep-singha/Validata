import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Noto+Sans:wght@400;500;600;700&family=Fustat:wght@400;500;600;700&display=swap';

//  SVG icons 
const ChevronIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 1l1.5 4H13l-3.5 2.5L11 12 7 9.5 3 12l1.5-4.5L1 5h4.5z" fill="currentColor" />
  </svg>
);

// Video Background 
function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<number>(0);
  const fadingOutRef = useRef(false);

  function cancelFrame() {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
  }

  function fadeIn(video: HTMLVideoElement) {
    cancelFrame();
    fadingOutRef.current = false;
    const start = performance.now();
    const startOpacity = video.style.opacity ? parseFloat(video.style.opacity) : 0;

    function tick(now: number) {
      const progress = Math.min((now - start) / 250, 1);
      video.style.opacity = String(startOpacity + (1 - startOpacity) * progress);
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    }
    frameRef.current = requestAnimationFrame(tick);
  }

  function fadeOut(video: HTMLVideoElement, onDone: () => void) {
    if (fadingOutRef.current) return;
    fadingOutRef.current = true;
    cancelFrame();
    const start = performance.now();
    const startOpacity = parseFloat(video.style.opacity || '1');

    function tick(now: number) {
      const progress = Math.min((now - start) / 250, 1);
      video.style.opacity = String(startOpacity * (1 - progress));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        onDone();
      }
    }
    frameRef.current = requestAnimationFrame(tick);
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.style.opacity = '0';

    function onCanPlay() { fadeIn(video!); }

    function onTimeUpdate() {
      if (!video) return;
      const remaining = video.duration - video.currentTime;
      if (!isNaN(remaining) && remaining <= 0.55) {
        fadeOut(video, () => {});
      }
    }

    function onEnded() {
      if (!video) return;
      video.style.opacity = '0';
      fadingOutRef.current = false;
      setTimeout(() => {
        video.currentTime = 0;
        video.play().then(() => fadeIn(video!)).catch(() => {});
      }, 100);
    }

    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('ended', onEnded);
    return () => {
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('ended', onEnded);
      cancelFrame();
    };
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
      <video
        ref={videoRef}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260329_050842_be71947f-f16e-4a14-810c-06e83d23ddb5.mp4"
        autoPlay
        muted
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '115%',
          height: '115%',
          objectFit: 'cover',
          objectPosition: 'center top',
          opacity: 0,
        }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.18)' }} />
    </div>
  );
}

//  Nav 
function NavBar({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <nav style={{
      position: 'relative',
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 120px',
    }}>
      <span style={{
        fontFamily: "'Schibsted Grotesk', sans-serif",
        fontWeight: 600,
        fontSize: 24,
        letterSpacing: '-1.44px',
        color: '#fff',
      }}>
        Validata
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        {['Platform', 'Features', 'How It Works', 'Pricing'].map((item) => (
          <div key={item} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontFamily: "'Schibsted Grotesk', sans-serif",
            fontWeight: 500,
            fontSize: 16,
            letterSpacing: '-0.2px',
            color: 'rgba(255,255,255,0.88)',
            cursor: 'pointer',
          }}>
            {item}
            {item === 'Features' && <ChevronIcon />}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button style={{
          width: 82,
          padding: '8px 0',
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.4)',
          borderRadius: 8,
          color: '#fff',
          fontFamily: "'Schibsted Grotesk', sans-serif",
          fontWeight: 500,
          fontSize: 15,
          cursor: 'pointer',
        }}>
          Sign Up
        </button>
        <button
          onClick={onGetStarted}
          style={{
            width: 101,
            padding: '8px 0',
            background: '#000',
            border: 'none',
            borderRadius: 8,
            color: '#fff',
            fontFamily: "'Schibsted Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: 15,
            cursor: 'pointer',
          }}>
          Get Started
        </button>
      </div>
    </nav>
  );
}

// Landing Page 
export function LandingPage() {
  const navigate = useNavigate();
  const goToApp = () => navigate('/app');

  return (
    <>
      {/* Inject Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href={FONTS_URL} rel="stylesheet" />

      <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
        <VideoBackground />

        <div style={{
          position: 'relative',
          zIndex: 5,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <NavBar onGetStarted={goToApp} />

          {/* Hero content */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0,
            marginTop: -50,
            padding: '0 120px',
          }}>

            {/* Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 34,
            }}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                background: '#0e1311',
                color: '#fff',
                borderRadius: 20,
                padding: '4px 10px',
                fontSize: 12,
                fontFamily: "'Inter', sans-serif",
              }}>
                <StarIcon /> New
              </span>
              <span style={{
                background: 'rgba(255,255,255,0.92)',
                color: '#111',
                borderRadius: 20,
                padding: '4px 14px',
                fontSize: 14,
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400,
                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
              }}>
                AI column mapping &amp; auto-fix suggestions are here
              </span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontFamily: "'Fustat', sans-serif",
              fontWeight: 700,
              fontSize: 80,
              letterSpacing: '-4.8px',
              lineHeight: 1,
              color: '#fff',
              textAlign: 'center',
              margin: '0 0 34px 0',
              textShadow: '0 2px 24px rgba(0,0,0,0.3)',
            }}>
              Clean Data,<br />Zero Guesswork
            </h1>

            {/* Subtitle */}
            <p style={{
              fontFamily: "'Fustat', sans-serif",
              fontWeight: 500,
              fontSize: 20,
              letterSpacing: '-0.4px',
              color: 'rgba(255,255,255,0.82)',
              textAlign: 'center',
              maxWidth: 736,
              width: 542,
              margin: '0 0 44px 0',
            }}>
              Upload your CSV transaction file, let AI map your columns and detect errors — then download a validated, analysis-ready dataset in seconds.
            </p>

            {/* CTA button */}
            <button
              onClick={goToApp}
              style={{
                padding: '16px 48px',
                fontSize: 18,
                fontFamily: "'Fustat', sans-serif",
                fontWeight: 600,
                color: '#fff',
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.35)',
                borderRadius: 14,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                cursor: 'pointer',
                letterSpacing: '-0.3px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                transition: 'background 0.2s, border-color 0.2s',
              }}
              onMouseEnter={e => {
                (e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.22)';
                (e.target as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.6)';
              }}
              onMouseLeave={e => {
                (e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)';
                (e.target as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.35)';
              }}
            >
              Start Validating →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
