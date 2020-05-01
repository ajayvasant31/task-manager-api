const sendgrid = require('@sendgrid/mail')
sendgrid.setApiKey(process.env.SENDGRID_API_KEY)


const SendWelcomeEmail = (name, email) => {
  const msg = {
    to: email,
    from: 'Mr.Robot2077@protonmail.com',
    subject: 'Welcome to the Task-manager',
    text: `Hi ${name}, We are here to help you stay organized`,
    html: '<footer>Created By AppKnight Inc.</footer>',
  }
  sendgrid.send(msg)
}

const SendCancelEmail = (name, email) => {
  const msg = {
    to: email,
    from: 'Mr.Robot2077@protonmail.com',
    subject: 'Cancellation Confirmation',
    text: `Hi ${name}, We are so sorry to see you go. Hope to see you again in future.`,
    html: '<footer>Created By AppKnight Inc.</footer>',
  }
  sendgrid.send(msg)
}


module.exports = {
  SendWelcomeEmail,
  SendCancelEmail
}