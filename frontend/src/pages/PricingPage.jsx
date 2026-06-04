import { useState } from 'react';
import {
  Check, X, Crown, Zap, Shield, Star, Users
} from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import useSubscription, { PLANS } from '../hooks/useSubscription';

const PLAN_DETAILS = [
  { id: 'free',       name: 'Free',       tagline: 'Get started',                 icon: Star,   iconColor: 'var(--text-2)', iconBg: 'var(--bg)',         popular: false },
  { id: 'starter',    name: 'Starter',    tagline: 'For retail investors',         icon: Zap,    iconColor: 'var(--blue)',   iconBg: 'var(--blue-light)', popular: true },
  { id: 'pro',        name: 'Pro',        tagline: 'For active traders & brokers', icon: Shield, iconColor: '#7C3AED',      iconBg: '#F5F3FF',           popular: false },
  { id: 'enterprise', name: 'Enterprise', tagline: 'For teams & corporates',       icon: Crown,  iconColor: '#D97706',      iconBg: '#FFFBEB',           popular: false },
];

const CARD_FEATURES = {
  free:       ['Market data, news, glossary', 'Practice simulator & learning', 'Watchlist (10 companies)', 'AI Analyst (5 queries/day)', '1 portfolio'],
  starter:    ['Everything in Free', 'Watchlist (50 companies)', 'AI Analyst (20/day)', '3 portfolios, price alerts', 'PDF reports, push notifications'],
  pro:        ['Everything in Starter', 'Unlimited watchlist & AI', '10 portfolios, Excel export', 'API access (1,000 calls/day)', 'Full analytics suite'],
  enterprise: ['Everything in Pro', 'Unlimited portfolios', 'White-label branded reports', 'Custom dashboards', 'API (10K/day), priority support'],
};

const COMPARE_FEATURES = [
  { label: 'Market data',       free: true,  starter: true,  pro: true,     enterprise: true },
  { label: 'Practice sim',      free: true,  starter: true,  pro: true,     enterprise: true },
  { label: 'Learning paths',    free: true,  starter: true,  pro: true,     enterprise: true },
  { label: 'Watchlist',         free: '10',  starter: '50',  pro: '\u221e', enterprise: '\u221e' },
  { label: 'AI queries/day',    free: '5',   starter: '20',  pro: '\u221e', enterprise: '\u221e' },
  { label: 'Portfolios',        free: '1',   starter: '3',   pro: '10',    enterprise: '\u221e' },
  { label: 'Price alerts',      free: false, starter: true,  pro: true,     enterprise: true },
  { label: 'PDF reports',       free: false, starter: true,  pro: true,     enterprise: true },
  { label: 'Push notifs',       free: false, starter: true,  pro: true,     enterprise: true },
  { label: 'Excel export',      free: false, starter: false, pro: true,     enterprise: true },
  { label: 'API access',        free: false, starter: false, pro: '1K',     enterprise: '10K' },
  { label: 'White-label',       free: false, starter: false, pro: false,    enterprise: true },
  { label: 'Custom dashboard',  free: false, starter: false, pro: false,    enterprise: true },
  { label: 'Priority support',  free: false, starter: false, pro: false,    enterprise: true },
];

