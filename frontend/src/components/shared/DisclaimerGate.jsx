import { useState, useEffect } from 'react';

/**
 * One-time blocking educational-use disclaimer, shown before the app is usable.
 *
 * The Flutter app has had this since launch (mobile_app/lib/widgets/disclaimer_gate.dart,
 * whose header comment already referred to "frontend/src/components/shared/DisclaimerGate.jsx").
 * That file never actually existed, so the web app shipped with no equivalent
 * notice at all — while presenting sample financial figures against the names of
 * real listed companies.
 *
 * Acceptance is stored in localStorage. Bumping DISCLAIMER_VERSION re-prompts
 * everyone, which is what you want if the wording changes materially.
 */

const STORAGE_KEY = 'ashom-disclaimer-accepted';
const DISCLAIMER_VERSION = '1';

export default function DisclaimerGate() {
  const [accepted, setAccepted] = useState(true); // assume accepted until checked, avoids a flash

  useEffect(() => {
    setAccepted(localStorage.getItem(STORAGE_KEY) === DISCLAIMER_VERSION);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, DISCLAIMER_VERSION);
    setAccepted(true);
  }

  if (accepted) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(1, 0, 49, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          background: 'var(--card)',
          borderRadius: 16,
          maxWidth: 400,
          width: '100%',
          padding: '28px 22px 22px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.30)',
        }}
      >
        <h2
          id="disclaimer-title"
          style={{
            fontFamily: 'var(--font-head)',
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--navy)',
            marginBottom: 12,
            textAlign: 'center',
          }}
        >
          Educational use only
        </h2>

        <div
          style={{
            fontSize: 12,
            lineHeight: 1.6,
            color: 'var(--text-2)',
            fontFamily: 'var(--font-body)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <p>
            Ashom is a research and learning tool. Nothing in this app is investment
            advice, a recommendation, or an offer to buy or sell any security.
          </p>
          <p>
            <strong style={{ color: 'var(--navy)' }}>Company financial figures shown in this app are sample data</strong>{' '}
            generated for demonstration. They are not the reported results of the
            companies named and must not be used for any investment decision.
            Verify all figures against official filings and the relevant exchange.
          </p>
          <p>
            Market prices are indicative and may be delayed or unavailable. Portfolio
            and order features are simulated — no real trade is ever placed.
          </p>
        </div>

        <button
          onClick={accept}
          style={{
            marginTop: 20,
            width: '100%',
            padding: '12px 16px',
            borderRadius: 'var(--r-md, 10px)',
            border: 'none',
            background: 'var(--navy)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
            cursor: 'pointer',
          }}
        >
          I understand
        </button>
      </div>
    </div>
  );
}
