import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Star, Trash2, Bell, BellOff, Plus, ChevronRight, TrendingUp, TrendingDown, X } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import useWatchlist from '../hooks/useWatchlist';
import usePushNotifications from '../hooks/usePushNotifications';

export default function WatchlistPage() {
  const navigate = useNavigate();
  const { watchlist, alerts, removeFromWatchlist, addAlert, removeAlert, toggleAlert } = useWatchlist();
  const { sendNotification, prefs: pushPrefs } = usePushNotifications();
  const [tab, setTab] = useState('watchlist');
  const [showAlertModal, setShowAlertModal] = useState(null);
  const [alertForm, setAlertForm] = useState({ type: 'below', targetPrice: '' });

  function handleAddAlert(e) {
    e.preventDefault();
    if (!showAlertModal || !alertForm.targetPrice) return;
    const target = parseFloat(alertForm.targetPrice);
    addAlert(showAlertModal.id, showAlertModal.name, alertForm.type, target);

    if (pushPrefs.enabled && pushPrefs.priceAlerts) {
      sendNotification('Price Alert Set', {
        body: `You will be notified when ${showAlertModal.ticker || showAlertModal.name} goes ${alertForm.type} $${target.toFixed(2)}`,
      });
    }

    setShowAlertModal(null);
    setAlertForm({ type: 'below', targetPrice: '' });
  }

  return (
    <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PageHeader title="Watchlist" subtitle="Track your favorite companies" backTo="/" />

      {/* Tabs */}
      <div className="flex px-5 pt-1" style={{ borderBottom: '1px solid var(--border)' }}>
        <button
          onClick={() => setTab('watchlist')}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-head font-semibold transition-colors"
          style={{
            borderBottom: tab === 'watchlist' ? '2px solid var(--navy)' : '2px solid transparent',
            color: tab === 'watchlist' ? 'var(--navy)' : 'var(--text-3)',
          }}
        >
          <Star size={13} /> Watchlist ({watchlist.length})
        </button>
        <button
          onClick={() => setTab('alerts')}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-head font-semibold transition-colors"
          style={{
            borderBottom: tab === 'alerts' ? '2px solid var(--navy)' : '2px solid transparent',
            color: tab === 'alerts' ? 'var(--navy)' : 'var(--text-3)',
          }}
        >
          <Bell size={13} /> Price Alerts ({alerts.length})
        </button>
      </div>

      <div className="px-4 py-4">
        {/* Watchlist Tab */}
        {tab === 'watchlist' && (
          <>
            {watchlist.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div
                  className="w-14 h-14 rounded-md flex items-center justify-center mb-4"
                  style={{ background: 'var(--ic-amber-bg)', color: 'var(--ic-amber-fg)' }}
                >
                  <Eye size={22} strokeWidth={1.8} />
                </div>
                <p className="font-head text-md font-bold mb-1" style={{ color: 'var(--navy)' }}>No companies watched</p>
                <p className="text-[11px] text-center max-w-[240px] leading-relaxed" style={{ color: 'var(--text-3)' }}>
                  Browse companies and tap the star icon to add them to your watchlist.
                </p>
                <button
                  onClick={() => navigate('/companies')}
                  className="mt-4 px-5 py-2.5 rounded-md font-head text-[11px] font-semibold text-white active:scale-95 transition-all"
                  style={{ background: 'var(--navy)' }}
                >
                  Browse Companies
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {watchlist.map(w => (
                  <div
                    key={w.id}
                    className="rounded-md flex items-center gap-3.5 p-3.5 transition-all hover:-translate-y-0.5"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                  >
                    <div
                      className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--ic-amber-bg)' }}
                    >
                      <Star size={14} fill="var(--ic-amber-fg)" style={{ color: 'var(--ic-amber-fg)' }} />
                    </div>
                    <button className="flex-1 min-w-0 text-left" onClick={() => navigate(`/companies/${w.id}`)}>
                      <p className="font-head text-sm font-bold truncate" style={{ color: 'var(--navy)' }}>{w.name}</p>
                      <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--text-3)' }}>
                        <span className="font-mono">{w.ticker || '--'}</span>
                        <span className="w-px h-3" style={{ background: 'var(--border)' }} />
                        <span className="truncate">{w.sector || '--'}</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setShowAlertModal(w)}
                      className="p-1.5 rounded-md hover:opacity-80 transition-colors"
                      title="Set price alert"
                      style={{ color: 'var(--blue)' }}
                    >
                      <Bell size={13} />
                    </button>
                    <button
                      onClick={() => removeFromWatchlist(w.id)}
                      className="p-1.5 rounded-md transition-colors"
                      style={{ color: 'var(--text-3)' }}
                    >
                      <Trash2 size={13} />
                    </button>
                    <ChevronRight size={14} className="flex-shrink-0" style={{ color: 'var(--text-3)' }} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Alerts Tab */}
        {tab === 'alerts' && (
          <>
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div
                  className="w-14 h-14 rounded-md flex items-center justify-center mb-4"
                  style={{ background: 'var(--ic-blue-bg)', color: 'var(--ic-blue-fg)' }}
                >
                  <Bell size={22} strokeWidth={1.8} />
                </div>
                <p className="font-head text-md font-bold mb-1" style={{ color: 'var(--navy)' }}>No price alerts</p>
                <p className="text-[11px] text-center max-w-[240px] leading-relaxed" style={{ color: 'var(--text-3)' }}>
                  Add a company to your watchlist, then set alerts when prices hit your targets.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {alerts.map(a => (
                  <div
                    key={a.id}
                    className="rounded-md flex items-center gap-3.5 p-3.5"
                    style={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      opacity: a.active ? 1 : 0.5,
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{
                        background: a.type === 'above' ? 'var(--ic-green-bg)' : 'var(--ic-red-bg)',
                        color: a.type === 'above' ? 'var(--ic-green-fg)' : 'var(--ic-red-fg)',
                      }}
                    >
                      {a.type === 'above'
                        ? <TrendingUp size={14} />
                        : <TrendingDown size={14} />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-head text-sm font-bold truncate" style={{ color: 'var(--navy)' }}>{a.companyName}</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>
                        Alert when price goes {a.type} ${a.targetPrice.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleAlert(a.id)}
                      className="p-1.5 rounded-md hover:opacity-80 transition-colors"
                    >
                      {a.active
                        ? <Bell size={13} style={{ color: 'var(--blue)' }} />
                        : <BellOff size={13} style={{ color: 'var(--text-3)' }} />
                      }
                    </button>
                    <button
                      onClick={() => removeAlert(a.id)}
                      className="p-1.5 rounded-md transition-colors"
                      style={{ color: 'var(--text-3)' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(1,1,49,0.35)' }} onClick={() => setShowAlertModal(null)}>
          <div
            className="w-full max-w-[430px] p-5 animate-slide-up"
            style={{ background: 'var(--card)', borderRadius: '20px 20px 0 0' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-head text-sm font-bold" style={{ color: 'var(--navy)' }}>Set Price Alert</h3>
              <button onClick={() => setShowAlertModal(null)} className="p-1 rounded-md" style={{ color: 'var(--text-3)' }}>
                <X size={16} />
              </button>
            </div>
            <p className="text-[11px] mb-4" style={{ color: 'var(--text-2)' }}>{showAlertModal.name}</p>
            <form onSubmit={handleAddAlert} className="space-y-4">
              <div>
                <label className="font-head text-[10px] font-bold uppercase tracking-[1px] block mb-1.5" style={{ color: 'var(--text-3)' }}>Alert when price goes</label>
                <div className="flex gap-1 p-0.5 rounded-md" style={{ background: 'var(--bg)' }}>
                  <button type="button" onClick={() => setAlertForm(f => ({ ...f, type: 'below' }))}
                    className="flex-1 py-2.5 rounded-[12px] text-[11px] font-head font-semibold transition-all"
                    style={{
                      background: alertForm.type === 'below' ? 'var(--card)' : 'transparent',
                      color: alertForm.type === 'below' ? 'var(--red)' : 'var(--text-3)',
                      boxShadow: alertForm.type === 'below' ? '0 1px 3px rgba(1,1,49,0.08)' : 'none',
                    }}
                  >Below</button>
                  <button type="button" onClick={() => setAlertForm(f => ({ ...f, type: 'above' }))}
                    className="flex-1 py-2.5 rounded-[12px] text-[11px] font-head font-semibold transition-all"
                    style={{
                      background: alertForm.type === 'above' ? 'var(--card)' : 'transparent',
                      color: alertForm.type === 'above' ? 'var(--green)' : 'var(--text-3)',
                      boxShadow: alertForm.type === 'above' ? '0 1px 3px rgba(1,1,49,0.08)' : 'none',
                    }}
                  >Above</button>
                </div>
              </div>
              <div>
                <label className="font-head text-[10px] font-bold uppercase tracking-[1px] block mb-1.5" style={{ color: 'var(--text-3)' }}>Target Price ($)</label>
                <input type="number" step="any" value={alertForm.targetPrice}
                  onChange={e => setAlertForm(f => ({ ...f, targetPrice: e.target.value }))}
                  placeholder="0.00" required autoFocus
                  className="w-full text-[12px] font-body rounded-md px-3 py-2.5 focus:outline-none transition-colors"
                  style={{ border: '1px solid var(--border)', color: 'var(--navy)', background: 'var(--card)' }}
                />
              </div>
              <button type="submit"
                className="w-full py-2.5 rounded-md font-head text-[11px] font-semibold text-white transition-colors"
                style={{ background: 'var(--navy)' }}
              >
                Set Alert
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
