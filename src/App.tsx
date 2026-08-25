
import { useEffect, useRef, useState, type FormEvent } from 'react'
import './App.css'
import './CustomerPage.css'
import CustomerPage from './CustomerPage'
import GiftOrdersPanel from './GiftOrdersPanel'
import { supabase } from './supabase'

type Product = {
  id: number
  name: string
  price: number
  category: string
  available: boolean
  stock: number
}

type CartItem = Product & {
  quantity: number
}

type Coupon = {
  id: number
  code: string
  percent: number
  active: boolean
}

type Role = 'admin' | 'cashier' | 'kitchen'

type User = {
  id: string
  email: string
  username: string
  name: string
  role: Role
}

type Order = {
  id: number
  items: CartItem[]
  type: string
  table: string
  paymentMethod: 'نقدي' | 'بطاقة'
  discountCode: string
  discountPercent: number
  discountAmount: number
  total: number
  status: 'جديد' | 'قيد التحضير' | 'جاهز'
  createdAt: string
  createdAtDate: string
}

const defaultProducts: Product[] = [
  {
    id: 1,
    name: 'إسبريسو',
    price: 1.5,
    category: 'قهوة',
    available: true,
    stock: 20,
  },
  {
    id: 2,
    name: 'لاتيه',
    price: 2.0,
    category: 'قهوة',
    available: true,
    stock: 20,
  },
  {
    id: 3,
    name: 'كابتشينو',
    price: 2.0,
    category: 'قهوة',
    available: true,
    stock: 20,
  },
  {
    id: 4,
    name: 'آيس أمريكانو',
    price: 1.8,
    category: 'بارد',
    available: true,
    stock: 15,
  },
  {
    id: 5,
    name: 'آيس لاتيه',
    price: 2.2,
    category: 'بارد',
    available: true,
    stock: 15,
  },
  {
    id: 6,
    name: 'شاي',
    price: 1.0,
    category: 'مشروبات',
    available: true,
    stock: 25,
  },
  {
    id: 7,
    name: 'كرواسون',
    price: 1.5,
    category: 'حلويات',
    available: true,
    stock: 12,
  },
  {
    id: 8,
    name: 'كيكة شوكولاتة',
    price: 2.5,
    category: 'حلويات',
    available: true,
    stock: 10,
  },
]

const categories = [
  'الكل',
  'قهوة',
  'بارد',
  'مشروبات',
  'حلويات',
]

const defaultCoupons: Coupon[] = [
  {
    id: 1,
    code: 'BAR10',
    percent: 10,
    active: true,
  },
  {
    id: 2,
    code: 'BAR20',
    percent: 20,
    active: true,
  },
]


