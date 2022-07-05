const nodemailer = require('nodemailer');

const sendEmail = async option =>{
    // 1)  Create a transporter
    // console.log(option)
    console.log(process.env.EMAIL_HOST, process.env.EMAIL_PORT )
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port : 2525,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
              }
            });

    // 2)  Define the email options
console.log("what is the problem!", transporter)
    const mailOptions = {
        from: 'AAKASH BANDHU ARYAL <baburaoapte@gmail.com>',
        to: option.Email,
        subject: option.subject,
        text: option.message
    }
    // 3)  Send the email
    await transporter.sendMail(mailOptions);

}

module.exports = sendEmail;