export default function PricingPage() {
  const [billing, setBilling] = useState('monthly');
  const { planId, upgrade } = useSubscription();
  const [showSuccess, setShowSuccess] = useState(null);

  const discount = billing === 'annual' ? 0.8 : 1;

  function handleUpgrade(newPlanId) {
    if (newPlanId === planId) return;
    upgrade(newPlanId, billing);
    setShowSuccess(newPlanId);
    setTimeout(() => setShowSuccess(null), 3000);
  }

  function formatPrice(price) {
    if (price === 0) return 'Free';
    return '$' + (price * discount).toFixed(2);
  }

  return (
    <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PageHeader title="Pricing" subtitle="Choose your plan" backTo="/settings" />

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Success toast */}
        {showSuccess && (
          <div
            className="animate-fade-in"
            style={{
              position: 'fixed',
              top: 64,
              left: 16,
              right: 16,
              zIndex: 50,
              background: 'var(--green)',
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              padding: 12,
              borderRadius: 'var(--r-md)',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              fontFamily: 'var(--font-body)',
            }}
          >
            <Check size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
            Upgraded to {PLANS[showSuccess]?.name}! Enjoy your new features.
          </div>
        )}

        {/* Billing toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: billing === 'monthly' ? 'var(--text-1)' : 'var(--text-3)', fontFamily: 'var(--font-body)' }}>Monthly</span>
          <button
            onClick={() => setBilling(b => b === 'monthly' ? 'annual' : 'monthly')}
            style={{
              width: 48,
              height: 28,
              borderRadius: 14,
              background: billing === 'annual' ? 'var(--green)' : 'var(--border)',
              border: 'none',
              cursor: 'pointer',
              padding: 2,
              display: 'flex',
              alignItems: 'center',
              transition: 'background 0.2s',
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                transition: 'transform 0.2s',
                transform: billing === 'annual' ? 'translateX(20px)' : 'translateX(0)',
              }}
            />
          </button>
          <span style={{ fontSize: 12, fontWeight: 500, color: billing === 'annual' ? 'var(--text-1)' : 'var(--text-3)', fontFamily: 'var(--font-body)' }}>
            Annual
            <span style={{ color: 'var(--green)', fontWeight: 700, marginLeft: 4 }}>-20%</span>
          </span>
        </div>

        {/* Plan cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {PLAN_DETAILS.map(pd => {
            const plan = PLANS[pd.id];
            const isCurrent = planId === pd.id;
            const Icon = pd.icon;
            const features = CARD_FEATURES[pd.id];

            return (
              <div
                key={pd.id}
                style={{
                  background: 'var(--card)',
                  border: pd.popular ? '2px solid var(--blue)' : '1px solid var(--border)',
                  borderRadius: 'var(--r-md)',
                  overflow: 'hidden',
                }}
              >
                {pd.popular && (
                  <div
                    style={{
                      background: 'var(--blue)',
                      color: '#fff',
                      textAlign: 'center',
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '5px 0',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontFamily: 'var(--font-head)',
                    }}
                  >
                    Most Popular
                  </div>
                )}
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--r-sm)',
                        background: pd.iconBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={18} style={{ color: pd.iconColor }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 14, color: 'var(--text-1)', margin: 0 }}>{pd.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-3)', margin: '1px 0 0' }}>{pd.tagline}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 22, color: 'var(--text-1)', margin: 0 }}>{formatPrice(plan.price)}</p>
                      {plan.price > 0 && <p style={{ fontSize: 11, color: 'var(--text-3)', margin: 0 }}>/month</p>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                    {features.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Check size={12} style={{ color: 'var(--green)', flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleUpgrade(pd.id)}
                    disabled={isCurrent}
                    style={{
                      width: '100%',
                      padding: '11px 0',
                      borderRadius: 'var(--r-sm)',
                      fontSize: 12,
                      fontWeight: 600,
                      fontFamily: 'var(--font-body)',
                      border: 'none',
                      cursor: isCurrent ? 'default' : 'pointer',
                      transition: 'all 0.15s',
                      background: isCurrent ? 'var(--bg)' : pd.popular ? 'var(--navy)' : 'var(--bg)',
                      color: isCurrent ? 'var(--text-3)' : pd.popular ? '#fff' : 'var(--text-1)',
                    }}
                  >
                    {isCurrent ? 'Current Plan' : plan.price === 0 ? 'Downgrade' : 'Upgrade'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Compact feature comparison table */}
        <p
          style={{
            fontFamily: 'var(--font-head)',
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1.2px',
            color: 'var(--text-3)',
            margin: '8px 0 0 4px',
          }}
        >
          Compare All Plans
        </p>
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)',
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', fontSize: 8, borderCollapse: 'collapse', fontFamily: 'var(--font-body)' }}>
            <thead>
              <tr style={{ background: 'var(--bg)' }}>
                <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 700, color: 'var(--text-2)', width: 90 }}>Feature</th>
                <th style={{ textAlign: 'center', padding: '6px 4px', fontWeight: 700, color: 'var(--text-2)', width: 42 }}>Free</th>
                <th style={{ textAlign: 'center', padding: '6px 4px', fontWeight: 700, color: 'var(--blue)', width: 42 }}>Start</th>
                <th style={{ textAlign: 'center', padding: '6px 4px', fontWeight: 700, color: '#7C3AED', width: 42 }}>Pro</th>
                <th style={{ textAlign: 'center', padding: '6px 4px', fontWeight: 700, color: '#D97706', width: 42 }}>Ent.</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE_FEATURES.map((f, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg)' }}>
                  <td style={{ padding: '5px 8px', color: 'var(--text-1)', fontWeight: 500, lineHeight: 1.3 }}>{f.label}</td>
                  {['free', 'starter', 'pro', 'enterprise'].map(tier => {
                    const val = f[tier];
                    return (
                      <td key={tier} style={{ textAlign: 'center', padding: '5px 4px' }}>
                        {val === true ? <Check size={10} style={{ color: 'var(--green)', margin: '0 auto', display: 'block' }} /> :
                         val === false ? <X size={10} style={{ color: 'var(--border)', margin: '0 auto', display: 'block' }} /> :
                         <span style={{ fontWeight: 700, color: 'var(--text-1)' }}>{val}</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* University offer */}
        <div
          style={{
            borderRadius: 'var(--r-md)',
            padding: 16,
            background: 'linear-gradient(135deg, var(--green), #059669)',
            color: '#fff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Users size={18} />
            <p style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 14, margin: 0 }}>University Program</p>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, margin: 0 }}>
            $500/year for unlimited student Pro accounts. Professor gets Enterprise for free.
          </p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', margin: '6px 0 0' }}>Contact us at edu@ashom.app</p>
        </div>

        <p style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', fontFamily: 'var(--font-body)' }}>
          All plans include a 14-day free trial. Cancel anytime. Prices in USD.
        </p>
      </div>
    </div>
  );
}