function BarniHomePage() {
  const goTo = (path: string) => {
    window.history.pushState({}, '', path)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  return (
    <div className="barni-public-home" dir="rtl">
      <style>{`
        .barni-public-home {
          --cream: #f6f0e7;
          --paper: #fbf8f2;
          --brown: #3b241b;
          --brown-2: #5b3829;
          --muted: #8d7668;
          --line: #e7ddd1;
          --gold: #b98b5d;
          min-height: 100vh;
          color: var(--brown);
          background:
            radial-gradient(circle at 15% 10%, rgba(185,139,93,.16), transparent 25rem),
            radial-gradient(circle at 90% 85%, rgba(91,56,41,.08), transparent 26rem),
            var(--cream);
          font-family: 'Cairo', Tahoma, Arial, sans-serif;
          overflow: hidden;
        }
        .barni-public-home * { box-sizing: border-box; }
        .barni-home-shell {
          width: min(760px, calc(100% - 32px));
          min-height: 100vh;
          margin: auto;
          padding: 34px 0 28px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .barni-home-brand {
          text-align: center;
          animation: barni-home-in .65s ease both;
        }
        .barni-home-mark {
          width: 76px;
          height: 76px;
          margin: 0 auto 18px;
          display: grid;
          place-items: center;
          border-radius: 24px;
          background: var(--brown);
          color: #ead6bc;
          font-size: 38px;
          box-shadow: 0 18px 45px rgba(59,36,27,.16);
        }
        .barni-home-logo {
          margin: 0;
          font-size: clamp(64px, 13vw, 106px);
          font-weight: 900;
          letter-spacing: -7px;
          line-height: .95;
        }
        .barni-home-tagline {
          margin: 14px 0 0;
          color: var(--muted);
          font-size: clamp(15px, 3vw, 19px);
          font-weight: 600;
        }
        .barni-home-english {
          margin-top: 8px;
          color: var(--gold);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 4px;
          direction: ltr;
        }
        .barni-home-links {
          display: grid;
          gap: 13px;
          margin-top: 38px;
        }
        .barni-home-link {
          width: 100%;
          min-height: 92px;
          padding: 17px 20px;
          display: grid;
          grid-template-columns: 56px 1fr 22px;
          align-items: center;
          gap: 15px;
          border: 1px solid var(--line);
          border-radius: 24px;
          background: rgba(251,248,242,.82);
          color: var(--brown);
          text-align: right;
          text-decoration: none;
          cursor: pointer;
          box-shadow: 0 10px 28px rgba(59,36,27,.045);
          transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease;
        }
        .barni-home-link:hover {
          transform: translateY(-3px);
          border-color: #cfb59d;
          box-shadow: 0 18px 35px rgba(59,36,27,.10);
        }
        .barni-home-link:active { transform: translateY(0); }
        .barni-home-icon {
          width: 56px;
          height: 56px;
          display: grid;
          place-items: center;
          border-radius: 18px;
          background: #efe2d3;
          font-size: 25px;
        }
        .barni-home-link strong {
          display: block;
          font-size: 18px;
          font-weight: 900;
        }
        .barni-home-link small {
          display: block;
          margin-top: 3px;
          color: var(--muted);
          font-size: 12px;
        }
        .barni-home-arrow {
          color: var(--gold);
          font-size: 22px;
          direction: ltr;
        }
        .barni-home-footer {
          margin-top: 30px;
          text-align: center;
          color: #a99688;
          font-size: 11px;
        }
        .barni-gift-page {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 24px;
        }
        .barni-gift-card {
          width: min(560px, 100%);
          padding: 34px;
          border: 1px solid var(--line);
          border-radius: 30px;
          background: rgba(251,248,242,.92);
          box-shadow: 0 25px 70px rgba(59,36,27,.10);
          text-align: center;
        }
        .barni-gift-card .icon { font-size: 48px; }
        .barni-gift-card h1 { margin: 12px 0 8px; font-size: 34px; }
        .barni-gift-card p { margin: 0; color: var(--muted); line-height: 1.9; }
        .barni-home-back {
          margin-top: 24px;
          border: 0;
          border-radius: 999px;
          padding: 12px 22px;
          background: var(--brown);
          color: white;
          cursor: pointer;
          font-weight: 800;
        }
        @keyframes barni-home-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 560px) {
          .barni-home-shell { width: min(100% - 24px, 520px); padding: 24px 0 20px; }
          .barni-home-link { min-height: 84px; border-radius: 21px; }
          .barni-home-icon { width: 50px; height: 50px; border-radius: 16px; }
          .barni-home-link { grid-template-columns: 50px 1fr 18px; gap: 12px; }
          .barni-home-link strong { font-size: 16px; }
        }
      `}</style>

      <main className="barni-home-shell">
        <section className="barni-home-brand">
          <div className="barni-home-mark">☕</div>
          <h1 className="barni-home-logo">برني</h1>
          <p className="barni-home-tagline">قهوتك، مزاجك، لحظتك.</p>
          <div className="barni-home-english">BARNI CAFÉ</div>
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

          <a
            className="barni-home-link"
            href="https://www.instagram.com/barni.om/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="barni-home-icon">◎</span>
            <span>
              <strong>حسابنا في إنستجرام</strong>
              <small>@barni.om · تابع جديد برني وعروضنا</small>
            </span>
            <span className="barni-home-arrow">↗</span>
          </a>

          <button className="barni-home-link" type="button" onClick={() => goTo('/gift')}>
            <span className="barni-home-icon">🎁</span>
            <span>
              <strong>إرسال هدية</strong>
              <small>أرسل هدية لشخص تحبه</small>
            </span>
            <span className="barni-home-arrow">←</span>
          </button>
        </nav>

        <footer className="barni-home-footer">© برني كافيه · كل لحظة لها مذاقها</footer>
      </main>
    </div>
  )
}

function BarniGiftPage() {
  const goHome = () => {
    window.history.pushState({}, '', '/')
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  const [senderName, setSenderName] = useState('')
  const [senderPhone, setSenderPhone] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [recipientPhone, setRecipientPhone] = useState('')
  const [message, setMessage] = useState('')

  const [giftProducts, setGiftProducts] = useState<Product[]>([])
  const [giftItems, setGiftItems] = useState<string[]>([])
  const [giftMode, setGiftMode] = useState<'menu' | 'special' | 'card'>('menu')
  const [cardValue, setCardValue] = useState('10')
  const [customCardValue, setCustomCardValue] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuCategory, setMenuCategory] = useState('الكل')
  const [loadingProducts, setLoadingProducts] = useState(true)

  const [paymentMethod, setPaymentMethod] =
    useState<'بطاقة' | 'عند التأكيد'>('بطاقة')

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const specialGift = {
    name: 'برني سبشل',
    price: 7,
    description: 'مشروبان + حلى من اختيارك',
  }

  const cardValues = [5, 10, 20, 30]

  useEffect(() => {
    let mounted = true

    const loadGiftProducts = async () => {
      setLoadingProducts(true)

      try {
        // نقرأ كل أعمدة المنتجات حتى يشتغل منيو الهدايا سواء كان مشروعك
        // يستخدم active أو available. ولا نربط ظهور المنتج بقيمة المخزون.
        const { data, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('id', { ascending: true })

        if (productsError) {
          console.error('Gift products error:', productsError)
          if (mounted) {
            setError('تعذر تحميل منيو برني حاليًا.')
            setGiftProducts(defaultProducts)
          }
          return
        }

        const availableProducts = (data ?? [])
          .map((product) => ({
            id: Number(product.id),
            name: String(product.name ?? ''),
            price: Number(product.price ?? 0),
            category: String(product.category ?? ''),
            available:
              product.active !== false && product.available !== false,
            stock: Number(product.stock ?? 0),
          }))
          .filter((product) => product.name.trim() && product.available)

        if (!mounted) return

        // إذا لم ترجع قاعدة البيانات منتجات، لا نخلي النافذة فاضية.
        setGiftProducts(availableProducts.length ? availableProducts : defaultProducts)
      } catch (loadError) {
        console.error('Gift products load failed:', loadError)
        if (mounted) {
          setError('تعذر تحميل منتجات برني.')
        }
      } finally {
        if (mounted) {
          setLoadingProducts(false)
        }
      }
    }

    loadGiftProducts()

    return () => {
      mounted = false
    }
  }, [])

  const selectedGiftProducts = giftProducts.filter((product) =>
    giftItems.includes(String(product.id)),
  )

  const categories = [
    'الكل',
    ...Array.from(
      new Set(
        giftProducts
          .map((product) => product.category.trim())
          .filter(Boolean),
      ),
    ),
  ]

  const visibleMenuProducts =
    menuCategory === 'الكل'
      ? giftProducts
      : giftProducts.filter((product) => product.category === menuCategory)

  const selectedGiftName =
    giftMode === 'menu'
      ? selectedGiftProducts.length
        ? selectedGiftProducts.map((product) => product.name).join(' + ')
        : 'اختر من منيو برني'
      : giftMode === 'special'
        ? specialGift.name
        : 'بطاقة برني'

  const selectedGiftPrice =
    giftMode === 'menu'
      ? selectedGiftProducts.reduce(
          (total, product) => total + product.price,
          0,
        )
      : giftMode === 'special'
        ? specialGift.price
        : cardValue === 'custom'
          ? Number(customCardValue) || 0
          : Number(cardValue)

  const normalizeOmanPhone = (value: string) =>
    value
      .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
      .replace(/[\s-]/g, '')
      .trim()

  const chooseMenuProduct = (product: Product) => {
    const id = String(product.id)

    setGiftItems((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )

    setGiftMode('menu')
    setError('')
  }

  const submitGift = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess(false)

    const cleanSenderName = senderName.trim()
    const cleanSenderPhone = normalizeOmanPhone(senderPhone)
    const cleanRecipientName = recipientName.trim()
    const cleanRecipientPhone = normalizeOmanPhone(recipientPhone)

    if (!cleanSenderName || !cleanRecipientName) {
      setError('اكتب اسم المرسل واسم المستلم')
      return
    }

    if (!/^[79]\d{7}$/.test(cleanSenderPhone)) {
      setError('رقم المرسل يجب أن يكون رقم عماني صحيح من 8 أرقام')
      return
    }

    if (!/^[79]\d{7}$/.test(cleanRecipientPhone)) {
      setError('رقم المستلم يجب أن يكون رقم عماني صحيح من 8 أرقام')
      return
    }

    if (giftMode === 'menu' && selectedGiftProducts.length === 0) {
      setError('اختر منتجًا واحدًا على الأقل من منيو برني')
      return
    }

    if (giftMode === 'card') {
      const amount = Number(
        cardValue === 'custom' ? customCardValue : cardValue,
      )
      if (!Number.isFinite(amount) || amount < 5) {
        setError('أدخل مبلغًا صحيحًا لا يقل عن 5 ر.ع')
        return
      }
    }

    setLoading(true)

    try {
      const giftLabel = `${selectedGiftName} · ${selectedGiftPrice.toFixed(2)} ر.ع`

      const paymentLabel =
        paymentMethod === 'بطاقة'
          ? 'بطاقة'
          : 'يتم تأكيد الدفع مع برني'

      const fullMessage = [
        message.trim(),
        `طريقة الدفع: ${paymentLabel}`,
        giftMode === 'card' ? `قيمة البطاقة: ${cardValue} ر.ع` : '',
      ]
        .filter(Boolean)
        .join('\n')

      const { error: insertError } = await supabase
        .from('gift_orders')
        .insert([
          {
            sender_name: cleanSenderName,
            sender_phone: cleanSenderPhone,
            recipient_name: cleanRecipientName,
            recipient_phone: cleanRecipientPhone,
            gift_item: giftLabel,
            message: fullMessage || null,
            payment_method: paymentMethod,
            payment_status: 'غير مدفوع',
            total: selectedGiftPrice,
            status: 'جديد',
          },
        ])

      if (insertError) {
        console.error('Gift order error:', insertError)
        setError(
          insertError.message?.includes('row-level security')
            ? 'تعذر إرسال الهدية بسبب صلاحيات قاعدة البيانات. تأكد من تشغيل سياسة gift_orders في Supabase.'
            : insertError.message || 'تعذر إرسال الهدية، حاول مرة ثانية.',
        )
        return
      }

      setSuccess(true)
      setGiftItems([])
      setCustomCardValue('')
      setSenderName('')
      setSenderPhone('')
      setRecipientName('')
      setRecipientPhone('')
      setMessage('')
    } catch (submitError) {
      console.error('Gift submit error:', submitError)
      setError('صار خطأ غير متوقع أثناء إرسال الهدية.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="barni-public-home" dir="rtl">
      <style>{`
        .barni-gift-page {
          min-height: 100vh;
          padding: 34px 16px 50px;
        }

        .barni-gift-wrap {
          width: min(920px, 100%);
          margin: 0 auto;
        }

        .barni-gift-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }

        .barni-gift-brand {
          color: #3b241b;
          font-size: 20px;
          font-weight: 900;
        }

        .barni-home-back {
          border: 1px solid #e7ddd1;
          border-radius: 999px;
          background: #fffdfa;
          color: #3b241b;
          padding: 11px 18px;
          font-family: inherit;
          font-weight: 900;
          cursor: pointer;
        }

        .barni-gift-hero {
          padding: 34px 24px;
          border: 1px solid #e7ddd1;
          border-radius: 30px;
          background: rgba(255,253,249,.94);
          text-align: center;
          box-shadow: 0 25px 70px rgba(59,36,27,.10);
          margin-bottom: 16px;
        }

        .barni-gift-icon {
          width: 74px;
          height: 74px;
          margin: 0 auto 14px;
          display: grid;
          place-items: center;
          border-radius: 24px;
          background: #3b241b;
          font-size: 36px;
        }

        .barni-gift-hero h1 {
          margin: 0;
          color: #3b241b;
          font-size: clamp(32px, 7vw, 48px);
          font-weight: 900;
        }

        .barni-gift-hero p {
          margin: 10px auto 0;
          max-width: 650px;
          color: #8d7668;
          font-size: 16px;
          line-height: 1.9;
        }

        .barni-gift-box {
          margin-top: 16px;
          padding: 24px;
          border: 1px solid #e7ddd1;
          border-radius: 26px;
          background: rgba(255,253,249,.94);
          box-shadow: 0 18px 55px rgba(59,36,27,.07);
        }

        .barni-gift-title {
          margin: 0 0 15px;
          color: #3b241b;
          font-size: 20px;
          font-weight: 900;
        }

        .barni-gift-options {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .barni-gift-option {
          min-height: 150px;
          padding: 17px;
          border: 1px solid #e7ddd1;
          border-radius: 21px;
          background: #fff;
          color: #3b241b;
          text-align: right;
          cursor: pointer;
          font-family: inherit;
          transition: .2s ease;
        }

        .barni-gift-option:hover {
          transform: translateY(-2px);
        }

        .barni-gift-option.active {
          border-color: #b98b5d;
          box-shadow: 0 0 0 2px rgba(185,139,93,.18);
          background: #fffaf3;
        }

        .barni-gift-option .emoji {
          display: block;
          font-size: 30px;
          margin-bottom: 11px;
        }

        .barni-gift-option strong {
          display: block;
          font-size: 17px;
        }

        .barni-gift-option small {
          display: block;
          margin-top: 5px;
          color: #8d7668;
          line-height: 1.6;
        }

        .barni-gift-option .price {
          display: block;
          margin-top: 10px;
          color: #b98b5d;
          font-size: 16px;
          font-weight: 900;
        }

        .barni-selected-product {
          margin-top: 14px;
          padding: 16px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          border-radius: 19px;
          background: #f5ede4;
        }

        .barni-selected-product .selected-meta {
          min-width: 0;
        }

        .barni-selected-product strong {
          display: block;
          color: #3b241b;
          font-size: 18px;
        }

        .barni-selected-product small {
          display: block;
          margin-top: 4px;
          color: #8d7668;
        }

        .barni-selected-product .selected-price {
          color: #b98b5d;
          font-size: 20px;
          font-weight: 900;
          white-space: nowrap;
        }

        .barni-menu-open {
          width: 100%;
          margin-top: 14px;
          border: 0;
          border-radius: 17px;
          padding: 15px;
          background: #3b241b;
          color: #fff;
          font-family: inherit;
          font-size: 15px;
          font-weight: 900;
          cursor: pointer;
        }

        .barni-menu-empty {
          margin-top: 12px;
          padding: 13px;
          border-radius: 15px;
          background: #f8e5df;
          color: #8f3020;
          text-align: center;
          font-weight: 800;
        }

        .barni-gift-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 13px;
        }

        .barni-gift-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .barni-gift-field.full {
          grid-column: 1 / -1;
        }

        .barni-gift-field label {
          color: #5b3829;
          font-size: 13px;
          font-weight: 900;
        }

        .barni-gift-field input,
        .barni-gift-field textarea,
        .barni-gift-field select {
          width: 100%;
          border: 1px solid #e1d3c4;
          border-radius: 15px;
          background: #fffdfa;
          color: #3b241b;
          padding: 13px;
          outline: none;
          font-family: inherit;
          font-size: 14px;
        }

        .barni-gift-field textarea {
          min-height: 105px;
          resize: vertical;
        }

        .barni-payment-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .barni-payment-button {
          padding: 15px;
          border: 1px solid #e1d3c4;
          border-radius: 16px;
          background: #fff;
          color: #3b241b;
          font-family: inherit;
          font-weight: 900;
          cursor: pointer;
        }

        .barni-payment-button.active {
          border-color: #b98b5d;
          background: #fff8ef;
          box-shadow: 0 0 0 2px rgba(185,139,93,.14);
        }

        .barni-gift-summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-top: 18px;
          padding: 17px;
          border-radius: 18px;
          background: #f3e7d8;
        }

        .barni-gift-summary small {
          display: block;
          margin-top: 5px;
          color: #8d7668;
        }

        .barni-gift-summary strong {
          font-size: 21px;
          white-space: nowrap;
        }

        .barni-gift-submit {
          width: 100%;
          min-height: 54px;
          margin-top: 14px;
          border: 0;
          border-radius: 17px;
          background: #3b241b;
          color: #fff;
          font-family: inherit;
          font-size: 16px;
          font-weight: 900;
          cursor: pointer;
        }

        .barni-gift-submit:disabled {
          opacity: .6;
          cursor: wait;
        }

        .barni-gift-note,
        .barni-gift-error,
        .barni-gift-success {
          margin-top: 13px;
          padding: 13px;
          border-radius: 14px;
          text-align: center;
          font-size: 12px;
          line-height: 1.8;
        }

        .barni-gift-note {
          color: #8d7668;
          background: #faf4ec;
        }

        .barni-gift-error {
          color: #8f3020;
          background: #f8e5df;
          font-weight: 800;
        }

        .barni-gift-success {
          color: #365c39;
          background: #e9f1e8;
          font-weight: 900;
        }

        /* قائمة المنيو الخاصة بالهدايا: بدون سلة وبدون تحويل لصفحة المنيو */
        .barni-gift-menu-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          padding: 24px;
          background: rgba(35, 22, 17, .42);
          backdrop-filter: blur(8px);
          overflow-y: auto;
        }

        .barni-gift-menu-modal {
          width: min(1050px, 100%);
          min-height: calc(100vh - 48px);
          margin: 0 auto;
          padding: 24px;
          border-radius: 30px;
          background: #f6f0e7;
          box-shadow: 0 30px 90px rgba(0,0,0,.25);
        }

        .barni-gift-menu-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 18px;
        }

        .barni-gift-menu-head h2 {
          margin: 0;
          color: #3b241b;
          font-size: 30px;
          font-weight: 900;
        }

        .barni-gift-menu-close {
          width: 45px;
          height: 45px;
          border: 1px solid #e1d3c4;
          border-radius: 50%;
          background: #fff;
          color: #3b241b;
          font-size: 22px;
          cursor: pointer;
        }

        .barni-gift-menu-subtitle {
          margin: -8px 0 18px;
          color: #8d7668;
        }

        .barni-gift-menu-categories {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }

        .barni-gift-menu-category {
          border: 1px solid #e1d3c4;
          border-radius: 999px;
          padding: 10px 16px;
          background: #fffdfa;
          color: #5b3829;
          font-family: inherit;
          font-weight: 800;
          cursor: pointer;
        }

        .barni-gift-menu-category.active {
          background: #3b241b;
          border-color: #3b241b;
          color: #fff;
        }

        .barni-gift-products {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .barni-gift-product {
          min-height: 185px;
          padding: 18px;
          border: 1px solid #e5d8ca;
          border-radius: 22px;
          background: #fffdfa;
          color: #3b241b;
          text-align: right;
          cursor: pointer;
          font-family: inherit;
          transition: .2s ease;
        }

        .barni-gift-product:hover {
          transform: translateY(-3px);
          border-color: #b98b5d;
          box-shadow: 0 12px 30px rgba(59,36,27,.10);
        }

        .barni-gift-product.selected {
          border-color: #b98b5d;
          background: #fff7ed;
          box-shadow: 0 0 0 2px rgba(185,139,93,.18);
        }

        .barni-gift-product-icon {
          width: 58px;
          height: 58px;
          margin-bottom: 14px;
          display: grid;
          place-items: center;
          border-radius: 18px;
          background: #f1e3d3;
          font-size: 29px;
        }

        .barni-gift-product strong {
          display: block;
          font-size: 18px;
        }

        .barni-gift-product small {
          display: block;
          min-height: 40px;
          margin-top: 6px;
          color: #8d7668;
          line-height: 1.6;
        }

        .barni-gift-product-price {
          display: block;
          margin-top: 10px;
          color: #b98b5d;
          font-size: 17px;
          font-weight: 900;
        }

        .barni-gift-menu-loading,
        .barni-gift-menu-empty-state {
          padding: 50px 20px;
          border: 1px dashed #d9c9b8;
          border-radius: 22px;
          background: rgba(255,253,249,.7);
          color: #8d7668;
          text-align: center;
          font-weight: 800;
        }

        @media (max-width: 760px) {
          .barni-gift-options,
          .barni-gift-products,
          .barni-gift-grid,
          .barni-payment-options {
            grid-template-columns: 1fr;
          }

          .barni-gift-field.full {
            grid-column: auto;
          }

          .barni-gift-box,
          .barni-gift-menu-modal {
            padding: 18px;
          }

          .barni-gift-menu-overlay {
            padding: 10px;
          }

          .barni-gift-menu-modal {
            min-height: calc(100vh - 20px);
            border-radius: 22px;
          }

          .barni-gift-summary,
          .barni-selected-product {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>

      <main className="barni-gift-page">
        <div className="barni-gift-wrap">
          <div className="barni-gift-top">
            <strong className="barni-gift-brand">☕ برني</strong>
            <button className="barni-home-back" type="button" onClick={goHome}>
              ← العودة إلى برني
            </button>
          </div>

          <section className="barni-gift-hero">
            <div className="barni-gift-icon">🎁</div>
            <h1>أرسل هدية من برني</h1>
            <p>
              اختر الهدية، وحدد الشخص الذي تريد إسعاده،
              واترك لنا تجهيز لحظته الجميلة.
            </p>
          </section>

          <form onSubmit={submitGift}>
            <section className="barni-gift-box">
              <h2 className="barni-gift-title">١. اختر هديتك</h2>

              <div className="barni-gift-options">
                <button
                  type="button"
                  className={`barni-gift-option ${giftMode === 'menu' ? 'active' : ''}`}
                  onClick={() => {
                    setGiftMode('menu')
                    setMenuOpen(true)
                  }}
                >
                  <span className="emoji">☕</span>
                  <strong>من منيو برني</strong>
                  <small>
                    اختر أي منتج من المنيو واجعله هديتك
                  </small>
                  <span className="price">
                    {selectedGiftProducts.length
                      ? `${selectedGiftPrice.toFixed(2)} ر.ع`
                      : 'اختر المنتجات'}
                  </span>
                </button>

                <button
                  type="button"
                  className={`barni-gift-option ${giftMode === 'special' ? 'active' : ''}`}
                  onClick={() => setGiftMode('special')}
                >
                  <span className="emoji">🎁</span>
                  <strong>برني سبشل</strong>
                  <small>{specialGift.description}</small>
                  <span className="price">
                    {specialGift.price.toFixed(2)} ر.ع
                  </span>
                </button>

                <button
                  type="button"
                  className={`barni-gift-option ${giftMode === 'card' ? 'active' : ''}`}
                  onClick={() => setGiftMode('card')}
                >
                  <span className="emoji">💳</span>
                  <strong>بطاقة برني</strong>
                  <small>أرسل رصيدًا يختاره المستلم من برني</small>
                  <span className="price">ابتداءً من 5 ر.ع</span>
                </button>
              </div>

              {giftMode === 'menu' && selectedGiftProducts.length > 0 && (
                <div className="barni-selected-product">
                  <div className="selected-meta">
                    <strong>
                      ☕ {selectedGiftProducts.map((product) => product.name).join(' + ')}
                    </strong>
                    <small>
                      {selectedGiftProducts.length} منتجات · تم اختيارها كهدية
                    </small>
                  </div>

                  <span className="selected-price">
                    {selectedGiftPrice.toFixed(2)} ر.ع
                  </span>
                </div>
              )}

              {giftMode === 'menu' && (
                <button
                  type="button"
                  className="barni-menu-open"
                  onClick={() => setMenuOpen(true)}
                >
                  {selectedGiftProducts.length
                    ? 'إضافة أو إزالة منتجات من المنيو'
                    : 'افتح منيو برني واختر هديتك'}
                </button>
              )}

              {giftMode === 'card' && (
                <div className="barni-gift-menu" style={{ marginTop: 14 }}>
                  <label htmlFor="gift-card-value">اختر قيمة بطاقة برني</label>
                  <select
                    id="gift-card-value"
                    value={cardValue}
                    onChange={(event) => {
                      setCardValue(event.target.value)
                      if (event.target.value !== 'custom') {
                        setCustomCardValue('')
                      }
                    }}
                    style={{
                      width: '100%',
                      minHeight: 52,
                      marginTop: 8,
                      padding: '0 14px',
                      border: '1px solid #d8c7b7',
                      borderRadius: 16,
                      background: '#fffdfa',
                      color: '#3b241b',
                      fontFamily: 'inherit',
                      fontSize: 16,
                      fontWeight: 800,
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {cardValues.map((value) => (
                      <option key={value} value={String(value)}>
                        {value.toFixed(2)} ر.ع
                      </option>
                    ))}
                    <option value="custom">مبلغ آخر</option>
                  </select>

                  {cardValue === 'custom' && (
                    <div style={{ marginTop: 10 }}>
                      <label htmlFor="custom-card-value">حدد المبلغ</label>
                      <input
                        id="custom-card-value"
                        type="number"
                        min="5"
                        step="0.5"
                        value={customCardValue}
                        onChange={(event) => setCustomCardValue(event.target.value)}
                        placeholder="مثال: 15"
                        inputMode="decimal"
                        style={{
                          width: '100%',
                          minHeight: 52,
                          marginTop: 8,
                          padding: '0 14px',
                          border: '1px solid #d8c7b7',
                          borderRadius: 16,
                          background: '#fffdfa',
                          color: '#3b241b',
                          fontFamily: 'inherit',
                          fontSize: 16,
                          fontWeight: 800,
                          outline: 'none',
                        }}
                      />
                      <small style={{ display: 'block', marginTop: 6, color: '#8d7668' }}>
                        الحد الأدنى 5 ر.ع
                      </small>
                    </div>
                  )}
                </div>
              )}
            </section>

            <section className="barni-gift-box">
              <h2 className="barni-gift-title">٢. بيانات المستلم والمرسل</h2>

              <div className="barni-gift-grid">
                <div className="barni-gift-field">
                  <label htmlFor="gift-sender-name">اسمك</label>
                  <input
                    id="gift-sender-name"
                    value={senderName}
                    onChange={(event) => setSenderName(event.target.value)}
                    placeholder="اسم المرسل"
                    required
                  />
                </div>

                <div className="barni-gift-field">
                  <label htmlFor="gift-sender-phone">رقم هاتفك</label>
                  <input
                    id="gift-sender-phone"
                    value={senderPhone}
                    onChange={(event) => setSenderPhone(event.target.value)}
                    placeholder="9XXXXXXX"
                    inputMode="numeric"
                    maxLength={8}
                    required
                  />
                </div>

                <div className="barni-gift-field">
                  <label htmlFor="gift-recipient-name">اسم المستلم</label>
                  <input
                    id="gift-recipient-name"
                    value={recipientName}
                    onChange={(event) => setRecipientName(event.target.value)}
                    placeholder="اسم الشخص الذي تهديه"
                    required
                  />
                </div>

                <div className="barni-gift-field">
                  <label htmlFor="gift-recipient-phone">رقم المستلم</label>
                  <input
                    id="gift-recipient-phone"
                    value={recipientPhone}
                    onChange={(event) => setRecipientPhone(event.target.value)}
                    placeholder="9XXXXXXX"
                    inputMode="numeric"
                    maxLength={8}
                    required
                  />
                </div>

                <div className="barni-gift-field full">
                  <label htmlFor="gift-message">رسالة مع الهدية</label>
                  <textarea
                    id="gift-message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="اكتب رسالة جميلة للشخص..."
                    maxLength={300}
                  />
                </div>
              </div>
            </section>

            <section className="barni-gift-box">
              <h2 className="barni-gift-title">٣. طريقة الدفع</h2>

              <div className="barni-payment-options">
                <button
                  type="button"
                  className={`barni-payment-button ${paymentMethod === 'بطاقة' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('بطاقة')}
                >
                  💳 بطاقة
                </button>

                <button
                  type="button"
                  className={`barni-payment-button ${paymentMethod === 'عند التأكيد' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('عند التأكيد')}
                >
                  📞 عند تأكيد الطلب
                </button>
              </div>

              <div className="barni-gift-note">
                سيتم حفظ طريقة الدفع مع طلب الهدية لتأكيدها مع برني.
              </div>
            </section>

            <section className="barni-gift-box">
              <h2 className="barni-gift-title">٤. ملخص الهدية</h2>

              <div className="barni-gift-summary">
                <div>
                  <strong>🎁 {selectedGiftName}</strong>
                  <small>طريقة الدفع: {paymentMethod}</small>
                </div>

                <strong>{selectedGiftPrice.toFixed(2)} ر.ع</strong>
              </div>

              {error && (
                <div className="barni-gift-error" role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div className="barni-gift-success" role="status">
                  تم إرسال طلب الهدية بنجاح 🎁
                  <br />
                  بنتواصل معك لتأكيد التفاصيل والدفع.
                </div>
              )}

              <button
                className="barni-gift-submit"
                type="submit"
                disabled={
                  loading ||
                  loadingProducts ||
                  (giftMode === 'menu' && selectedGiftProducts.length === 0)
                }
              >
                {loading ? 'جاري إرسال الطلب...' : 'إتمام طلب الهدية 🎁'}
              </button>

              <div className="barni-gift-note">
                بعد إرسال الطلب تظهر التفاصيل لدى برني، ثم يتم تأكيد الطلب
                والدفع حسب الطريقة المختارة.
              </div>
            </section>
          </form>
        </div>
      </main>

      {menuOpen && (
        <div
          className="barni-gift-menu-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setMenuOpen(false)
            }
          }}
        >
          <div className="barni-gift-menu-modal">
            <div className="barni-gift-menu-head">
              <div>
                <h2>منيو برني</h2>
              </div>

              <button
                type="button"
                className="barni-gift-menu-close"
                onClick={() => setMenuOpen(false)}
                aria-label="إغلاق المنيو"
              >
                ×
              </button>
            </div>

            <p className="barni-gift-menu-subtitle">
              اختر أكثر من منتج إذا تريد، واضغط على المنتج مرة ثانية لإزالته.
            </p>

            {loadingProducts ? (
              <div className="barni-gift-menu-loading">
                جاري تحميل منتجات برني...
              </div>
            ) : giftProducts.length === 0 ? (
              <div className="barni-gift-menu-empty-state">
                جاري تجهيز منتجات برني... إذا ظهرت هذه الرسالة، تأكد أن منتجات المنيو مفعّلة في لوحة الإدارة.
              </div>
            ) : (
              <>
                <div className="barni-gift-menu-categories">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      className={`barni-gift-menu-category ${
                        menuCategory === category ? 'active' : ''
                      }`}
                      onClick={() => setMenuCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                <div className="barni-gift-products">
                  {visibleMenuProducts.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      className={`barni-gift-product ${
                        giftItems.includes(String(product.id)) ? 'selected' : ''
                      }`}
                      onClick={() => chooseMenuProduct(product)}
                    >
                      <span className="barni-gift-product-icon">
                        {product.category.includes('حلى') ? '🍰' : '☕'}
                      </span>

                      <strong>{product.name}</strong>

                      <small>
                        {product.category || 'من منيو برني'}
                      </small>

                      <span className="barni-gift-product-price">
                        {product.price.toFixed(2)} ر.ع
                      </span>
                      <span
                        style={{
                          display: 'block',
                          marginTop: 8,
                          fontWeight: 900,
                          color: giftItems.includes(String(product.id))
                            ? '#3b241b'
                            : '#b98b5d',
                        }}
                      >
                        {giftItems.includes(String(product.id))
                          ? '✓ تمت الإضافة'
                          : '＋ إضافة'}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function App() {
  const [currentPath, setCurrentPath] = useState<string>(
    () => window.location.pathname || '/',
  )

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/')
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  const goToCustomer = () => {
    window.history.pushState({}, '', '/customer')
    setCurrentPath('/customer')
  }

  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [loginLoading, setLoginLoading] = useState(false)

  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error' | 'info'
  } | null>(null)

  const notify = (
    message: string,
    type: 'success' | 'error' | 'info' = 'info',
  ) => {
    setToast({ message, type })
    window.setTimeout(() => setToast(null), 2600)
  }

  // =========================
  // تنبيهات الطلبات الصوتية
  // =========================
  const [soundMuted, setSoundMuted] = useState<boolean>(() => {
    return localStorage.getItem('barni-order-sound-muted') === 'true'
  })

  const audioContextRef = useRef<AudioContext | null>(null)

  const getAudioContext = () => {
    if (typeof window === 'undefined') return null

    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & {
        webkitAudioContext?: typeof AudioContext
      }).webkitAudioContext

    if (!AudioContextClass) return null

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass()
    }

    if (audioContextRef.current.state === 'suspended') {
      void audioContextRef.current.resume()
    }

    return audioContextRef.current
  }

  const playOrderNotificationSound = (
    kind: 'order' | 'gift' | 'ready' = 'order',
  ) => {
    if (soundMuted) return

    const context = getAudioContext()
    if (!context) return

    const notes =
      kind === 'gift'
        ? [880, 1175, 1568]
        : kind === 'ready'
          ? [659, 784, 988]
          : [523, 659, 784]

    const now = context.currentTime

    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.value = frequency

      gain.gain.setValueAtTime(0.0001, now + index * 0.12)
      gain.gain.exponentialRampToValueAtTime(
        0.18,
        now + index * 0.12 + 0.025,
      )
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + index * 0.12 + 0.18,
      )

      oscillator.connect(gain)
      gain.connect(context.destination)

      oscillator.start(now + index * 0.12)
      oscillator.stop(now + index * 0.12 + 0.2)
    })
  }

  const toggleOrderSound = () => {
    const next = !soundMuted
    setSoundMuted(next)
    localStorage.setItem('barni-order-sound-muted', String(next))

    if (!next) {
      playOrderNotificationSound('order')
      notify('تم تشغيل صوت تنبيهات الطلبات', 'success')
    } else {
      notify('تم كتم صوت تنبيهات الطلبات')
    }
  }

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('barni-products')

    if (!saved) return defaultProducts

    try {
      const parsed = JSON.parse(saved)

      return parsed.map((product: Product) => ({
        ...product,
        stock: product.stock ?? 20,
        available:
          product.stock > 0
            ? product.available ?? true
            : false,
      }))
    } catch {
      return defaultProducts
    }
  })

  // تحميل المنتجات من Supabase
  useEffect(() => {
    const loadProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('id', { ascending: true })

      if (error) {
        console.error('Supabase products error:', error)
        return
      }

      if (data && data.length > 0) {
        const dbProducts: Product[] = data.map((product) => ({
          id: product.id,
          name: product.name,
          price: Number(product.price),
          category: product.category,
          available: product.active && product.stock > 0,
          stock: product.stock,
        }))

        setProducts(dbProducts)
      }
    }

    loadProducts()
  }, [])

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('barni-coupons')

    if (!saved) return defaultCoupons

    try {
      const parsed = JSON.parse(saved)

      if (!Array.isArray(parsed) || parsed.length === 0) {
        return defaultCoupons
      }

      return parsed
    } catch {
      return defaultCoupons
    }
  })

  useEffect(() => {
    const loadCoupons = async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('id', { ascending: true })

      if (error) {
        console.error('Supabase coupons error:', error)
        return
      }

      setCoupons((data ?? []).map((coupon: any) => ({
        id: Number(coupon.id),
        code: String(coupon.code ?? '').toUpperCase(),
        percent: Number(coupon.percent ?? 0),
        active: coupon.active !== false,
      })))
    }

    loadCoupons()
  }, [])

  const [cart, setCart] = useState<CartItem[]>([])

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('barni-orders')

    if (!saved) return []

    try {
      return JSON.parse(saved).map((order: Order) => ({
        ...order,
        createdAtDate:
          order.createdAtDate ?? '',
        discountCode:
          order.discountCode ?? '',
        discountPercent:
          order.discountPercent ?? 0,
        discountAmount:
          order.discountAmount ?? 0,
      }))
    } catch {
      return []
    }
  })

  const normalizeOrder = (order: any): Order => ({
    id: Number(order.id),

    // يدعم بيانات الطلب سواء جاءت من orders مباشرة
    // أو بعد دمجها مع order_items.
    items: Array.isArray(order.items)
      ? order.items.map((item: any) => ({
          id: Number(item.id ?? item.product_id),
          name: String(
            item.name ??
              item.product_name ??
              '',
          ),
          price: Number(item.price ?? 0),
          category: String(item.category ?? ''),
          quantity: Number(item.quantity ?? 1),
          stock: Number(item.stock ?? 999999),
          available: true,
        }))
      : [],

    type:
      order.type ??
      order.order_type ??
      'سفري',

    table:
      order.table ??
      order.table_id ??
      '',

    paymentMethod:
      order.paymentMethod ??
      order.payment_method ??
      'نقدي',

    discountCode:
      order.discountCode ??
      order.discount_code ??
      '',

    discountPercent: Number(
      order.discountPercent ??
        order.discount_percent ??
        0,
    ),

    discountAmount: Number(
      order.discountAmount ??
        order.discount_amount ??
        0,
    ),

    total: Number(order.total ?? 0),

    status: order.status ?? 'جديد',

    createdAt:
      order.createdAt ??
      order.created_at ??
      '',

    createdAtDate:
      order.createdAtDate ??
      order.created_at ??
      '',
  })

  useEffect(() => {
    if (!user) return

    let cancelled = false

    const loadOrders = async () => {
      // تحميل الطلبات الأساسية أولاً.
      const { data: ordersData, error: ordersError } =
        await supabase
          .from('orders')
          .select('*')
          .order('id', { ascending: false })
          .limit(500)

      if (ordersError) {
        console.error(
          'Supabase orders error:',
          ordersError,
        )
        return
      }

      const rawOrders = ordersData ?? []

      if (rawOrders.length === 0) {
        if (!cancelled) setOrders([])
        return
      }

      // المنتجات ليست داخل orders عندنا.
      // هي محفوظة في جدول order_items، لذلك لازم
      // نحملها ونربطها برقم الطلب حتى تظهر في المطبخ.
      const orderIds = rawOrders
        .map((order: any) => Number(order.id))
        .filter((id: number) => Number.isFinite(id))

      const {
        data: itemsData,
        error: itemsError,
      } = await supabase
        .from('order_items')
        .select(
          'order_id, product_id, product_name, price, quantity, subtotal',
        )
        .in('order_id', orderIds)

      if (itemsError) {
        console.error(
          'Supabase order_items error:',
          itemsError,
        )

        // الطلب نفسه يظل ظاهرًا حتى لو فشل تحميل
        // التفاصيل، بدل ما تختفي شاشة المطبخ بالكامل.
        if (!cancelled) {
          setOrders(
            rawOrders.map((order: any) =>
              normalizeOrder(order),
            ),
          )
        }
        return
      }

      const itemsByOrder = new Map<number, any[]>()

      for (const item of itemsData ?? []) {
        const orderId = Number(item.order_id)
        const current =
          itemsByOrder.get(orderId) ?? []

        current.push({
          id: Number(item.product_id),
          name: String(
            item.product_name ?? '',
          ),
          price: Number(item.price ?? 0),
          category: '',
          quantity: Number(item.quantity ?? 1),
          stock: 999999,
          available: true,
        })

        itemsByOrder.set(orderId, current)
      }

      const normalizedOrders = rawOrders.map(
        (order: any) =>
          normalizeOrder({
            ...order,
            items:
              itemsByOrder.get(Number(order.id)) ??
              [],
          }),
      )

      if (!cancelled) {
        setOrders(normalizedOrders)
      }
    }

    loadOrders()
    const timer = window.setInterval(loadOrders, 4000)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [user])

  const [orderType, setOrderType] = useState('سفري')
  const [tableNumber, setTableNumber] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'نقدي' | 'بطاقة'>('نقدي')
  const [discountCode, setDiscountCode] = useState('')
  const [discountPercent, setDiscountPercent] = useState(0)
  const [selectedCategory, setSelectedCategory] =
    useState('الكل')

  const [page, setPage] = useState<
    | 'cashier'
    | 'kitchen'
    | 'orders'
    | 'gift-orders'
    | 'dashboard'
    | 'admin'
  >('cashier')

  // =========================
  // عدادات الطلبات الجديدة
  // =========================
  const [newOrdersCount, setNewOrdersCount] = useState(0)
  const [newGiftOrdersCount, setNewGiftOrdersCount] = useState(0)

  const markOrdersSeen = () => {
    const maxId = orders.reduce(
      (max, order) => Math.max(max, Number(order.id) || 0),
      0,
    )

    if (maxId > 0) {
      localStorage.setItem('barni-last-seen-order-id', String(maxId))
    }

    setNewOrdersCount(0)
  }

  const markGiftOrdersSeen = async () => {
    try {
      const { data } = await supabase
        .from('gift_orders')
        .select('id')
        .order('id', { ascending: false })
        .limit(500)

      const maxId = (data ?? []).reduce(
        (max: number, row: any) => Math.max(max, Number(row.id) || 0),
        0,
      )

      if (maxId > 0) {
        localStorage.setItem('barni-last-seen-gift-order-id', String(maxId))
      }
    } catch (error) {
      console.error('Gift seen marker error:', error)
    }

    setNewGiftOrdersCount(0)
  }

  // الطلبات العادية: أول تحميل لا يعتبر الطلبات القديمة جديدة.
  useEffect(() => {
    if (!user || orders.length === 0) return

    const maxId = orders.reduce(
      (max, order) => Math.max(max, Number(order.id) || 0),
      0,
    )

    if (maxId === 0) return

    const savedLastSeen = localStorage.getItem('barni-last-seen-order-id')

    if (!savedLastSeen) {
      localStorage.setItem('barni-last-seen-order-id', String(maxId))
      setNewOrdersCount(0)
      return
    }

    const lastSeen = Number(savedLastSeen) || 0
    const newOrders = orders.filter(
      (order) => Number(order.id) > lastSeen,
    )

    setNewOrdersCount(newOrders.length)

    const savedLastNotified = Number(
      localStorage.getItem('barni-last-notified-order-id') || '0',
    )

    const unseenForSound = orders.filter(
      (order) => Number(order.id) > savedLastNotified,
    )

    if (unseenForSound.length > 0) {
      const newest = Math.max(
        ...unseenForSound.map((order) => Number(order.id) || 0),
      )

      localStorage.setItem(
        'barni-last-notified-order-id',
        String(newest),
      )

      playOrderNotificationSound('order')
      notify(
        unseenForSound.length === 1
          ? `وصل طلب جديد #${newest} 🔔`
          : `وصلت ${unseenForSound.length} طلبات جديدة 🔔`,
        'info',
      )
    }
  }, [orders, user])

  // الهدايا: نراقب جدول gift_orders كل 4 ثوانٍ.
  useEffect(() => {
    if (!user) return

    let cancelled = false

    const checkGiftOrders = async () => {
      const { data, error } = await supabase
        .from('gift_orders')
        .select('id')
        .order('id', { ascending: false })
        .limit(500)

      if (error || cancelled) return

      const rows = data ?? []
      const maxId = rows.reduce(
        (max: number, row: any) => Math.max(max, Number(row.id) || 0),
        0,
      )

      if (maxId === 0) {
        setNewGiftOrdersCount(0)
        return
      }

      const savedLastSeen = localStorage.getItem('barni-last-seen-gift-order-id')

      if (!savedLastSeen) {
        localStorage.setItem('barni-last-seen-gift-order-id', String(maxId))
        setNewGiftOrdersCount(0)
        return
      }

      const lastSeen = Number(savedLastSeen) || 0
      const newGiftOrders = rows.filter(
        (row: any) => Number(row.id) > lastSeen,
      )

      setNewGiftOrdersCount(newGiftOrders.length)

      const savedLastNotified = Number(
        localStorage.getItem('barni-last-notified-gift-order-id') || '0',
      )

      const unseenForSound = rows.filter(
        (row: any) => Number(row.id) > savedLastNotified,
      )

      if (unseenForSound.length > 0) {
        const newest = Math.max(
          ...unseenForSound.map((row: any) => Number(row.id) || 0),
        )

        localStorage.setItem(
          'barni-last-notified-gift-order-id',
          String(newest),
        )

        playOrderNotificationSound('gift')
        notify(
          unseenForSound.length === 1
            ? `وصلت هدية جديدة #${newest} 🎁`
            : `وصلت ${unseenForSound.length} هدايا جديدة 🎁`,
          'info',
        )
      }
    }

    checkGiftOrders()
    const timer = window.setInterval(checkGiftOrders, 4000)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [user])

  const [salesPeriod, setSalesPeriod] = useState<
    'today' | 'week' | 'month' | 'all'
  >('today')

  const [kitchenFilter, setKitchenFilter] = useState<
    'all' | 'جديد' | 'قيد التحضير'
  >('all')

  // إضافة منتج
  const [newName, setNewName] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newStock, setNewStock] = useState('')
  const [newCategory, setNewCategory] = useState('قهوة')

  // =========================
  // QR الطاولات
  // =========================
  const [customerBaseUrl, setCustomerBaseUrl] = useState(() => {
    const saved = localStorage.getItem('barni-customer-base-url')
    return saved || 'https://barni-cafe.barnicafe-om.workers.dev'
  })

  const tableCount = 4

  const saveCustomerBaseUrl = (value: string) => {
    const clean = value.trim().replace(/\/$/, '')
    setCustomerBaseUrl(clean)
    localStorage.setItem('barni-customer-base-url', clean)
  }

  const getTableCustomerUrl = (tableNumber: number) =>
    `${customerBaseUrl.replace(/\/$/, '')}/customer?table=${tableNumber}`

  const getTableQrUrl = (tableNumber: number) =>
    `https://quickchart.io/qr?size=420&margin=2&text=${encodeURIComponent(
      getTableCustomerUrl(tableNumber),
    )}`

  const printTableQrs = () => {
    const cards = Array.from({ length: tableCount }, (_, index) => {
      const tableNumber = index + 1
      return `
        <section class="qr-card">
          <h1>برني كافيه</h1>
          <h2>طاولة ${tableNumber}</h2>
          <img src="${getTableQrUrl(tableNumber)}" alt="QR طاولة ${tableNumber}" />
          <p>امسح الرمز لفتح المنيو والطلب</p>
        </section>
      `
    }).join('')

    const printWindow = window.open('', '_blank', 'width=900,height=900')
    if (!printWindow) {
      notify('المتصفح منع نافذة الطباعة', 'error')
      return
    }

    printWindow.document.write(`
      <!doctype html>
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="UTF-8" />
          <title>QR طاولات برني</title>
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 24px;
              font-family: Arial, sans-serif;
              background: #fff;
              color: #241b17;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 24px;
            }
            .qr-card {
              min-height: 420px;
              border: 2px solid #241b17;
              border-radius: 24px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 24px;
              text-align: center;
              break-inside: avoid;
            }
            .qr-card h1 { margin: 0 0 8px; font-size: 26px; }
            .qr-card h2 { margin: 0 0 14px; font-size: 30px; }
            .qr-card img { width: 260px; height: 260px; }
            .qr-card p { margin: 14px 0 0; font-size: 16px; }
            @media print {
              body { padding: 0; }
              .grid { gap: 12px; }
              .qr-card { min-height: 48vh; }
            }
          </style>
        </head>
        <body>
          <div class="grid">${cards}</div>
          <script>
            window.onload = () => {
              setTimeout(() => window.print(), 700);
            };
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const [newCouponCode, setNewCouponCode] = useState('')
  const [newCouponPercent, setNewCouponPercent] = useState('')

  // تعديل منتج
  const [editingId, setEditingId] = useState<number | null>(
    null,
  )

  const [editingName, setEditingName] = useState('')
  const [editingPrice, setEditingPrice] = useState('')
  const [editingCategory, setEditingCategory] =
    useState('قهوة')
  const [editingStock, setEditingStock] = useState('')
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null)

  const loadStaffProfile = async (
    email: string,
    authId: string,
    authUser?: {
      app_metadata?: Record<string, unknown>
      user_metadata?: Record<string, unknown>
    },
  ) => {
    const normalizedEmail = email.trim().toLowerCase()

    const { data, error } = await supabase
      .from('staff_profiles')
      .select('email,name,role')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (!error && data) {
      const role = String(data.role ?? '')
      if (!['admin', 'cashier', 'kitchen'].includes(role)) {
        console.error('Invalid staff role:', data.role)
        return null
      }

      return {
        id: authId,
        email: data.email,
        username: data.email,
        name: data.name || normalizedEmail,
        role: role as Role,
      } satisfies User
    }

    // دعم الصلاحيات الموجودة في Supabase Auth App Metadata.
    // app_metadata لا يستطيع المستخدم العادي تعديلها من الواجهة، لذلك هي
    // أفضل كخطة احتياطية من user_metadata للصلاحيات.
    const metadataRole = String(
      authUser?.app_metadata?.role ?? '',
    )

    if (['admin', 'cashier', 'kitchen'].includes(metadataRole)) {
      const metadataName = String(
        authUser?.user_metadata?.name ??
          authUser?.user_metadata?.full_name ??
          normalizedEmail,
      )

      return {
        id: authId,
        email: normalizedEmail,
        username: normalizedEmail,
        name: metadataName,
        role: metadataRole as Role,
      } satisfies User
    }

    if (error) {
      console.error('Staff profile error:', error)

      if (error.code === '42P01') {
        notify(
          'قاعدة البيانات ناقصها جدول staff_profiles',
          'error',
        )
      }
    }

    return null
  }

  useEffect(() => {
    let mounted = true

    const restoreSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Restore session error:', error)
          return
        }

        const session = data.session
        if (!session?.user?.email || !mounted) return

        const profile = await loadStaffProfile(
          session.user.email,
          session.user.id,
          session.user,
        )

        if (mounted) setUser(profile)
      } finally {
        if (mounted) setAuthLoading(false)
      }
    }

    restoreSession()

    const { data: listener } =
      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!mounted) return

        if (!session?.user?.email) {
          setUser(null)
          setAuthLoading(false)
          return
        }

        const profile = await loadStaffProfile(
          session.user.email,
          session.user.id,
          session.user,
        )

        if (mounted) {
          setUser(profile)
          setAuthLoading(false)
        }
      })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const login = async () => {
    if (loginLoading) return

    const email = loginUsername.trim().toLowerCase()
    const password = loginPassword

    if (!email || !password) {
      setLoginError('اكتب البريد الإلكتروني وكلمة المرور')
      return
    }

    setLoginLoading(true)
    setLoginError('')

    try {
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        })

      if (error || !data.user) {
        console.error('Login error:', error)
        setLoginError(
          error?.message?.includes('Invalid login credentials')
            ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
            : error?.message || 'تعذر تسجيل الدخول',
        )
        return
      }

      const profile = await loadStaffProfile(
        email,
        data.user.id,
        data.user,
      )

      if (!profile) {
        await supabase.auth.signOut()
        setLoginError(
          'الحساب صحيح، لكنه غير مضاف كموظف في برني',
        )
        return
      }

      setUser(profile)
      setLoginUsername('')
      setLoginPassword('')
      setLoginError('')
      setPage(
        profile.role === 'kitchen'
          ? 'kitchen'
          : 'cashier',
      )
      notify('تم تسجيل الدخول بنجاح', 'success')
    } finally {
      setLoginLoading(false)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setCart([])
    setReceiptOrder(null)
    setPage('cashier')
  }

  const canAccess = (
    target:
      | 'cashier'
      | 'kitchen'
      | 'orders'
      | 'gift-orders'
      | 'dashboard'
      | 'admin',
  ) => {
    if (!user) return false
    if (user.role === 'admin') return true
    if (user.role === 'cashier') {
      return (
        target === 'cashier' ||
        target === 'orders' ||
        target === 'gift-orders'
      )
    }
    return target === 'kitchen'
  }

  useEffect(() => {
    if (!user) return

    if (!canAccess(page)) {
      setPage(
        user.role === 'kitchen'
          ? 'kitchen'
          : 'cashier',
      )
    }
  }, [user, page])

  // =========================
  // السلة
  // =========================

  const addToCart = (product: Product) => {
    if (!product.available || product.stock <= 0) {
      notify('هذا المنتج غير متوفر')
      return
    }

    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) => item.id === product.id,
      )

      if (existing) {
        if (existing.quantity >= product.stock) {
          notify('لا توجد كمية كافية من هذا المنتج')
          return currentCart
        }

        return currentCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        )
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: 1,
        },
      ]
    })
  }

  const removeFromCart = (id: number) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  const clearCart = () => {
    setCart([])
    setTableNumber('')
  }

  const subtotal = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0,
  )

  const discountAmount =
    subtotal * (discountPercent / 100)

  const total = subtotal - discountAmount

  // =========================
  // المنتجات
  // =========================

  const filteredProducts =
    selectedCategory === 'الكل'
      ? products
      : products.filter(
          (product) =>
            product.category === selectedCategory,
        )

  // =========================
  // الخصم
  // =========================

  const applyDiscount = () => {
    const code = discountCode.trim().toUpperCase()

    if (!code) {
      setDiscountPercent(0)
      notify('اكتب كود الخصم أولاً')
      return
    }

    const coupon = coupons.find(
      (item) =>
        item.code === code &&
        item.active,
    )

    if (!coupon) {
      setDiscountPercent(0)
      notify('كود الخصم غير موجود أو غير فعال')
      return
    }

    setDiscountCode(coupon.code)
    setDiscountPercent(coupon.percent)

    notify(`تم تطبيق خصم ${coupon.percent}%`)
  }
  const removeDiscount = () => {
    setDiscountCode('')
    setDiscountPercent(0)
  }

  // =========================
  // إتمام الطلب
  // =========================

  const completeOrder = async () => {
    if (cart.length === 0) return

    if (orderType === 'داخل الكوفي' && !tableNumber) {
      notify('اكتب رقم الطاولة أولاً', 'error')
      return
    }

    for (const item of cart) {
      const product = products.find((product) => product.id === item.id)
      if (!product || product.stock < item.quantity) {
        notify(`الكمية غير كافية من ${item.name}`, 'error')
        return
      }
    }

    const { data, error } = await supabase.rpc('place_barni_order', {
      p_items: cart.map(({ id, name, category, price, quantity }) => ({
        id, name, category, price, quantity,
      })),
      p_type: orderType,
      p_table: tableNumber,
      p_phone: '',
      p_payment_method: paymentMethod,
      p_discount_code: discountPercent > 0 ? discountCode : '',
    })

    if (error) {
      console.error('Cashier order error:', error)
      notify(error.message || 'تعذر حفظ الطلب', 'error')
      return
    }

    const orderId = Number(data?.id)
    const { data: savedOrder } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle()

    const newOrder = savedOrder
      ? normalizeOrder({
          ...savedOrder,
          items:
            Array.isArray(savedOrder.items) &&
            savedOrder.items.length > 0
              ? savedOrder.items
              : cart,
        })
      : {
          id: orderId,
          items: cart,
          type: orderType,
          table: tableNumber,
          paymentMethod,
          discountCode,
          discountPercent: Number(data?.discountPercent ?? discountPercent),
          discountAmount: Number(data?.discountAmount ?? discountAmount),
          total: Number(data?.total ?? total),
          status: 'جديد' as const,
          createdAt: new Date().toLocaleTimeString('ar-OM'),
          createdAtDate: new Date().toISOString(),
        }

    setOrders((currentOrders) => [newOrder, ...currentOrders.filter((order) => order.id !== newOrder.id)])
    setProducts((currentProducts) => currentProducts.map((product) => {
      const ordered = cart.find((item) => item.id === product.id)
      if (!ordered) return product
      const stock = Math.max(0, product.stock - ordered.quantity)
      return { ...product, stock, available: stock > 0 }
    }))

    notify(`تم إنشاء الطلب #${orderId}`, 'success')
    setReceiptOrder(newOrder)
    removeDiscount()
    clearCart()
  }

  // =========================
  // المطبخ
  // =========================

  const updateOrderStatus = async (
    orderId: number,
    status: Order['status'],
  ) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)

    if (error) {
      console.error('Order status update error:', error)
      notify('تعذر تحديث حالة الطلب', 'error')
      return
    }

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId ? { ...order, status } : order,
      ),
    )

    if (status === 'جاهز') notify(`الطلب #${orderId} جاهز للتسليم ✓`, 'success')
  }

  // =========================
  // إدارة أكواد الخصم
  // =========================

  const addCoupon = async () => {
    const code = newCouponCode.trim().toUpperCase()
    const percent = Number(newCouponPercent)

    if (!code) {
      notify('اكتب كود الخصم')
      return
    }

    if (!Number.isInteger(percent) || percent <= 0 || percent > 100) {
      notify('نسبة الخصم يجب أن تكون بين 1 و100')
      return
    }

    const exists = coupons.some(
      (coupon) => coupon.code === code,
    )

    if (exists) {
      notify('هذا الكود موجود بالفعل')
      return
    }

    const { data, error } = await supabase
      .from('coupons')
      .insert([{ code, percent, active: true }])
      .select('*')
      .single()

    if (error) {
      console.error('Coupon insert error:', error)
      notify('تعذر حفظ كود الخصم', 'error')
      return
    }

    setCoupons((currentCoupons) => [...currentCoupons, { id: Number(data.id), code, percent, active: true }])

    setNewCouponCode('')
    setNewCouponPercent('')
  }

  const toggleCoupon = async (id: number) => {
    const coupon = coupons.find((item) => item.id === id)
    if (!coupon) return

    const active = !coupon.active
    const { error } = await supabase.from('coupons').update({ active }).eq('id', id)
    if (error) {
      console.error('Coupon toggle error:', error)
      notify('تعذر تغيير حالة الكوبون', 'error')
      return
    }

    setCoupons((currentCoupons) => currentCoupons.map((item) => item.id === id ? { ...item, active } : item))
  }

  const deleteCoupon = async (id: number) => {
    const confirmed = window.confirm(
      'هل تريد حذف كود الخصم؟',
    )

    if (!confirmed) return

    const { error } = await supabase.from('coupons').delete().eq('id', id)
    if (error) {
      console.error('Coupon delete error:', error)
      notify('تعذر حذف كود الخصم', 'error')
      return
    }

    setCoupons((currentCoupons) => currentCoupons.filter((coupon) => coupon.id !== id))
  }

  // =========================
  // إضافة منتج
  // =========================

  const addProduct = async () => {
    const price = Number(newPrice)
    const stock = Number(newStock)

    if (!newName.trim()) {
      notify('اكتب اسم المنتج')
      return
    }

    if (!price || price <= 0) {
      notify('اكتب سعرًا صحيحًا')
      return
    }

    if (
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      notify('اكتب كمية صحيحة')
      return
    }

    const productToInsert = {
      name: newName.trim(),
      price,
      category: newCategory,
      stock,
      active: stock > 0,
      available: stock > 0,
    }

    const { data, error } = await supabase
      .from('products')
      .insert([productToInsert])
      .select('*')
      .single()

    if (error) {
      console.error('Product insert error:', error)
      notify('تعذر حفظ المنتج في قاعدة البيانات', 'error')
      return
    }

    const savedProduct: Product = {
      id: Number(data.id),
      name: String(data.name),
      price: Number(data.price),
      category: String(data.category),
      stock: Number(data.stock ?? 0),
      available: Boolean(data.active ?? data.available) &&
        Number(data.stock ?? 0) > 0,
    }

    setProducts((currentProducts) => [
      ...currentProducts,
      savedProduct,
    ])

    setNewName('')
    setNewPrice('')
    setNewStock('')
    setNewCategory('قهوة')
  }

  // =========================
  // بدء تعديل المنتج
  // =========================

  const startEditing = (product: Product) => {
    setEditingId(product.id)

    setEditingName(product.name)
    setEditingPrice(product.price.toString())
    setEditingCategory(product.category)
    setEditingStock(product.stock.toString())
  }

  // =========================
  // إلغاء التعديل
  // =========================

  const cancelEditing = () => {
    setEditingId(null)

    setEditingName('')
    setEditingPrice('')
    setEditingCategory('قهوة')
    setEditingStock('')
  }

  // =========================
  // حفظ تعديل المنتج
  // =========================

  const saveProduct = async () => {
    if (editingId === null) return

    const price = Number(editingPrice)
    const stock = Number(editingStock)

    if (!editingName.trim()) {
      notify('اكتب اسم المنتج')
      return
    }

    if (!price || price <= 0) {
      notify('اكتب سعرًا صحيحًا')
      return
    }

    if (
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      notify('اكتب كمية صحيحة')
      return
    }

    const { error } = await supabase
      .from('products')
      .update({
        name: editingName.trim(),
        price,
        category: editingCategory,
        stock,
        active: stock > 0,
        available: stock > 0,
      })
      .eq('id', editingId)

    if (error) {
      console.error('Product update error:', error)
      notify('تعذر حفظ تعديل المنتج', 'error')
      return
    }

    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === editingId
          ? { ...product, name: editingName.trim(), price, category: editingCategory, stock, available: stock > 0 }
          : product,
      ),
    )

    // تحديث المنتج إذا كان موجودًا في السلة
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === editingId
          ? {
              ...item,
              name: editingName.trim(),
              price,
              category: editingCategory,
              stock,
              available: stock > 0,
            }
          : item,
      ),
    )

    cancelEditing()
  }

  // =========================
  // حذف المنتج
  // =========================

  const deleteProduct = async (id: number) => {
    const confirmed = window.confirm(
      'هل تريد حذف هذا المنتج؟',
    )

    if (!confirmed) return

    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      console.error('Product delete error:', error)
      notify('تعذر حذف المنتج', 'error')
      return
    }

    setProducts((currentProducts) => currentProducts.filter((product) => product.id !== id))

    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.id !== id,
      ),
    )
  }

  // =========================
  // إيقاف / تفعيل المنتج
  // =========================

  const toggleProductAvailability = async (id: number) => {
    const product = products.find((item) => item.id === id)
    if (!product) return
    if (product.stock <= 0) {
      notify('لا يمكن تفعيل منتج مخزونه صفر', 'error')
      return
    }

    const available = !product.available
    const { error } = await supabase
      .from('products')
      .update({ active: available, available })
      .eq('id', id)

    if (error) {
      console.error('Product availability error:', error)
      notify('تعذر تغيير حالة المنتج', 'error')
      return
    }

    setProducts((currentProducts) =>
      currentProducts.map((item) => item.id === id ? { ...item, available } : item),
    )
  }

  // =========================
  // تصدير تقرير المبيعات
  // =========================

  const getPeriodLabel = () => {
    if (salesPeriod === 'today') return 'اليوم'
    if (salesPeriod === 'week') return 'هذا الأسبوع'
    if (salesPeriod === 'month') return 'هذا الشهر'
    return 'الكل'
  }

  const exportSalesReport = () => {
    if (filteredSalesOrders.length === 0) {
      notify('لا توجد طلبات لتصديرها في هذه الفترة')
      return
    }

    const rows = filteredSalesOrders.map((order) => {
      const subtotal =
        order.total + (order.discountAmount ?? 0)

      return [
        order.id,
        order.createdAt,
        order.type,
        order.type === 'داخل الكوفي'
          ? order.table
          : '',
        order.paymentMethod,
        subtotal.toFixed(2),
        (order.discountAmount ?? 0).toFixed(2),
        order.total.toFixed(2),
      ]
    })

    const headers = [
      'رقم الطلب',
      'الوقت',
      'نوع الطلب',
      'الطاولة',
      'طريقة الدفع',
      'قبل الخصم',
      'الخصم',
      'الإجمالي',
    ]

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replaceAll('"', '""')}"`,
          )
          .join(','),
      )
      .join('\n')

    const bom = '\uFEFF'
    const blob = new Blob(
      [bom + csv],
      { type: 'text/csv;charset=utf-8;' },
    )

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download =
      `برني-تقرير-${getPeriodLabel()}.csv`

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  // =========================
  // حالة المطبخ
  // =========================

  const newKitchenOrders = orders.filter(
    (order) => order.status === 'جديد',
  )

  const preparingKitchenOrders = orders.filter(
    (order) => order.status === 'قيد التحضير',
  )

  const activeKitchenOrders =
    kitchenFilter === 'all'
      ? orders.filter(
          (order) => order.status !== 'جاهز',
        )
      : orders.filter(
          (order) => order.status === kitchenFilter,
        )

  // =========================
  // إحصائيات المبيعات
  // =========================

  const now = new Date()

  const filteredSalesOrders = orders.filter((order) => {
    if (salesPeriod === 'all') {
      return true
    }

    // الطلبات القديمة التي لا تحتوي تاريخًا كاملًا
    // تظهر في "الكل" فقط.
    if (!order.createdAtDate) {
      return false
    }

    const orderDate = new Date(order.createdAtDate)

    if (salesPeriod === 'today') {
      return (
        orderDate.getFullYear() === now.getFullYear() &&
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getDate() === now.getDate()
      )
    }

    if (salesPeriod === 'week') {
      const startOfWeek = new Date(now)
      const day = startOfWeek.getDay()
      const diff = day === 0 ? 6 : day - 1

      startOfWeek.setDate(
        startOfWeek.getDate() - diff,
      )
      startOfWeek.setHours(0, 0, 0, 0)

      return orderDate >= startOfWeek
    }

    if (salesPeriod === 'month') {
      return (
        orderDate.getFullYear() === now.getFullYear() &&
        orderDate.getMonth() === now.getMonth()
      )
    }

    return true
  })

  const totalSales = filteredSalesOrders.reduce(
    (sum, order) => sum + order.total,
    0,
  )

  const totalOrders = filteredSalesOrders.length

  const averageOrder =
    totalOrders > 0
      ? totalSales / totalOrders
      : 0

  const cashSales = filteredSalesOrders
    .filter(
      (order) => order.paymentMethod === 'نقدي',
    )
    .reduce(
      (sum, order) => sum + order.total,
      0,
    )

  const cardSales = filteredSalesOrders
    .filter(
      (order) => order.paymentMethod === 'بطاقة',
    )
    .reduce(
      (sum, order) => sum + order.total,
      0,
    )

  const totalDiscounts =
    filteredSalesOrders.reduce(
      (sum, order) =>
        sum + (order.discountAmount ?? 0),
      0,
    )

  const productSales = products
    .map((product) => {
      const quantity = filteredSalesOrders.reduce(
        (sum, order) => {
          const item = order.items.find(
            (item) => item.id === product.id,
          )

          return sum + (item?.quantity ?? 0)
        },
        0,
      )

      return {
        ...product,
        sold: quantity,
      }
    })
    .sort((a, b) => b.sold - a.sold)

  const topProducts = productSales
    .filter((product) => product.sold > 0)
    .slice(0, 5)

  const lowStockProducts = products
    .filter((product) => product.stock <= 5)
    .sort((a, b) => a.stock - b.stock)


  // =========================
  // الواجهة
  // =========================

  // صفحة العميل يجب أن تأتي بعد جميع الـ Hooks.
  // وضعها قبل الـ Hooks كان يسبب:
  // "Rendered fewer hooks than expected"

  if (currentPath === '/') {
    return <BarniHomePage />
  }

  if (currentPath === '/gift') {
    return <BarniGiftPage />
  }

  if (authLoading && currentPath !== '/customer') {
    return (
      <div className="barni-login-page" dir="rtl">
        <div className="barni-login-card">
          <div className="barni-login-logo">☕</div>
          <h1>برني كافيه</h1>
          <p>جاري التحقق من جلسة الدخول...</p>
        </div>
      </div>
    )
  }

  if (currentPath === '/customer') {
    return <CustomerPage showCashierButton={Boolean(user) && new URLSearchParams(window.location.search).get('staff') === '1'} />
  }

  if (!user) {
    return (
      <div className="barni-login-page" dir="rtl">
        <div className="barni-login-card">
          <div className="barni-login-logo">☕</div>
          <h1>برني كافيه</h1>
          <p>نظام إدارة الكاشير</p>

          <div className="barni-login-form">
            <label>
              البريد الإلكتروني
              <input
                value={loginUsername}
                onChange={(event) =>
                  setLoginUsername(event.target.value)
                }
                placeholder="staff@barnicafe.com"
              />
            </label>

            <label>
              كلمة المرور
              <input
                type="password"
                value={loginPassword}
                onChange={(event) =>
                  setLoginPassword(event.target.value)
                }
                placeholder="••••••••"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') login()
                }}
              />
            </label>

            {loginError && (
              <div className="barni-login-error">
                {loginError}
              </div>
            )}

            <button
              className="barni-login-button"
              onClick={login}
              disabled={loginLoading}
            >
              {loginLoading ? 'جارٍ تسجيل الدخول...' : 'دخول النظام'}
            </button>
          </div>
        </div>

        <style>{`
          .barni-login-page {
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 24px;
            background: linear-gradient(135deg,#f5eee8,#e9ddd4);
          }
          .barni-login-card {
            width: min(420px,100%);
            box-sizing: border-box;
            background: #fff;
            border: 1px solid #eadfd8;
            border-radius: 24px;
            padding: 32px;
            box-shadow: 0 20px 60px rgba(43,33,29,.12);
            text-align: center;
          }
          .barni-login-logo {
            width: 64px;
            height: 64px;
            margin: 0 auto 14px;
            border-radius: 18px;
            display: grid;
            place-items: center;
            background: #241b17;
            color: #fff;
            font-size: 28px;
          }
          .barni-login-card h1 { margin: 0 0 6px; }
          .barni-login-card > p { margin: 0 0 26px; color: #806d60; }
          .barni-login-form { display: grid; gap: 14px; text-align: right; }
          .barni-login-form label { display: grid; gap: 7px; font-weight: 700; color: #4e3d34; }
          .barni-login-form input {
            box-sizing: border-box;
            width: 100%;
            padding: 13px 14px;
            border: 1px solid #ded2ca;
            border-radius: 11px;
            font-size: 15px;
          }
          .barni-login-form input:focus { outline: none; border-color: #9b7254; }
          .barni-login-button {
            border: 0;
            border-radius: 11px;
            padding: 13px;
            background: #241b17;
            color: #fff;
            font-size: 16px;
            font-weight: 800;
            cursor: pointer;
          }
          .barni-login-error {
            background: #fff0ee;
            color: #9b3d32;
            padding: 10px;
            border-radius: 10px;
            font-size: 14px;
          }
          .barni-demo-accounts {
            margin-top: 22px;
            padding: 12px;
            border-radius: 12px;
            background: #faf7f4;
            display: grid;
            gap: 4px;
            color: #806d60;
            font-size: 12px;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="pos" dir="rtl">

      {/* =========================
          الهيدر
      ========================= */}

      <header className="topbar">
        <div>
          <h1>برني كافيه</h1>

          <span>
            {page === 'cashier'
              ? 'نظام الكاشير'
              : page === 'kitchen'
                ? 'شاشة المطبخ'
                : page === 'orders'
                  ? 'سجل الطلبات'
                  : page === 'gift-orders'
                    ? 'طلبات الهدايا'
                    : page === 'dashboard'
                    ? 'لوحة المبيعات'
                    : 'إدارة المنتجات'}
          </span>
        </div>

        <div className="topbar-actions">

          <button
            type="button"
            onClick={toggleOrderSound}
            title={
              soundMuted
                ? 'تشغيل صوت تنبيهات الطلبات'
                : 'كتم صوت تنبيهات الطلبات'
            }
            style={{
              minWidth: '44px',
              height: '42px',
              padding: '0 12px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,.12)',
              background: soundMuted ? '#3b2922' : '#fff',
              color: soundMuted ? '#fff' : '#241b17',
              fontSize: '18px',
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            {soundMuted ? '🔕' : '🔊'}
          </button>

          <button
            className={
              currentPath === '/customer'
                ? 'nav-active'
                : ''
            }
            onClick={goToCustomer}
          >
            موقع العميل
          </button>

          {canAccess('cashier') && (
            <button
              className={
                page === 'cashier'
                  ? 'nav-active'
                  : ''
              }
              onClick={() =>
                setPage('cashier')
              }
            >
              الكاشير
            </button>
          )}

          {canAccess('kitchen') && (
            <button
              className={
                page === 'kitchen'
                  ? 'nav-active'
                  : ''
              }
              onClick={() =>
                setPage('kitchen')
              }
            >
              المطبخ
            </button>
          )}

          {canAccess('orders') && (
            <button
              className={
                page === 'orders'
                  ? 'nav-active'
                  : ''
              }
              onClick={() => {
                setPage('orders')
                markOrdersSeen()
              }}
            >
              الطلبات
              {newOrdersCount > 0 && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '22px',
                    height: '22px',
                    marginRight: '7px',
                    padding: '0 6px',
                    borderRadius: '999px',
                    background: '#c0392b',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 900,
                  }}
                >
                  {newOrdersCount}
                </span>
              )}
            </button>
          )}

          {canAccess('gift-orders') && (
            <button
              className={
                page === 'gift-orders'
                  ? 'nav-active'
                  : ''
              }
              onClick={() => {
                setPage('gift-orders')
                void markGiftOrdersSeen()
              }}
            >
              الهدايا
              {newGiftOrdersCount > 0 && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '22px',
                    height: '22px',
                    marginRight: '7px',
                    padding: '0 6px',
                    borderRadius: '999px',
                    background: '#c0392b',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 900,
                  }}
                >
                  {newGiftOrdersCount}
                </span>
              )}
            </button>
          )}

          {canAccess('dashboard') && (
            <button
              className={
                page === 'dashboard'
                  ? 'nav-active'
                  : ''
              }
              onClick={() =>
                setPage('dashboard')
              }
            >
              المبيعات
            </button>
          )}

          {canAccess('admin') && (
            <button
              className={
                page === 'admin'
                  ? 'nav-active'
                  : ''
              }
              onClick={() =>
                setPage('admin')
              }
            >
              الإدارة
            </button>
          )}

          <div className="status">
            <span className="online-dot"></span>
            متصل
          </div>

          <div className="topbar-user">
            <div className="user-badge">
              <strong>{user.name}</strong>
              <span>
                {user.role === 'admin'
                  ? 'مدير'
                  : user.role === 'cashier'
                    ? 'كاشير'
                    : 'مطبخ'}
              </span>
            </div>

            <button
              className="logout-button"
              onClick={logout}
            >
              خروج
            </button>
          </div>

        </div>
      </header>

      {/* =========================
          الكاشير
      ========================= */}

      {page === 'cashier' && (
        <main className="pos-layout">

          <section className="products-section">

            <div className="section-title">
              <h2>المنتجات</h2>

              <span>
                {filteredProducts.length} منتجات
              </span>
            </div>

            <div className="category-buttons">
              {categories.map((category) => (
                <button
                  key={category}
                  className={
                    selectedCategory === category
                      ? 'active'
                      : ''
                  }
                  onClick={() =>
                    setSelectedCategory(category)
                  }
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="products-grid">
              {filteredProducts.map(
                (product) => (
                  <button
                    className={`product-card ${
                      !product.available
                        ? 'unavailable'
                        : ''
                    }`}
                    key={product.id}
                    onClick={() =>
                      addToCart(product)
                    }
                    disabled={
                      !product.available
                    }
                  >

                    <div className="product-icon">
                      ☕
                    </div>

                    <h3>
                      {product.name}
                    </h3>

                    <span>
                      {!product.available
                        ? 'غير متوفر'
                        : `${product.category} · متبقي ${product.stock}`}
                    </span>

                    <strong>
                      {product.price.toFixed(2)} ر.ع
                    </strong>

                  </button>
                ),
              )}
            </div>

          </section>

          {/* السلة */}

          <aside className="cart-section">

            <div className="cart-header">
              <div>
                <h2>الطلب الحالي</h2>

                <span>
                  {cart.reduce(
                    (sum, item) =>
                      sum + item.quantity,
                    0,
                  )}{' '}
                  أصناف
                </span>
              </div>

              <button
                className="clear-button"
                onClick={clearCart}
              >
                مسح
              </button>
            </div>

            <div className="cart-items">

              {cart.length === 0 ? (
                <div className="empty-cart">

                  <div>🛒</div>

                  <h3>
                    السلة فارغة
                  </h3>

                  <p>
                    اضغط على أي منتج لإضافته
                    للطلب
                  </p>

                </div>
              ) : (
                cart.map((item) => (
                  <div
                    className="cart-item"
                    key={item.id}
                  >

                    <div>

                      <h3>
                        {item.name}
                      </h3>

                      <span>
                        {(
                          item.price *
                          item.quantity
                        ).toFixed(2)}{' '}
                        ر.ع
                      </span>

                    </div>

                    <div className="quantity">

                      <button
                        onClick={() =>
                          removeFromCart(
                            item.id,
                          )
                        }
                      >
                        −
                      </button>

                      <strong>
                        {item.quantity}
                      </strong>

                      <button
                        onClick={() =>
                          addToCart(item)
                        }
                      >
                        +
                      </button>

                    </div>

                  </div>
                ))
              )}

            </div>

            <div className="cart-footer">

              <div className="order-options">

                <h3>
                  نوع الطلب
                </h3>

                <div className="order-type-buttons">

                  <button
                    className={
                      orderType === 'سفري'
                        ? 'selected'
                        : ''
                    }
                    onClick={() => {
                      setOrderType('سفري')
                      setTableNumber('')
                    }}
                  >
                    سفري
                  </button>

                  <button
                    className={
                      orderType ===
                      'داخل الكوفي'
                        ? 'selected'
                        : ''
                    }
                    onClick={() =>
                      setOrderType(
                        'داخل الكوفي',
                      )
                    }
                  >
                    داخل الكوفي
                  </button>

                </div>

                {orderType ===
                  'داخل الكوفي' && (
                  <input
                    type="number"
                    placeholder="رقم الطاولة"
                    value={tableNumber}
                    onChange={(event) =>
                      setTableNumber(
                        event.target.value,
                      )
                    }
                  />
                )}

              </div>

              <div className="discount-options">
                <h3>كود الخصم</h3>

                <div className="discount-input-row">
                  <input
                    type="text"
                    placeholder="مثال: BAR10"
                    value={discountCode}
                    onChange={(event) =>
                      setDiscountCode(
                        event.target.value.toUpperCase(),
                      )
                    }
                    disabled={discountPercent > 0}
                  />

                  {discountPercent > 0 ? (
                    <button
                      className="remove-discount-button"
                      onClick={removeDiscount}
                    >
                      إزالة
                    </button>
                  ) : (
                    <button
                      className="apply-discount-button"
                      onClick={applyDiscount}
                    >
                      تطبيق
                    </button>
                  )}
                </div>

                {discountPercent > 0 && (
                  <div className="discount-applied">
                    ✓ تم تطبيق خصم {discountPercent}%
                  </div>
                )}
              </div>

              <div className="payment-options">
                <h3>طريقة الدفع</h3>

                <div className="payment-type-buttons">
                  <button
                    className={
                      paymentMethod === 'نقدي'
                        ? 'selected'
                        : ''
                    }
                    onClick={() =>
                      setPaymentMethod('نقدي')
                    }
                  >
                    💵 نقدي
                  </button>

                  <button
                    className={
                      paymentMethod === 'بطاقة'
                        ? 'selected'
                        : ''
                    }
                    onClick={() =>
                      setPaymentMethod('بطاقة')
                    }
                  >
                    💳 بطاقة
                  </button>
                </div>
              </div>

              <div className="summary">

                <div className="summary-row">
                  <span>المجموع قبل الخصم</span>
                  <strong>
                    {subtotal.toFixed(2)} ر.ع
                  </strong>
                </div>

                {discountPercent > 0 && (
                  <div className="summary-row discount-row">
                    <span>
                      الخصم ({discountPercent}%)
                    </span>
                    <strong>
                      -{discountAmount.toFixed(2)} ر.ع
                    </strong>
                  </div>
                )}

                <div className="summary-row final-total-row">
                  <span>الإجمالي</span>
                  <strong>
                    {total.toFixed(2)} ر.ع
                  </strong>
                </div>

              </div>

              <button
                className="checkout-button"
                disabled={
                  cart.length === 0
                }
                onClick={completeOrder}
              >
                إتمام الطلب
              </button>

            </div>

          </aside>

        </main>
      )}

      {/* =========================
          المطبخ
      ========================= */}

      {page === 'kitchen' && (
        <main className="kitchen-page">

          <div className="kitchen-heading">

            <div>
              <h2>طلبات المطبخ</h2>

              <p>
                تابع الطلب من لحظة وصوله حتى يصبح جاهزًا
              </p>
            </div>

            <div className="kitchen-count">
              {orders.filter(
                (order) => order.status !== 'جاهز',
              ).length}{' '}
              قيد العمل
            </div>

          </div>

          <div className="kitchen-status-summary">

            <button
              className={
                kitchenFilter === 'all'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setKitchenFilter('all')
              }
            >
              <strong>
                {orders.filter(
                  (order) =>
                    order.status !== 'جاهز',
                ).length}
              </strong>

              <span>كل الطلبات</span>
            </button>

            <button
              className={
                kitchenFilter === 'جديد'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setKitchenFilter('جديد')
              }
            >
              <strong>
                {newKitchenOrders.length}
              </strong>

              <span>جديد</span>
            </button>

            <button
              className={
                kitchenFilter === 'قيد التحضير'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setKitchenFilter('قيد التحضير')
              }
            >
              <strong>
                {preparingKitchenOrders.length}
              </strong>

              <span>قيد التحضير</span>
            </button>

          </div>

          {activeKitchenOrders.length === 0 ? (

            <div className="no-orders">

              <div>✓</div>

              <h2>
                لا توجد طلبات قيد العمل
              </h2>

              <p>
                عند وصول طلب جديد سيظهر هنا تلقائيًا
              </p>

            </div>

          ) : (

            <div className="orders-grid">

              {activeKitchenOrders.map((order) => (

                <article
                  className={`order-card ${order.status}`}
                  key={order.id}
                >

                  <div className="order-card-header">

                    <div>
                      <h3>
                        طلب #{order.id}
                      </h3>

                      <span>
                        {order.createdAt}
                      </span>
                    </div>

                    <strong>
                      {order.status}
                    </strong>

                  </div>

                  <div className="order-info">

                    <span>
                      {order.type}
                    </span>

                    {order.type ===
                      'داخل الكوفي' && (
                      <span>
                        طاولة {order.table}
                      </span>
                    )}

                    <span>
                      {order.paymentMethod}
                    </span>

                  </div>

                  <div className="order-items">

                    {order.items.map(
                      (item) => (

                        <div
                          className="kitchen-item"
                          key={item.id}
                        >

                          <strong>
                            {item.quantity} ×
                          </strong>

                          <span>
                            {item.name}
                          </span>

                        </div>

                      ),
                    )}

                  </div>

                  <div className="order-card-footer">

                    <strong>
                      {order.total.toFixed(2)}{' '}
                      ر.ع
                    </strong>

                    {order.status ===
                      'جديد' && (

                      <button
                        onClick={() =>
                          updateOrderStatus(
                            order.id,
                            'قيد التحضير',
                          )
                        }
                      >
                        بدء التحضير
                      </button>

                    )}

                    {order.status ===
                      'قيد التحضير' && (

                      <button
                        onClick={() =>
                          updateOrderStatus(
                            order.id,
                            'جاهز',
                          )
                        }
                      >
                        تم التجهيز ✓
                      </button>

                    )}

                  </div>

                </article>

              ))}

            </div>

          )}

        </main>
      )}

      {/* =========================
          لوحة المبيعات
      ========================= */}

      {page === 'dashboard' && (
        <main
          className="sales-dashboard"
          style={{
            padding: '30px',
            maxWidth: '1400px',
            margin: '0 auto',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '20px',
              marginBottom: '25px',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <h2 style={{ margin: '0 0 7px' }}>
                لوحة المبيعات
              </h2>

              <p style={{ margin: 0, color: '#806d60' }}>
                ملخص أداء برني من الطلبات المسجلة
              </p>
            </div>

            <div
              className="sales-heading-actions"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  padding: '10px 15px',
                  borderRadius: '10px',
                  background: '#f4eee9',
                  color: '#6b5141',
                  fontWeight: '700',
                }}
              >
                الطلبات: {totalOrders}
              </div>

              <button
                className="export-sales-button"
                onClick={exportSalesReport}
              >
                ↓ تصدير التقرير
              </button>
            </div>
          </div>

          <div className="sales-period-box">
            <div className="sales-period-title">
              <span>الفترة الزمنية</span>
              <strong>
                {salesPeriod === 'today'
                  ? 'اليوم'
                  : salesPeriod === 'week'
                    ? 'هذا الأسبوع'
                    : salesPeriod === 'month'
                      ? 'هذا الشهر'
                      : 'كل الطلبات'}
              </strong>
            </div>

            <div className="sales-period-selector">
              <button
                className={
                  salesPeriod === 'today'
                    ? 'selected'
                    : ''
                }
                onClick={() =>
                  setSalesPeriod('today')
                }
              >
                اليوم
              </button>

              <button
                className={
                  salesPeriod === 'week'
                    ? 'selected'
                    : ''
                }
                onClick={() =>
                  setSalesPeriod('week')
                }
              >
                هذا الأسبوع
              </button>

              <button
                className={
                  salesPeriod === 'month'
                    ? 'selected'
                    : ''
                }
                onClick={() =>
                  setSalesPeriod('month')
                }
              >
                هذا الشهر
              </button>

              <button
                className={
                  salesPeriod === 'all'
                    ? 'selected'
                    : ''
                }
                onClick={() =>
                  setSalesPeriod('all')
                }
              >
                الكل
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                background: '#241b17',
                color: '#fff',
                borderRadius: '18px',
                padding: '22px',
              }}
            >
              <span style={{ opacity: 0.75 }}>
                إجمالي المبيعات
              </span>

              <h3
                style={{
                  margin: '10px 0 0',
                  fontSize: '28px',
                }}
              >
                {totalSales.toFixed(2)} ر.ع
              </h3>
            </div>

            <div
              style={{
                background: '#fff',
                border: '1px solid #eadfd8',
                borderRadius: '18px',
                padding: '22px',
              }}
            >
              <span style={{ color: '#806d60' }}>
                عدد الطلبات
              </span>

              <h3
                style={{
                  margin: '10px 0 0',
                  fontSize: '28px',
                }}
              >
                {totalOrders}
              </h3>
            </div>

            <div
              style={{
                background: '#fff',
                border: '1px solid #eadfd8',
                borderRadius: '18px',
                padding: '22px',
              }}
            >
              <span style={{ color: '#806d60' }}>
                متوسط قيمة الطلب
              </span>

              <h3
                style={{
                  margin: '10px 0 0',
                  fontSize: '28px',
                }}
              >
                {averageOrder.toFixed(2)} ر.ع
              </h3>
            </div>

            <div
              style={{
                background: '#fff',
                border: '1px solid #eadfd8',
                borderRadius: '18px',
                padding: '22px',
              }}
            >
              <span style={{ color: '#806d60' }}>
                منخفض المخزون
              </span>

              <h3
                style={{
                  margin: '10px 0 0',
                  fontSize: '28px',
                }}
              >
                {lowStockProducts.length}
              </h3>
            </div>

            <div
              style={{
                background: '#fff',
                border: '1px solid #eadfd8',
                borderRadius: '18px',
                padding: '22px',
              }}
            >
              <span style={{ color: '#806d60' }}>
                مبيعات نقدية
              </span>

              <h3
                style={{
                  margin: '10px 0 0',
                  fontSize: '28px',
                }}
              >
                {cashSales.toFixed(2)} ر.ع
              </h3>
            </div>

            <div
              style={{
                background: '#fff',
                border: '1px solid #eadfd8',
                borderRadius: '18px',
                padding: '22px',
              }}
            >
              <span style={{ color: '#806d60' }}>
                مبيعات البطاقة
              </span>

              <h3
                style={{
                  margin: '10px 0 0',
                  fontSize: '28px',
                }}
              >
                {cardSales.toFixed(2)} ر.ع
              </h3>
            </div>

            <div
              style={{
                background: '#fff',
                border: '1px solid #eadfd8',
                borderRadius: '18px',
                padding: '22px',
              }}
            >
              <span style={{ color: '#806d60' }}>
                إجمالي الخصومات
              </span>

              <h3
                style={{
                  margin: '10px 0 0',
                  fontSize: '28px',
                }}
              >
                {totalDiscounts.toFixed(2)} ر.ع
              </h3>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'minmax(0, 1.4fr) minmax(300px, 1fr)',
              gap: '18px',
            }}
          >
            <section
              style={{
                background: '#fff',
                border: '1px solid #eadfd8',
                borderRadius: '18px',
                padding: '22px',
              }}
            >
              <h3 style={{ marginTop: 0 }}>
                الأكثر مبيعًا
              </h3>

              {topProducts.length === 0 ? (
                <div
                  style={{
                    padding: '40px 10px',
                    textAlign: 'center',
                    color: '#927e70',
                  }}
                >
                  لا توجد مبيعات مسجلة حتى الآن
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gap: '10px',
                  }}
                >
                  {topProducts.map((product, index) => (
                    <div
                      key={product.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          '38px 1fr auto',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '12px',
                        background: '#faf7f4',
                      }}
                    >
                      <strong
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#eee2d9',
                        }}
                      >
                        {index + 1}
                      </strong>

                      <div>
                        <strong>{product.name}</strong>

                        <div
                          style={{
                            color: '#806d60',
                            fontSize: '13px',
                            marginTop: '3px',
                          }}
                        >
                          {product.category}
                        </div>
                      </div>

                      <strong>
                        {product.sold} مبيع
                      </strong>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section
              style={{
                background: '#fff',
                border: '1px solid #eadfd8',
                borderRadius: '18px',
                padding: '22px',
              }}
            >
              <h3 style={{ marginTop: 0 }}>
                تنبيه المخزون
              </h3>

              {lowStockProducts.length === 0 ? (
                <div
                  style={{
                    padding: '40px 10px',
                    textAlign: 'center',
                    color: '#28743a',
                  }}
                >
                  المخزون ممتاز، لا يوجد نقص حاليًا ✓
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gap: '10px',
                  }}
                >
                  {lowStockProducts
                    .slice(0, 6)
                    .map((product) => (
                      <div
                        key={product.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px',
                          borderRadius: '12px',
                          background:
                            product.stock === 0
                              ? '#fce9e6'
                              : '#fff6df',
                        }}
                      >
                        <strong>
                          {product.name}
                        </strong>

                        <span
                          style={{
                            color:
                              product.stock === 0
                                ? '#9b3d32'
                                : '#8a5a00',
                            fontWeight: '700',
                          }}
                        >
                          {product.stock === 0
                            ? 'نفد'
                            : `${product.stock} متبقي`}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </section>
          </div>
        </main>
      )}

      {/* =========================
          طلبات الهدايا
      ========================= */}

      {page === 'gift-orders' && (
        <GiftOrdersPanel />
      )}

      {/* =========================
          سجل الطلبات
      ========================= */}

      {page === 'orders' && (
        <main
          className="orders-history-page"
          style={{
            padding: '28px',
            maxWidth: '1400px',
            margin: '0 auto',
            width: '100%',
          }}
        >
          <div
            className="orders-history-heading"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '20px',
              marginBottom: '24px',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <h2 style={{ marginBottom: '6px' }}>
                سجل الطلبات
              </h2>

              <p style={{ margin: 0 }}>
                جميع الطلبات المحفوظة من الكاشير
              </p>
            </div>

            <div
              style={{
                padding: '12px 18px',
                borderRadius: '12px',
                background: '#f4eee9',
                color: '#2b211d',
                fontWeight: '700',
              }}
            >
              {orders.length} طلب
            </div>
          </div>

          {orders.length === 0 ? (
            <div
              className="no-orders"
              style={{
                minHeight: '280px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <div>🧾</div>

              <h2>
                لا توجد طلبات حتى الآن
              </h2>

              <p>
                عندما يتم إنشاء طلب من الكاشير سيظهر هنا
              </p>
            </div>
          ) : (
            <div
              className="orders-history-list"
              style={{
                display: 'grid',
                gap: '16px',
              }}
            >
              {orders
                .slice()
                .reverse()
                .map((order) => (
                  <article
                    key={order.id}
                    className="order-history-card"
                    style={{
                      background: '#ffffff',
                      border: '1px solid #eadfd8',
                      borderRadius: '16px',
                      padding: '20px',
                      boxShadow:
                        '0 6px 20px rgba(43, 33, 29, 0.06)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '16px',
                        flexWrap: 'wrap',
                        marginBottom: '16px',
                      }}
                    >
                      <div>
                        <h3 style={{ margin: '0 0 6px' }}>
                          طلب #{order.id}
                        </h3>

                        <span
                          style={{
                            color: '#806d60',
                            fontSize: '14px',
                          }}
                        >
                          {order.createdAt}
                        </span>
                      </div>

                      <span
                        style={{
                          padding: '7px 12px',
                          borderRadius: '999px',
                          background:
                            order.status === 'جاهز'
                              ? '#e7f5e9'
                              : order.status === 'قيد التحضير'
                                ? '#fff3d8'
                                : '#eee8ff',
                          color:
                            order.status === 'جاهز'
                              ? '#28743a'
                              : order.status === 'قيد التحضير'
                                ? '#8a5a00'
                                : '#59409a',
                          fontWeight: '700',
                        }}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        gap: '10px',
                        flexWrap: 'wrap',
                        marginBottom: '16px',
                      }}
                    >
                      <span
                        style={{
                          background: '#f7f2ee',
                          padding: '7px 12px',
                          borderRadius: '9px',
                        }}
                      >
                        {order.type}
                      </span>

                      {order.type === 'داخل الكوفي' && (
                        <span
                          style={{
                            background: '#f7f2ee',
                            padding: '7px 12px',
                            borderRadius: '9px',
                          }}
                        >
                          طاولة {order.table}
                        </span>
                      )}

                      <span
                        style={{
                          background: '#f7f2ee',
                          padding: '7px 12px',
                          borderRadius: '9px',
                        }}
                      >
                        {order.paymentMethod}
                      </span>

                      <span
                        style={{
                          padding: '7px 12px',
                          borderRadius: '9px',
                          background:
                            order.status === 'جاهز'
                              ? '#e7f5e9'
                              : order.status === 'قيد التحضير'
                                ? '#fff3d8'
                                : '#eee8ff',
                          color:
                            order.status === 'جاهز'
                              ? '#28743a'
                              : order.status === 'قيد التحضير'
                                ? '#8a5a00'
                                : '#59409a',
                          fontWeight: '700',
                        }}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gap: '9px',
                        padding: '14px 0',
                        borderTop:
                          '1px solid #eee4de',
                        borderBottom:
                          '1px solid #eee4de',
                      }}
                    >
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: '16px',
                          }}
                        >
                          <span>
                            {item.quantity} × {item.name}
                          </span>

                          <strong>
                            {(
                              item.price * item.quantity
                            ).toFixed(2)}{' '}
                            ر.ع
                          </strong>
                        </div>
                      ))}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '16px',
                        marginTop: '16px',
                      }}
                    >
                      <span
                        style={{
                          color: '#806d60',
                        }}
                      >
                        إجمالي الطلب
                      </span>

                      <strong
                        style={{
                          fontSize: '20px',
                        }}
                      >
                        {order.total.toFixed(2)} ر.ع
                      </strong>
                    </div>
                  </article>
                ))}
            </div>
          )}
        </main>
      )}

      {/* =========================
          الإدارة
      ========================= */}

      {page === 'admin' && (
        <main className="admin-page">

          <div className="admin-heading">

            <div>

              <h2>
                إدارة المنتجات
              </h2>

              <p>
                أضف وعدّل المنتجات والمخزون
              </p>

            </div>

            <div className="admin-count">
              {products.length} منتجات
            </div>

          </div>

          {/* =========================
              QR الطاولات
          ========================= */}

          <section className="add-product-card" style={{ marginBottom: 24 }}>
            <h3>📱 QR الطاولات</h3>

            <p style={{ marginTop: 6, color: '#806d60' }}>
              أربع طاولات للتجربة. غيّر رابط موقع العميل إذا كان الموقع منشورًا على دومين آخر.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(240px, 1fr) auto',
                gap: 12,
                alignItems: 'end',
                marginTop: 16,
              }}
            >
              <label style={{ display: 'grid', gap: 7 }}>
                <strong>رابط موقع العميل</strong>
                <input
                  type="url"
                  value={customerBaseUrl}
                  onChange={(event) => setCustomerBaseUrl(event.target.value)}
                  onBlur={() => saveCustomerBaseUrl(customerBaseUrl)}
                  placeholder="https://example.com"
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  saveCustomerBaseUrl(customerBaseUrl)
                  notify('تم حفظ رابط موقع العميل', 'success')
                }}
              >
                حفظ الرابط
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                gap: 16,
                marginTop: 20,
              }}
            >
              {Array.from({ length: tableCount }, (_, index) => {
                const tableNumber = index + 1
                const customerUrl = getTableCustomerUrl(tableNumber)

                return (
                  <article
                    key={tableNumber}
                    style={{
                      border: '1px solid #eadfd8',
                      borderRadius: 18,
                      padding: 16,
                      textAlign: 'center',
                      background: '#fff',
                    }}
                  >
                    <strong style={{ display: 'block', fontSize: 20 }}>
                      طاولة {tableNumber}
                    </strong>

                    <img
                      src={getTableQrUrl(tableNumber)}
                      alt={`QR طاولة ${tableNumber}`}
                      style={{
                        width: '100%',
                        maxWidth: 190,
                        aspectRatio: '1',
                        objectFit: 'contain',
                        margin: '12px auto',
                        display: 'block',
                      }}
                    />

                    <small
                      style={{
                        display: 'block',
                        wordBreak: 'break-all',
                        color: '#806d60',
                        marginBottom: 10,
                      }}
                    >
                      {customerUrl}
                    </small>

                    <button
                      type="button"
                      onClick={() => window.open(customerUrl, '_blank')}
                    >
                      تجربة الطاولة
                    </button>
                  </article>
                )
              })}
            </div>

            <button
              type="button"
              style={{ marginTop: 18 }}
              onClick={printTableQrs}
            >
              🖨️ طباعة QR الطاولات الأربع
            </button>
          </section>

          {/* إضافة منتج */}

          <section className="add-product-card">

            <h3>
              إضافة منتج جديد
            </h3>

            <div className="add-product-form">

              <input
                type="text"
                placeholder="اسم المنتج"
                value={newName}
                onChange={(event) =>
                  setNewName(
                    event.target.value,
                  )
                }
              />

              <input
                type="number"
                step="0.01"
                placeholder="السعر"
                value={newPrice}
                onChange={(event) =>
                  setNewPrice(
                    event.target.value,
                  )
                }
              />

              <input
                type="number"
                min="0"
                placeholder="الكمية"
                value={newStock}
                onChange={(event) =>
                  setNewStock(
                    event.target.value,
                  )
                }
              />

              <select
                value={newCategory}
                onChange={(event) =>
                  setNewCategory(
                    event.target.value,
                  )
                }
              >

                <option value="قهوة">
                  قهوة
                </option>

                <option value="بارد">
                  بارد
                </option>

                <option value="مشروبات">
                  مشروبات
                </option>

                <option value="حلويات">
                  حلويات
                </option>

              </select>

              <button
                onClick={addProduct}
              >
                + إضافة المنتج
              </button>

            </div>

          </section>

          {/* المنتجات */}

          <section
            style={{
              background: '#fff8f5',
              border: '1px solid #f0d8cf',
              borderRadius: '18px',
              padding: '18px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '15px',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <h3 style={{ margin: '0 0 5px' }}>
                أدوات النظام
              </h3>
              <p style={{ margin: 0, color: '#806d60' }}>
                أدوات الصيانة الحساسة متوقفة في نسخة الإطلاق
              </p>
            </div>

            <button
              style={{
                border: '1px solid #e0bdb4',
                background: '#fff',
                color: '#9b3d32',
                borderRadius: '10px',
                padding: '10px 14px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              onClick={() => {
                if (!window.confirm(
                  'هذه الأداة متوقفة في نسخة الإطلاق. استخدم لوحة Supabase لإدارة البيانات الحساسة.',
                )) return

                notify('أداة إعادة البيانات متوقفة في نسخة الإطلاق', 'info')
              }}
            >
              أداة إعادة البيانات
            </button>
          </section>

          <section className="coupon-management-card">
            <div className="coupon-management-heading">
              <div>
                <h3>أكواد الخصم</h3>
                <p>
                  أنشئ أكوادًا خاصة للعملاء وحدد نسبة الخصم
                </p>
              </div>

              <span>
                {coupons.length} أكواد
              </span>
            </div>

            <div className="coupon-add-form">
              <input
                type="text"
                placeholder="كود الخصم مثل: RAMADAN10"
                value={newCouponCode}
                onChange={(event) =>
                  setNewCouponCode(
                    event.target.value.toUpperCase(),
                  )
                }
              />

              <input
                type="number"
                min="1"
                max="100"
                placeholder="نسبة الخصم %"
                value={newCouponPercent}
                onChange={(event) =>
                  setNewCouponPercent(
                    event.target.value,
                  )
                }
              />

              <button onClick={addCoupon}>
                + إضافة الكود
              </button>
            </div>

            <div className="coupon-list">
              {coupons.map((coupon) => (
                <div
                  className={`coupon-item ${
                    !coupon.active
                      ? 'coupon-disabled'
                      : ''
                  }`}
                  key={coupon.id}
                >
                  <div>
                    <strong>
                      {coupon.code}
                    </strong>

                    <span>
                      خصم {coupon.percent}%
                    </span>
                  </div>

                  <div className="coupon-actions">
                    <button
                      onClick={() =>
                        toggleCoupon(coupon.id)
                      }
                    >
                      {coupon.active
                        ? 'إيقاف'
                        : 'تفعيل'}
                    </button>

                    <button
                      className="delete-product"
                      onClick={() =>
                        deleteCoupon(coupon.id)
                      }
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="admin-products">

            <h3>
              المنتجات الحالية
            </h3>

            <div className="admin-product-list">

              {products.map(
                (product) => (

                  <div
                    className={`admin-product ${
                      !product.available
                        ? 'disabled-product'
                        : ''
                    }`}
                    key={product.id}
                  >

                    <div className="admin-product-info">

                      <div className="admin-product-icon">
                        ☕
                      </div>

                      {editingId ===
                      product.id ? (

                        <div className="edit-product-fields">

                          <label>
                            <span>
                              اسم المنتج
                            </span>

                            <input
                              type="text"
                              value={
                                editingName
                              }
                              onChange={(
                                event,
                              ) =>
                                setEditingName(
                                  event.target
                                    .value,
                                )
                              }
                            />
                          </label>

                          <label>
                            <span>
                              السعر
                            </span>

                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={
                                editingPrice
                              }
                              onChange={(
                                event,
                              ) =>
                                setEditingPrice(
                                  event.target
                                    .value,
                                )
                              }
                            />
                          </label>

                          <label>
                            <span>
                              المخزون
                            </span>

                            <input
                              type="number"
                              min="0"
                              value={
                                editingStock
                              }
                              onChange={(
                                event,
                              ) =>
                                setEditingStock(
                                  event.target
                                    .value,
                                )
                              }
                            />
                          </label>

                          <label>
                            <span>
                              التصنيف
                            </span>

                            <select
                              value={
                                editingCategory
                              }
                              onChange={(
                                event,
                              ) =>
                                setEditingCategory(
                                  event.target
                                    .value,
                                )
                              }
                            >

                              <option value="قهوة">
                                قهوة
                              </option>

                              <option value="بارد">
                                بارد
                              </option>

                              <option value="مشروبات">
                                مشروبات
                              </option>

                              <option value="حلويات">
                                حلويات
                              </option>

                            </select>

                          </label>

                        </div>

                      ) : (

                        <div>

                          <h4>
                            {product.name}
                          </h4>

                          <span>
                            {product.category} ·{' '}
                            {product.price.toFixed(
                              2,
                            )}{' '}
                            ر.ع
                          </span>

                          <div
                            style={{
                              marginTop:
                                '6px',
                              fontWeight:
                                'bold',
                            }}
                          >
                            المخزون:{' '}
                            {product.stock}
                          </div>

                        </div>

                      )}

                    </div>

                    <div className="admin-product-actions">

                      {editingId ===
                      product.id ? (

                        <>
                          <button
                            onClick={
                              saveProduct
                            }
                          >
                            حفظ
                          </button>

                          <button
                            onClick={
                              cancelEditing
                            }
                          >
                            إلغاء
                          </button>
                        </>

                      ) : (

                        <button
                          onClick={() =>
                            startEditing(
                              product,
                            )
                          }
                        >
                          تعديل
                        </button>

                      )}

                      <button
                        onClick={() =>
                          toggleProductAvailability(
                            product.id,
                          )
                        }
                      >
                        {product.available
                          ? 'إيقاف'
                          : 'تفعيل'}
                      </button>

                      <button
                        className="delete-product"
                        onClick={() =>
                          deleteProduct(
                            product.id,
                          )
                        }
                      >
                        حذف
                      </button>

                    </div>

                  </div>

                ),
              )}

            </div>

          </section>

        </main>
      )}

      {receiptOrder && (
        <div
          className="receipt-overlay"
          onClick={() => setReceiptOrder(null)}
        >
          <div
            className="receipt-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="receipt-paper">
              <div className="receipt-header">
                <h2>برني كافيه</h2>
                <p>فاتورة بيع</p>
              </div>

              <div className="receipt-meta">
                <div>
                  <span>رقم الطلب</span>
                  <strong>#{receiptOrder.id}</strong>
                </div>

                <div>
                  <span>الوقت</span>
                  <strong>{receiptOrder.createdAt}</strong>
                </div>

                <div>
                  <span>طريقة الدفع</span>
                  <strong>{receiptOrder.paymentMethod}</strong>
                </div>

                <div>
                  <span>المجموع قبل الخصم</span>
                  <strong>
                    {(
                      receiptOrder.total +
                      receiptOrder.discountAmount
                    ).toFixed(2)} ر.ع
                  </strong>
                </div>

                <div>
                  <span>
                    الخصم
                    {receiptOrder.discountPercent > 0
                      ? ` (${receiptOrder.discountPercent}%)`
                      : ''}
                  </span>
                  <strong>
                    {receiptOrder.discountAmount.toFixed(2)} ر.ع
                  </strong>
                </div>

                <div>
                  <span>نوع الطلب</span>
                  <strong>{receiptOrder.type}</strong>
                </div>

                {receiptOrder.type === 'داخل الكوفي' && (
                  <div>
                    <span>رقم الطاولة</span>
                    <strong>{receiptOrder.table}</strong>
                  </div>
                )}
              </div>

              <div className="receipt-items">
                {receiptOrder.items.map((item) => (
                  <div className="receipt-item" key={item.id}>
                    <div>
                      <strong>{item.name}</strong>
                      <span>
                        {item.quantity} × {item.price.toFixed(2)} ر.ع
                      </span>
                    </div>

                    <strong>
                      {(item.price * item.quantity).toFixed(2)} ر.ع
                    </strong>
                  </div>
                ))}
              </div>

              <div className="receipt-total">
                <span>الإجمالي</span>
                <strong>
                  {receiptOrder.total.toFixed(2)} ر.ع
                </strong>
              </div>

              <p className="receipt-thanks">
                شكرًا لزيارتكم ☕
              </p>
            </div>

            <div className="receipt-actions">
              <button
                className="print-receipt-button"
                onClick={() => window.print()}
              >
                🖨️ طباعة الفاتورة
              </button>

              <button
                className="close-receipt-button"
                onClick={() => setReceiptOrder(null)}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`barni-toast barni-toast-${toast.type}`}>
          <span>
            {toast.type === 'success'
              ? '✓'
              : toast.type === 'error'
                ? '!'
                : 'i'}
          </span>
          {toast.message}
        </div>
      )}

      <style>{`
        .topbar-user { display:flex; align-items:center; gap:8px; }
        .user-badge { display:flex; flex-direction:column; gap:2px; text-align:right; }
        .user-badge strong { font-size:13px; color:#2b211d; }
        .user-badge span { font-size:10px; color:#806d60; }
        .logout-button {
          border:1px solid #eadfd8;
          background:#fff;
          color:#6b5141;
          border-radius:9px;
          padding:8px 11px;
          cursor:pointer;
          font-weight:700;
        }
        .barni-toast {
          position:fixed;
          left:24px;
          bottom:24px;
          z-index:10000;
          min-width:230px;
          max-width:calc(100vw - 48px);
          display:flex;
          align-items:center;
          gap:10px;
          padding:13px 16px;
          border-radius:12px;
          color:#fff;
          background:#241b17;
          box-shadow:0 12px 35px rgba(0,0,0,.2);
          font-weight:700;
        }
        .barni-toast span {
          width:24px;
          height:24px;
          border-radius:50%;
          display:grid;
          place-items:center;
          background:rgba(255,255,255,.18);
        }
        .barni-toast-success { background:#28743a; }
        .barni-toast-error { background:#9b3d32; }
        .barni-toast-info { background:#241b17; }
        @media (max-width:700px) {
          .topbar-user .user-badge { display:none; }
          .barni-toast { left:12px; right:12px; bottom:12px; min-width:0; max-width:none; }
        }
      `}</style>
    </div>
  )
}

export default App
