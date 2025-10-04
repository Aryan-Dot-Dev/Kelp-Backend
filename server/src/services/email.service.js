import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: true
    }
})

transporter.verify((error, success) => {
    if (error) {
        console.error('Email service configuration error:', error);
    } else {
        console.log('Email service is ready to send emails');
    }
});

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTPEmail(to) {
    const otp = generateOTP();
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
        html: `<p>Your OTP code is <b>${otp}</b>. It is valid for 10 minutes.</p>`
    };

    
    try {
        await transporter.sendMail(mailOptions);
        console.log('OTP email sent to', to);
        return otp;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw new Error('Failed to send OTP email');
    }
}

export { sendOTPEmail };

