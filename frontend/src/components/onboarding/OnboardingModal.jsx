import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { TrendingUp, Cpu, Pin } from 'lucide-react';

const STORAGE_KEY = 'vifm-onboarding-done';

const slides = [
  {
    id: 'welcome',
    icon: null, // uses logo
    title: 'Welcome to Ashom',
    subtitle: 'Your GCC Financial Intelligence Platform',
    detail: '820+ companies \u00b7 6 markets \u00b7 Real-time data',
  },
  {
    id: 'markets',
    icon: TrendingUp,
    iconBg: '#EBF3FB',
    iconFg: '#3878BE',
    title: 'Live GCC Markets',
    subtitle: 'Track stocks, metals, oil, and crypto across all 6 GCC exchanges in real time.',
  },
  {
    id: 'ai',
    icon: Cpu,
    iconBg: '#F0EEFE',
    iconFg: '#7C5FDB',
    title: 'AI Financial Analyst',
    subtitle: 'Ask questions about any company, sector, or market trend. Get instant analysis powered by AI.',
  },
  {
    id: 'yours',
    icon: Pin,
    iconBg: '#E6FAF5',
    iconFg: '#00C896',
    title: 'Make It Yours',
    subtitle: 'Pin your favorite tools, companies, and market data to your personal home screen.',
    isLast: true,
  },
];

export default function OnboardingModal({ onComplete }) {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  const finish = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    onComplete();
  }, [onComplete]);

  const goNext = useCallback(() => {
    if (current === slides.length - 1) {
      finish();
      return;
    }
    setFading(true);
    setTimeout(() => {
      setCurrent(prev => prev + 1);
      setFading(false);
    }, 200);
  }, [current, finish]);

  const slide = slides[current];

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        background: '#fff',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 430,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Skip button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 20px 0' }}>
          <button
            onClick={finish}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 12,
              color: 'var(--text-3, #9CA3AF)',
              fontFamily: 'inherit',
            }}
          >
            Skip
          </button>
        </div>

        {/* Slide content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 32px',
            opacity: fading ? 0 : 1,
            transition: 'opacity 200ms ease',
          }}
        >
          {/* Icon / Logo */}
          {slide.icon ? (
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: slide.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}
            >
              <slide.icon size={28} color={slide.iconFg} strokeWidth={2} />
            </div>
          ) : (
            /* Logo square */
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 8,
                background: 'var(--navy, #000032)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}
            >
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 16, fontFamily: 'var(--font-head, inherit)' }}>
                A
              </span>
            </div>
          )}

          {/* Title */}
          <h2
            style={{
              fontFamily: 'var(--font-head, inherit)',
              fontSize: current === 0 ? 22 : 18,
              fontWeight: 700,
              color: 'var(--navy, #000032)',
              margin: 0,
              textAlign: 'center',
            }}
          >
            {slide.title}
          </h2>

          {/* Subtitle */}
          <p
            style={{
              fontSize: current === 0 ? 14 : 13,
              color: 'var(--text-2, #6B7280)',
              textAlign: 'center',
              lineHeight: 1.55,
              margin: '12px 0 0',
              maxWidth: 300,
            }}
          >
            {slide.subtitle}
          </p>

          {/* Detail line (slide 1 only) */}
          {slide.detail && (
            <p
              style={{
                fontSize: 12,
                color: 'var(--text-3, #9CA3AF)',
                textAlign: 'center',
                margin: '8px 0 0',
              }}
            >
              {slide.detail}
            </p>
          )}
        </div>

        {/* Bottom section: dots + button */}
        <div style={{ padding: '0 24px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          {/* Progress dots */}
          <div style={{ display: 'flex', gap: 8 }}>
            {slides.map((_, i) => (
              <div
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: i === current ? 'var(--navy, #000032)' : 'var(--border, #E5E7EB)',
                  transition: 'background 200ms ease',
                }}
              />
            ))}
          </div>

          {/* Action button */}
          <button
            onClick={goNext}
            style={{
              width: '100%',
              height: 48,
              borderRadius: 6,
              border: 'none',
              background: 'var(--navy, #000032)',
              color: '#fff',
              fontSize: 15,
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            {slide.isLast ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
