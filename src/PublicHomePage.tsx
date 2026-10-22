import { useState } from 'react'
import { supabase } from './supabase'

const YoushopGooglePlay = 'https://play.google.com/store/apps/details?id=com.appsbunches.youshop'
const YoushopAppStore = 'https://apps.apple.com/om/app/youshop-%D9%8A%D9%88%D8%B4%D9%88%D8%A8/id6450418043'

export default function PublicHomePage() {
  const [onlineOpen, setOnlineOpen] = useState(false)
  const [loyaltyOpen, setLoyaltyOpen] = useState(false)
  const [loyaltyPhone, setLoyaltyPhone] = useState('')
  const [loyaltyLoading, setLoyaltyLoading] = useState(false)
  const [loyaltyResult, setLoyaltyResult] = useState<{ name?: string; points: number } | null>(null)
  const [loyaltyMessage, setLoyaltyMessage] = useState('')

  const isApple = /iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent)

  const openStore = (googleUrl: string, appleUrl: string) => {
    window.open(isApple ? appleUrl : googleUrl, '_blank', 'noopener,noreferrer')
  }

  const lookupLoyalty = async () => {
    const phone = loyaltyPhone.replace(/\D/g, '')
    setLoyaltyResult(null)
    setLoyaltyMessage('')

    if (!/^[79]\d{7}$/.test(phone)) {
      setLoyaltyMessage('اكتب رقم عماني صحيح من 8 أرقام')
      return
    }

    setLoyaltyLoading(true)

    try {
      const { data, error } = await supabase
        .from('customers')
        .select('name, phone, loyalty_points')
        .eq('phone', phone)
        .maybeSingle()

      if (error) {
        console.error('Loyalty lookup failed:', error)
        setLoyaltyMessage('تعذر الوصول إلى نقاطك حالياً')
        return
      }

      if (!data) {
        setLoyaltyMessage('لم نجد حساباً بهذا الرقم')
        return
      }

      setLoyaltyResult({
        name: data.name || undefined,
        points: Number(data.loyalty_points ?? 0),
      })
    } catch (error) {
      console.error('Loyalty lookup exception:', error)
      setLoyaltyMessage('حدث خطأ، حاول مرة أخرى')
    } finally {
      setLoyaltyLoading(false)
    }
  }

  return (
    <div className="barni-public-home" dir="rtl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;500;600;700;800;900&display=swap');

        .barni-public-home {
          min-height: 100vh;
          width: 100%;
          overflow-x: hidden;

          --bg: #f6f0e7;
          --card: #fcfaf6;
          --brown: #3b241b;
          --dark: #241914;
          --muted: #917a6b;
          --gold: #b98b5d;
          --line: #e7ddd1;

          background:
            radial-gradient(
              circle at 10% 10%,
              rgba(185, 139, 93, 0.12),
              transparent 24rem
            ),
            radial-gradient(
              circle at 92% 90%,
              rgba(91, 56, 41, 0.05),
              transparent 25rem
            ),
            var(--bg);

          color: var(--brown);

          font-family:
            'Noto Kufi Arabic',
            Tahoma,
            Arial,
            sans-serif;
        }

        .barni-public-home *,
        .barni-public-home a,
        .barni-public-home h1,
        .barni-public-home p,
        .barni-public-home span,
        .barni-public-home strong,
        .barni-public-home small,
        .barni-public-home footer {
          font-family:
            'Noto Kufi Arabic',
            Tahoma,
            Arial,
            sans-serif;
        }

        .barni-home-shell {
          width: min(1140px, calc(100% - 56px));
          min-height: 100vh;

          margin: 0 auto;
          padding: 24px 0 28px;

          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* =========================
           BRAND
        ========================= */

        .barni-home-brand {
          width: 100%;
          text-align: center;

          animation: barni-home-in 0.55s ease both;
        }

        .barni-home-mark {
          width: 92px;
          height: 92px;

          margin: 0 auto 8px;

          display: grid;
          place-items: center;

          border-radius: 26px;

          background: var(--brown);

          color: #ead6bc;

          font-size: 42px;
          line-height: 1;

          box-shadow:
            0 18px 45px rgba(59, 36, 27, 0.14);
        }

        .barni-home-logo {
          margin: -8px 0 0;

          color: var(--brown);

          font-family:
            'Noto Kufi Arabic',
            Tahoma,
            Arial,
            sans-serif !important;

          font-size: clamp(58px, 7.5vw, 96px);

          line-height: 1.25;

          font-weight: 900 !important;

          letter-spacing: -1.5px;
        }

        .barni-home-tagline {
          margin: 12px 0 0;

          color: var(--muted);

          font-family:
            'Noto Kufi Arabic',
            Tahoma,
            Arial,
            sans-serif !important;

          font-size: clamp(17px, 1.9vw, 21px);

          line-height: 1.55;

          font-weight: 500 !important;
        }

        .barni-home-english {
          margin-top: 6px;

          color: var(--gold);

          font-family:
            Arial,
            sans-serif !important;

          font-size: 11px;
          line-height: 1;

          font-weight: 800;

          letter-spacing: 4px;

          direction: ltr;
        }

        /* =========================
           LINKS
        ========================= */

        .barni-home-links {
          width: 100%;
          max-width: 1140px;

          display: grid;

          gap: 14px;

          margin-top: 32px;
        }

        .barni-home-link {
          width: 100%;
          min-height: 94px;

          padding: 17px 20px;

          display: grid;
          grid-template-columns: 56px 1fr 22px;
          align-items: center;

          gap: 15px;

          border: 1px solid var(--line);
          border-radius: 24px;

          background:
            linear-gradient(
              180deg,
              rgba(255, 255, 255, 0.30),
              rgba(252, 250, 246, 0.93)
            );

          color: var(--dark);

          text-align: right;
          text-decoration: none;

          box-shadow:
            0 10px 28px rgba(59, 36, 27, 0.045);

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            border-color 0.2s ease;
        }

        button.barni-home-link {
          appearance: none;
          -webkit-appearance: none;
          cursor: pointer;
          font-family: inherit;
        }

        .barni-home-link:hover {
          transform: translateY(-3px);

          border-color: #cfb59d;

          box-shadow:
            0 18px 36px rgba(59, 36, 27, 0.09);
        }

        .barni-home-link:active {
          transform: translateY(0);
        }

        .barni-home-icon {
          width: 56px;
          height: 56px;

          display: grid;
          place-items: center;

          border-radius: 18px;

          background: #efe2d3;

          font-size: 25px;
          line-height: 1;
        }

        .barni-home-link strong {
          display: block;

          margin: 0;

          color: var(--dark);

          font-family:
            'Noto Kufi Arabic',
            Tahoma,
            Arial,
            sans-serif !important;

          font-size: 18px;
          line-height: 1.3;

          font-weight: 800 !important;
        }

        .barni-home-link small {
          display: block;

          margin-top: 2px;

          color: var(--muted);

          font-family:
            'Noto Kufi Arabic',
            Tahoma,
            Arial,
            sans-serif !important;

          font-size: 12px;
          line-height: 1.55;

          font-weight: 400 !important;
        }

        .barni-home-arrow {
          color: var(--gold);

          font-family: Arial, sans-serif !important;

          font-size: 22px;
          line-height: 1;

          direction: ltr;

          transition:
            transform 0.2s ease,
            color 0.2s ease;
        }

        .barni-home-link:hover .barni-home-arrow {
          transform: translateX(-4px);
          color: #9f744d;
        }

        /* =========================
           FOOTER
        ========================= */

        .barni-home-footer {
          margin-top: 28px;

          color: #a99688;

          font-family:
            'Noto Kufi Arabic',
            Tahoma,
            Arial,
            sans-serif !important;

          font-size: 11px;
          line-height: 1.6;

          font-weight: 400;
        }

        /* =========================
           ANIMATION
        ========================= */

        @keyframes barni-home-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* =========================
           TABLET
        ========================= */

        @media (max-width: 900px) {
          .barni-home-shell {
            width: min(100% - 30px, 720px);
          }

          .barni-home-mark {
            width: 84px;
            height: 84px;

            border-radius: 24px;

            font-size: 38px;
          }

          .barni-home-logo {
            font-size: clamp(58px, 12vw, 88px);
          }

          .barni-home-links {
            margin-top: 28px;
          }
        }

        /* =========================
           MOBILE
        ========================= */

        @media (max-width: 600px) {
          .barni-home-shell {
            width: calc(100% - 20px);

            padding: 22px 0 18px;
          }

          .barni-home-mark {
            width: 76px;
            height: 76px;

            border-radius: 22px;

            margin-bottom: 15px;

            font-size: 34px;
          }

          .barni-home-logo {
            font-size: clamp(54px, 17vw, 78px);
            letter-spacing: -2px;
          }

          .barni-home-tagline {
            margin-top: 5px;
            font-size: 15px;
          }

          .barni-home-english {
            margin-top: 5px;

            font-size: 10px;
            letter-spacing: 3px;
          }

          .barni-home-links {
            gap: 12px;
            margin-top: 26px;
          }

          .barni-home-link {
            min-height: 84px;

            padding: 14px 15px;

            grid-template-columns: 50px 1fr 18px;

            gap: 12px;

            border-radius: 21px;
          }

          .barni-home-icon {
            width: 50px;
            height: 50px;

            border-radius: 16px;

            font-size: 22px;
          }

          .barni-home-link strong {
            font-size: 16px;
          }

          .barni-home-link small {
            font-size: 11px;
          }

          .barni-home-arrow {
            font-size: 20px;
          }

          .barni-home-footer {
            margin-top: 20px;
            font-size: 10px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .barni-home-brand {
            animation: none;
          }

          .barni-home-link {
            transition: none;
          }
        }
      `}</style>

      <main className="barni-home-shell">
        <section className="barni-home-brand">
          <div className="barni-home-mark">
            ☕
          </div>

          <h1 className="barni-home-logo">
            برني
          </h1>

          <p className="barni-home-tagline">
            قهوتك، مزاجك، لحظتك.
          </p>

          <div className="barni-home-english">
            BARNI CAFÉ
          </div>
        </section>

        <nav className="barni-home-links" aria-label="روابط برني">
          <a className="barni-home-link" href="/customer">
            <span className="barni-home-icon">☕</span>
            <span>
              <strong>منيو برني</strong>
              <small>تصفح المنيو واطلب مباشرة</small>
            </span>
            <span className="barni-home-arrow">←</span>
          </a>

          <a className="barni-home-link" href="/gift">
            <span className="barni-home-icon">🎁</span>
            <span>
              <strong>إرسال هدية</strong>
              <small>أرسل هدية لشخص تحبه</small>
            </span>
            <span className="barni-home-arrow">←</span>
          </a>

          <button
            type="button"
            className="barni-home-link"
            onClick={() => setOnlineOpen(true)}
          >
            <span className="barni-home-icon">🛍️</span>
            <span>
              <strong>اطلب أونلاين</strong>
              <small>اختر يوشوب أو موقع برني</small>
            </span>
            <span className="barni-home-arrow">←</span>
          </button>

          <button
            type="button"
            className="barni-home-link"
            onClick={() => {
              setLoyaltyOpen(true)
              setLoyaltyResult(null)
              setLoyaltyMessage('')
            }}
          >
            <span className="barni-home-icon">⭐</span>
            <span>
              <strong>نقاطي</strong>
              <small>تحقق من رصيد نقاط الولاء برقم هاتفك</small>
            </span>
            <span className="barni-home-arrow">←</span>
          </button>

          <a
            className="barni-home-link"
            href="https://maps.app.goo.gl/7AysM4qRHRVNvEN6A?g_st=aw"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="barni-home-icon">📍</span>
            <span>
              <strong>موقعنا</strong>
              <small>افتح موقعنا على الخريطة</small>
            </span>
            <span className="barni-home-arrow">↗</span>
          </a>

          <a
            className="barni-home-link"
            href="https://www.instagram.com/barni.om/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="barni-home-icon">💬</span>
            <span>
              <strong>تواصل معنا</strong>
              <small>@barni.om · تابع جديد برني وعروضنا</small>
            </span>
            <span className="barni-home-arrow">↗</span>
          </a>
        </nav>

        {onlineOpen && (
          <div
            role="dialog"
            aria-modal="true"
            onClick={() => setOnlineOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              display: 'grid',
              placeItems: 'center',
              padding: 20,
              background: 'rgba(36,25,20,.55)',
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                width: 'min(430px,100%)',
                padding: 26,
                borderRadius: 28,
                background: '#fcfaf6',
                border: '1px solid #e7ddd1',
                boxShadow: '0 24px 70px rgba(36,25,20,.25)',
                textAlign: 'center',
              }}
            >
              <button
                type="button"
                onClick={() => setOnlineOpen(false)}
                style={{
                  float: 'left',
                  border: 0,
                  background: 'transparent',
                  color: '#917a6b',
                  fontSize: 28,
                  cursor: 'pointer',
                }}
              >
                ×
              </button>

              <div style={{ fontSize: 38, marginBottom: 8 }}>
                🛍️
              </div>

              <h2
                style={{
                  margin: '0 0 8px',
                  color: '#3b241b',
                }}
              >
                اطلب أونلاين
              </h2>

              <p
                style={{
                  margin: '0 0 20px',
                  color: '#917a6b',
                  fontSize: 13,
                }}
              >
                اختر المنصة التي تريد الطلب منها
              </p>

              <button
                type="button"
                onClick={() =>
                  openStore(YoushopGooglePlay, YoushopAppStore)
                }
                style={{
                  width: '100%',
                  padding: '15px 18px',
                  marginBottom: 10,
                  border: '1px solid #e7ddd1',
                  borderRadius: 18,
                  background: '#efe2d3',
                  color: '#3b241b',
                  fontFamily: 'inherit',
                  fontWeight: 800,
                  fontSize: 16,
                  cursor: 'pointer',
                }}
              >
                🛍️ يوشوب
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.href = '/customer'
                }}
                style={{
                  width: '100%',
                  padding: '15px 18px',
                  border: 0,
                  borderRadius: 18,
                  background: '#3b241b',
                  color: '#fff',
                  fontFamily: 'inherit',
                  fontWeight: 800,
                  fontSize: 16,
                  cursor: 'pointer',
                }}
              >
                ☕ موقع برني
              </button>
            </div>
          </div>
        )}

        {loyaltyOpen && (
          <div
            role="dialog"
            aria-modal="true"
            onClick={() => setLoyaltyOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              display: 'grid',
              placeItems: 'center',
              padding: 20,
              background: 'rgba(36,25,20,.55)',
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                width: 'min(430px,100%)',
                padding: 26,
                borderRadius: 28,
                background: '#fcfaf6',
                border: '1px solid #e7ddd1',
                boxShadow: '0 24px 70px rgba(36,25,20,.25)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    color: '#3b241b',
                  }}
                >
                  ⭐ نقاطي
                </h2>

                <button
                  type="button"
                  onClick={() => setLoyaltyOpen(false)}
                  style={{
                    border: 0,
                    background: 'transparent',
                    color: '#917a6b',
                    fontSize: 28,
                    cursor: 'pointer',
                  }}
                >
                  ×
                </button>
              </div>

              <p
                style={{
                  color: '#917a6b',
                  fontSize: 13,
                  margin: '8px 0 18px',
                }}
              >
                أدخل رقم هاتفك لمعرفة رصيد نقاط الولاء
              </p>

              <input
                type="tel"
                inputMode="numeric"
                maxLength={8}
                value={loyaltyPhone}
                onChange={e =>
                  setLoyaltyPhone(
                    e.target.value.replace(/\D/g, '')
                  )
                }
                placeholder="9xxxxxxx"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '14px 16px',
                  border: '1px solid #e7ddd1',
                  borderRadius: 16,
                  background: '#f6f0e7',
                  color: '#241914',
                  fontFamily: 'inherit',
                  fontSize: 15,
                  outline: 'none',
                  direction: 'ltr',
                  textAlign: 'right',
                }}
              />

              <button
                type="button"
                onClick={lookupLoyalty}
                disabled={loyaltyLoading}
                style={{
                  width: '100%',
                  marginTop: 10,
                  padding: '14px 18px',
                  border: 0,
                  borderRadius: 16,
                  background: '#3b241b',
                  color: '#fff',
                  fontFamily: 'inherit',
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: loyaltyLoading ? 'wait' : 'pointer',
                  opacity: loyaltyLoading ? 0.7 : 1,
                }}
              >
                {loyaltyLoading
                  ? 'جاري التحقق...'
                  : 'عرض نقاطي'}
              </button>

              {loyaltyMessage && (
                <p
                  style={{
                    margin: '14px 0 0',
                    color: '#9a5a43',
                    fontSize: 13,
                    textAlign: 'center',
                  }}
                >
                  {loyaltyMessage}
                </p>
              )}

              {loyaltyResult && (
                <div
                  style={{
                    marginTop: 16,
                    padding: 18,
                    borderRadius: 20,
                    background: '#efe2d3',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      color: '#917a6b',
                      fontSize: 13,
                    }}
                  >
                    {loyaltyResult.name
                      ? `أهلاً ${loyaltyResult.name}`
                      : 'رصيدك الحالي'}
                  </div>

                  <strong
                    style={{
                      display: 'block',
                      marginTop: 5,
                      color: '#3b241b',
                      fontSize: 34,
                      lineHeight: 1.2,
                    }}
                  >
                    {loyaltyResult.points}
                  </strong>

                  <span
                    style={{
                      color: '#917a6b',
                      fontSize: 13,
                    }}
                  >
                    نقطة
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <footer className="barni-home-footer">
          © برني كافيه · كل لحظة لها مذاقها
        </footer>
      </main>
    </div>
  )
}