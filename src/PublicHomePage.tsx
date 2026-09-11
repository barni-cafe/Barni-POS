export default function PublicHomePage() {
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

        <nav
          className="barni-home-links"
          aria-label="روابط برني"
        >
          {/* منيو برني */}
          <a
            className="barni-home-link"
            href="/customer"
          >
            <span className="barni-home-icon">
              ☕
            </span>

            <span>
              <strong>
                منيو برني
              </strong>

              <small>
                تصفح المنيو واطلب مباشرة
              </small>
            </span>

            <span className="barni-home-arrow">
              ←
            </span>
          </a>

          {/* إرسال هدية */}
          <a
            className="barni-home-link"
            href="/gift"
          >
            <span className="barni-home-icon">
              🎁
            </span>

            <span>
              <strong>
                إرسال هدية
              </strong>

              <small>
                أرسل هدية لشخص تحبه
              </small>
            </span>

            <span className="barni-home-arrow">
              ←
            </span>
          </a>

          {/* موقع برني */}
          <a
            className="barni-home-link"
            href="https://maps.app.goo.gl/7AysM4qRHRVNvEN6A?g_st=aw"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="barni-home-icon">
              📍
            </span>

            <span>
              <strong>
                موقع برني
              </strong>

              <small>
                افتح موقعنا على الخريطة
              </small>
            </span>

            <span className="barni-home-arrow">
              ↗
            </span>
          </a>

          {/* إنستجرام */}
          <a
            className="barni-home-link"
            href="https://www.instagram.com/barni.om/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="barni-home-icon">
              ◎
            </span>

            <span>
              <strong>
                حسابنا في إنستجرام
              </strong>

              <small>
                @barni.om · تابع جديد برني وعروضنا
              </small>
            </span>

            <span className="barni-home-arrow">
              ↗
            </span>
          </a>
        </nav>

        <footer className="barni-home-footer">
          © برني كافيه · كل لحظة لها مذاقها
        </footer>
      </main>
    </div>
  )
}