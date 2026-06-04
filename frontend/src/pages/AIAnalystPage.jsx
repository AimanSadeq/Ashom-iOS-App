import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, ChevronRight, ChevronLeft, Globe } from 'lucide-react';

import PageHeader from '../components/shared/PageHeader';
import { analyst } from '../services/api';

/* ─── Bilingual translations ─── */
const T = {
  en: {
    title: 'GCC Markets Intelligence',
    subtitle: 'Ask about companies, sectors, financials, or market trends across 820+ GCC listed companies.',
    placeholder: 'Ask about GCC markets...',
    powered: 'Powered by VIFM AI',
    suggestions: [
      { label: 'Analyze Saudi Aramco', message: 'Analyze Saudi Aramco financial performance and outlook', icon: 'right' },
      { label: 'Compare banking sectors', message: 'Compare banking sectors across GCC countries', icon: 'right' },
      { label: 'Top dividend stocks', message: 'What are the top dividend stocks in GCC markets?', icon: 'right' },
      { label: 'UAE market outlook', message: 'What is the outlook for UAE capital markets in 2026?', icon: 'right' },
    ],
  },
  ar: {
    title: '\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0645\u0627\u0644\u064A \u0644\u0623\u0633\u0648\u0627\u0642 \u0627\u0644\u062E\u0644\u064A\u062C',
    subtitle: '\u0627\u0633\u0623\u0644 \u0639\u0646 \u0627\u0644\u0634\u0631\u0643\u0627\u062A \u0648\u0627\u0644\u0642\u0637\u0627\u0639\u0627\u062A \u0648\u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0627\u0644\u064A\u0629 \u0623\u0648 \u0627\u062A\u062C\u0627\u0647\u0627\u062A \u0627\u0644\u0633\u0648\u0642 \u0639\u0628\u0631 \u0623\u0643\u062B\u0631 \u0645\u0646 820 \u0634\u0631\u0643\u0629 \u0645\u062F\u0631\u062C\u0629 \u0641\u064A \u062F\u0648\u0644 \u0645\u062C\u0644\u0633 \u0627\u0644\u062A\u0639\u0627\u0648\u0646 \u0627\u0644\u062E\u0644\u064A\u062C\u064A.',
    placeholder: '\u0627\u0633\u0623\u0644 \u0639\u0646 \u0623\u0633\u0648\u0627\u0642 \u0627\u0644\u062E\u0644\u064A\u062C...',
    powered: '\u0645\u062F\u0639\u0648\u0645 \u0645\u0646 VIFM AI',
    suggestions: [
      { label: '\u062A\u062D\u0644\u064A\u0644 \u0623\u0631\u0627\u0645\u0643\u0648 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629', message: '\u062A\u062D\u0644\u064A\u0644 \u0623\u062F\u0627\u0621 \u0623\u0631\u0627\u0645\u0643\u0648 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 \u0627\u0644\u0645\u0627\u0644\u064A \u0648\u0627\u0644\u062A\u0648\u0642\u0639\u0627\u062A', icon: 'left' },
      { label: '\u0645\u0642\u0627\u0631\u0646\u0629 \u0627\u0644\u0642\u0637\u0627\u0639 \u0627\u0644\u0645\u0635\u0631\u0641\u064A', message: '\u0645\u0642\u0627\u0631\u0646\u0629 \u0627\u0644\u0642\u0637\u0627\u0639\u0627\u062A \u0627\u0644\u0645\u0635\u0631\u0641\u064A\u0629 \u0639\u0628\u0631 \u062F\u0648\u0644 \u0645\u062C\u0644\u0633 \u0627\u0644\u062A\u0639\u0627\u0648\u0646 \u0627\u0644\u062E\u0644\u064A\u062C\u064A', icon: 'left' },
      { label: '\u0623\u0641\u0636\u0644 \u0623\u0633\u0647\u0645 \u0627\u0644\u062A\u0648\u0632\u064A\u0639\u0627\u062A', message: '\u0645\u0627 \u0647\u064A \u0623\u0641\u0636\u0644 \u0623\u0633\u0647\u0645 \u0627\u0644\u062A\u0648\u0632\u064A\u0639\u0627\u062A \u0641\u064A \u0623\u0633\u0648\u0627\u0642 \u0627\u0644\u062E\u0644\u064A\u062C\u061F', icon: 'left' },
      { label: '\u062A\u0648\u0642\u0639\u0627\u062A \u0633\u0648\u0642 \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A', message: '\u0645\u0627 \u0647\u064A \u062A\u0648\u0642\u0639\u0627\u062A \u0623\u0633\u0648\u0627\u0642 \u0631\u0623\u0633 \u0627\u0644\u0645\u0627\u0644 \u0641\u064A \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A \u0644\u0639\u0627\u0645 2026\u061F', icon: 'left' },
    ],
  },
};

