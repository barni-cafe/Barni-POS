import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'

type GiftOrder = {
  id: number
  sender_name: string
  sender_phone: string
  recipient_name: string
  recipient_phone: string
  gift_item: string
  message: string | null
  payment_method: string | null
  payment_status: 'مدفوع' | 'غير مدفوع' | string
  total: number
  status: 'جديد' | 'قيد التجهيز' | 'تم التسليم' | 'ملغي' | string
  created_at: string
}

const statusOptions = ['جديد', 'قيد التجهيز', 'تم التسليم', 'ملغي'] as const

export default function GiftOrdersPanel() {
  const [orders, setOrders] = useState<GiftOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'الكل' | 'غير مدفوع' | 'مدفوع' | 'جديد' | 'قيد التجهيز'>('الكل')

  const loadOrders = useCallback(async () => {
    const { data, error: loadError } = await supabase
      .from('gift_orders')
      .select('*')
      .order('id', { ascending: false })
      .limit(300)

    if (loadError) {
      console.error('Gift orders load error:', loadError)
      setError(
        loadError.message?.includes('payment_status')
          ? 'قاعدة البيانات تحتاج تحديث حقول الدفع. شغّل ملف SQL المرفق ثم أعد فتح التطبيق.'
          : loadError.message || 'تعذر تحميل طلبات الهدايا.',
      )
      setLoading(false)
      return
    }

    setOrders(
      (data ?? []).map((row: any) => ({
        id: Number(row.id),
        sender_name: String(row.sender_name ?? ''),
        sender_phone: String(row.sender_phone ?? ''),
        recipient_name: String(row.recipient_name ?? ''),
        recipient_phone: String(row.recipient_phone ?? ''),
        gift_item: String(row.gift_item ?? ''),
        message: row.message ? String(row.message) : null,
        payment_method: row.payment_method ? String(row.payment_method) : null,
        payment_status: String(row.payment_status ?? 'غير مدفوع'),
        total: Number(row.total ?? 0),
        status: String(row.status ?? 'جديد'),
        created_at: String(row.created_at ?? ''),
      })),
    )
    setError('')
    setLoading(false)
  }, [])

  useEffect(() => {
    loadOrders()
    const timer = window.setInterval(loadOrders, 4000)
    return () => window.clearInterval(timer)
  }, [loadOrders])

  const updateOrder = async (
    id: number,
    patch: Partial<Pick<GiftOrder, 'payment_status' | 'status'>>,
  ) => {
    setUpdatingId(id)
    setError('')

    const { error: updateError } = await supabase
      .from('gift_orders')
      .update(patch)
      .eq('id', id)

    if (updateError) {
      console.error('Gift order update error:', updateError)
      setError(updateError.message || 'تعذر تحديث طلب الهدية.')
      setUpdatingId(null)
      return
    }

    await loadOrders()
    setUpdatingId(null)
  }

  const filteredOrders = orders.filter((order) => {
    if (filter === 'الكل') return true
    if (filter === 'غير مدفوع') return order.payment_status !== 'مدفوع'
    if (filter === 'مدفوع') return order.payment_status === 'مدفوع'
    return order.status === filter
  })

  const formatDate = (value: string) => {
    if (!value) return 'غير معروف'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleString('ar-OM', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  const statusStyle = (status: string) => {
    if (status === 'تم التسليم') return { bg: '#e7f5e9', color: '#28743a' }
    if (status === 'قيد التجهيز') return { bg: '#fff3d8', color: '#8a5a00' }
    if (status === 'ملغي') return { bg: '#fce9e6', color: '#9b3d32' }
    return { bg: '#eee8ff', color: '#59409a' }
  }

  return (
    <main
      dir="rtl"
      style={{
        minHeight: 'calc(100vh - 90px)',
        padding: '28px',
        maxWidth: '1500px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        background: '#f7f1e9',
      }}
    >
      <style>{`
        .gift-orders-panel * { box-sizing: border-box; }
        .gift-orders-filter {
          border: 1px solid #e2d5ca;
          background: #fffdfa;
          color: #3b241b;
          border-radius: 999px;
          padding: 10px 16px;
          cursor: pointer;
          font-family: inherit;
          font-weight: 800;
        }
        .gift-orders-filter.active {
          background: #3b241b;
          color: #fff;
          border-color: #3b241b;
        }
        .gift-order-card {
          background: #fff;
          border: 1px solid #eadfd8;
          border-radius: 20px;
          padding: 22px;
          box-shadow: 0 8px 28px rgba(43,33,29,.06);
        }
        .gift-order-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }
        .gift-order-info {
          background: #f8f3ee;
          border-radius: 13px;
          padding: 12px 14px;
        }
        .gift-order-info small {
          display: block;
          color: #806d60;
          margin-bottom: 4px;
        }
        .gift-order-action {
          border: 1px solid #e0d1c4;
          border-radius: 12px;
          padding: 10px 14px;
          background: #fffdfa;
          color: #3b241b;
          cursor: pointer;
          font-family: inherit;
          font-weight: 800;
        }
        .gift-order-action.primary {
          background: #3b241b;
          color: #fff;
          border-color: #3b241b;
        }
        .gift-order-action.paid {
          background: #28743a;
          color: #fff;
          border-color: #28743a;
        }
        @media (max-width: 750px) {
          .gift-order-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="gift-orders-panel">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 18,
            flexWrap: 'wrap',
            marginBottom: 20,
          }}
        >
          <div>
            <h2 style={{ margin: '0 0 6px', color: '#3b241b' }}>
              🎁 طلبات الهدايا
            </h2>
            <p style={{ margin: 0, color: '#806d60' }}>
              كل طلب هدية بالتفصيل، مع حالة الدفع والتجهيز والتسليم
            </p>
          </div>

          <div
            style={{
              padding: '12px 18px',
              borderRadius: 14,
              background: '#fff',
              border: '1px solid #eadfd8',
              fontWeight: 900,
              color: '#3b241b',
            }}
          >
            {orders.length} هدية
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            marginBottom: 18,
          }}
        >
          {(['الكل', 'غير مدفوع', 'مدفوع', 'جديد', 'قيد التجهيز'] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={`gift-orders-filter ${filter === item ? 'active' : ''}`}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {error && (
          <div
            style={{
              marginBottom: 16,
              padding: 14,
              borderRadius: 14,
              background: '#fce9e6',
              color: '#9b3d32',
              fontWeight: 800,
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div
            style={{
              padding: 60,
              textAlign: 'center',
              background: '#fff',
              borderRadius: 20,
              color: '#806d60',
            }}
          >
            جاري تحميل طلبات الهدايا...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div
            style={{
              padding: 60,
              textAlign: 'center',
              background: '#fff',
              border: '1px solid #eadfd8',
              borderRadius: 20,
            }}
          >
            <div style={{ fontSize: 42 }}>🎁</div>
            <h3 style={{ color: '#3b241b' }}>لا توجد طلبات هدايا</h3>
            <p style={{ color: '#806d60' }}>
              عندما يرسل أحد هدية ستظهر هنا تلقائيًا.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {filteredOrders.map((order) => {
              const status = statusStyle(order.status)
              const isUpdating = updatingId === order.id

              return (
                <article key={order.id} className="gift-order-card">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                      flexWrap: 'wrap',
                      marginBottom: 18,
                    }}
                  >
                    <div>
                      <h3 style={{ margin: '0 0 5px', color: '#3b241b' }}>
                        هدية #{order.id}
                      </h3>
                      <span style={{ color: '#806d60', fontSize: 13 }}>
                        {formatDate(order.created_at)}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          padding: '8px 12px',
                          borderRadius: 999,
                          background: status.bg,
                          color: status.color,
                          fontWeight: 900,
                        }}
                      >
                        {order.status}
                      </span>
                      <span
                        style={{
                          padding: '8px 12px',
                          borderRadius: 999,
                          background:
                            order.payment_status === 'مدفوع'
                              ? '#e7f5e9'
                              : '#fce9e6',
                          color:
                            order.payment_status === 'مدفوع'
                              ? '#28743a'
                              : '#9b3d32',
                          fontWeight: 900,
                        }}
                      >
                        {order.payment_status === 'مدفوع'
                          ? '✓ تم الدفع'
                          : 'غير مدفوع'}
                      </span>
                    </div>
                  </div>

                  <div className="gift-order-grid">
                    <div className="gift-order-info">
                      <small>المرسل</small>
                      <strong>{order.sender_name || 'غير مسجل'}</strong>
                      <div style={{ marginTop: 4, color: '#806d60' }}>
                        {order.sender_phone || 'بدون رقم'}
                      </div>
                    </div>

                    <div className="gift-order-info">
                      <small>المستلم</small>
                      <strong>{order.recipient_name || 'غير مسجل'}</strong>
                      <div style={{ marginTop: 4, color: '#806d60' }}>
                        {order.recipient_phone || 'بدون رقم'}
                      </div>
                    </div>

                    <div className="gift-order-info">
                      <small>الهدية</small>
                      <strong>{order.gift_item || 'غير محددة'}</strong>
                    </div>

                    <div className="gift-order-info">
                      <small>المبلغ</small>
                      <strong style={{ fontSize: 18 }}>
                        {order.total.toFixed(2)} ر.ع
                      </strong>
                    </div>

                    <div className="gift-order-info">
                      <small>طريقة الدفع</small>
                      <strong>{order.payment_method || 'غير محددة'}</strong>
                    </div>

                    <div className="gift-order-info">
                      <small>حالة الدفع</small>
                      <strong>
                        {order.payment_status === 'مدفوع'
                          ? 'تم الدفع ✓'
                          : 'بانتظار الدفع'}
                      </strong>
                    </div>
                  </div>

                  {order.message && (
                    <div
                      style={{
                        marginTop: 12,
                        padding: 14,
                        borderRadius: 14,
                        background: '#fffaf3',
                        border: '1px solid #eee0d4',
                      }}
                    >
                      <small style={{ color: '#806d60', fontWeight: 800 }}>
                        الرسالة والتفاصيل
                      </small>
                      <div
                        style={{
                          whiteSpace: 'pre-wrap',
                          marginTop: 6,
                          lineHeight: 1.8,
                          color: '#3b241b',
                        }}
                      >
                        {order.message}
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      marginTop: 18,
                      paddingTop: 16,
                      borderTop: '1px solid #eee4de',
                    }}
                  >
                    <strong style={{ marginLeft: 'auto', color: '#806d60' }}>
                      تحديث الطلب:
                    </strong>

                    {order.payment_status !== 'مدفوع' ? (
                      <button
                        type="button"
                        className="gift-order-action paid"
                        disabled={isUpdating}
                        onClick={() =>
                          updateOrder(order.id, {
                            payment_status: 'مدفوع',
                          })
                        }
                      >
                        {isUpdating ? 'جاري التحديث...' : '✓ تأكيد تم الدفع'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="gift-order-action"
                        disabled={isUpdating}
                        onClick={() =>
                          updateOrder(order.id, {
                            payment_status: 'غير مدفوع',
                          })
                        }
                      >
                        إرجاع إلى غير مدفوع
                      </button>
                    )}

                    {statusOptions.map((nextStatus) => (
                      <button
                        key={nextStatus}
                        type="button"
                        className={`gift-order-action ${
                          order.status === nextStatus ? 'primary' : ''
                        }`}
                        disabled={isUpdating || order.status === nextStatus}
                        onClick={() =>
                          updateOrder(order.id, {
                            status: nextStatus,
                          })
                        }
                      >
                        {nextStatus}
                      </button>
                    ))}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
