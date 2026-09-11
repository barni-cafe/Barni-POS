const twilio = require('twilio')

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN

if (!accountSid || !authToken) {
  throw new Error('Twilio environment variables are missing')
}

const client = twilio(accountSid, authToken)

async function sendWhatsApp(to, message) {
  const result = await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM,
    to: `whatsapp:${to}`,
    contentSid: process.env.TWILIO_CONTENT_SID,
  })

  return result
}

module.exports = {
  sendWhatsApp,
}