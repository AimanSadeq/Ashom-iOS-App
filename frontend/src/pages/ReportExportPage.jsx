import { useState } from 'react';
import { Download, Check, Loader2, Building2, PieChart, TrendingUp, Calendar } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';

const STORAGE_KEY = 'vifm-portfolio';

function loadHoldings() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function formatCurrency(n) {
  if (n == null) return '--';
  return '$' + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const REPORT_TEMPLATES = [
  { id: 'portfolio-summary', name: 'Portfolio Summary', desc: 'Overview of all holdings with allocation breakdown', icon: PieChart, iconBg: 'var(--blue-light)', iconColor: 'var(--blue)' },
  { id: 'performance-report', name: 'Performance Report', desc: 'Returns, gains/losses, and performance', icon: TrendingUp, iconBg: 'var(--green-bg)', iconColor: 'var(--green)' },
  { id: 'holdings-detail', name: 'Holdings Detail', desc: 'Detailed view of each position with metrics', icon: Building2, iconBg: '#F3EEFF', iconColor: '#7C3AED' },
  { id: 'monthly-statement', name: 'Monthly Statement', desc: 'Monthly activity summary', icon: Calendar, iconBg: '#FFF7ED', iconColor: '#D97706' },
];

function el(doc, tag, attrs = {}, children = []) {
  const node = doc.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'text') node.textContent = v;
    else if (k === 'className') node.className = v;
    else node.style[k] = v;
  });
  children.forEach(c => node.appendChild(c));
  return node;
}

function td(doc, text, style = {}) {
  return el(doc, 'td', { text, padding: '10px 8px', borderBottom: '1px solid #eee', fontSize: '13px', ...style });
}

function th(doc, text) {
  return el(doc, 'th', { text, textAlign: 'left', padding: '10px 8px', borderBottom: '2px solid #ddd', fontSize: '11px', textTransform: 'uppercase', color: '#666' });
}

