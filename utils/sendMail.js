import nodemailer from 'nodemailer'
export const sendMail = async(options)=>{
    const transporter = nodemailer.createTransport({
        host:'smtp.gmail.com',
        port: '465',
        service:process.env.SMTP_SERVICE,
        auth:{
            user:'viztheblaze@gmail.com',
            pass:'ggbv zero drog tyhx',

        }
    });


    const mailOptions = {
        from : 'viztheblaze@gmail.com',
        to: options.email,
        subject: options.subject,   
        text: options.message,
    };

    await transporter.sendMail(mailOptions)


}

// module.exports = sendMail