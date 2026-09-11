import { useEffect, useMemo, useState } from 'react'
import { supabase } from './supabase'
import './CustomerPage.css'

type Product = {
  id: number
  name: string
  category: string
  price: number
  stock: number
  active?: boolean
  available?: boolean
}

type CartItem = Product & { quantity: number }

type Coupon = {
  code: string
  percent: number
  active?: boolean
}

type Notice = {
  message: string
  type: 'success' | 'error' | 'info'
}

type OrderStatus = 'جديد' | 'قيد التحضير' | 'جاهز' | 'مكتمل' | string

type Confirmation = {
  orderId: number
  total: number
  type: 'سفري' | 'داخل الكوفي'
  table: string
}

type CustomerPageProps = {
  showCashierButton?: boolean
}

const normalizeProduct = (item: any): Product => {
  const stock = Number(item?.stock ?? 0)
  const price = Number(item?.price ?? 0)
  const active = item?.active ?? true

  return {
    id: Number(item?.id ?? 0),
    name: String(item?.name ?? 'منتج غير مسمى'),
    category: String(item?.category ?? 'عام'),
    price,
    stock,
    active: Boolean(active),
    available: Boolean(item?.available ?? (active && stock > 0)),
  }
}

const normalizeCoupon = (item: any): Coupon => ({
  code: String(item?.code ?? '').trim().toUpperCase(),
  percent: Number(item?.percent ?? 0),
  active: item?.active === undefined ? true : Boolean(item.active),
})

const getTableFromUrl = () => {
  const params = new URLSearchParams(window.location.search)
  const raw = (params.get('table') ?? params.get('t') ?? '').trim()

  if (!/^\d{1,3}$/.test(raw)) return ''
  const table = Number(raw)
  return table > 0 ? String(table) : ''
}

const getModeFromUrl = () => {
  const params = new URLSearchParams(window.location.search)
  const mode = (params.get('mode') ?? '').toLowerCase()
  return mode === 'takeaway' || mode === 'car' ? 'سفري' : ''
}

const getSavedCartKey = (table: string) =>
  `barni-customer-cart:${table || 'takeaway'}`

