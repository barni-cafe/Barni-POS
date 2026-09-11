require('dotenv').config()

const express = require('express')
const { sendWhatsApp } = require('./twilio.cjs')

const app = express()

// السماح للموقع الرئيسي بالاتصال بسيرفر WhatsApp
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204)
  }

  next()
})

app.use(express.json())

app.post('/api/whatsapp', async (req, res) => {
  console.log('📩 طلب WhatsApp وصل للسيرفر')

  try {
    const { to, message } = req.body

    if (!to || !message) {
      return res.status(400).json({
        success: false,
        error: 'رقم الهاتف والرسالة مطلوبان',
      })
    }

    console.log('📱 المستلم:', to)

    const result = await sendWhatsApp(to, message)

    console.log('✅ تم إرسال WhatsApp:', result.sid)

    return res.json({
      success: true,
      sid: result.sid,
    })
  } catch (error) {
    console.error('❌ WhatsApp error:', error)

    return res.status(500).json({
      success: false,
      error: error.message || 'فشل إرسال الرسالة',
    })
  }
})

app.listen(3001, () => {
  console.log('Barni WhatsApp server running on port 3001')
})