import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Noto+Sans:wght@400;500;600;700&family=Fustat:wght@400;500;600;700&display=swap';

// ── SVG icons ────────────────────────────────────────────────────────────────
const ChevronIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const UpArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 12V4M4 8l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 1l1.5 4H13l-3.5 2.5L11 12 7 9.5 3 12l1.5-4.5L1 5h4.5z" fill="currentColor" />
  </svg>
);
const SparkleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 2l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" fill="currentColor" />
    <path d="M13 1l.5 1.5L15 3l-1.5.5L13 5l-.5-1.5L11 3l1.5-.5z" fill="currentColor" opacity="0.6" />
  </svg>
);
const AttachIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M12 6.5L6.5 12A3.5 3.5 0 012 7.5l5.5-5.5A2 2 0 0110 5l-5 5A.5.5 0 014 9.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const MicIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="5" y="1" width="4" height="7" rx="2" stroke="currentColor" strokeWidth="1.2" />
    <path d="M2.5 7a4.5 4.5 0 009 0M7 11.5V13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.2" />
    <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

// ── Video Background ──────────────────────────────────────────────────────────
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

// ── Nav ───────────────────────────────────────────────────────────────────────
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

// ── Search Box ────────────────────────────────────────────────────────────────
function AskBox({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div style={{
      width: '100%',
      maxWidth: 728,
      background: 'rgba(0,0,0,0.24)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderRadius: 18,
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontFamily: "'Schibsted Grotesk', sans-serif",
            fontWeight: 500,
            fontSize: 12,
            color: '#fff',
          }}>
            240 / 500 rows validated
          </span>
          <button style={{
            background: 'rgba(90,225,76,0.89)',
            border: 'none',
            borderRadius: 6,
            padding: '2px 10px',
            fontSize: 11,
            fontWeight: 600,
            color: '#0a2e08',
            cursor: 'pointer',
            fontFamily: "'Schibsted Grotesk', sans-serif",
          }}>
            Upgrade
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.7)' }}>
          <SparkleIcon />
          <span style={{
            fontFamily: "'Schibsted Grotesk', sans-serif",
            fontWeight: 500,
            fontSize: 12,
            color: 'rgba(255,255,255,0.75)',
          }}>
            Powered by Claude AI
          </span>
        </div>
      </div>

      {/* Input area */}
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}>
        <input
          placeholder="Ask about your data, e.g. 'Why are phone numbers failing?'"
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: 16,
            color: 'rgba(0,0,0,0.85)',
            background: 'transparent',
            fontFamily: "'Inter', sans-serif",
          }}
        />
        <button
          onClick={onGetStarted}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: '#000',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#fff',
            flexShrink: 0,
          }}>
          <UpArrowIcon />
        </button>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { label: 'Upload CSV', icon: <AttachIcon /> },
            { label: 'Voice', icon: <MicIcon /> },
            { label: 'Examples', icon: <SearchIcon /> },
          ].map(({ label, icon }) => (
            <button
              key={label}
              onClick={label === 'Upload CSV' ? onGetStarted : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '5px 10px',
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: 6,
                color: 'rgba(255,255,255,0.85)',
                fontSize: 12,
                fontFamily: "'Schibsted Grotesk', sans-serif",
                fontWeight: 500,
                cursor: 'pointer',
              }}>
              {icon}
              {label}
            </button>
          ))}
        </div>
        <span style={{
          fontSize: 12,
          color: 'rgba(255,255,255,0.45)',
          fontFamily: "'Schibsted Grotesk', sans-serif",
        }}>
          0 / 3,000
        </span>
      </div>
    </div>
  );
}

// ── Landing Page ──────────────────────────────────────────────────────────────
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