export default function CustomerPage({ showCashierButton = false }: CustomerPageProps) {
  // CUSTOMER-ONLY MODE: this component never renders or navigates to the POS.
  // The legacy prop is intentionally ignored for backwards compatibility.
  void showCashierButton

  const initialTable = useMemo(() => getTableFromUrl(), [])
  const initialMode = useMemo(() => getModeFromUrl(), [])

  const [products, setProducts] = useState<Product[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [selectedCategory, setSelectedCategory] = useState('الكل')
  const [search, setSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [orderType, setOrderType] = useState<'سفري' | 'داخل الكوفي' | ''>(
    initialTable ? 'داخل الكوفي' : initialMode,
  )
  const [tableNumber] = useState(initialTable)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'نقدي' | 'بطاقة'>('نقدي')
  const [discountCode, setDiscountCode] = useState('')
  const [discountPercent, setDiscountPercent] = useState(0)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('جديد')
  const [showSplash, setShowSplash] = useState(true)
  const [showOrderChoice, setShowOrderChoice] = useState(!initialTable && !initialMode)
  const [customerScreen, setCustomerScreen] = useState<'menu' | 'cart'>('menu')
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('barni-favorites') ?? '[]')
    } catch {
      return []
    }
  })

  const notify = (message: string, type: Notice['type'] = 'info') => {
    setNotice({ message, type })
    window.setTimeout(() => setNotice(null), 3200)
  }

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 1400)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem(getSavedCartKey(tableNumber))
    if (!saved) return
    try {
      const parsed = JSON.parse(saved) as CartItem[]
      if (Array.isArray(parsed)) setCart(parsed)
    } catch {
      localStorage.removeItem(getSavedCartKey(tableNumber))
    }
  }, [tableNumber])

  useEffect(() => {
    localStorage.setItem(getSavedCartKey(tableNumber), JSON.stringify(cart))
  }, [cart, tableNumber])

  useEffect(() => {
    localStorage.setItem('barni-favorites', JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      const [{ data: productData, error: productError }, { data: couponData }] =
        await Promise.all([
          supabase.from('products').select('*').order('id', { ascending: true }),
          supabase.from('coupons').select('*').order('id', { ascending: true }),
        ])

      if (productError) {
        console.error('Customer products error:', productError)
        if (!cancelled) notify('تعذر تحميل المنيو حالياً', 'error')
        return
      }

      if (!cancelled) {
        setProducts(
          (productData ?? [])
            .map(normalizeProduct)
            .filter((product) => product.active !== false),
        )
        setCoupons((couponData ?? []).map(normalizeCoupon))
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!confirmation?.orderId) return

    let cancelled = false

    const refreshStatus = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('status')
        .eq('id', confirmation.orderId)
        .maybeSingle()

      if (!error && data && !cancelled) {
        setOrderStatus(String(data.status ?? 'جديد'))
      }
    }

    refreshStatus()
    const timer = window.setInterval(refreshStatus, 5000)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [confirmation?.orderId])

  const categories = useMemo(
    () => [
      'الكل',
      ...Array.from(
        new Set(
          products.map((product) => product.category).filter(Boolean),
        ),
      ),
    ],
    [products],
  )

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()

    return products.filter((product) => {
      const categoryMatch =
        selectedCategory === 'الكل' || product.category === selectedCategory
      const searchMatch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)

      return categoryMatch && searchMatch
    })
  }, [products, selectedCategory, search])

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )
  const discountAmount = subtotal * (discountPercent / 100)
  const total = Math.max(subtotal - discountAmount, 0)
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  const addToCart = (product: Product) => {
    if (!product.available || product.stock <= 0) {
      notify('هذا المنتج غير متوفر حالياً', 'error')
      return
    }

    setCart((current) => {
      const existing = current.find((item) => item.id === product.id)

      if (existing) {
        if (existing.quantity >= product.stock) {
          notify('وصلت للكمية المتاحة من هذا المنتج', 'error')
          return current
        }

        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }

      return [...current, { ...product, quantity: 1 }]
    })

    notify(`تمت إضافة ${product.name}`, 'success')
  }

  const updateCartItemQuantity = (id: number, delta: number) => {
    setCart((current) =>
      current
        .map((item) => {
          if (item.id !== id) return item

          const nextQuantity = item.quantity + delta
          if (nextQuantity > item.stock) {
            notify('لا توجد كمية إضافية متاحة', 'error')
            return item
          }

          return { ...item, quantity: nextQuantity }
        })
        .filter((item) => item.quantity > 0),
    )
  }

  const removeCartItem = (id: number) => {
    setCart((current) => current.filter((item) => item.id !== id))
  }

  const toggleFavorite = (id: number) => {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )
  }

  const applyDiscount = async () => {
    const code = discountCode.trim().toUpperCase()

    if (!code) {
      notify('اكتب كود الخصم أولاً', 'error')
      return
    }

    const local = coupons.find(
      (coupon) => coupon.code === code && coupon.active !== false,
    )

    if (local) {
      setDiscountPercent(local.percent)
      notify(`تم تطبيق خصم ${local.percent}%`, 'success')
      return
    }

    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code)
      .maybeSingle()

    if (error) {
      console.error('Coupon lookup failed:', error)
      notify('تعذر التحقق من الكود', 'error')
      return
    }

    if (!data || data.active === false) {
      setDiscountPercent(0)
      notify('كود الخصم غير موجود أو غير فعال', 'error')
      return
    }

    const coupon = normalizeCoupon(data)
    setDiscountPercent(coupon.percent)
    notify(`تم تطبيق خصم ${coupon.percent}%`, 'success')
  }

  const resetDiscount = () => {
    setDiscountCode('')
    setDiscountPercent(0)
  }

  const submitOrder = async () => {
    if (!cart.length) {
      notify('السلة فارغة', 'error')
      return
    }

    const phone = phoneNumber.trim()
    if (!/^[79]\d{7}$/.test(phone)) {
      notify('اكتب رقم عماني صحيح من 8 أرقام', 'error')
      return
    }

    if (!orderType) {
      notify('اختر نوع الطلب', 'error')
      return
    }

    if (orderType === 'داخل الكوفي' && !tableNumber) {
      notify('لا يوجد رقم طاولة في الرابط', 'error')
      return
    }

    setIsSubmitting(true)

    try {
      const { data, error } = await supabase.rpc('place_barni_order', {
        p_items: cart.map(({ id, name, category, price, quantity }) => ({
          id,
          name,
          category,
          price,
          quantity,
        })),
        p_type: orderType,
        p_table: tableNumber,
        p_phone: phone,
        p_payment_method: paymentMethod,
        p_discount_code:
          discountPercent > 0 ? discountCode.trim().toUpperCase() : '',
      })

      if (error) {
        console.error('Customer order RPC failed:', error)
        notify(error.message || 'تعذر إرسال الطلب', 'error')
        return
      }

      // Supports both the current RPC return shape (bigint)
      // and a future { id, total } return shape.
      const orderId = Number(data?.id ?? data)
      const finalTotal = Number(data?.total ?? total)

      if (!Number.isFinite(orderId)) {
        console.error('Unexpected RPC response:', data)
        notify('تم إرسال الطلب لكن تعذر قراءة رقمه', 'error')
        return
      }

      // إرسال إشعار واتساب تلقائيًا بعد نجاح إنشاء الطلب.
      // لا نضع أسرار واتساب في المتصفح، بل نستدعي Edge Function آمنة.
      try {
        const { error: whatsappError } = await supabase.functions.invoke(
          'send-order-whatsapp',
          {
            body: {
              phone,
              orderId,
              total: Number.isFinite(finalTotal) ? finalTotal : total,
              status: 'تم استلام الطلب',
            },
          },
        )

        if (whatsappError) {
          console.error('WhatsApp notification failed:', whatsappError)
          // فشل واتساب لا يلغي الطلب الذي تم إنشاؤه بنجاح.
        }
      } catch (whatsappError) {
        console.error('WhatsApp notification exception:', whatsappError)
      }

      setConfirmation({
        orderId,
        total: Number.isFinite(finalTotal) ? finalTotal : total,
        type: orderType,
        table: orderType === 'داخل الكوفي' ? tableNumber : 'سفري',
      })

      setOrderStatus('جديد')
      setCart([])
      setCustomerScreen('menu')
      setShowOrderChoice(false)
      setDiscountCode('')
      setDiscountPercent(0)
      notify('تم إرسال طلبك للمطبخ بنجاح', 'success')
    } catch (error) {
      console.error('Order submission error:', error)
      notify('حدث خطأ أثناء تأكيد الطلب', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const statusLabel =
    orderStatus === 'جديد'
      ? 'تم استلام الطلب'
      : orderStatus === 'قيد التحضير'
        ? 'المطبخ يحضر طلبك'
        : orderStatus === 'جاهز'
          ? 'طلبك جاهز'
          : orderStatus === 'مكتمل'
            ? 'تم تسليم الطلب'
            : orderStatus

  return (
    <div className="customer-page" dir="rtl">
      {showSplash && (
        <div className="barni-splash">
          <div
            className="barni-splash-logo"
            style={{
              fontFamily: 'Cairo, Tahoma, Arial, sans-serif',
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            برني
          </div>
        </div>
      )}

      {!showSplash && showOrderChoice && (
        <div className="barni-order-choice">
          <div className="barni-choice-content">
            <div
              className="barni-choice-logo"
              style={{
                fontFamily: 'Cairo, Tahoma, Arial, sans-serif',
                fontWeight: 900,
                lineHeight: 1,
                transform: 'translateY(-35px)',
                marginBottom: '0px',
              }}
            >
              برني
            </div>

            <div
              className="barni-choice-subtitle"
              style={{
                fontFamily: 'Cairo, Tahoma, Arial, sans-serif',
                margin: '55px 0 36px',
              }}
            >
              كيف تحب تطلب؟
            </div>

            <div className="barni-choice-buttons">
              <button
                type="button"
                onClick={() => {
                  setOrderType('سفري')
                  setShowOrderChoice(false)
                }}
              >
                <span>🚗</span>
                <strong>طلب من السيارة</strong>
                <small>اطلب وأنت في الطريق</small>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOrderType('داخل الكوفي')
                  setShowOrderChoice(false)
                }}
              >
                <span>☕</span>
                <strong>طلب من داخل المقهى</strong>
                <small>امسح QR الطاولة للطلب المباشر</small>
              </button>
            </div>
          </div>
        </div>
      )}

      {!showSplash && !showOrderChoice && (
        <div className="barni-app">
          <style>{`
            .barni-home-button {
              position: fixed;
              top: 16px;
              right: 24px;
              z-index: 2000;

              display: inline-flex;
              align-items: center;
              gap: 8px;

              padding: 10px 18px;

              border: 1px solid #e7ddd1;
              border-radius: 999px;

              background: #3b241b;
              color: #fff;

              font-family: "Noto Kufi Arabic", Tahoma, Arial, sans-serif;
              font-size: 14px;
              font-weight: 700;

              text-decoration: none;

              box-shadow: 0 8px 22px rgba(59, 36, 27, 0.12);

              transition:
                transform 0.2s ease,
                background 0.2s ease;
            }

            .barni-home-button:hover {
              transform: translateY(-2px);
              background: #4a2c21;
            }

            .barni-home-button:active {
              transform: translateY(0);
            }

            @media (max-width: 600px) {
              .barni-home-button {
                top: 12px;
                right: 12px;
                padding: 8px 13px;
                font-size: 12px;
              }
            }
          `}</style>

          <a
            href="/"
            className="barni-home-button"
            aria-label="العودة إلى الصفحة الرئيسية"
          >
            ← الرئيسية
          </a>

          <header className="barni-header">
            <div className="barni-header-inner">
              <button
                type="button"
                className="barni-simple-logo"
                onClick={() => {
                  setCustomerScreen('menu')
                  setConfirmation(null)
                }}
              >
                برني
              </button>

              <div className="barni-header-actions">
                {tableNumber && (
                  <div className="barni-table-badge">طاولة {tableNumber}</div>
                )}

                <button
                  type="button"
                  className="barni-cart-button"
                  onClick={() => setCustomerScreen('cart')}
                >
                  السلة <b>{totalItems}</b>
                </button>
              </div>
            </div>
          </header>

          {customerScreen === 'menu' && !confirmation && (
            <main className="barni-page barni-menu-page">
              <section className="barni-welcome">
                <span>BARnI • DIGITAL MENU</span>
                <h1>
                  اطلبها على <em>مزاجك.</em>
                </h1>
                <p>
                  اختر قهوتك، عدّل طلبك، وأرسله مباشرة للمطبخ بدون انتظار.
                </p>

                <div className="barni-search-wrap">
                  <span>⌕</span>
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="ابحث عن قهوة أو حلى..."
                    aria-label="البحث في المنيو"
                  />
                </div>
              </section>

              <div className="barni-category-tabs">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={
                      selectedCategory === category
                        ? 'barni-category active'
                        : 'barni-category'
                    }
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {products.length === 0 ? (
                <div className="barni-empty">
                  <span>☕</span>
                  <h3>المنيو غير متاحة حالياً</h3>
                  <p>حاول مرة ثانية بعد قليل.</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="barni-empty">
                  <span>⌕</span>
                  <h3>ما لقينا هذا المنتج</h3>
                  <p>جرّب اسمًا أو تصنيفًا مختلفًا.</p>
                </div>
              ) : (
                <div className="barni-product-grid">
                  {filteredProducts.map((product) => {
                    const isFavorite = favorites.includes(product.id)

                    return (
                      <article
                        key={product.id}
                        className="barni-product-card"
                        onClick={() => setSelectedProduct(product)}
                      >
                        <div className="barni-product-visual">
                          <button
                            type="button"
                            className={`barni-favorite ${isFavorite ? 'active' : ''}`}
                            aria-label="المفضلة"
                            onClick={(event) => {
                              event.stopPropagation()
                              toggleFavorite(product.id)
                            }}
                          >
                            {isFavorite ? '♥' : '♡'}
                          </button>

                          <div className="barni-product-ring" />
                          <span>☕</span>

                          {!product.available || product.stock <= 0 ? (
                            <small className="sold-out">غير متوفر</small>
                          ) : null}
                        </div>

                        <div className="barni-product-info">
                          <div>
                            <h3>{product.name}</h3>
                            <p>{product.category}</p>
                          </div>

                          <div className="barni-product-buy">
                            <strong>{product.price.toFixed(2)} ر.ع</strong>
                            <button
                              type="button"
                              disabled={!product.available || product.stock <= 0}
                              onClick={(event) => {
                                event.stopPropagation()
                                addToCart(product)
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}

              {selectedProduct && (
                <div
                  className="barni-product-modal"
                  onClick={() => setSelectedProduct(null)}
                >
                  <div
                    className="barni-product-modal-card"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      type="button"
                      className="barni-close"
                      onClick={() => setSelectedProduct(null)}
                    >
                      ×
                    </button>

                    <div className="barni-modal-image">☕</div>
                    <span className="barni-modal-category">
                      {selectedProduct.category}
                    </span>
                    <h2>{selectedProduct.name}</h2>
                    <strong>{selectedProduct.price.toFixed(2)} ر.ع</strong>

                    <button
                      type="button"
                      className="barni-modal-add"
                      onClick={() => {
                        addToCart(selectedProduct)
                        setSelectedProduct(null)
                      }}
                      disabled={
                        !selectedProduct.available || selectedProduct.stock <= 0
                      }
                    >
                      إضافة للسلة
                    </button>
                  </div>
                </div>
              )}
            </main>
          )}

          {customerScreen === 'cart' && !confirmation && (
            <main className="barni-page barni-cart-page">
              <div className="barni-page-title">
                <button type="button" onClick={() => setCustomerScreen('menu')}>
                  ← المنيو
                </button>
                <h1>طلبك</h1>
              </div>

              {cart.length === 0 ? (
                <div className="barni-cart-empty">
                  <span>🛒</span>
                  <h3>السلة فارغة</h3>
                  <button type="button" onClick={() => setCustomerScreen('menu')}>
                    تصفح المنيو
                  </button>
                </div>
              ) : (
                <div className="barni-cart-layout">
                  <section className="barni-cart-list">
                    {cart.map((item) => (
                      <div className="barni-cart-row" key={item.id}>
                        <div className="barni-cart-row-icon">☕</div>

                        <div className="barni-cart-row-main">
                          <h3>{item.name}</h3>
                          <span>{item.price.toFixed(2)} ر.ع</span>
                        </div>

                        <div className="barni-quantity">
                          <button
                            type="button"
                            onClick={() => updateCartItemQuantity(item.id, -1)}
                          >
                            −
                          </button>
                          <strong>{item.quantity}</strong>
                          <button
                            type="button"
                            onClick={() => updateCartItemQuantity(item.id, 1)}
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          className="barni-remove"
                          onClick={() => removeCartItem(item.id)}
                        >
                          حذف
                        </button>
                      </div>
                    ))}
                  </section>

                  <section className="barni-checkout-card">
                    <div className="barni-checkout-line">
                      <span>المجموع</span>
                      <strong>{subtotal.toFixed(2)} ر.ع</strong>
                    </div>

                    {discountPercent > 0 && (
                      <div className="barni-checkout-line discount">
                        <span>الخصم {discountPercent}%</span>
                        <strong>-{discountAmount.toFixed(2)} ر.ع</strong>
                      </div>
                    )}

                    <div className="barni-checkout-line total">
                      <span>الإجمالي</span>
                      <strong>{total.toFixed(2)} ر.ع</strong>
                    </div>

                    <label className="barni-field">
                      <span>رقم الهاتف</span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={8}
                        value={phoneNumber}
                        onChange={(event) =>
                          setPhoneNumber(event.target.value.replace(/\D/g, ''))
                        }
                        placeholder="9xxxxxxx"
                      />
                    </label>

                    {orderType === 'داخل الكوفي' && (
                      <div className="barni-locked-table">
                        <span>الطلب إلى</span>
                        <strong>طاولة {tableNumber}</strong>
                      </div>
                    )}

                    <div className="barni-choice-group">
                      <span>طريقة الدفع</span>
                      <div>
                        {(['نقدي', 'بطاقة'] as const).map((method) => (
                          <button
                            key={method}
                            type="button"
                            className={paymentMethod === method ? 'active' : ''}
                            onClick={() => setPaymentMethod(method)}
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="barni-discount">
                      <input
                        type="text"
                        value={discountCode}
                        onChange={(event) =>
                          setDiscountCode(event.target.value.toUpperCase())
                        }
                        placeholder="كود الخصم"
                      />
                      <button
                        type="button"
                        onClick={
                          discountPercent > 0 ? resetDiscount : applyDiscount
                        }
                      >
                        {discountPercent > 0 ? 'إزالة' : 'تطبيق'}
                      </button>
                    </div>

                    <button
                      type="button"
                      className="barni-submit"
                      onClick={submitOrder}
                      disabled={cart.length === 0 || isSubmitting}
                    >
                      {isSubmitting ? 'جاري إرسال الطلب...' : 'تأكيد الطلب'}
                    </button>

                    <small className="barni-secure-note">
                      🔒 طلبك يرسل مباشرة إلى نظام برني
                    </small>
                  </section>
                </div>
              )}
            </main>
          )}

          {confirmation && (
            <main className="barni-page">
              <section className="barni-confirmation">
                <div className="barni-confirmation-icon">✓</div>
                <span>ORDER #{confirmation.orderId}</span>
                <h2>تم استلام طلبك</h2>
                <p>
                  {confirmation.type === 'داخل الكوفي'
                    ? `طاولة ${confirmation.table}`
                    : 'طلب من السيارة'}
                </p>

                <div className="barni-live-status">
                  <span>الحالة الحالية</span>
                  <strong>{statusLabel}</strong>
                  <small>تتحدث تلقائياً</small>
                </div>

                <strong className="barni-confirmation-total">
                  {confirmation.total.toFixed(2)} ر.ع
                </strong>

                <button
                  type="button"
                  className="barni-submit"
                  onClick={() => {
                    setConfirmation(null)
                    setOrderStatus('جديد')
                    setCustomerScreen('menu')
                  }}
                >
                  طلب جديد
                </button>
              </section>
            </main>
          )}

          {notice && (
            <div className={`barni-toast ${notice.type}`}>{notice.message}</div>
          )}

          <footer className="barni-footer">
            <strong>برني</strong>
            <span>قهوة على مزاجك.</span>
          </footer>
        </div>
      )}
    </div>
  )
}