export default function AIAnalystPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState('en');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const t = T[lang];
  const isRtl = lang === 'ar';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || loading) return;

    // Track language of the message
    const msgLang = lang;
    const userMsg = { id: Date.now(), role: 'user', content: trimmed, lang: msgLang };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    // Prepend Arabic hint if in Arabic mode
    const apiMessage = msgLang === 'ar'
      ? '[User is asking in Arabic. Please respond in Arabic if possible.] ' + trimmed
      : trimmed;

    try {
      const res = await analyst.chat({ message: apiMessage, history: newMessages });
      const reply = res?.message || res?.response || res?.data?.message || 'I could not generate a response. Please try again.';
      setMessages((prev) => [...prev, { id: Date.now(), role: 'assistant', content: reply, lang: 'en' }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: 'assistant', content: `Sorry, I encountered an error: ${err.message}. Please try again.`, lang: 'en' },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="animate-fade-in flex flex-col h-full" style={{ background: 'var(--bg)' }}>
      <PageHeader title="AI Financial Analyst" backTo="/" subtitle="Ask anything about GCC markets" />

      {/* Language toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 16px 0' }}>
        <div
          style={{
            display: 'inline-flex',
            borderRadius: 999,
            border: '1px solid var(--border)',
            background: 'var(--card)',
            overflow: 'hidden',
          }}
        >
          <button
            onClick={() => setLang('en')}
            style={{
              padding: '5px 14px',
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'var(--font-body)',
              border: 'none',
              cursor: 'pointer',
              background: lang === 'en' ? 'var(--navy)' : 'transparent',
              color: lang === 'en' ? '#fff' : 'var(--text-2)',
              transition: 'all 0.15s',
            }}
          >
            EN
          </button>
          <button
            onClick={() => setLang('ar')}
            style={{
              padding: '5px 14px',
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'var(--font-body)',
              border: 'none',
              cursor: 'pointer',
              background: lang === 'ar' ? 'var(--navy)' : 'transparent',
              color: lang === 'ar' ? '#fff' : 'var(--text-2)',
              transition: 'all 0.15s',
            }}
          >
            AR
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: '16px' }}>
            {/* Icon: navy bg rounded square 60x60 */}
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 'var(--r-md)',
                background: 'var(--navy)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <Sparkles size={28} color="#fff" />
            </div>

            {/* Title: font-head bold 20px */}
            <h3
              style={{
                fontFamily: 'var(--font-head)',
                fontWeight: 700,
                fontSize: 20,
                color: 'var(--navy)',
                marginBottom: 4,
              }}
            >
              {t.title}
            </h3>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                color: 'var(--text-3)',
                maxWidth: 280,
                margin: '0 auto 16px',
                lineHeight: 1.4,
              }}
            >
              {t.subtitle}
            </p>

            {/* Suggestion buttons: 2-column grid, bordered pill cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {t.suggestions.map((prompt) => (
                <button
                  key={prompt.label}
                  onClick={() => sendMessage(prompt.message)}
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r-md)',
                    padding: '12px 14px',
                    textAlign: isRtl ? 'right' : 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    direction: isRtl ? 'rtl' : 'ltr',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--blue)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(83,145,213,0.10)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--navy)',
                      lineHeight: 1.3,
                    }}
                  >
                    {prompt.label}
                  </span>
                  {prompt.icon === 'left'
                    ? <ChevronLeft size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                    : <ChevronRight size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                  }
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isMsgRtl = msg.lang === 'ar';
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                gap: 8,
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                direction: 'ltr', // keep layout consistent
              }}
            >
              {msg.role === 'assistant' && (
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 'var(--r-sm)',
                    background: 'var(--blue-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  <Bot size={14} style={{ color: 'var(--blue)' }} />
                </div>
              )}
              <div>
                {msg.role === 'assistant' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 10,
                        fontWeight: 600,
                        color: 'var(--text-3)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      AI
                    </span>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 600,
                        fontFamily: 'var(--font-body)',
                        color: '#fff',
                        background: 'var(--text-3)',
                        borderRadius: 3,
                        padding: '1px 4px',
                        lineHeight: 1.3,
                      }}
                    >
                      EN
                    </span>
                  </div>
                )}
                <div
                  dir={isMsgRtl ? 'rtl' : 'ltr'}
                  style={{
                    maxWidth: '80%',
                    padding: '10px 14px',
                    borderRadius: 'var(--r-md)',
                    fontSize: 13,
                    lineHeight: 1.55,
                    fontFamily: 'var(--font-body)',
                    textAlign: isMsgRtl ? 'right' : 'left',
                    ...(msg.role === 'user'
                      ? {
                          background: 'var(--navy)',
                          color: '#fff',
                          borderBottomRightRadius: 'var(--r-sm)',
                        }
                      : {
                          background: 'var(--card)',
                          color: 'var(--navy)',
                          borderBottomLeftRadius: 'var(--r-sm)',
                          border: '1px solid var(--border)',
                        }),
                  }}
                >
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                </div>
                {msg.role === 'user' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 600,
                        fontFamily: 'var(--font-body)',
                        color: '#fff',
                        background: msg.lang === 'ar' ? '#00A878' : 'var(--blue)',
                        borderRadius: 3,
                        padding: '1px 4px',
                        lineHeight: 1.3,
                      }}
                    >
                      {msg.lang === 'ar' ? 'AR' : 'EN'}
                    </span>
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 'var(--r-sm)',
                    background: 'var(--blue-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  <User size={14} style={{ color: 'var(--navy)' }} />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-start', direction: 'ltr' }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 'var(--r-sm)',
                background: 'var(--blue-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Bot size={14} style={{ color: 'var(--blue)' }} />
            </div>
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--r-md)',
                borderBottomLeftRadius: 'var(--r-sm)',
                background: 'var(--card)',
                border: '1px solid var(--border)',
              }}
            >
              <Loader2 size={14} className="animate-spin" style={{ color: 'var(--text-3)' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div
        style={{
          borderTop: '1px solid var(--border)',
          background: 'var(--card)',
          padding: '12px 16px',
        }}
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', direction: isRtl ? 'rtl' : 'ltr' }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder={t.placeholder}
            disabled={loading}
            dir={isRtl ? 'rtl' : 'ltr'}
            style={{
              flex: 1,
              padding: '10px 16px',
              fontSize: 14,
              fontFamily: 'var(--font-body)',
              border: '1px solid var(--border)',
              borderRadius: 999,
              outline: 'none',
              background: 'var(--bg)',
              color: 'var(--navy)',
              opacity: loading ? 0.5 : 1,
              textAlign: isRtl ? 'right' : 'left',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--blue)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(83,145,213,0.12)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              background: loading || !input.trim() ? 'var(--text-3)' : 'var(--navy)',
              color: '#fff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              flexShrink: 0,
              transition: 'background 0.15s',
              opacity: loading || !input.trim() ? 0.5 : 1,
            }}
          >
            <Send size={16} style={isRtl ? { transform: 'scaleX(-1)' } : {}} />
          </button>
        </div>
        {/* Powered by badge */}
        <p
          style={{
            textAlign: 'center',
            fontFamily: 'var(--font-body)',
            fontSize: 10,
            color: 'var(--text-3)',
            marginTop: 8,
            marginBottom: 0,
            letterSpacing: '0.3px',
          }}
        >
          {t.powered}
        </p>
      </div>
    </div>
  );
}