function openPrintableReport(holdings, templateName) {
  const totalValue = holdings.reduce((sum, h) => sum + (h.quantity * (h.currentPrice || h.costPrice)), 0);
  const totalCost = holdings.reduce((sum, h) => sum + (h.quantity * h.costPrice), 0);
  const retVal = totalValue - totalCost;
  const retPct = totalCost > 0 ? (retVal / totalCost * 100).toFixed(2) : '0.00';
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const allocationByType = holdings.reduce((acc, h) => {
    const type = h.type || 'stock';
    acc[type] = (acc[type] || 0) + (h.quantity * (h.currentPrice || h.costPrice));
    return acc;
  }, {});

  const win = window.open('', '_blank');
  if (!win) return;
  const doc = win.document;
  doc.title = 'Ashom - ' + templateName;

  const style = doc.createElement('style');
  style.textContent = `
    body{font-family:'Segoe UI',Arial,sans-serif;max-width:800px;margin:0 auto;padding:40px;color:#0a2f4e}
    table{width:100%;border-collapse:collapse;margin:16px 0}
    @media print{body{padding:20px}}
  `;
  doc.head.appendChild(style);

  // Header
  const header = el(doc, 'div', { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0a2f4e', paddingBottom: '16px', marginBottom: '24px' }, [
    el(doc, 'div', {}, [
      el(doc, 'div', { text: 'Ashom', fontSize: '24px', fontWeight: 'bold' }),
      el(doc, 'div', { text: 'GCC Financial Intelligence', color: '#666', fontSize: '12px' }),
    ]),
    el(doc, 'div', { text: templateName + ' \u2014 ' + date, textAlign: 'right', color: '#666', fontSize: '13px' }),
  ]);
  doc.body.appendChild(header);

  // Summary heading
  doc.body.appendChild(el(doc, 'h2', { text: 'Portfolio Summary', fontSize: '18px', marginTop: '24px', borderBottom: '1px solid #eee', paddingBottom: '8px' }));

  // Summary cards
  const grid = el(doc, 'div', { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', margin: '16px 0' });
  [
    { label: 'Total Value', value: formatCurrency(totalValue), color: '#0a2f4e' },
    { label: 'Total Cost', value: formatCurrency(totalCost), color: '#0a2f4e' },
    { label: 'Total Return', value: formatCurrency(retVal) + ' (' + retPct + '%)', color: retVal >= 0 ? '#0f6e56' : '#a32d2d' },
  ].forEach(item => {
    grid.appendChild(el(doc, 'div', { background: '#f8f9fa', padding: '16px', borderRadius: '8px' }, [
      el(doc, 'div', { text: item.label, fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }),
      el(doc, 'div', { text: item.value, fontSize: '20px', fontWeight: 'bold', marginTop: '4px', color: item.color }),
    ]));
  });
  doc.body.appendChild(grid);

  // Allocation
  doc.body.appendChild(el(doc, 'h2', { text: 'Allocation', fontSize: '18px', marginTop: '24px', borderBottom: '1px solid #eee', paddingBottom: '8px' }));
  const allocTable = el(doc, 'table', {}, [
    el(doc, 'tr', {}, [th(doc, 'Asset Class'), th(doc, 'Value'), th(doc, 'Weight')]),
  ]);
  Object.entries(allocationByType).forEach(([type, val]) => {
    allocTable.appendChild(el(doc, 'tr', {}, [
      td(doc, type.charAt(0).toUpperCase() + type.slice(1)),
      td(doc, formatCurrency(val)),
      td(doc, (val / totalValue * 100).toFixed(1) + '%'),
    ]));
  });
  doc.body.appendChild(allocTable);

  // Holdings
  doc.body.appendChild(el(doc, 'h2', { text: 'Holdings', fontSize: '18px', marginTop: '24px', borderBottom: '1px solid #eee', paddingBottom: '8px' }));
  const holdTable = el(doc, 'table', {}, [
    el(doc, 'tr', {}, ['Name', 'Type', 'Qty', 'Cost', 'Current', 'Value', 'Return'].map(t => th(doc, t))),
  ]);
  holdings.forEach(h => {
    const cv = h.quantity * (h.currentPrice || h.costPrice);
    const cost = h.quantity * h.costPrice;
    const ret = cost > 0 ? ((cv - cost) / cost * 100) : 0;
    holdTable.appendChild(el(doc, 'tr', {}, [
      td(doc, h.name + ' (' + (h.symbol || '') + ')'),
      td(doc, (h.type || 'stock').charAt(0).toUpperCase() + (h.type || 'stock').slice(1)),
      td(doc, String(h.quantity)),
      td(doc, formatCurrency(h.costPrice)),
      td(doc, formatCurrency(h.currentPrice || h.costPrice)),
      td(doc, formatCurrency(cv)),
      td(doc, (ret >= 0 ? '+' : '') + ret.toFixed(1) + '%', { color: ret >= 0 ? '#0f6e56' : '#a32d2d' }),
    ]));
  });
  doc.body.appendChild(holdTable);

  // Footer
  doc.body.appendChild(el(doc, 'div', {
    text: 'Generated by Ashom \u00B7 ashom.app \u00B7 ' + date + ' \u2014 For informational purposes only.',
    marginTop: '40px', paddingTop: '16px', borderTop: '1px solid #eee', fontSize: '11px', color: '#999', textAlign: 'center',
  }));

  doc.close();
  setTimeout(() => win.print(), 500);
}

const cardStyle = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' };
const sectionLabel = {
  fontFamily: 'var(--font-head)', fontSize: 11, fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-3)',
  marginBottom: 10,
};

export default function ReportExportPage() {
  const [generating, setGenerating] = useState(null);
  const [generated, setGenerated] = useState([]);
  const holdings = loadHoldings();
  const totalValue = holdings.reduce((sum, h) => sum + (h.quantity * (h.currentPrice || h.costPrice)), 0);

  function handleGenerate(templateId) {
    setGenerating(templateId);
    const template = REPORT_TEMPLATES.find(t => t.id === templateId);
    setTimeout(() => {
      openPrintableReport(holdings, template.name);
      setGenerating(null);
      setGenerated(prev => [...prev, templateId]);
    }, 1000);
  }

  return (
    <div>
      <PageHeader title="Report Export" subtitle="Generate PDF reports" backTo="/portfolio" />
      <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Portfolio snapshot */}
        <div style={{
          ...cardStyle, padding: 16, border: 'none',
          background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-soft) 100%)',
          color: '#fff',
        }}>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 4, fontFamily: 'var(--font-head)' }}>Portfolio Snapshot</p>
          <p style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-head)' }}>{formatCurrency(totalValue)}</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{holdings.length} holdings across {new Set(holdings.map(h => h.type)).size} asset classes</p>
        </div>

        <p style={sectionLabel}>Report Templates</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {REPORT_TEMPLATES.map(t => {
            const Icon = t.icon;
            const isGenerating = generating === t.id;
            const isDone = generated.includes(t.id);
            return (
              <div key={t.id} style={{ ...cardStyle, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 'var(--r-sm)',
                    background: t.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon size={18} style={{ color: t.iconColor }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', fontFamily: 'var(--font-head)' }}>{t.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.5 }}>{t.desc}</p>
                  </div>
                  <button onClick={() => handleGenerate(t.id)} disabled={isGenerating}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '6px 14px', borderRadius: 'var(--r-sm)',
                      fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer',
                      fontFamily: 'var(--font-head)', transition: 'all 0.15s',
                      background: isGenerating ? 'var(--bg)' : isDone ? 'var(--green-bg)' : 'var(--blue-light)',
                      color: isGenerating ? 'var(--text-3)' : isDone ? 'var(--green)' : 'var(--blue)',
                      opacity: isGenerating ? 0.7 : 1,
                    }}
                  >
                    {isGenerating ? <><Loader2 size={12} className="animate-spin" /> Generating...</> :
                     isDone ? <><Check size={12} /> Generated</> :
                     <><Download size={12} /> Generate</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', marginTop: 16 }}>Reports open in a new tab. Use Print &rarr; Save as PDF.</p>
      </div>
    </div>
  );
}
