import React from 'react'

const CUSTOMER_URL =
  'https://barni-cafe.barnicafe-om.workers.dev/customer'

const GIFT_URL =
  'https://barni-cafe.barnicafe-om.workers.dev/gift'

const INSTAGRAM_URL =
  'https://www.instagram.com/barni.cafe.om/'

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: '#f7efe5',
  color: '#3a2117',
  fontFamily: 'Cairo, Tahoma, Arial, sans-serif',
  boxSizing: 'border-box',
  padding: '30px 24px 55px',
}

const wrapStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 1090,
  margin: '0 auto',
}

const cardStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 132,
  border: '1px solid rgba(117, 91, 72, .14)',
  borderRadius: 34,
  background: 'rgba(255, 253, 249, .78)',
  boxShadow: '0 8px 30px rgba(80, 54, 36, .035)',
  display: 'flex',
  alignItems: 'center',
  padding: '24px 28px',
  boxSizing: 'border-box',
  cursor: 'pointer',
  textAlign: 'right',
  direction: 'rtl',
  transition: 'transform .15s ease, box-shadow .15s ease',
}

function CupLogo() {
  return (
    <div
      aria-hidden="true"
      style={{
        width: 110,
        height: 110,
        borderRadius: 31,
        background: '#3a2117',
        display: 'grid',
        placeItems: 'center',
        boxShadow: '0 14px 30px rgba(58,33,23,.08)',
      }}
    >
      <div
        style={{
          fontSize: 54,
          lineHeight: 1,
          transform: 'translateY(-1px)',
          filter: 'saturate(.75)',
        }}
      >
        ☕
      </div>
    </div>
  )
}

function CardIcon({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        flex: '0 0 auto',
        width: 80,
        height: 80,
        borderRadius: 27,
        background: '#eee0cf',
        display: 'grid',
        placeItems: 'center',
        fontSize: 39,
        marginRight: 22,
      }}
    >
      {children}
    </div>
  )
}

function Arrow() {
  return (
    <span
      style={{
        fontSize: 34,
        lineHeight: 1,
        color: '#c2874d',
        fontWeight: 300,
      }}
    >
      ←
    </span>
  )
}

export default function BarniWebsite() {
  const openCustomer = () => {
    window.location.href = CUSTOMER_URL
  }

  const openGift = () => {
    window.location.href = GIFT_URL
  }

  const openInstagram = () => {
    window.open(INSTAGRAM_URL, '_blank', 'noopener,noreferrer')
  }

  return (
    <main dir="rtl" style={pageStyle}>
      <div style={wrapStyle}>
        <header
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            paddingTop: 0,
            paddingBottom: 62,
          }}
        >
          <CupLogo />

          <div
            style={{
              marginTop: 34,
              fontSize: 'clamp(78px, 10vw, 132px)',
              lineHeight: .82,
              fontWeight: 950,
              letterSpacing: -8,
              color: '#3a2117',
            }}
          >
            برني
          </div>

          <div
            style={{
              marginTop: 20,
              fontSize: 22,
              color: '#806b5c',
              fontWeight: 600,
            }}
          >
            قوتك، مزاجك، لحظتك.
          </div>

          <div
            style={{
              marginTop: 25,
              color: '#b47a43',
              fontSize: 15,
              fontWeight: 900,
              letterSpacing: 5,
              direction: 'ltr',
            }}
          >
            B A R N I&nbsp;&nbsp; C A F É
          </div>
        </header>

        <section
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          <button
            type="button"
            onClick={openCustomer}
            style={cardStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow =
                '0 12px 34px rgba(80,54,36,.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow =
                '0 8px 30px rgba(80,54,36,.035)'
            }}
          >
            <CardIcon>☕</CardIcon>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 27,
                  fontWeight: 950,
                  lineHeight: 1.2,
                  color: '#302018',
                }}
              >
                منيو برني
              </div>

              <div
                style={{
                  marginTop: 9,
                  fontSize: 16,
                  color: '#887568',
                  fontWeight: 500,
                }}
              >
                تصفح المنيو واطلب مباشرة
              </div>
            </div>

            <Arrow />
          </button>

          <button
            type="button"
            onClick={openInstagram}
            style={cardStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow =
                '0 12px 34px rgba(80,54,36,.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow =
                '0 8px 30px rgba(80,54,36,.035)'
            }}
          >
            <CardIcon>
              <span
                style={{
                  fontSize: 46,
                  fontWeight: 300,
                  fontFamily: 'Arial, sans-serif',
                }}
              >
                ◎
              </span>
            </CardIcon>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 27,
                  fontWeight: 950,
                  lineHeight: 1.2,
                  color: '#302018',
                }}
              >
                حسابنا في إنستجرام
              </div>

              <div
                style={{
                  marginTop: 9,
                  fontSize: 16,
                  color: '#887568',
                  fontWeight: 500,
                }}
              >
                تابع جديد برني وعروضنا · @barni.om
              </div>
            </div>

            <Arrow />
          </button>

          <button
            type="button"
            onClick={openGift}
            style={cardStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow =
                '0 12px 34px rgba(80,54,36,.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow =
                '0 8px 30px rgba(80,54,36,.035)'
            }}
          >
            <CardIcon>🎁</CardIcon>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 27,
                  fontWeight: 950,
                  lineHeight: 1.2,
                  color: '#302018',
                }}
              >
                إرسال هدية
              </div>

              <div
                style={{
                  marginTop: 9,
                  fontSize: 16,
                  color: '#887568',
                  fontWeight: 500,
                }}
              >
                أرسل هدية لشخص تحبه
              </div>
            </div>

            <Arrow />
          </button>
        </section>
      </div>
    </main>
  )
}
