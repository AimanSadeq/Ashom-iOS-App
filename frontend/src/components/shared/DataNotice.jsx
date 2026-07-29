/**
 * Data-provenance notices.
 *
 * The app mixes four very different kinds of data on screens that look
 * identical: live third-party feeds (CoinGecko), delayed/fallback feeds
 * (commodities, which currently always serve hardcoded prices because the
 * upstream call fails), generated sample fundamentals, and entirely invented
 * demo content. A user cannot tell them apart. These components make the
 * distinction visible at the point of use.
 *
 * Mirrors mobile_app/lib/widgets/notice_banners.dart.
 */

const VARIANTS = {
  // Figures generated for demonstration; not the company's reported results.
  sample: {
    label: 'Sample data',
    detail: 'Figures are generated for demonstration and are not the reported results of the companies named.',
    fg: 'var(--amber, #F2A600)',
    bg: 'var(--amber-bg, #FFF8E6)',
  },
  // Whole feature is illustrative — fake users, fake calendars, fake chains.
  demo: {
    label: 'Demo content',
    detail: 'This screen shows illustrative example content, not real market activity.',
    fg: 'var(--amber, #F2A600)',
    bg: 'var(--amber-bg, #FFF8E6)',
  },
  // Upstream feed failed; hardcoded fallback values are being displayed.
  fallback: {
    label: 'Prices unavailable',
    detail: 'The live price feed is not responding. Indicative values are shown — do not rely on them.',
    fg: 'var(--red, #FF4B6E)',
    bg: 'var(--red-bg, #FFF0F3)',
  },
  // Real feed, but not real-time.
  delayed: {
    label: 'Indicative pricing',
    detail: 'Prices are indicative and may be delayed. Verify with the official exchange.',
    fg: 'var(--text-2)',
    bg: 'var(--bg)',
  },
  // Simulated trading.
  simulated: {
    label: 'Simulated',
    detail: 'Orders here are simulated for practice. No real trade is placed.',
    fg: 'var(--blue, #5391D5)',
    bg: 'var(--blue-light, #EAF2FB)',
  },
};

/** Full-width banner. Put this at the top of a page body. */
export function DataNotice({ variant = 'sample', detail, style }) {
  const v = VARIANTS[variant] || VARIANTS.sample;
  return (
    <div
      role="note"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        padding: '10px 12px',
        borderRadius: 'var(--r-md, 10px)',
        background: v.bg,
        border: `1px solid ${v.fg}33`,
        fontFamily: 'var(--font-body)',
        ...style,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          flexShrink: 0,
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: v.fg,
          marginTop: 5,
        }}
      />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: v.fg, marginBottom: 2 }}>
          {v.label}
        </div>
        <div style={{ fontSize: 11, lineHeight: 1.5, color: 'var(--text-2)' }}>
          {detail || v.detail}
        </div>
      </div>
    </div>
  );
}

/** Compact inline chip, for placing next to an individual figure or heading. */
export function DataBadge({ variant = 'sample', style }) {
  const v = VARIANTS[variant] || VARIANTS.sample;
  return (
    <span
      title={v.detail}
      style={{
        display: 'inline-block',
        padding: '1px 6px',
        borderRadius: 4,
        background: v.bg,
        color: v.fg,
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: '0.3px',
        textTransform: 'uppercase',
        fontFamily: 'var(--font-body)',
        whiteSpace: 'nowrap',
        verticalAlign: 'middle',
        ...style,
      }}
    >
      {v.label}
    </span>
  );
}

export default DataNotice;
