import sg from '@sendgrid/mail'
import * as process from 'node:process'

console.log(process.env.SENDGRID_API_KEY)
sg.setApiKey(process.env.SENDGRID_API_KEY)

const messages = {
  to: 'daniel@muelheim-modular.de', // Change to your recipient
  from: 'no-reply@mailer.heene.io', // Change to your verified sender
  subject: 'Sending with SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
}


sg.send(messages)
  .then(() => {
    console.log('Email sent')
  })
  .catch((error) => {
    console.error(error)
  })

//n
// (async () => {
//   const payload = await getPayload({ config: payloadConfig })
//
//   const clean = async () => {
//
//   }
//
//
// })()
