const twilio = require('twilio')

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN

const client = twilio(accountSid, authToken)

async function sendTest() {
  try {
    console.log('📤 جاري إرسال رسالة WhatsApp...')

    const message = await client.messages.create({
      from: 'whatsapp:+17372508034',
      to: 'whatsapp:+96890652517',
      contentSid: 'HXfe5ab5f00277942d4d4200328b4d403c',
      contentVariables: JSON.stringify({
        1: 'Barni',
        2: 'اختبار',
      }),
    })

    console.log('✅ تم إرسال الرسالة بنجاح!')
    console.log('Message SID:', message.sid)
  } catch (error) {
    console.error('❌ فشل إرسال الرسالة')
    console.error('الخطأ:', error.message)
  }
}

sendTest()